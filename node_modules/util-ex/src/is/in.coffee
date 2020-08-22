isRegExp        = require('./type/regexp')

module.exports = (str, list, caseSensitive)->
  str = str.toLowerCase() unless caseSensitive
  for item,i in list
    if isRegExp item
      unless caseSensitive or item.ignoreCase
        list[i] = item  = RegExp item.source, 'i'
      result = item.test str
      break if result
    else
      item = item.toString()
      item = item.toLowerCase() unless caseSensitive
      result = item is str
      break if result
  result
