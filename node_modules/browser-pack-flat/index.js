var pathParse = require('path-parse')
var path = require('path')
var fs = require('fs')
var transformAst = require('transform-ast')
var countLines = require('count-lines')
var convertSourceMap = require('convert-source-map')
var combineSourceMap = require('combine-source-map')
var through = require('through2')
var umd = require('umd')
var dedent = require('dedent')
var json = require('JSONStream')
var combiner = require('stream-combiner')
var scan = require('scope-analyzer')
var toIdentifier = require('./private_modules/identifierfy')
var wrapComment = require('wrap-comment')
var isRequire = require('estree-is-require')
var isMemberExpression = require('estree-is-member-expression')

var dedupedRx = /^arguments\[4\]\[(\d+)\]/

var kEvaluateOnDemand = Symbol('evaluate on demand')
var kAst = Symbol('ast')
var kIsSimpleExport = Symbol('is simple export')
var kExportsName = Symbol('exports variable name')
var kRequireCalls = Symbol('require calls')
var kDependencyOrder = Symbol('dependency order of execution sort value')
var kReferences = Symbol('module/exports references')
var kMagicString = Symbol('magic string')
var kSourceMap = Symbol('source map')
var kDummyVars = Symbol('dummy replacement variables')
var kShouldRename = Symbol('should rename binding')

var createModuleFactoryCode = fs.readFileSync(require.resolve('./_createModuleFactory'), 'utf8')
var exposedRequireCode = fs.readFileSync(require.resolve('./_exposedRequire'), 'utf8')

