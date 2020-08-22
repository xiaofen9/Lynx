'use strict'

/**
 * node-slug
 *
 * @license MIT
 * @copyright Slynova - Romain Lanz <romain.lanz@slynova.ch>
 */

var kebabCase = require('lodash.kebabcase')
var transform = require('charmap').transform

/**
 * Slugify any given characters.
 *
 * @method slug
 *
 * @param {string|number}  text  Text to Slugify
 *
 * @return {string}
 */
function slug (text) {
  if (text === void 0) return ''

  return kebabCase(
    removeNonAsciiChar(
      transform(
        text.toString()
      )
    )
  )
}

/**
 * Remove non-ascii character.
 *
 * @method removeNonAsciiChar
 *
 * @param {string}  text  Text to remove non-ascii character
 *
 * @return {string}
 */
function removeNonAsciiChar (text) {
  var newText = ''

  for (var i = 0; i <= text.length; i++) {
    if (text.charCodeAt(i) < 128) {
      newText += text[i]
    }
  }

  return newText
}

slug.extends = function (customMap) {
  transform.extends(customMap)
}

module.exports = slug