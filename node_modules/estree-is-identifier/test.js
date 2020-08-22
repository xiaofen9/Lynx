var test = require('tape')
var parseFull = require('acorn').parse
var isIdentifier = require('./')

function parse (expr) {
  return parseFull(expr).body[0].expression
}

test('isIdentifier', function (t) {
  t.ok(isIdentifier(parse('abc')))
  t.notOk(isIdentifier(parse('abc.xyz')))
  t.notOk(isIdentifier(parseFull('function a () {}').body[0]))

  t.ok(isIdentifier(parse('abc'), 'abc'))
  t.notOk(isIdentifier(parse('xyz'), 'abc'))

  t.end()
})
