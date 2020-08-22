# estree-is-identifier

check if an AST node is an identifier, optionally with a specific name

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]

[npm-image]: https://img.shields.io/npm/v/estree-is-identifier.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/estree-is-identifier
[travis-image]: https://img.shields.io/travis/goto-bus-stop/estree-is-identifier.svg?style=flat-square
[travis-url]: https://travis-ci.org/goto-bus-stop/estree-is-identifier
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard

## Install

```
npm install estree-is-identifier
```

## Usage

```js
var isIdentifier = require('estree-is-identifier')

var node = parse('function a () {}')
isIdentifier(node) // false
var node = parse('abc')
isIdentifier(node) // true
isIdentifier(node, 'abc') // true
isIdentifier(node, 'xyz') // false
```

Also see the [tests](./test.js) for more examples.

## API

### `isIdentifier(node, name)`

Check if `node` is an identifier.
If `name` is given, check if the identifier has this name.

## License

[Apache-2.0](LICENSE.md)
