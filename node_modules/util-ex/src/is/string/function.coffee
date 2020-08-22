module.exports = (aFuncString)-> 
  result = /^[;\s]*function(\s+\S*)?\s*\(.*\)\s*{.*}[;\s]*$/.test(aFuncString)


