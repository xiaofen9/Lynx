var test = require('tape')
var wrap = require('./')

test('wrapComment', function (t) {
  t.equal(wrap('some text'), '/* some text */',
    'should wrap simple text')
  t.equal(wrap('/* comment */ boop */'), '/* /* comment *\\/ boop *\\/ */',
    'should escape comment close syntax')
  t.equal(wrap('\n\n'), '/* \n\n */',
    'should work with multiline text')
  t.end()
})
