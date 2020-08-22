isFunction        = require './is/type/function'
extend            = require './_extend'
clonePropertiesTo = require './clone-properties-to'
createObject      = require 'inherits-ex/lib/createObject'
getPrototypeOf    = require 'inherits-ex/lib/getPrototypeOf'

module.exports  = cloneObject = (aObject, tryCloneFn)->
  if tryCloneFn isnt false and isFunction aObject.clone
    result = aObject.clone()
  else
    proto = getPrototypeOf aObject
    ctor = if proto.hasOwnProperty 'Class' then proto.Class else aObject.constructor
    result = createObject ctor
    clonePropertiesTo result, aObject

  result