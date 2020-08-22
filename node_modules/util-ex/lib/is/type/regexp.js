var isObject = require('./object');
var objectToString = require('../../object-to-string');
var regexpClass = '[object RegExp]';

module.exports = function(v) {
  return isObject(v) && objectToString(v) === regexpClass;
}

