var isIdentifier = require('estree-is-identifier')

module.exports = function isRequire (node, source) {
  if (typeof node !== 'object' || !node) {
    throw new TypeError('estree-is-require: node must be an object')
  }
  if (typeof node.type !== 'string') {
    throw new TypeError('estree-is-require: node must have a string type')
  }

  if (node.type !== 'CallExpression' || !isIdentifier(node.callee, 'require')) {
    return false
  }

  var arg = node.arguments[0]
  if (!arg) {
    return false
  }

  if (arg.type !== 'Literal' && arg.type !== 'StringLiteral' && arg.type !== 'NumericLiteral' && arg.type !== 'TemplateLiteral') {
    return false
  }

  if (!source) {
    return true
  }

  if (arg.type === 'TemplateLiteral' && arg.quasis.length === 1 && arg.quasis[0].type === 'TemplateElement') {
    return arg.quasis[0].value.cooked === source
  }

  return arg.value === source
}
