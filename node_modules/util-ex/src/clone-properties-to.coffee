defineProperty  = require './defineProperty'

getAllOwnKeys   = Object.getOwnPropertyNames
getDescriptor   = Object.getOwnPropertyDescriptor

module.exports  = clonePropertiesTo = (dest, src)->
  for k in getAllOwnKeys(src)
    attr = getDescriptor(src, k)
    defineProperty dest, k, undefined, attr
  dest
