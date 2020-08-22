var test = require('tape')
var minify = require('../')
var pump = require('pump')
var fromString = require('from2-string')
var concat = require('concat-stream')
var dedent = require('dedent')

test('Example Test', function (t) {
  t.plan(2)
  fromString(dedent`
    global.value = (function a () {
      var b = 2
      function test () {
        return 1 + b
      }
      return test()
    }())
  `).pipe(minify()).pipe(concat({ encoding: 'string' }, function (result) {
    t.ok(result)
    eval(result) // eslint-disable-line no-eval
    t.equal(global.value, 3)
    delete global.value
  }))
})

test('emits errors', function (t) {
  t.plan(2)
  var src = dedent`
    (function() {
      syntax error;
    })();
  `

  var stream = minify()
  stream.on('data', function () {})
  stream.on('error', function (err) {
    t.ok(err)
    t.ok(/Unexpected token: name/.test(err.message))
  })
  stream.end(src)
})

test('supports es2015 syntax', function (t) {
  t.plan(1)

  var src = dedent`
    const fn = (...args) => {
      return args.map(x => x ** 2)
    }
  `

  var stream = minify()
  stream.pipe(concat({ encoding: 'string' }, done))
  stream.on('error', t.fail)
  stream.end(src)

  function done (result) {
    result = result.toString()
    t.notEqual(result, src)
  }
})

test('handles sourcemaps', function (t) {
  t.plan(1)
  var input = dedent`
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    exports.default = function (a) {
      return a * 2;
    };

    //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFyci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7a0JBQWUsVUFBQyxDQUFEO0FBQUEsU0FBTyxJQUFJLENBQVg7QUFBQSxDIiwiZmlsZSI6InN0ZG91dCIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IChhKSA9PiBhICogMlxuIl19
  `

  pump(
    fromString(input),
    minify(),
    concat({ encoding: 'string' }, done)
  ).on('error', t.fail)

  function done (result) {
    var expected = dedent`
      "use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=function(e){return 2*e};
      //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFyci5qcyJdLCJuYW1lcyI6WyJhIl0sIm1hcHBpbmdzIjoib0ZBQWUsU0FBQ0EsR0FBRCxPQUFXLEVBQUpBIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgKGEpID0+IGEgKiAyXG4iXX0=
    `

    t.equal(result, expected)
  }
})
