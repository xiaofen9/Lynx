(function() {
  var getKeys, getOwnPropertyNames;

  getKeys = Object.keys;

  getOwnPropertyNames = Object.getOwnPropertyNames;

  module.exports = function(aObject) {
    var keys, result;
    result = getOwnPropertyNames(aObject);
    if (result.length) {
      keys = getKeys(aObject);
      result = result.filter(function(k) {
        return keys.indexOf(k) === -1;
      });
    }
    return result;
  };

}).call(this);

//# sourceMappingURL=get-non-enumerable-names.js.map
