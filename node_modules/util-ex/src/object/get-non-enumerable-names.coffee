getKeys = Object.keys
getOwnPropertyNames = Object.getOwnPropertyNames

module.exports = (aObject)->
  result = getOwnPropertyNames(aObject)
  if result.length
    keys = getKeys(aObject)
    result = result.filter (k)->keys.indexOf(k) is -1
  result
