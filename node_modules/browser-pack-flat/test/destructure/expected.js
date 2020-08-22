(function(){
var hello = 'hello'
var world = 'everyone'

var _$greeting_2 = { hello, world }

var _$app_1 = {};
var {
  hello: __hello_1,
  world: [ ...__world_1 ]
} = _$greeting_2

console.log(__hello_1, __world_1.join(''))

}());
