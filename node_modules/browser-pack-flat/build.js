var minify = require('uglify-js').minify
var fs = require('fs')

var createModuleFactory = minify(require('./lib/createModuleFactory').toString()).code
var exposedRequire = minify(require('./lib/exposedRequire').toString()).code

fs.writeFileSync('./_createModuleFactory.js', createModuleFactory)
fs.writeFileSync('./_exposedRequire.js', exposedRequire)
