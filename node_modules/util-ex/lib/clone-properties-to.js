(function() {
  var clonePropertiesTo, defineProperty, getAllOwnKeys, getDescriptor;

  defineProperty = require('./defineProperty');

  getAllOwnKeys = Object.getOwnPropertyNames;

  getDescriptor = Object.getOwnPropertyDescriptor;

  module.exports = clonePropertiesTo = function(dest, src) {
    var attr, i, k, len, ref;
    ref = getAllOwnKeys(src);
    for (i = 0, len = ref.length; i < len; i++) {
      k = ref[i];
      attr = getDescriptor(src, k);
      defineProperty(dest, k, void 0, attr);
    }
    return dest;
  };

}).call(this);

//# sourceMappingURL=clone-properties-to.js.map
