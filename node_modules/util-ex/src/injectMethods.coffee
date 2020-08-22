### injectMethods(object, methods)

inject methods to an object. You can use `this.super()` to call the original method.
and use `this.self` to get the original `this` object if the original method is exists.

* methods*(object)*:
  * key: the method name to inject
  * value: the new method function
###
isFunction   = require('./is/type/function')
injectMethod = require('./injectMethod')
module.exports = (aObject, aMethods, aOptions) ->
  replacedMethods = aOptions.replacedMethods if aOptions and aOptions.replacedMethods
  if aMethods instanceof Object
    for k,v of aMethods
      continue if not isFunction v
      inherited = aObject[k]
      if isFunction(inherited) and not (replacedMethods and replacedMethods[k])
        injectMethod(aObject, k, v)
      else
        aObject[k] = v
###
* scope*(object)*: the new function scope
module.exports = (aObject, aMethods) ->
  if not isArray(aScope) or not isArray(aValues)
    if isObject(aScope)
      keys = Object.keys(aScope)
      aValues = keys.map (k) -> aScope[k]
      aScope = keys
    else
      aValues = []
      aScope = []
  aScope.push 'inherited'
  if aMethods instanceof Object
    for k,v of aMethods
      continue if not isFunction v
      vOrgMethod = aObject[k]
      if not isFunction vOrgMethod
        aObject[k] = v
      else
        aObject[k] = ((inherited)->
          values = aValues.slice()
          values.push inherited
          Function(aScope, "return "+v).apply(@, values)
        )(vOrgMethod)
###
