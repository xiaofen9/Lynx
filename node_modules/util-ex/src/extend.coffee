isArray     = require './is/type/array'
isFunction  = require './is/type/function'

module.exports = (dest, sources, filter)->
  sources = [sources] if not isArray sources
  if isFunction filter
    for src in sources
      continue unless src and src instanceof Object
      keys = Object.keys(src)
      for key in keys
        value = src[key]
        dest[key] = value if filter(key, value)
  else
    for src in sources
      continue unless src and src instanceof Object
      keys = Object.keys(src)
      for key in keys
        dest[key] = src[key]
  dest

