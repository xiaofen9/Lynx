#Write by http://stackoverflow.com/users/1048572/bergi

###
# Usage:
#   var fn = createFunction('yourFuncName', ['arg1', 'arg2'], 'return log(arg1+arg2);', {log:console.log});
#
# fn.toString() is :
# "function yourFuncName(arg1, arg2) {
#    return log(arg1+arg2);
#  }"
###

isArray     = require('./is/type/array')
isString    = require('./is/type/string')
isObject    = require('./is/type/object')
createFunc  = require('./_create-function')

module.exports = (name, args, body, scope, values) ->
  return createFunc 'function '+name + '(){}' if arguments.length == 1
  if isString(args)
    values = scope
    scope = body
    body = args
    args = []
  else if not args?
    args = []
  body = 'function ' + name + '(' + args.join(', ') + ') {\n' + body + '\n}'
  createFunc body, scope, values
