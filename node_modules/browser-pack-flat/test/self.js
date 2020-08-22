var test = require('tape')
var fs = require('fs')
var path = require('path')
var assert = require('assert')
var browserify = require('browserify')
var through = require('through2')
var unpack = require('browser-unpack')

function unpackStream () {
  var d = ''
  return through({ objectMode: true }, function (chunk, enc, cb) {
    d += chunk
    cb()
  }, function (cb) {
    unpack(d).forEach(this.push, this)
    cb(null)
  })
}

function runBundleUnpack (packer) {
  var b = browserify({
    entries: path.join(__dirname, '../index'),
    node: true,
    transform: 'brfs'
  })

  return b.bundle()
    .pipe(unpackStream())
    .pipe(packer({ raw: true, standalone: 'packFlat' }))
}

function runBundlePlugin (packer) {
  var b = browserify({
    entries: path.join(__dirname, '../plugin'),
    node: true,
    standalone: 'packFlat',
    transform: 'brfs'
  })
  b.plugin(packer)

  return b.bundle()
}

test('bundling itself with itself: plugin edition', function (t) {
  t.plan(1)
  runBundlePlugin(require('../plugin'))
    .pipe(fs.createWriteStream(path.join(__dirname, './self.plugin.expected.js')))
    .on('finish', onbundle)

  function onbundle () {
    runBundlePlugin(require('./self.plugin.expected'))
      .pipe(fs.createWriteStream(path.join(__dirname, './self.plugin.actual.js')))
      .on('finish', oncompare)
  }

  function oncompare () {
    t.is(
      fs.readFileSync(path.join(__dirname, './self.plugin.expected.js'), 'utf8'),
      fs.readFileSync(path.join(__dirname, './self.plugin.actual.js'), 'utf8'),
      'flattened browserified code should have the same output as the commonjs version'
    )
    t.end()
  }
})

test('bundling itself with itself: repack edition', function (t) {
  t.plan(1)
  runBundleUnpack(require('../index'))
    .pipe(fs.createWriteStream(path.join(__dirname, './self.unpack.expected.js')))
    .on('finish', onbundle)

  function onbundle () {
    runBundleUnpack(require('./self.unpack.expected'))
      .pipe(fs.createWriteStream(path.join(__dirname, './self.unpack.actual.js')))
      .on('finish', oncompare)
  }

  function oncompare () {
    t.is(
      fs.readFileSync(path.join(__dirname, './self.unpack.expected.js'), 'utf8'),
      fs.readFileSync(path.join(__dirname, './self.unpack.actual.js'), 'utf8'),
      'flattened browserified code should have the same output as the commonjs version'
    )
    t.end()
  }
})
