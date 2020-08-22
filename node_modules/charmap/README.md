# Charmap Lookup Table

Inspired by [Django Urlify](https://github.com/django/django) and [node-slug](https://github.com/dodo/node-slug).

---

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i charmap
# or
$ yarn add charmap
```

Then require the `transform()` method directly from the package.

```javascript
const { transform } = require('charmap')

transform('ظ') // th
transform('é') // e
transform('<') // less
transform('tôi tên là đức tạ') // toi ten la duc ta
```

## Contribution Guidelines

Any pull requests or discussions are welcome.<br>
Note that every pull request providing a new feature or correcting a bug should be created with appropriate unit tests.