// Parse the module and collect require() calls and exports assignments.
function parseModule (row, index, rows, opts) {
  // Holds the `module.exports` variable name.
  var moduleExportsName = toIdentifier('_$' + getModuleName(row.file || '') + '_' + row.id)

  // browserify is clever about deduping modules with the same source code,
  // but it needs the browser-pack runtime in order to do so.
  // we don't have that runtime so this … re-dupes those modules.
  if (dedupedRx.test(row.source)) {
    var n = row.source.match(dedupedRx)[1]
    var dedup = rows.filter(function (other) {
      return String(other.id) === n
    })[0]
    row.source = dedup.source
  }

  var requireCalls = []
  var orderOfExecution = new Map()

  var ast
  // hack to keep track of `module`/`exports` references correctly.
  // in node.js they're defined by a function wrapper, so their scope is
  // one level higher-ish than the module scope. this emulates that.
  var globalScope = {
    type: 'BrowserPackFlatWrapper',
    parent: null
  }
  scan.createScope(globalScope, ['require', 'module', 'exports'])

  var source = row.source

  // Determine if a require() call may not be evaluated according to its linear source position
  // This happens primarily if the call is inside a function, or inside a conditional branch
  function isOrderUnpredictable (node) {
    while ((node = node.parent)) {
      // Special-case for IIFE, behaviour is the same as evaluating inline
      if (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
        // (() => {})()
        if (node.parent && node.parent.type === 'CallExpression' && node.parent.callee === node) {
          continue
        }
        // (function(){}).call(null)
        // this form is added by browserify to inject globals
        if (node.parent && node.parent.type === 'MemberExpression' &&
            node.parent.object === node &&
            (node.parent.property.name === 'call' || node.parent.property.name === 'apply') &&
            node.parent.parent && node.parent.parent.type === 'CallExpression') {
          continue
        }
      }

      // if(require('d')) is still in-order
      // the same is technically true for while(require()) and for(require();;) but those are more rare
      if (node.parent && node.parent.type === 'IfStatement' && node.parent.test === node) {
        // Skip the IfStatement
        node = node.parent
        continue
      }

      if (node.type === 'IfStatement' || // if(false) require()
          node.type === 'WhileStatement' || // while(false) require()
          node.type === 'ForStatement' || // for(;false;) require()
          node.type === 'ForInStatement' || // for(x in []) require()
          node.type === 'FunctionExpression' || // setTimeout(function(){ require() })
          node.type === 'FunctionDeclaration' || // function neverCalled(){ require() }
          node.type === 'ArrowFunctionExpression' // setTimeout(()=> require())
      ) {
        return true
      }
    }
    return false
  }

  // Keep track of modules that were already evaluated in a predictable order so that multiple
  // require('a') occurences don't force 'a' to become on-demand
  var alreadyPredictablyEvaluated = new Set()
  // we'll do two walks along the AST in order to detect variables and their references.
  // we initialise the scopes and declarations in the first one here, and then collect
  // references in the second.
  var magicString = transformAst(source, {
    ecmaVersion: 9,
    inputFilename: row.sourceFile,
    sourceType: opts.sourceType || 'script'
  }, function (node) {
    if (node.type === 'Program') ast = node
    scan.visitScope(node)

    // also collect requires while we're here
    if (isRequire(node)) {
      var argument = node.arguments[0]
      var required = argument.type === 'Literal' ? argument.value : null

      if (required !== null && moduleExists(row.deps[required])) {
        var other = rows.byId[row.deps[required]]
        if (isOrderUnpredictable(node)) {
          if (!alreadyPredictablyEvaluated.has(other)) {
            other[kEvaluateOnDemand] = true
          }
        } else {
          alreadyPredictablyEvaluated.add(other)
        }
        requireCalls.push({
          id: row.deps[required],
          node: node,
          requiredModule: other
        })
      } else if (required !== null) {
        requireCalls.push({
          external: true,
          id: row.deps[required] || required,
          node: node
        })
      }

      if (required !== null) {
        orderOfExecution.set(row.deps[required] || required, node.end)
      }

      function moduleExists (id) {
        return id != null && !!rows.byId[id]
      }
    }
  })
  magicString.walk(function (node) {
    // transform-ast has set this to `undefined`
    ast.parent = globalScope
    scan.visitBinding(node)
  })

  var requireList = scan.scope(globalScope).getReferences('require')
  var moduleExportsList = scan.scope(globalScope).getReferences('module')
    .map(function (node) { return node.parent })
    .filter(isModuleExports)
  var exportsList = scan.scope(globalScope).getReferences('exports')
  var moduleList = scan.scope(globalScope).getReferences('module')
    .filter(function (node) { return !isModuleExports(node.parent) })

  // Detect simple exports that are just `module.exports = xyz`, we can compile them to a single
  // variable assignment.
  var isSimpleExport = false
  if (moduleExportsList.length === 1 && exportsList.length === 0 && moduleList.length === 0) {
    var node = moduleExportsList[0]
    if (node.parent.type === 'AssignmentExpression' && node.parent.left === node &&
        node.parent.parent.type === 'ExpressionStatement') {
      isSimpleExport = scan.nearestScope(node.object, false) === ast

      var name = getNodeName(node.parent.right)
      if (name) {
        moduleExportsName = toIdentifier('_$' + name + '_' + row.id)
      }
    }
  }

  row[kAst] = ast
  row[kIsSimpleExport] = isSimpleExport
  row[kExportsName] = moduleExportsName
  row.hasExports = (moduleExportsList.length + exportsList.length) > 0
  row[kRequireCalls] = requireCalls
  row[kDependencyOrder] = orderOfExecution
  row[kReferences] = {
    require: requireList,
    module: moduleList,
    exports: exportsList,
    'module.exports': moduleExportsList
  }
  row[kMagicString] = magicString
}

