(function(){
var createModuleFactory = function createModuleFactory(t){var e;return function(r){return e||t(e={exports:{},parent:r},e.exports),e.exports}};
var _$c_4 = createModuleFactory(function (module, exports) {
console.log('conditionally')

});
var _$b_3 = createModuleFactory(function (module, exports) {
console.log('later')

});
var _$a_1 = {};
console.log('always')

var _$d_5 = Math.random()

var _$app_2 = {};
(function (global){
_$a_1
global.later = function () {
  _$b_3({}) // should not run immediately
}
if (_$d_5>0.5) {
  _$c_4({}) // should not always run
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
}());
