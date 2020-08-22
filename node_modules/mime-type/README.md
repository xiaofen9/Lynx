# mime-type

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

The custom more powerful mime-type utility can work with [mime-db](https://github.com/jshttp/mime-db).

fork from [mime-types](https://github.com/jshttp/mime-types), these features added:

- you can load mime-types via [mime-db](https://github.com/jshttp/mime-db) `mime = new Mime(require('mime-db'))`
  - or use `mime = require('mime-type/with-db')` directly, but first
  - you need `npm install mime-db`
- `mime = new Mime()` business, so you could do `lookup = mime.lookup.bind(mime)`.
- you can add the mime-type via `.define(type, mime)` functionality
- you can add many mime-type via `.load(mimes)` functionality
- you can search the mime-type via `.glob(pattern)` functionality
- you can remove a mime-type via `.delete(type)` functionality
- you can clear mime-types via `.clear(filter)` functionality
- `.exist(type)` functionality to check whether a mime-type is exist.
- `.extensions` will be deprecated, use `mime[type].extensions` instead.
- All functions return `undefined` if input is invalid or not found.

Otherwise, the API is compatible.

## Install

```sh
$ npm install mime-type
```

## API

```js
//create an empty mime-type:
var mime = require('mime-type')()
//or create an instance and load mime-db. you need `npm install mime-db`
var mime = require('mime-type/with-db')
//it equals to:
var db = require('mime-db')
var mime = require('mime-type')(db)
```

All functions return `undefined` if input is invalid or not found.

### mime.lookup(path)

Lookup the content-type associated with a file.

```js
mime.lookup('json')             // 'application/json'
mime.lookup('.md')              // 'text/x-markdown'
mime.lookup('file.html')        // 'text/html'
mime.lookup('folder/file.js')   // 'application/javascript'
mime.lookup('folder/.htaccess') // false

mime.lookup('cats') // false
```

### mime.glob(pattern)

Return all MIME types which matching a pattern(See [Minimatch](https://github.com/isaacs/minimatch)).

```js
mime.glob('*/*')             // ['application/octet-stream']
mime.glob('*/*markdown')     // ['text/x-markdown']
mime.glob('text/j*')         // ['text/jade', 'text/jsx']
mime.glob('unknown/x')       // []
```

### mime.exist(type)

test whether a mime-type is exist.
It is an alias for `mime.hasOwnProperty`

```js
mime.exist('text/x-markdown') // true
mime.exist('unknown/xxx')     // false
```

### mime.define(type, object, duplicationWay?)

define a new mime-type. the duplicationWay is optional the process way of duplication extensions:

* mime.dupDefault: the default process way.
* mime.dupOverwrite: the news overwrite the olds
* mime.dupSkip: just skip it.
* mime.dupAppend: append the news to the exist extensions.

return the added extensions list if successful or `undefined`.

```js
mime.define('script/coffee', {
  extensions: ['coffee', 'litcoffee', 'coffee.md']
}, mime.dupAppend)
mime.lookup ('coffee') //[ 'text/coffeescript', 'script/coffee' ]
```

### mime.delete(type)

remove a specified mime-type

```js
mime.delete('script/coffee') //true
```

### mime.clear(filter)

clear all or specified mime-types

the filter could be a string pattern or a function

return the count of deleted mime-types.

```js
mime.clear() //clear all mime-types
mime.clear('text/*') //clear the specified mime-types
mime.clear(function(type, mime){
  return type.substr(0,5) === 'text/'
})
```

### mime.load(mimes)

load a lot of mime-types. return the count of loaded mime-types.

```js
mime.clear() //clear all mime-types
mime.load({
  'script/coffee': {
    extensions: ['coffee', 'coffee.md', 'litcoffee'],
    compressible: true,
    charset: 'utf-8',
    defaultExtension: 'coffee.md'
  },
  'script/python': {
    extensions: ['py', 'py.md', 'litpy'],
    compressible: true,
    charset: 'utf-8'
  }
})
```

### mime.contentType(type)

Create a full content-type header given a content-type or extension.

```js
mime.contentType('markdown')  // 'text/x-markdown; charset=utf-8'
mime.contentType('file.json') // 'application/json; charset=utf-8'

// from a full path
mime.contentType(path.extname('/path/to/file.json')) // 'application/json; charset=utf-8'
```

### mime.extension(type)

Get the default extension for a content-type.

```js
mime.extension('application/octet-stream') // 'bin'
```

### mime.charset(type)

Lookup the implied default charset of a content-type.

```js
mime.charset('text/x-markdown') // 'UTF-8'
```

### var type = mime.types[extension]

A map of content-types by extension.

### [extensions...] = mime.extensions[type]

A map of extensions by content-type.

### var mimeObject = mime[type]

A map of mime object(IMimeType) by content-type.

```ts
export interface IMimeType {
  source: string;
  charset?: string;
  compressible?: boolean;
  extensions: string[]|string;
}
```

### mime.dup: DuplicationProcessWay

the default duplicationo process way.

See `mime.define`.

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/mime-type.svg
[npm-url]: https://npmjs.org/package/mime-type
[node-version-image]: https://img.shields.io/node/v/mime-type.svg
[node-version-url]: http://nodejs.org/download/
[travis-image]: https://img.shields.io/travis/snowyu/mime-type.js/master.svg
[travis-url]: https://travis-ci.org/snowyu/mime-type.js
[coveralls-image]: https://img.shields.io/coveralls/snowyu/mime-type.js/master.svg
[coveralls-url]: https://coveralls.io/r/snowyu/mime-type.js
[downloads-image]: https://img.shields.io/npm/dm/mime-type.svg
[downloads-url]: https://npmjs.org/package/mime-type
