module.exports = function isMemberExpression (node, pattern) {
  if (typeof node !== 'object' || !node) {
    throw new TypeError('estree-is-member-expression: node must be an object')
  }
  if (typeof node.type !== 'string') {
    throw new TypeError('estree-is-member-expression: node must have a string type')
  }

  if (typeof pattern === 'string') {
    pattern = pattern.split('.')
  }
  if (pattern && !Array.isArray(pattern)) {
    throw new TypeError('estree-is-member-expression: pattern must be a .-delimited string or an array of strings')
  }

  return matchesExpression(node, pattern)
}

function matchesExpression (node, pattern) {
  if (node.type !== 'MemberExpression') {
    return false
  }

  if (!pattern) {
    return true
  }

  if (isProperty(node.property, node.computed, pattern[pattern.length - 1])) {
    if (pattern.length === 2) {
      // just checked "a.b", only need to check "a"
      return node.object.type === 'Identifier' && node.object.name === pattern[0]
    }
    return matchesExpression(node.object, pattern.slice(0, -1))
  }
  return false
}

function isProperty (node, computed, name) {
  if (node.type === 'Identifier' && !computed) {
    return node.name === name
  }
  if (node.type === 'StringLiteral' || node.type === 'Literal') {
    return node.value === name
  }
  return false
}
