# wrap-comment

Safely wrap some text in a JavaScript comment, escaping close `*/` sequences.

Useful if you're commenting text in some source code.

## Install

```bash
npm install wrap-comment
```

## Usage

```js
var wrapComment = require('wrap-comment')
wrapComment('some text')
// → '/* some text */'
wrapComment('tricky /* text */')
// → '/* tricky /* text *\/ */'
```

## License

[MIT](./LICENSE)
