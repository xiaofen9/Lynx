#Write by http://stackoverflow.com/users/1048572/bergi

###
# Usage:
#   var fn = newFunction('yourFuncName', ['arg1', 'arg2'], 'return log(arg1+arg2);', {log:console.log});
#
#   newFunction('function abc(){}');
#   newFunction('function abc(){}', {log:console.log})
#   newFunction('function abc(){}', ['log'], [console.log])
#
# fn.toString() is :
# "function yourFuncName(arg1, arg2) {
#    return log(arg1+arg2);
#  }"
###

isArray     = require('./is/type/array')
isString    = require('./is/type/string')
isObject    = require('./is/type/object')
isFunction  = require('./is/string/function')
createFunc  = require('./_create-function')

module.exports = (name, args, body, scope, values) ->
  if arguments.length == 1
    name = 'function ' + name + '(){}' if not isFunction(name)
    return createFunc name
      
  if isFunction(name)
    scope = args
    values = body
  else
    if isString(args)
      values = scope
      scope = body
      body = args
      args = []
    else if not args?
      args = []
    name = 'function ' + name + '(' + args.join(', ') + ') {\n' + body + '\n}'

  createFunc name, scope, values
  #Function(scope, 'return ' + name + ';').apply null, values
