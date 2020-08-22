(function(){
var _$wrapped_2 = { exports: {} };
(function (module) {
  module.exports = 'whatever'
})(_$wrapped_2)

_$wrapped_2 = _$wrapped_2.exports
var _$app_1 = { exports: {} };
_$wrapped_2

if ("object" === 'object' && _$app_1.exports) {
  console.log('commonjs')
}

_$app_1 = _$app_1.exports
}());
