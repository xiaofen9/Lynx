/**
 * https://github.com/novemberborn/identifierfy, compiled to support Node 4
 */

'use strict'
var keyword = require('esutils').keyword

// Follow Babel's implementation:
// <https://github.com/babel/babel/blob/add96d626d98133e26f62ec4c2aeee655bed069a/packages/babel-types/src/validators.js#L153:L164>
function isValidIdentifier (name) {
  return !keyword.isReservedWordES6(name, true) && keyword.isIdentifierNameES6(name)
}

// Rewrite the name until it forms a valid identifier.
module.exports = function identifierfy (name, options) {
  var prefixInvalidIdentifiers = options && options.prefixInvalidIdentifiers !== undefined ? options.prefixInvalidIdentifiers : true
  var prefixReservedWords = options && options.prefixReservedWords !== undefined ? options.prefixReservedWords : true
  // Start with a valid character. This way if the first character in the name
  // is not allowed to be used as the first character it can be prefixed with
  // an underscore, without having to be dropped. The same goes for if the name
  // is a reserved word.
  var intermediate = '_'

  // Flag whether the previous character was invalid (and thus dropped).
  var prevWasInvalid = false

  // Use for/of to iterate over the code points. This way surrogate pairs can
  // be avoided.
  for (var char of name) {
    // Try to uppercase the immediately following (not all characters have an
    // case equivalent though). Ignore if the dropped character was at the front
    // of the name.
    if (prevWasInvalid && intermediate !== '_') {
      char = char.toUpperCase()
    }

    // Only include characters if the name remains valid.
    if (isValidIdentifier(intermediate + char)) {
      intermediate += char
      prevWasInvalid = false
    } else {
      prevWasInvalid = true
    }
  }

  // Return `null` if no characters from the original name survive the process.
  if (intermediate === '_') return null

  // If the name is valid without the underscore prefix return it as such,
  // otherwise retain it, unless directed otherwise.
  var withoutPrefix = intermediate.slice(1)
  if (isValidIdentifier(withoutPrefix)) {
    return withoutPrefix
  } else if (prefixInvalidIdentifiers && prefixReservedWords) {
    return intermediate
  } else {
    var isIdentifierName = keyword.isIdentifierNameES6(withoutPrefix)
    var isReservedWord = keyword.isReservedWordES6(withoutPrefix, true)
    if ((!isIdentifierName && !prefixInvalidIdentifiers) ||
        (isReservedWord && !prefixReservedWords)) {
      return withoutPrefix
    } else {
      return intermediate
    }
  }
}
