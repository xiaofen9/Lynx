var duplexify = require('duplexify')
var concat = require('concat-stream')
var fromString = require('from2-string')
var defaultUglify = require('terser')
var convert = require('convert-source-map')
var xtend = require('xtend')

module.exports = uglifyStream

function defaultOpts () {
  return {
    sourceMap: { content: 'inline' }
  }
}

function uglifyStream (opts) {
  opts = xtend(defaultOpts(), opts || {})
  var uglify = opts.uglify || defaultUglify
  delete opts.uglify

  var stream = duplexify()

  var writer = concat({ encoding: 'string' }, function (source) {
    var minified = uglify.minify(source, opts)
    if (minified.error) {
      stream.emit('error', minified.error)
      return
    }
    var final = minified.code
    if (minified.map) {
      final += '\n' + convert.fromJSON(minified.map).toComment()
    }
    var reader = fromString(final)
    stream.setReadable(reader)
  })

  stream.setWritable(writer)

  return stream
}
