var OutBuffer = require('../lib/outBuffer');
var InBuffer = require('../lib/inBuffer');

var outBuffer = new OutBuffer();

var case1 = [1, '1', 'aaa', 1.2, {
	a: 1
}, new Buffer('aaa'), -1, 0, null, NaN, undefined];

var case2 = [-100];

var o = {
	id: 4,
	frontendId: 'connector-server-1',
	uid: 210073,
	settings: {}
};

var case3 = [100, 'aaa', o];

var case4 = ["user", 220062, {
	"oid": 210087,
	"name": "",
	"gender": 1,
	"create_tm": 0,
	"create_ip": "127.0.0.1",
	"honor": 0,
	"gold_cur": 0,
	"gold_total": 0,
	"online_tm": 0,
	"timestamp": 0,
	"level": 1,
	"scene": "{\"userForce\":1100024}",
	"id": 220062
}];

var case5 = [null, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 174, 1111111111111111]];

var case6 = 0;

var value = case5;

var num = 1;
for (var i = 0; i < num; i++) {
	outBuffer.writeObject(value);
	// outBuffer.writeObject(case1);

	var buf = outBuffer.getBuffer();
	console.log(buf)
	console.log(buf.length);

	var inBuffer = new InBuffer(buf);
	var obj = inBuffer.readObject();

	console.log(obj)
}