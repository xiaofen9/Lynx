(function(){
var _$one_2 = {};
(function (__filename){
console.log(__filename)

}).call(this,"/test/dep-order/one.js")
var _$two_4 = {};
(function (__filename){
console.log(__filename)

}).call(this,"/test/dep-order/two.js")
var _$three_3 = {};
(function (__filename){
console.log(__filename)

}).call(this,"/test/dep-order/three.js")
var _$app_1 = {};
_$one_2
_$two_4
_$three_3
}());
