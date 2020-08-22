(function(){
var globalVar = 1

var _$globalVar_2 = globalVar

var _$app_1 = {};
var __globalVar_1 = 0
/* removed: var _$globalVar_2 = require('./importedModule') */;

function setExports (argument) {
  var localVar = 1
  _$app_1 = {
    globalVar: __globalVar_1,
    importedModule: _$globalVar_2,
    localVar,
    argument
  }
}

setExports(10)

}());
