var test = require('tape')
var through = require('through2')
var fromString = require('from2-string')
var browserify = require('browserify')
var packFlat = require('../plugin')

test('plugin should replace browser-pack', function (t) {
  t.plan(1)

  var input = fromString('module.exports = "whatever"')
  var b = browserify(input)
  // Add some streams around the browser-pack stream
  b.pipeline.get('pack').unshift(through.obj())
  b.pipeline.get('pack').push(through.obj())

  b.plugin(packFlat)
  b.bundle(onbundle)

  function onbundle (err) {
    t.ifError(err)
  }
})
