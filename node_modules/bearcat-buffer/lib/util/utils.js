var Utils = {};

Utils.invokeCallback = function(cb) {
	if (typeof cb === 'function') {
		cb.apply(null, Array.prototype.slice.call(arguments, 1));
	}
};

Utils.applyCallback = function(cb, args) {
	if (typeof cb === 'function') {
		cb.apply(null, args);
	}
};

Utils.getObjectClass = function(obj) {
	if (!obj) {
		return;
	}

	var constructor = obj.constructor;
	if (!constructor) {
		return;
	}

	if (constructor.name) {
		return constructor.name;
	}

	var str = constructor.toString();
	if (!str) {
		return;
	}

	var arr = null;
	if (str.charAt(0) == '[') {
		arr = str.match(/\[\w+\s*(\w+)\]/);
	} else {
		arr = str.match(/function\s*(\w+)/);
	}

	if (arr && arr.length == 2) {
		return arr[1];
	}
};

/**
 * Utils check float
 *
 * @param  {Float}   float
 * @return {Boolean} true|false
 * @api public
 */
Utils.checkFloat = function(v) {
	return v === Number(v) && v % 1 !== 0;
	// return parseInt(v) !== v;
}

/**
 * Utils check type
 *
 * @param  {String}   type
 * @return {Function} high order function
 * @api public
 */
Utils.isType = function(type) {
	return function(obj) {
		return {}.toString.call(obj) == "[object " + type + "]";
	}
}

/**
 * Utils check array
 *
 * @param  {Array}   array
 * @return {Boolean} true|false
 * @api public
 */
Utils.checkArray = Array.isArray || Utils.isType("Array");

/**
 * Utils check number
 *
 * @param  {Number}  number
 * @return {Boolean} true|false
 * @api public
 */
Utils.checkNumber = Utils.isType("Number");

/**
 * Utils check function
 *
 * @param  {Function}   func function
 * @return {Boolean}    true|false
 * @api public
 */
Utils.checkFunction = Utils.isType("Function");
/**
 * Utils check object
 *
 * @param  {Object}   obj object
 * @return {Boolean}  true|false
 * @api public
 */
Utils.checkObject = Utils.isType("Object");

/**
 * Utils check string
 *
 * @param  {String}   string
 * @return {Boolean}  true|false
 * @api public
 */
Utils.checkString = Utils.isType("String");

/**
 * Utils check boolean
 *
 * @param  {Object}   obj object
 * @return {Boolean}  true|false
 * @api public
 */
Utils.checkBoolean = Utils.isType("Boolean");

/**
 * Utils check bean
 *
 * @param  {Object}   obj object
 * @return {Boolean}  true|false
 * @api public
 */
Utils.checkBean = function(obj) {
	return obj && obj['$id'] &&
		Utils.checkFunction(obj['writeFields']) &&
		Utils.checkFunction(obj['readFields']);
}

Utils.checkNull = function(obj) {
	return !Utils.isNotNull(obj);
}

/**
 * Utils args to array
 *
 * @param  {Object}  args arguments
 * @return {Array}   array
 * @api public
 */
Utils.to_array = function(args) {
	var len = args.length;
	var arr = new Array(len);

	for (var i = 0; i < len; i++) {
		arr[i] = args[i];
	}

	return arr;
}

/**
 * Utils check is not null
 *
 * @param  {Object}   value
 * @return {Boolean}  true|false
 * @api public
 */
Utils.isNotNull = function(value) {
	if (value !== null && typeof value !== 'undefined')
		return true;
	return false;
}

Utils.getType = function(object) {
	if (object == null || typeof object === 'undefined') {
		return Utils.typeMap['null'];
	}

	if (Buffer.isBuffer(object)) {
		return Utils.typeMap['buffer'];
	}

	if (Utils.checkArray(object)) {
		return Utils.typeMap['array'];
	}

	if (Utils.checkString(object)) {
		return Utils.typeMap['string'];
	}

	if (Utils.checkObject(object)) {
		if (Utils.checkBean(object)) {
			return Utils.typeMap['bean'];
		}

		return Utils.typeMap['object'];
	}

	if (Utils.checkBoolean(object)) {
		return Utils.typeMap['boolean'];
	}

	if (Utils.checkNumber(object)) {
		if (Utils.checkFloat(object)) {
			return Utils.typeMap['float'];
		}

		if (isNaN(object)) {
			return Utils.typeMap['null'];
		}

		return object > 0 ? Utils.typeMap['uint'] : Utils.typeMap['sint'];
	}
}

var typeArray = ['', 'null', 'buffer', 'array', 'string', 'object', 'bean', 'boolean', 'float', 'uint', 'sint'];
var typeMap = {};
for (var i = 1; i <= typeArray.length; i++) {
	typeMap[typeArray[i]] = i;
}

Utils.typeArray = typeArray;

Utils.typeMap = typeMap;

Utils.getBearcat = function() {
	return require('bear' + 'cat');
}

module.exports = Utils;