function sortModules (rows) {
  var index = new Map()
  var mod
  while ((mod = rows.pop())) {
    index.set(mod.id, mod)
  }

  function compareDependencySortOrder (a, b) {
    // Sort dependencies by the order of their require() calls
    var ao = typeof a.dependencyOrder === 'number'
    var bo = typeof b.dependencyOrder === 'number'
    if (ao && bo) {
      return a.dependencyOrder < b.dependencyOrder ? -1 : 1
    }
    if (ao && !bo) return -1
    if (!ao && bo) return 1

    return compareModuleSortOrder(a.module, b.module)
  }

  var modules = Array.from(index.values()).sort(compareModuleSortOrder)
  var seen = new Set()

  function visit (mod) {
    if (seen.has(mod.id)) return
    seen.add(mod.id)
    if (hasDeps(mod)) {
      values(mod.deps)
        .map(function attachSortOrder (id) {
          var dep = index.get(id)
          if (dep) {
            return {
              module: dep,
              dependencyOrder: mod[kDependencyOrder] ? mod[kDependencyOrder].get(id) : undefined
            }
          }
        })
        .filter(Boolean)
        .sort(compareDependencySortOrder)
        .forEach(function (dep) { visit(dep.module) })
    }
    rows.push(mod)
  }

  modules.forEach(visit)
}

function values (obj) {
  var result = []
  for (var k in obj) { result.push(obj[k]) }
  return result
}

function hasDeps (mod) {
  return mod.deps && Object.keys(mod.deps).length > 0
}

function compareModuleSortOrder (a, b) {
  // Float entry modules to the top.
  if (a.entry && !b.entry) return -1
  if (!a.entry && b.entry) return 1
  // Sort entry modules by their `.order`.
  var ao = typeof a.order === 'number'
  var bo = typeof b.order === 'number'
  if (ao && bo) {
    return a.order < b.order ? -1 : 1
  }
  // Modules that have an `.order` go before modules that do not.
  if (ao && !bo) return -1
  if (!ao && bo) return 1

  // Else sort by ID, so that output is stable.
  return a.id < b.id ? -1 : 1
}

// Collect all global variables that are used in any module.
// This is done separately from the next step (markDuplicateVariableNames)
// so that global variables used in "later" modules, when colliding
// with a module variable name in an "earlier" module, are correctly
// deduped. See https://github.com/browserify/tinyify/issues/10
function identifyGlobals (row, i, rows) {
  var ast = row[kAst]
  var globalScope = ast.parent

  var scope = scan.scope(ast)
  if (scope) {
    scan.scope(globalScope).getUndeclaredNames().forEach(function (name) {
      rows.usedGlobalVariables.add(name)
    })
  }
}

// Mark module variables that collide with variable names from other modules so we can rewrite them.
function markDuplicateVariableNames (row, i, rows) {
  var ast = row[kAst]

  var scope = scan.scope(ast)
  if (scope) {
    scope.forEach(function (binding, name) {
      binding[kShouldRename] = rows.usedGlobalVariables.has(name)
      rows.usedGlobalVariables.add(name)
    })
  }
}

