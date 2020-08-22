var Buffer = require('buffer').Buffer;
var Writable = require('stream').Writable;
var exorcist = require('exorcist');
var browserify = require('browserify');
var minifyStream = require('minify-stream');

var util;
module.exports = function(racer) {
  var Backend = racer.Backend || racer.Store;
  Backend.prototype.bundle = bundle;
  util = racer.util;
};

function bundle(file, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = null;
  }
  options = Object.assign({}, options, {debug: true});
  var minify = (options.minify == null) ? util.isProduction : options.minify;

  var b = browserify(options);
  this.emit('bundle', b);
  b.add(file);

  var bundleStream = (minify) ?
    b.plugin('common-shakeify')
      .plugin('browser-pack-flat/plugin')
      .bundle()
      .pipe(minifyStream()) :
    b.bundle();

  var sourceStream = new BufferStream();
  var sourceMapStream = new BufferStream();
  bundleStream
    .pipe(exorcist(sourceMapStream, '/'))
    .pipe(sourceStream);

  sourceStream.on('finish', function() {
    var source = sourceStream.toString()
      // Remove the sourceMappingURL inserted by exorcist
      .replace(/\n\/\/# sourceMappingURL=.*/, '');
    var sourceMap = sourceMapStream.toString();
    cb(null, source, sourceMap);
  });
}

function BufferStream() {
  Writable.call(this);
  this.chunks = [];
}
BufferStream.prototype = Object.create(Writable.prototype);
BufferStream.prototype.constructor = BufferStream;
BufferStream.prototype._write = function(chunk, encoding, callback) {
  this.chunks.push(chunk);
  callback();
};
BufferStream.prototype.toString = function() {
  return Buffer.concat(this.chunks).toString();
};
