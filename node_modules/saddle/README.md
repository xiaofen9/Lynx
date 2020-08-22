# Saddle

Saddle contains the various `Template` and `Binding` classes for [DerbyJS](https://github.com/derbyjs/derby).

Saddle doesn't directly depend on any other part of Derby, but to use Saddle, you do need an implementation of `Expression` to pass to `Template`s.

* There are a couple small example `Expression` implementations in [expressions.js](https://github.com/derbyjs/saddle/blob/master/example/expressions.js).
* Derby's full implementations of `Expression`s are in [derbyjs/derby-templates](https://github.com/derbyjs/derby-templates/blob/master/lib/expressions.js).

## Installation

```
npm install saddle
```

## Tests

```
npm test
```

Some of Saddle's tests require a DOM to run, so after running the in-memory tests, `npm test` will print out a URL to run browser-based tests.
