var test = require('tape')
var parseFull = require('acorn').parse
var isRequire = require('./')

function parse (expr) {
  return parseFull(expr).body[0].expression
}

test('isRequire', function (t) {
  t.ok(isRequire(parse('require("abc")')))
  t.notOk(isRequire(parse('require()')))
  t.notOk(isRequire(parseFull('function a () {}').body[0]))
  t.ok(isRequire(parse('require(0)')))

  t.ok(isRequire(parse('require("abc")'), 'abc'))
  t.notOk(isRequire(parse('require("xyz")'), 'abc'))
  t.ok(isRequire(parse('require(10)'), 10))
  t.notOk(isRequire(parse('require(10)'), 11))

  t.ok(isRequire(parse('require(\'abc\')'), 'abc'))
  t.ok(isRequire(parse('require(`xyz`)'), 'xyz'))

  t.end()
})
