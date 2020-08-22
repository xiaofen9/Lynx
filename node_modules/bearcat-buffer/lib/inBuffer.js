var Utils = require('./util/utils');
var Codec = require('./util/codec');

var InBuffer = function(buffer) {
	this.buf = buffer;
	this.offset = 0;
	this.size = buffer.length;
}

InBuffer.prototype.read = function() {
	return this.readByte();
}

InBuffer.prototype.readBoolean = function() {
	var r = this.read();
	if (r < 0) {
		throw new Error('EOFException');
	}

	return (r != 0);
}

InBuffer.prototype.readByte = function() {
	this.check(1);
	return this.buf.readUInt8(this.offset++, true);
}

InBuffer.prototype.readBuffer = function() {
	var len = this.readUInt();
	this.check(len);
	var r = this.buf.slice(this.offset, this.offset + len);
	this.offset += len;
	return r;
}

InBuffer.prototype.readChar = function() {
	return this.readByte();
}

InBuffer.prototype.readVInt = function() {
	return Codec.decodeUInt32(this.getBytes());
}

InBuffer.prototype.readUInt = function() {
	return this.readVInt();
}

InBuffer.prototype.readSInt = function() {
	return Codec.decodeSInt32(this.getBytes());
}

InBuffer.prototype.readDouble = function() {
	this.check(8);
	var r = this.buf.readDoubleLE(this.offset, true);
	this.offset += 8;
	return r;
}

InBuffer.prototype.readFloat = function() {
	this.check(4);
	var r = this.buf.readFloatLE(this.offset, true);
	this.offset += 4;
	return r;
}

InBuffer.prototype.readInt = function() {
	this.check(4);
	var r = this.buf.readInt32LE(this.offset, true);
	this.offset += 4;
	return r;
}

InBuffer.prototype.readShort = function() {
	this.check(2);
	var r = this.buf.readInt16LE(this.offset, true);
	this.offset += 2;
	return r;
}

InBuffer.prototype.readUShort = function() {
	this.check(2);
	var r = this.buf.readUInt16LE(this.offset, true);
	this.offset += 2;
	return r;
}

InBuffer.prototype.readString = function() {
	var len = this.readUInt();
	this.check(len);
	var r = this.buf.toString('utf8', this.offset, this.offset + len);
	this.offset += len;
	return r;
}

InBuffer.prototype.getBytes = function() {
	var bytes = [];
	var offset = this.offset;

	var buffer = this.buf;
	var b;
	do {
		var b = buffer.readUInt8(offset, true);
		bytes.push(b);
		offset++;
	} while (b >= 128);

	this.offset = offset;

	return bytes;
}

InBuffer.prototype.readObject = function() {
	var type = this.readByte();
	var instance = null;
	var typeMap = Utils.typeMap;

	if (typeMap['null'] == type) {

	} else if (typeMap['buffer'] == type) {
		instance = this.readBuffer();
	} else if (typeMap['array'] == type) {
		instance = [];
		var len = this.readVInt();
		for (var i = 0; i < len; i++) {
			instance.push(this.readObject());
		}
	} else if (typeMap['string'] == type) {
		instance = this.readString();
	} else if (typeMap['object'] == type) {
		var objStr = this.readString();
		instance = JSON.parse(objStr);
	} else if (typeMap['bean'] == type) {
		var id = this.readString();
		var bearcat = Utils.getBearcat();
		var bean = bearcat.getBean(id);
		if (!bean) {
			throw new Error('readBean bean not found ' + id);
			return;
		}
		bean.readFields(this);
		instance = bean;
	} else if (typeMap['boolean'] == type) {
		instance = this.readBoolean();
	} else if (typeMap['float'] == type) {
		instance = this.readFloat();
	} else if (typeMap['uint'] == type) {
		instance = this.readUInt();
	} else if (typeMap['sint'] == type) {
		instance = this.readSInt();
	} else {
		throw new Error('readObject invalid read type ' + type);
	}

	return instance;
}

InBuffer.prototype.check = function(len) {
	if (this.offset + len > this.size) {
		throw new Error('IndexOutOfBoundsException');
	}
}

module.exports = InBuffer;