function rewriteModule (row, i, rows) {
  var moduleExportsName = row[kExportsName]
  var moduleBaseName

  var ast = row[kAst]
  var magicString = row[kMagicString]
  var moduleList = row[kReferences].module
  var moduleExportsList = row[kReferences]['module.exports']
  var exportsList = row[kReferences].exports
  var requireList = row[kReferences].require

  // If `module` is used as a free variable we need to turn it into an object with an `.exports`
  // property, to deal with situations like:
  //
  //     var a = module;
  //     a.exports = 'hello'
  //
  // Not too common, but it happens…
  if (moduleList.length > 0) {
    moduleBaseName = moduleExportsName
    moduleExportsName += '.exports'
  }

  // inline "typeof require", because it will usually not be available at runtime
  requireList.forEach(function (node) {
    if (node.parent.type === 'UnaryExpression' && node.parent.operator === 'typeof') {
      node.parent.edit.update('"function"')
    }
  })

  if (!row[kEvaluateOnDemand]) { // on-demand modules have a function wrapper and don't need to be rewritten
    moduleExportsList.concat(exportsList).forEach(function (node) {
      if (row[kIsSimpleExport]) {
        // var $moduleExportsName = xyz
        node.edit.update('var ' + moduleExportsName)
      } else {
        renameIdentifier(node, moduleExportsName)
      }
    })
    moduleList.forEach(function (node) {
      // rewrite `typeof module` to `"object"`
      if (node.parent.type === 'UnaryExpression' && node.parent.operator === 'typeof') {
        node.parent.edit.update('"object"')
      } else if (isModuleParent(node.parent)) {
        if (row.entry) {
          node.parent.edit.update('null')
        } else {
          node.parent.edit.update('({})')
        }
      } else {
        renameIdentifier(node, moduleBaseName)
      }
    })
    if (scan.scope(ast)) {
      // rename colliding global variable names
      scan.scope(ast).forEach(function (binding, name) {
        if (binding[kShouldRename]) {
          renameBinding(binding, toIdentifier('__' + name + '_' + row.id))
        }
      })
    }
  }

  row[kRequireCalls].forEach(function (req) {
    var node = req.node
    var other = req.requiredModule
    if (req.external) {
      node.edit.update('require(' + JSON.stringify(req.id) + ')')
    } else if (other && other[kEvaluateOnDemand]) {
      node.edit.update(other[kExportsName] + '({})') // `module.parent` value = {}
    } else if (other && other[kExportsName]) {
      renameImport(row, node, other[kExportsName])
    } else {
      // TODO this is an unknown module, so probably something went wrong and we should throw an error?
      node.edit.update(toIdentifier('_$module_' + req.id))
    }
  })

  if (row[kEvaluateOnDemand]) {
    magicString.prepend('var ' + row[kExportsName] + ' = ' + rows.createModuleFactoryName + '(function (module, exports) {\n')
    magicString.append('\n});')
  } else if (moduleBaseName) {
    magicString
      .prepend('var ' + moduleBaseName + ' = { exports: {} };\n')
      .append('\n' + moduleBaseName + ' = ' + moduleExportsName)
    moduleExportsName = moduleBaseName
  } else if (!row[kIsSimpleExport]) {
    magicString.prepend('var ' + moduleExportsName + ' = {};\n')
  }

  row[kSourceMap] = magicString.map
  row.source = magicString.toString()
}

