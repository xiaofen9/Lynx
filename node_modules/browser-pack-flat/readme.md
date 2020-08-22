# browser-pack-flat

Bundle browserify modules into a single scope, a la rollup.

Caveats:

 - Modules are executed fully, one after another, instead of inline.
   This is a potential difference from Node.js and the default browserify behaviour.
   Usually this does not matter, but rarely the order that some things are executed in may change.
 - This rewrites `require()` calls to simple variable assignments.
   If a module wraps `require()` somehow it probably will not work.
   In practice this is quite rare.
 - Using `factor-bundle` to split output code into separate files will not work with this plugin.

## Install

```bash
npm install --save-dev browser-pack-flat
```

## Usage

```bash
browserify /path/to/app.js | browser-unpack | browser-pack-flat
```

Or as a plugin:

```bash
browserify /path/to/app.js -p browser-pack-flat
```

The plugin replaces the `browser-pack` module used by default by browserify.

With the Node API:

```js
var browserify = require('browserify')
var packFlat = require('browser-pack-flat')

browserify({ entries: './src/app.js' })
  .plugin(packFlat, { /* options */ })
  .bundle()
  .pipe(fs.createWriteStream('bundle.js'))
```

## What exactly?

browserify uses [browser-pack](https://github.com/browserify/browser-pack) to output a bundle.
browser-pack uses a small `require`-like runtime and wraps modules in functions to get a module loading behaviour that's almost identical to Node.js.
However this resolution can take a few milliseconds across an entire bundle.

Input:

```js
var unique = require('uniq');

var data = [1, 2, 2, 3, 4, 5, 5, 5, 6];

console.log(unique(data));
```

With browser-pack, this bundle would output:

```js
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var unique = require('uniq');

var data = [1, 2, 2, 3, 4, 5, 5, 5, 6];

console.log(unique(data));
},{"uniq":2}],2:[function(require,module,exports){
"use strict"

/* -- snip -- */

function unique(list, compare, sorted) {
  if(list.length === 0) {
    return list
  }
  if(compare) {
    if(!sorted) {
      list.sort(compare)
    }
    return unique_pred(list, compare)
  }
  if(!sorted) {
    list.sort()
  }
  return unique_eq(list)
}

module.exports = unique

},{}]},{},[1]);
```

browser-pack-flat instead rewrites `require()` calls and `module.exports` assignments to simple variables, and sorts the modules so that the module that would be executed first, is at the top of the bundle.
It doesn't need a runtime in most cases, and no function calls to execute modules.

```js
(function(){
"use strict"

/* -- snip -- */

function unique(list, compare, sorted) {
  if(list.length === 0) {
    return list
  }
  if(compare) {
    if(!sorted) {
      list.sort(compare)
    }
    return unique_pred(list, compare)
  }
  if(!sorted) {
    list.sort()
  }
  return unique_eq(list)
}

var _$unique_2 = unique

var _$main_1 = {};
/* removed: var _$unique_2 = require('uniq'); */;

var data = [1, 2, 2, 3, 4, 5, 5, 5, 6];

console.log(_$unique_2(data));
}());
```

Instead of `require('uniq')`, the main module simply refers to `_$unique_2`, which is the exports value of the `uniq` module.
The only function wrapper is the outermost one, which prevents variables from leaking into the `window` (global scope).

Sometimes it's not possible to sort modules in their execution order, because in the Node.js module system, a module can require another module that requires the first module: a circular dependency.
browser-pack-flat addresses this with a small runtime, to lazily execute modules that are part of a circular dependency chain.
This works similarly to how the Node.js module system works, and to how the standard browser-pack works too.
Instead of rewriting `require()`s to variables and `module.exports` to a variable assignment, in "circular modules" browser-pack-flat adds a function wrapper.
When a circular module is `require()`d, browser-pack-flat will call the function wrapper, which executes the module and caches the exports.

Below, `a.js` depends on `b.js`, and `b.js` depends on `a.js`:

```js
// app.js
console.log(
  require('./a')()
)
// a.js
var b = require('./b')
module.exports = function () {
  return b()
}
// b.js
module.exports = function () {
  return require('./a').toString()
}
```

With browser-pack-flat, this becomes:

```js
(function(){
var createModuleFactory = function createModuleFactory(factory) {
  var module; return function () { if (!module) { module = { exports: {} }; factory(module, module.exports) } return module.exports }
};
var _$a_1 = createModuleFactory(function (module, exports) {
var b = _$b_3()
module.exports = function () {
  return b()
}

});
var _$b_3 = createModuleFactory(function (module, exports) {
module.exports = function () {
  return _$a_1().toString()
}

});
var _$app_2 = {};
console.log(
  _$a_1()()
)

}());
```

The `createModuleFactory` helper returns the exports of the module it wraps, evaluating the module on the first call.
Instead of replacing `require('./a')` with `_$a_1` like browser-pack-flat normally would, it replaced it with `_$a_1()`.

browser-pack-flat does some more things like rewriting top-level variables in modules in case there is another variable with the same name in another module, but that's most of the magic!

## Related

 * [common-shakeify](https://github.com/goto-bus-stop/common-shakeify) - Tree-shaking plugin for browserify based on [@indutny](https://github.com/indutny)'s [common-shake](https://github.com/indutny/common-shake) library
 * [tinyify](https://github.com/browserify/tinyify) - Optimization plugin for browserify, includes browser-pack-flat

## License

[MIT](./LICENSE)

