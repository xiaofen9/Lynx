var test = require('tape')
var vm = require('vm')
var fs = require('fs')
var path = require('path')
var browserify = require('browserify')
var concat = require('concat-stream')
var pack = require('../plugin')

var tests = [
  'bare-module',
  'colliding-unused',
  'comment',
  'dedupe',
  'dep-order',
  'destructure',
  'dynamic-require',
  'eager-cycles',
  'exports-name',
  'globals',
  'input-source-map',
  'lazy-cycles',
  'lazy-order',
  'module-parent',
  'remove-decl',
  'set-exports',
  'shorthand',
  'simplify',
  'source-map',
  'standalone',
  'typeof-require',
  'variable'
]

tests.forEach(function (name) {
  test(name, { skip: /^v4/.test(process.version) && name === 'input-source-map' }, function (t) {
    runTest(t, name)
  })
})

function runTest (t, name) {
  t.plan(1)
  var basedir = path.join(__dirname, name)
  var optionsPath = path.join(basedir, 'options.json')
  var options = {}
  try { options = JSON.parse(fs.readFileSync(optionsPath, 'utf8')) } catch (err) {}
  var entry = path.join(basedir, 'app.js')
  var expected = path.join(basedir, 'expected.js')
  var actual = path.join(basedir, 'actual.js')
  options.entries = entry
  var bundle = browserify(options)
    .plugin(pack)
    .bundle()
    .on('error', t.fail)

  // Write actual output to a file for easier inspection
  bundle.pipe(fs.createWriteStream(actual))

  bundle.pipe(concat(function (result) {
    t.is(
      result.toString('utf8'),
      fs.readFileSync(expected, 'utf8'),
      name
    )
    t.end()
  }))
}

test('parent-cycle', function (t) {
  t.plan(2)

  var basedir = path.join(__dirname, 'parent-cycle')
  var entry = path.join(basedir, 'app.js')
  var actual = path.join(basedir, 'actual.js')

  browserify(entry)
    .plugin(pack)
    .bundle(function (err, result) {
      t.ifError(err)
      fs.writeFileSync(actual, result)
      vm.runInNewContext(result + '', {
        console: { log: log }
      })
      function log (value) {
        t.equal(value, 5)
      }
    })
})
