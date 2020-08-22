/* keys:
@param aOptions
  * enumerable: defaults to true
  * nonEnumerable: defaults to false
*/
getOwnPropertyNames = Object.getOwnPropertyNames
getObjectKeys = Object.keys

module.exports = function(aObject, aOptions) {
  var enumerable = true;
  var nonEnumerable = false;
  var result = [];
  var enumKeys;
  var keys;
  if (aOptions) {
    if (aOptions.enumerable != null) enumerable = aOptions.enumerable;
    if (aOptions.nonEnumerable != null) nonEnumerable = aOptions.nonEnumerable;
  }

  if (aObject && (enumerable || nonEnumerable)) {
    if (enumerable && !nonEnumerable) {
      keys = getObjectKeys(aObject);
    } else {
      keys = getOwnPropertyNames(aObject);
      if (!enumerable) {
        enumKeys = getObjectKeys(aObject);
        keys = keys.filter(function(k){return enumKeys.indexOf(k) < 0});
      }
    }
    keys.forEach(function(k){
      result.push(aObject[k]);
    });
  }
  return result;
};
