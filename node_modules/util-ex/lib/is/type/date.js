var isObject = require('./object');
var objectToString = require('../../object-to-string');
var dateClass = '[object Date]';

module.exports = function(d) {
  return isObject(d) && objectToString(d) === dateClass;
}

