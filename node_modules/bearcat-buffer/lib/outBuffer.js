var Utils = require('./util/utils');
var Codec = require('./util/codec');
var BUFFER_SIZE_DEFAULT = 32;

var OutBuffer = function(size) {
	this.offset = 0;
	this.size = size || BUFFER_SIZE_DEFAULT;
	this.buf = new Buffer(this.size);
}

OutBuffer.prototype.getData = function() {
	return this.buf;
}

OutBuffer.prototype.getBuffer = function() {
	return this.buf.slice(0, this.offset);
}

OutBuffer.prototype.getLength = function() {
	return this.offset;
}

OutBuffer.prototype.write = function(data, offset, len) {
	this.ensureCapacity(len);
	this.buf.write(data, offset, len);
	this.offset += len;
}

OutBuffer.prototype.writeBoolean = function(v) {
	this.writeByte(v ? 1 : 0);
}

OutBuffer.prototype.writeByte = function(v) {
	this.ensureCapacity(1);
	this.buf.writeUInt8(v, this.offset++, true);
}

OutBuffer.prototype.writeBuffer = function(bytes) {
	var len = bytes.length;
	this.ensureCapacity(len + 4);
	this.writeUInt(len);
	var buffer = this.buf;
	var offset = this.offset;
	for (var i = 0; i < len; i++) {
		buffer.writeUInt8(bytes[i], offset++, true);
	}
	this.offset = offset;
}

OutBuffer.prototype.writeBytes = function(bytes) {
	var len = bytes.length;
	var buffer = this.buf;
	var offset = this.offset;
	for (var i = 0; i < len; i++) {
		buffer.writeUInt8(bytes[i], offset++, true);
	}
	this.offset = offset;
}

OutBuffer.prototype.writeChar = function(v) {
	this.writeByte(v);
}

OutBuffer.prototype.writeChars = function(bytes) {
	this.writeBuffer(bytes);
}

OutBuffer.prototype.writeVInt = function(v) {
	var bytes = Codec.encodeUInt32(v);
	this.writeBytes(bytes);
}

OutBuffer.prototype.writeDouble = function(v) {
	this.ensureCapacity(8);
	this.buf.writeDoubleLE(v, this.offset, true);
	this.offset += 8;
}

OutBuffer.prototype.writeFloat = function(v) {
	this.ensureCapacity(4);
	this.buf.writeFloatLE(v, this.offset, true);
	this.offset += 4;
}

OutBuffer.prototype.writeInt = function(v) {
	this.ensureCapacity(4);
	this.buf.writeInt32LE(v, this.offset, true);
	this.offset += 4;
}

OutBuffer.prototype.writeUInt = function(v) {
	this.writeVInt(v);
}

OutBuffer.prototype.writeSInt = function(v) {
	var bytes = Codec.encodeSInt32(v);
	this.writeBytes(bytes);
}

OutBuffer.prototype.writeShort = function(v) {
	this.ensureCapacity(2);
	this.buf.writeInt16LE(v, this.offset, true);
	this.offset += 2;
}

OutBuffer.prototype.writeUShort = function(v) {
	this.ensureCapacity(2);
	this.buf.writeUInt16LE(v, this.offset, true);
	this.offset += 2;
}

OutBuffer.prototype.writeString = function(str) {
	var len = Buffer.byteLength(str);
	this.ensureCapacity(len + 4);
	this.writeUInt(len);
	this.buf.write(str, this.offset, len);
	this.offset += len;
}

OutBuffer.prototype.writeObject = function(object) {
	var type = Utils.getType(object);
	// console.log('writeObject %d', type)
	if (!type) {
		throw new Error('invalid writeObject ' + object);
	}

	this.writeByte(type);

	var typeMap = Utils.typeMap;

	if (typeMap['null'] == type) {
		return;
	}

	if (typeMap['buffer'] == type) {
		this.writeBuffer(object);
		return;
	}

	if (typeMap['array'] == type) {
		var len = object.length;
		this.writeVInt(len);
		for (var i = 0; i < len; i++) {
			this.writeObject(object[i]);
		}
		return;
	}

	if (typeMap['string'] == type) {
		this.writeString(object);
		return;
	}

	if (typeMap['object'] == type) {
		this.writeString(JSON.stringify(object));
		// logger.error('invalid writeObject object must be bearcat beans and should implement writeFields and readFields interfaces');
		return;
	}

	if (typeMap['bean'] == type) {
		this.writeString(object['$id']);
		object.writeFields(this);
		return;
	}

	if (typeMap['boolean'] == type) {
		this.writeBoolean(object);
		return;
	}

	if (typeMap['float'] == type) {
		this.writeFloat(object);
		return;
	}

	if (typeMap['uint'] == type) {
		this.writeUInt(object);
		return;
	}

	if (typeMap['sint'] == type) {
		this.writeSInt(object);
		return;
	}
}

OutBuffer.prototype.ensureCapacity = function(len) {
	var minCapacity = this.offset + len;
	if (minCapacity > this.buf.length) {
		this.grow(minCapacity); // double grow
	}
}

OutBuffer.prototype.grow = function(minCapacity) {
	var oldCapacity = this.buf.length;
	var newCapacity = oldCapacity << 1;
	if (newCapacity - minCapacity < 0) {
		newCapacity = minCapacity;
	}

	if (newCapacity < 0 && minCapacity < 0) {
		throw new Error('OutOfMemoryError');
		newCapacity = 0x7fffffff; // Integer.MAX_VALUE
	}

	// console.log('grow minCapacity %d newCapacity %d', minCapacity, newCapacity);
	var newBuf = new Buffer(newCapacity);
	this.buf.copy(newBuf);
	this.buf = newBuf;
}

OutBuffer.prototype.copy = function(target, offset, sourceStart, sourceEnd) {
	var len = sourceEnd - sourceStart;
	target.ensureCapacity(len);
	this.buf.copy(target.buf, offset, sourceStart, sourceEnd);
	target.offset += len;
}

module.exports = OutBuffer;