# minify-stream

minify javascript in a stream using uglify-js

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]

[npm-image]: https://img.shields.io/npm/v/minify-stream.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/minify-stream
[travis-image]: https://img.shields.io/travis/goto-bus-stop/minify-stream.svg?style=flat-square
[travis-url]: https://travis-ci.org/goto-bus-stop/minify-stream
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard

## Install

```
npm install minify-stream
```

## Usage

```js
var minifyStream = require('minify-stream')

fs.createReadStream('app.js')
  .pipe(minifyStream())
  .pipe(fs.createWriteStream('app.min.js'))
```

## API

### `minifyStream(?options)`

Create a new minify stream. Write a Javascript file or bundle to it.
Possible `options` are:

 - `uglify` - An uglify module to use, defaults to [`terser`](https://npmjs.com/package/terser).
   It must have an uglify-compatible `minify()` function.
 - All other options are passed to the `minify()` function as the second parameter.
   See the [terser docs](https://github.com/fabiosantoscode/terser#minify-options) for available options.

`minify-stream` adds inline source maps by default. Use [`exorcist`](https://npmjs.com/package/exorcist)
to extract source maps from the output stream into a separate file. If you don't need source maps, pass
the `sourceMap: false` option to disable them.

```js
minifyStream({ sourceMap: false })
```

## License

[MIT](LICENSE.md)
