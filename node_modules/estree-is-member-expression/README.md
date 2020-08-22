# estree-is-member-expression

check if an AST node is a MemberExpression, in general or a specific one

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]

[npm-image]: https://img.shields.io/npm/v/estree-is-member-expression.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/estree-is-member-expression
[travis-image]: https://img.shields.io/travis/goto-bus-stop/estree-is-member-expression.svg?style=flat-square
[travis-url]: https://travis-ci.org/goto-bus-stop/estree-is-member-expression
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard

## Install

```
npm install estree-is-member-expression
```

## Usage

```js
var isMemberExpression = require('estree-is-member-expression')

var node = parse('function a () {}')
isMemberExpression(node) // false
var node = parse('module.exports')
isMemberExpression(node) // true
isMemberExpression(node, 'module.exports') // true
isMemberExpression(node, 'module.filename') // false
isMemberExpression(node, 'module.filename.toString') // false
var node = parse('module.filename.toString')
isMemberExpression(node, 'module.filename.toString') // true
```

Also see the [tests](./test.js) for more examples.

## API

### `isMemberExpression(node, pattern)`

Check if `node` is a MemberExpression.
If `pattern` is given, check if `node` is a MemberExpression matching the `pattern`.
`pattern` can be a .-delimited string or an array. The pattern can contain more than two elements, all of them must match.

## License

[Apache-2.0](LICENSE.md)
