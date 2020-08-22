var globalVar = 0
var importedModule = require('./importedModule')

function setExports (argument) {
  var localVar = 1
  module.exports = {
    globalVar,
    importedModule,
    localVar,
    argument
  }
}

setExports(10)
