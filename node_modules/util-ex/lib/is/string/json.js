(function() {
  var isFloat, isString;

  isFloat = require('./float');

  isString = require('../type/string');

  module.exports = function(v, almost) {
    var lastIndex, result;
    result = isString(v) && (v = v.trim()) !== '';
    if (result) {
      lastIndex = v.length - 1;
      if (v[0] === '"') {
        result = v[lastIndex] === v[0];
        if (result) {
          return result;
        }
      } else if (v[0] === '{') {
        result = v[lastIndex] === '}';
      } else if (v[0] === '[') {
        result = v[lastIndex] === ']';
      } else {
        result = isFloat(v);
        if (result) {
          return result;
        }
      }
      if (result && !almost) {
        try {
          JSON.parse(v);
        } catch (_error) {
          result = false;
        }
      }
    }
    return result;
  };

}).call(this);

//# sourceMappingURL=json.js.map
