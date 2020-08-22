(function(){
var _$thisIsAFunction_3 = function thisIsAFunction () {}

var _$ThisIsAClass_2 = class ThisIsAClass {}

var _$thisIsAReference_4 = thisIsAReference

function thisIsAReference () {}

var _$app_1 = {};
console.log(
  _$thisIsAFunction_3.name,
  _$ThisIsAClass_2.name,
  _$thisIsAReference_4.name
)

}());
