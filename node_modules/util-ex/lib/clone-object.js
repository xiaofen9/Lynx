(function() {
  var cloneObject, clonePropertiesTo, createObject, extend, getPrototypeOf, isFunction;

  isFunction = require('./is/type/function');

  extend = require('./_extend');

  clonePropertiesTo = require('./clone-properties-to');

  createObject = require('inherits-ex/lib/createObject');

  getPrototypeOf = require('inherits-ex/lib/getPrototypeOf');

  module.exports = cloneObject = function(aObject, tryCloneFn) {
    var ctor, proto, result;
    if (tryCloneFn !== false && isFunction(aObject.clone)) {
      result = aObject.clone();
    } else {
      proto = getPrototypeOf(aObject);
      ctor = proto.hasOwnProperty('Class') ? proto.Class : aObject.constructor;
      result = createObject(ctor);
      clonePropertiesTo(result, aObject);
    }
    return result;
  };

}).call(this);

//# sourceMappingURL=clone-object.js.map
