# estree-is-require

check if an AST node is a valid `require()` call

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]

[npm-image]: https://img.shields.io/npm/v/estree-is-require.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/estree-is-require
[travis-image]: https://img.shields.io/travis/goto-bus-stop/estree-is-require.svg?style=flat-square
[travis-url]: https://travis-ci.org/goto-bus-stop/estree-is-require
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard

## Install

```
npm install estree-is-require
```

## Usage

```js
var isRequire = require('estree-is-require')

var node = parse('function a () {}')
isRequire(node) // false
var node = parse('require("abc")')
isRequire(node) // true
isRequire(node, 'abc') // true
isRequire(node, 'xyz') // false
var node = parse('require(10)')
isRequire(node, 10) // true
```

Also see the [tests](./test.js) for more examples.

## API

### `isRequire(node, source)`

Check if `node` is a call to `require`.
If `source` is given, the first argument to `require` matches it.

## License

[Apache-2.0](LICENSE.md)
