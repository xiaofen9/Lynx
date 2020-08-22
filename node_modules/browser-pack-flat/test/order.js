var test = require('tape')
var vm = require('vm')
var concat = require('concat-stream')
var pack = require('../')

test('should evaluate entry modules by their `.order` property', function (t) {
  t.plan(1)
  var p = pack({ raw: true })

  p.pipe(concat(onbundle))

  p.write({
    id: 4, index: 4,
    deps: {},
    source: 'module.exports="hello"'
  })
  p.write({
    id: 0, index: 0,
    entry: true,
    order: 1,
    deps: {},
    source: 'console.log(1)'
  })
  p.write({
    id: 2, index: 2,
    entry: true,
    order: 2,
    deps: {},
    source: 'console.log(2)'
  })
  p.write({
    id: 1, index: 3,
    entry: true,
    order: 0,
    deps: { x: 4 },
    source: 'console.log(require("x"))'
  })
  p.end()

  function onbundle (code) {
    var result = []
    vm.runInNewContext(code, {
      console: {
        log: function (text) { result.push(text) }
      }
    })
    t.equal(result.join('\n'), 'hello\n1\n2')
  }
})
