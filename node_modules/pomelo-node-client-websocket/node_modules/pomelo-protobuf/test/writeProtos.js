var protobuf = require('../lib/protobuf');
var fs = require('fs');

var protos = protobuf.parse(require('./example.json'));

console.log(protos);
fs.writeFile('./protos.json', JSON.stringify(protos, null ,2));

fs.writeFile('./msg.json', JSON.stringify(require('./testMsg'), null ,2));

