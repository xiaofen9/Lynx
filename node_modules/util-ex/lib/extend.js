(function() {
  var isArray, isFunction;

  isArray = require('./is/type/array');

  isFunction = require('./is/type/function');

  module.exports = function(dest, sources, filter) {
    var i, j, k, key, keys, l, len, len1, len2, len3, src, value;
    if (!isArray(sources)) {
      sources = [sources];
    }
    if (isFunction(filter)) {
      for (i = 0, len = sources.length; i < len; i++) {
        src = sources[i];
        if (!(src && src instanceof Object)) {
          continue;
        }
        keys = Object.keys(src);
        for (j = 0, len1 = keys.length; j < len1; j++) {
          key = keys[j];
          value = src[key];
          if (filter(key, value)) {
            dest[key] = value;
          }
        }
      }
    } else {
      for (k = 0, len2 = sources.length; k < len2; k++) {
        src = sources[k];
        if (!(src && src instanceof Object)) {
          continue;
        }
        keys = Object.keys(src);
        for (l = 0, len3 = keys.length; l < len3; l++) {
          key = keys[l];
          dest[key] = src[key];
        }
      }
    }
    return dest;
  };

}).call(this);

//# sourceMappingURL=extend.js.map
