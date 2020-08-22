(function(){
var createModuleFactory = function createModuleFactory(t){var e;return function(r){return e||t(e={exports:{},parent:r},e.exports),e.exports}};
var _$a_1 = createModuleFactory(function (module, exports) {
exports.b = _$b_3
exports.c = _$c_4({})

});
var _$c_4 = createModuleFactory(function (module, exports) {
module.exports = 10 + _$a_1({}).b

});
var _$d_5 = 'hello'

var _$b_3 = 10

var _$e_6 = 'world'

var _$app_2 = {};
console.log({
  d: _$d_5,
  a: _$a_1({}),
  e: _$e_6
})

}());
