<div align="center">
  <img src="https://res.cloudinary.com/adonisjs/image/upload/q_100/v1557762307/poppinss_iftxlt.jpg" width="600px">
</div>

# Indicative Parser
> Converts indicative rules and messages schema to a tree

[![circleci-image]][circleci-url] [![npm-image]][npm-url] ![][typescript-image] [![license-image]][license-url]

Indicative parser pre-compiles the Indicative schema to a recursive tree of nodes. Each node is given one of the following types.

- `object`: Node with one or more nested children.
- `array`: Node with one or more index or wildcard based nested children.
- `literal`: The leaf nodes.

Do note, that the `literal` **type is not equal to literal values in Javascript**. For parser, the literal nodes are nodes with no leaf.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [Why Indicative needs a parser?](#why-indicative-needs-a-parser)
- [Usage](#usage)
- [Maintainers](#maintainers)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Why Indicative needs a parser?
If you look at the Indicative schema, it is very concise and developer friendly. However, the same schema needs to be parsed to execute the validation rules.

```js
{
  username: 'required',
  'account.type': 'required|in:email,social'
}
```

One way is to loop over the schema object keys, split them by `.` and then inline execute the validations for each field. This process is very straight forward, but will have performance issues.

Instead, we pre-compile the schema (later cache it) and generate a tree, which is easier to reason about and then generated optimized functions from the parsed tree.

## Usage
Install the package from npm registry as follows:

```sh
npm i indicative-parser@alpha

# yarn
yarn add indicative-parser@alpha
```

and then use it as follows:

```js
import { rulesParser } from 'indicative-parser'

rulesParser({
  username: 'required',
  'account.type': 'required|in:email,social'
})
```

Above code outputs the following tree.

```json
{
  "username": {
    "type": "literal",
    "rules": [
      {
        "name": "required",
        "args": []
      }
    ]
  },
  "account": {
    "rules": [],
    "type": "object",
    "children": {
      "type": {
        "type": "literal",
        "rules": [
          {
            "name": "required",
            "args": []
          },
          {
            "name": "in",
            "args": [
              "email",
              "social"
            ]
          }
        ]
      }
    }
  }
}
```

## Maintainers
[Harminder virk](https://github.com/thetutlage)

[circleci-image]: https://img.shields.io/circleci/project/github/poppinss/indicative-parser/master.svg?style=for-the-badge&logo=circleci
[circleci-url]: https://circleci.com/gh/poppinss/indicative-parser "circleci"

[npm-image]: https://img.shields.io/npm/v/indicative-parser.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/indicative-parser "npm"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript

[license-url]: LICENSE.md
[license-image]: https://img.shields.io/aur/license/pac.svg?style=for-the-badge
