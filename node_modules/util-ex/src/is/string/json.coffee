isFloat = require('./float')
isString = require('../type/string')

module.exports = (v, almost)->
  result = isString(v) and (v=v.trim()) isnt ''
  if result
    lastIndex = v.length-1
    if v[0] is '"'# or v[0] is "'"
      result = v[lastIndex] is v[0]
      return result if result
    else if v[0] is '{'
      result = v[lastIndex] is '}'
    else if v[0] is '['
      result = v[lastIndex] is ']'
    else
      result = isFloat(v)
      return result if result
    if result and not almost 
      try
        JSON.parse(v)
      catch
        result = false
  result
      

 

