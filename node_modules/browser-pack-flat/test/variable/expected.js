(function(){
var _$param_2 = function (module) {
  return { exports: module }
}

var _$app_1 = {};
_$app_1.param = _$param_2
_$app_1.something = function () {
  var exports = {}
  exports.something = _$param_2
  return exports
}

}());
