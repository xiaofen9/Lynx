var test = require('tape')
var path = require('path')
var browserify = require('browserify')
var concat = require('concat-stream')
var vm = require('vm')

test('manual exposed/external modules', function (t) {
  var externalModule = './' + path.relative(process.cwd(), require.resolve('./expose/externalModule.js'))

  var b1 = browserify({ entries: path.join(__dirname, 'expose/index.js'), standalone: 'expose' })
    .plugin(require.resolve('../plugin'))
    .external(externalModule)

  var b2 = browserify()
    .plugin(require.resolve('../plugin'))
    .require(externalModule, { expose: externalModule })

  b1.bundle().pipe(concat(function (output1) {
    b2.bundle().pipe(concat(function (output2) {
      var nodeOutput = require('./expose/index.js')

      var withPluginOutput = {}
      var withPlugin = vm.createContext(withPluginOutput)

      vm.runInContext(output2, withPlugin)
      vm.runInContext(output1, withPlugin)

      t.is(nodeOutput, 'localModule /// ' + process.cwd() + '/test/expose/anotherLocalModule.js')
      t.is(withPluginOutput.expose, 'localModule /// /test/expose/anotherLocalModule.js')

      t.end()
    }))
  }))
})

test('manual exposed/external modules with cycles', function (t) {
  var externalFiles = ['./a.js', './b.js']
  var externalModules = externalFiles.map(function (file) {
    return './' + path.relative(process.cwd(), require.resolve('./lazy-expose/' + file))
  })

  var b1 = browserify({ entries: path.join(__dirname, 'lazy-expose/app.js'), standalone: 'expose' })
    .plugin(require.resolve('../plugin'))
    .external(externalModules)
    .on('error', t.fail)

  var b2 = browserify()
    .plugin(require.resolve('../plugin'))
    .require(externalModules.map(function (m) {
      return {
        file: m,
        expose: m
      }
    }))
    .on('error', t.fail)

  b1.bundle().pipe(concat(function (output1) {
    b2.bundle().pipe(concat(function (output2) {
      var nodeOutput = require('./lazy-expose/app.js')

      var withPluginOutput = {}
      var withPlugin = vm.createContext(withPluginOutput)

      vm.runInContext(output2, withPlugin)
      vm.runInContext(output1, withPlugin)

      var expectedOutput = 'function () {\n  return b()\n}'
      t.is(nodeOutput, expectedOutput)
      t.is(withPluginOutput.expose, expectedOutput)

      t.end()
    }))
  }))
})
