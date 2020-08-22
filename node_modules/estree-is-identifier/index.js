module.exports = function isIdentifier (node, name) {
  if (typeof node !== 'object' || !node) {
    throw new TypeError('estree-is-identifier: node must be an object')
  }
  if (typeof node.type !== 'string') {
    throw new TypeError('estree-is-identifier: node must have a string type')
  }

  if (node.type !== 'Identifier') {
    return false
  }

  if (!name) {
    return true
  }

  return node.name === name
}

