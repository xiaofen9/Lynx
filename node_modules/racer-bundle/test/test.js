var expect = require('chai').expect;
var racer = require('racer');
var plugin = require('../index');

describe('bundle', function() {

  it('adds a bundle method to stores', function() {
    var backend = racer.createBackend();
    expect(backend.bundle).equal(undefined);
    racer.use(plugin);
    expect(backend.bundle).to.be.a('function');
  });

  it('can bundle unminified', function(done) {
    var backend = racer.createBackend();
    var options = {minify: false};
    backend.bundle(__dirname + '/_entry.js', options, function(err, source, sourceMap) {
      expect(err).not.exist;
      expect(source).a('string');
      expect(sourceMap).a('string');
      console.log('source length', source.length);
      console.log('source map length', sourceMap.length)
      done();
    });
  });

  it('can bundle minified', function(done) {
    var backend = racer.createBackend();
    var options = {minify: true};
    backend.bundle(__dirname + '/_entry.js', options, function(err, source, sourceMap) {
      expect(err).not.exist;
      expect(source).a('string');
      expect(sourceMap).a('string');
      console.log('source length', source.length);
      console.log('source map length', sourceMap.length)
      done();
    });
  });
});
