var logger = require('pomelo-logger').getLogger('pomelo-rpc', 'Coder');
// var OutBuffer = require('./buffer/outputBuffer');
// var InBuffer = require('./buffer/inputBuffer');
var bBuffer = require('bearcat-buffer');
var OutBuffer = bBuffer.outBuffer;
var InBuffer = bBuffer.inBuffer;

var Coder = {};

Coder.encodeClient = function(id, msg, servicesMap) {
	// logger.debug('[encodeClient] id %s msg %j', id, msg);
	var outBuf = new OutBuffer();
	outBuf.writeUInt(id);
	var namespace = msg['namespace'];
	var serverType = msg['serverType'];
	var service = msg['service'];
	var method = msg['method'];
	var args = msg['args'] || [];
	outBuf.writeShort(servicesMap[0][namespace]);
	outBuf.writeShort(servicesMap[1][service]);
	outBuf.writeShort(servicesMap[2][method]);
	// outBuf.writeString(namespace);
	// outBuf.writeString(service);
	// outBuf.writeString(method);

	outBuf.writeObject(args);

	return outBuf.getBuffer();
}

Coder.encodeServer = function(id, args) {
	// logger.debug('[encodeServer] id %s args %j', id, args);
	var outBuf = new OutBuffer();
	outBuf.writeUInt(id);
	outBuf.writeObject(args);
	return outBuf.getBuffer();	
}

Coder.decodeServer = function(buf, servicesMap) {
	var inBuf = new InBuffer(buf);
	var id = inBuf.readUInt();
	var namespace = servicesMap[3][inBuf.readShort()];
	var service = servicesMap[4][inBuf.readShort()];
	var method = servicesMap[5][inBuf.readShort()];
	// var namespace = inBuf.readString();
	// var service = inBuf.readString();
	// var method = inBuf.readString();

	var args = inBuf.readObject();
	// logger.debug('[decodeServer] namespace %s service %s method %s args %j', namespace, service, method, args)

	return {
		id: id,
		msg: {
			namespace: namespace,
			// serverType: serverType,
			service: service,
			method: method,
			args: args
		}
	}
}

Coder.decodeClient = function(buf) {
	var inBuf = new InBuffer(buf);
	var id = inBuf.readUInt();
	var resp = inBuf.readObject();
	// logger.debug('[decodeClient] id %s resp %j', id, resp);
	return {
		id: id,
		resp: resp
	}
}

module.exports = Coder;