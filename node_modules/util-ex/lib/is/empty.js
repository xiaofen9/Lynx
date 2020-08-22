var isEmptyFunction = require('./empty-function');
var isFunction = require('./type/function');
var isArguments = require('./type/arguments');
var hasOwnProperty = Object.prototype.hasOwnProperty;
var getOwnPropertyNames = Object.getOwnPropertyNames; //>=ECMAScript5 only

var argsClass = '[object Arguments]',
    arrayClass = '[object Array]',
    boolClass = '[object Boolean]',
    dateClass = '[object Date]',
    errorClass = '[object Error]',
    funcClass = '[object Function]',
    numberClass = '[object Number]',
    objectClass = '[object Object]',
    regexpClass = '[object RegExp]',
    stringClass = '[object String]';
var support = {};
(function() {
  var ctor = function() { this.x = 1; },
      object = { '0': 1, 'length': 1 },
      props = [];

  ctor.prototype = { 'valueOf': 1, 'y': 1 };
  for (var key in new ctor) { props.push(key); }
  for (key in arguments) { }

  /**
   * Detect if an `arguments` object's [[Class]] is resolvable (all but Firefox < 4, IE < 9).
   *
   * @memberOf _.support
   * @type boolean
   */
  support.argsClass = toString.call(arguments) == argsClass;
}(1));

module.exports = function(value) {
  var result = true;
  if (!value) {
    return result;
  }
  var className = toString.call(value),
      length = value.length;

  if ((className == arrayClass || className == stringClass ||
      (support.argsClass ? className == argsClass : isArguments(value))) ||
      (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
    return !length;
  }

  if (className == funcClass) {
    return isEmptyFunction(value)
  }

  if (getOwnPropertyNames(value).length > 0) return false;
  /*
  for (var key in value) {
    if (hasOwnProperty.call(value, key)) return false;
  }
  */
  return result;
}