function flatten (rows, opts, stream) {
  rows.byId = Object.create(null)
  rows.forEach(function (row) { rows.byId[row.id] = row })

  var containsCycles = detectCycles(rows)

  var combiner = opts.debug ? combineSourceMap.create() : null

  var intro = ''
  var outro = ''

  rows.usedGlobalVariables = new Set()
  rows.exposeName = generateName(rows, 'exposedRequire')
  rows.createModuleFactoryName = generateName(rows, 'createModuleFactory')
  rows.forEach(function (row, index, rows) {
    parseModule(row, index, rows, opts)
  })
  sortModules(rows)
  rows.forEach(identifyGlobals)
  rows.forEach(markDuplicateVariableNames)
  rows.forEach(rewriteModule)
  moveOnDemandModulesToStart(rows)

  // Initialize entry modules that are marked as on-demand (because of a dependency cycle
  // or a conditional require() call)
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].entry && rows[i][kEvaluateOnDemand]) {
      outro += '\n' + rows[i][kExportsName] + '();'
    }
  }

  // Expose modules on the global `require` function, or standalone as UMD
  var exposesModules = false
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].expose && !opts.standalone) {
      exposesModules = true
      if (rows[i][kEvaluateOnDemand]) {
        // If the module is evaluated on demand, using a function, define
        // a getter so the function will be called.
        outro += '\nObject.defineProperty(' + rows.exposeName + '.m, ' + JSON.stringify(rows[i].id) + ', { get: function() { return ' + rows[i][kExportsName] + '({}); }});'
      } else {
        outro += '\n' + rows.exposeName + '.m[' + JSON.stringify(rows[i].id) + '] = ' + rows[i][kExportsName] + ';'
      }
    }

    var isEntryModule = rows[i].entry && rows[i].hasExports && opts.standalone
    // Need this for:
    // https://github.com/browserify/browserify/blob/0305b703b226878f3acb5b8f2ff9451c87cd3991/test/debug_standalone.js#L44-L64
    var isStandaloneModule = opts.standalone && rows[i].id === stream.standaloneModule
    if (isEntryModule || isStandaloneModule) {
      outro += '\nreturn ' + rows[i][kExportsName] + ';\n'
    }
  }

  if (opts.standalone) {
    intro += umd.prelude(opts.standalone)
    outro += umd.postlude(opts.standalone)
  } else if (exposesModules) {
    intro += dedent`
      require = (function (require) {
      var ${rows.exposeName} = ${exposedRequireCode};
      ${rows.exposeName}.m = {};
      ${rows.exposeName}.r = require;
    `
    outro += '\n' + dedent`
      return ${rows.exposeName};
      }(typeof require === 'function' ? require : void 0));
    `
  } else if (opts.iife || opts.iife == undefined) {
    intro += '(function(){\n'
    outro += '\n}());'
  }

  // Add the circular dependency/on-demand runtime if necessary.
  if (rows.some(function (mod) { return mod[kEvaluateOnDemand] })) {
    intro += 'var ' + rows.createModuleFactoryName + ' = ' + createModuleFactoryCode + ';\n'
  }

  var result = ''
  var line = 0

  var preludePath = path.relative(
    opts.basedir || process.cwd(),
    path.join(__dirname, '_prelude')
  )
  var postludePath = path.relative(
    opts.basedir || process.cwd(),
    path.join(__dirname, '_postlude')
  )

  result += intro
  if (opts.debug) {
    combiner.addFile({
      sourceFile: preludePath,
      source: intro
    }, { line: line })
  }

  line += countLines(intro) - 1

  rows.forEach(function (row, i) {
    if (i > 0) {
      result += '\n'
      line += 1
    }
    result += row.source
    if (opts.debug && row.sourceFile && !row.nomap) {
      combiner.addFile({
        sourceFile: row.sourceFile,
        source: row.source + '\n' + convertSourceMap.fromObject(row[kSourceMap]).toComment()
      }, { line: line })
    }

    line += countLines(row.source) - 1
  })

  result += outro
  if (opts.debug) {
    combiner.addFile({
      sourceFile: postludePath,
      source: outro
    }, { line: line })
  }

  if (opts.debug) {
    result += '\n' + combiner.comment()
  }

  result += '\n'

  return Buffer.from(result)
}

module.exports = function browserPackFlat(opts) {
  // When used as a transform
  if (typeof opts === 'string' && typeof arguments[1] === 'object') {
    throw new Error('browser-pack-flat: must be used as a plugin through `browser-pack-flat/plugin`')
  }
  // When used as a plugin
  if (opts && typeof opts.plugin === 'function') {
    // Doing 'plu' + 'gin' so browserify doesn't detect this require() call
    // when running the self-test. Workaround for this bug:
    // https://github.com/browserify/browserify/issues/1260
    return require('./plu' + 'gin').apply(null, arguments)
  }

  opts = opts || {}

  var rows = []

  var packer = through.obj(onwrite, onend)
  var stream = opts.raw ? packer : combiner([
    json.parse([ true ]),
    packer
  ])

  return stream

  function onwrite (row, enc, cb) {
    rows.push(row)
    cb(null)
  }
  function onend (cb) {
    try {
      packer.push(flatten(rows, opts || {}, stream))
      packer.push(null)
      cb(null)
    } catch (err) {
      cb(err)
    }
  }
}

/**
 * Detect cyclical dependencies in the bundle. All modules in a dependency cycle
 * are moved to the top of the bundle and wrapped in functions so they're not
 * evaluated immediately. When other modules need a module that's in a dependency
 * cycle, instead of using the module's exportName, it'll call the `createModuleFactory` runtime
 * function, which will execute the requested module and return its exports.
 */
