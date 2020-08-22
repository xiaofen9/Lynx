
/*
 * Usage:
 *   var fn = createFunction('yourFuncName', ['arg1', 'arg2'], 'return log(arg1+arg2);', {log:console.log});
 *
 * fn.toString() is :
 * "function yourFuncName(arg1, arg2) {
 *    return log(arg1+arg2);
 *  }"
 */

(function() {
  var createFunc, isArray, isObject, isString;

  isArray = require('./is/type/array');

  isString = require('./is/type/string');

  isObject = require('./is/type/object');

  createFunc = require('./_create-function');

  module.exports = function(name, args, body, scope, values) {
    if (arguments.length === 1) {
      return createFunc('function ' + name + '(){}');
    }
    if (isString(args)) {
      values = scope;
      scope = body;
      body = args;
      args = [];
    } else if (args == null) {
      args = [];
    }
    body = 'function ' + name + '(' + args.join(', ') + ') {\n' + body + '\n}';
    return createFunc(body, scope, values);
  };

}).call(this);

//# sourceMappingURL=createFunction.js.map
