
/*
 * Usage:
 *   var fn = _createFunction('function yourFuncName(arg1, arg2){log(arg1+arg2);}', {log:console.log});
 *
 *   _createFunction('function abc(){}');
 *   _createFunction('function abc(){}', {log:console.log})
 *   _createFunction('function abc(){}', ['log'], [console.log])
 *
 * fn.toString() is :
 * "function yourFuncName(arg1, arg2) {
 *    return log(arg1+arg2);
 *  }"
 */

(function() {
  var isArray, isObject;

  isArray = require('./is/type/array');

  isObject = require('./is/type/object');

  module.exports = function(body, scope, values) {
    var keys;
    if (arguments.length === 1) {
      return Function('return ' + body)();
    } else {
      if (!isArray(scope) || !isArray(values)) {
        if (isObject(scope)) {
          keys = Object.keys(scope);
          values = keys.map(function(k) {
            return scope[k];
          });
          scope = keys;
        } else {
          values = [];
          scope = [];
        }
      }
      return Function(scope, 'return ' + body).apply(null, values);
    }
  };

}).call(this);

//# sourceMappingURL=_create-function.js.map
