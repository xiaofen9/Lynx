(function(){
var _$hello_3 = 'hello'

var _$world_4 = {};
var world = _$world_4 = 'world'

var _$asi_2 = {};
// If the `test` import is removed naively, the result will be alert(test), which is incorrect.
alert
/* removed: var _$hello_3 = require('./hello'); */;
(_$hello_3)

var _$app_1 = {};
/* removed: var _$hello_3 = require('./hello') */;
/* removed: var _$world_4 = require('./world' /* comment *\/) */;

_$asi_2, console.log(_$hello_3, _$world_4)

}());
