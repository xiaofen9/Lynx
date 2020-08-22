# node-slug

Transforms any text into an uri-safe string.

---

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slynova/slug
# or
$ yarn add @slynova/slug
```

Then require the `slug()` method directly from the package.

```javascript
const slug = require('@slynova/slug')

slug('1 < 2') // 1-less-2
slug('Hey! How are you') // hey-how-are-you
slug('tôi tên là đức tạ') // toi-ten-la-duc-ta
slug('learn adonis in 30minutes') // learn-adonis-in-30-minutes
```

## Extending char map

To extend the char map you can use the static method `extends`

```javascript
const slug = require('@slynova/slug')

slug.extends({'💙': 'love'})
slug('i 💙 you') // i-love-you
```

## Contribution Guidelines

Any pull requests or discussions are welcome.<br>
Note that every pull request providing a new feature or correcting a bug should be created with appropriate unit tests.
