(function(){
var _$app_1 = { exports: {} };
if ("function" === 'function' && typeof _$app_1.exports === 'object' && "object" === 'object') {
  console.log('should do this')
  _$app_1.exports = factory()
} else {
  console.log('should not do this')
  this.Standalone = factory()
}

function factory () {
  return { value: 10 }
}

_$app_1 = _$app_1.exports
}());
