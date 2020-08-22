
/*
 * Usage:
 *   var fn = newFunction('yourFuncName', ['arg1', 'arg2'], 'return log(arg1+arg2);', {log:console.log});
 *
 *   newFunction('function abc(){}');
 *   newFunction('function abc(){}', {log:console.log})
 *   newFunction('function abc(){}', ['log'], [console.log])
 *
 * fn.toString() is :
 * "function yourFuncName(arg1, arg2) {
 *    return log(arg1+arg2);
 *  }"
 */

(function() {
  var createFunc, isArray, isFunction, isObject, isString;

  isArray = require('./is/type/array');

  isString = require('./is/type/string');

  isObject = require('./is/type/object');

  isFunction = require('./is/string/function');

  createFunc = require('./_create-function');

  module.exports = function(name, args, body, scope, values) {
    if (arguments.length === 1) {
      if (!isFunction(name)) {
        name = 'function ' + name + '(){}';
      }
      return createFunc(name);
    }
    if (isFunction(name)) {
      scope = args;
      values = body;
    } else {
      if (isString(args)) {
        values = scope;
        scope = body;
        body = args;
        args = [];
      } else if (args == null) {
        args = [];
      }
      name = 'function ' + name + '(' + args.join(', ') + ') {\n' + body + '\n}';
    }
    return createFunc(name, scope, values);
  };

}).call(this);

//# sourceMappingURL=new-function.js.map
