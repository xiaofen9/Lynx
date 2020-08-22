var test = require('tape')
var parseFull = require('acorn').parse
var isMemberExpression = require('./')

function parse (expr) {
  return parseFull(expr).body[0].expression
}

test('isMemberExpression', function (t) {
  t.ok(isMemberExpression(parse('a.b')))
  t.notOk(isMemberExpression(parse('a')))
  t.notOk(isMemberExpression(parseFull('function a () {}').body[0]))
  t.ok(isMemberExpression(parse('b["b"]')))

  t.ok(isMemberExpression(parse('a.b'), 'a.b'))
  t.notOk(isMemberExpression(parse('a.b'), 'a.c'))
  t.ok(isMemberExpression(parse('b["b"]'), 'b.b'))
  t.notOk(isMemberExpression(parse('b["b"]'), 'b.c'))

  t.ok(isMemberExpression(parse('a.b.c.d.e.f'), 'a.b.c.d.e.f'))
  t.notOk(isMemberExpression(parse('a.b.c.d.e.f'), 'a.b.x.d.e.f'))

  t.end()
})