function detectCycles (rows) {
  var cyclicalModules = new Set()
  var checked = new Set()
  rows.forEach(function (module) {
    var visited = []

    check(module)

    function check (row) {
      var i = visited.indexOf(row)
      if (i !== -1) {
        checked.add(row)
        for (; i < visited.length; i++) {
          cyclicalModules.add(visited[i])
        }
        return
      }
      if (checked.has(row)) return
      visited.push(row)
      Object.keys(row.deps).forEach(function (k) {
        var dep = row.deps[k]
        var other = rows.byId[dep]
        if (other) check(other, visited)
      })
      visited.pop()
    }
  })

  // mark cyclical dependencies
  for (var i = 0; i < rows.length; i++) {
    rows[i][kEvaluateOnDemand] = cyclicalModules.has(rows[i])
  }
  return cyclicalModules.size > 0
}

function moveOnDemandModulesToStart (rows) {
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][kEvaluateOnDemand]) {
      var row = rows.splice(i, 1)[0]
      rows.unshift(row)
    }
  }
}

function getNodeName (node) {
  if (node.type === 'FunctionExpression') node = node.id
  else if (node.type === 'ClassExpression') node = node.id
  if (node && node.type === 'Identifier') {
    return node.name
  }
}

function isModuleExports (node) {
  return isMemberExpression(node, 'module.exports')
}
function isModuleParent (node) {
  return isMemberExpression(node, 'module.parent')
}

function isObjectKey (node) {
  return node.parent.type === 'Property' && node.parent.key === node
}
function isShorthandProperty (node) {
  return node.type === 'Identifier' && isObjectKey(node) && node.parent.shorthand
}

function renameIdentifier (node, name) {
  if (isShorthandProperty(node)) {
    node.edit.update(node.name + ': ' + name)
  } else {
    node.edit.update(name)
  }
}

function renameImport (row, node, name) {
  if (node.parent.type === 'VariableDeclarator' && node.parent.id.type === 'Identifier') {
    var binding = scan.getBinding(node.parent.id)
    if (binding) {
      renameBinding(binding, name)
      removeVariableDeclarator(row, node.parent)
      return
    }
  }
  node.edit.update(name)
}

function renameBinding (binding, newName) {
  binding.each(function (node) {
    renameIdentifier(node, newName)
  })
}

// Remove a variable declarator -- remove the declaration entirely if it is the only one,
// otherwise replace with a dummy declarator
function removeVariableDeclarator (row, decl) {
  if (decl.parent.type === 'VariableDeclaration') {
    var i = decl.parent.declarations.indexOf(decl)
    if (decl.parent.declarations.length === 1) {
      var removed = decl.parent.getSource()
      decl.parent.edit.update(wrapComment('removed: ' + removed) + ';')
    } else if (i === decl.parent.declarations.length - 1) {
      // Remove ", a = 1"
      row[kMagicString].overwrite(decl.parent.declarations[i - 1].end, decl.end, '')
    } else {
      // Remove "a = 1, "
      row[kMagicString].overwrite(decl.start, decl.parent.declarations[i + 1].start, '')
    }
    decl.parent.declarations.splice(i, 1)
  } else {
    if (!row[kDummyVars]) row[kDummyVars] = 0
    var id = '__dummy_' + row.index + '$' + row[kDummyVars]
    row[kDummyVars]++
    decl.edit.update(toIdentifier(id) + ' = 0')
  }
}

function getModuleName (file) {
  var parts = pathParse(file)
  var name = parts.base === 'index.js'
    ? path.basename(parts.dir)
    : parts.name
  return name || 'module'
}

function generateName (rows, base) {
  var dedupe = ''
  var i = 0
  while (true) {
    var inUse = rows.some(function (row) {
      return row.source.indexOf(base + dedupe) !== -1
    })
    if (!inUse) {
      return base + dedupe
    }
    dedupe = '_' + (i++)
  }
}
