###
# Usage:
#   var fn = _createFunction('function yourFuncName(arg1, arg2){log(arg1+arg2);}', {log:console.log});
#
#   _createFunction('function abc(){}');
#   _createFunction('function abc(){}', {log:console.log})
#   _createFunction('function abc(){}', ['log'], [console.log])
#
# fn.toString() is :
# "function yourFuncName(arg1, arg2) {
#    return log(arg1+arg2);
#  }"
###

isArray     = require('./is/type/array')
isObject    = require('./is/type/object')

module.exports = (body, scope, values) ->
  if arguments.length == 1
    Function('return ' + body)()
  else
    if !isArray(scope) or !isArray(values)
      if isObject(scope)
        keys = Object.keys(scope)
        values = keys.map((k) ->
          scope[k]
        )
        scope = keys
      else
        values = []
        scope = []
    Function(scope, 'return ' + body).apply null, values

