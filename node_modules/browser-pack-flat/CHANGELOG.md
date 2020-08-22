# browser-pack-flat change log

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org/).

## 3.4.2
 * Fix lazy exposed modules. (#41)

## 3.4.1
 * Inline result of `typeof require`, which is used by some UMD headers. (#38)

## 3.4.0
 * Sort dependencies by source order location, now execution order should be much more consistent between Node.js and browser-pack-flat
 * Prevent inlining conditional and lazy `require()` calls:
   ```js
   // this no longer evaluates 'a' if condition is false
   if (condition) require('a')

   // this now evaluates 'b' first, then console.log(), and then 'c' once lazy() is called,
   // instead of evaluating 'b' and 'c' before entering the module
   function lazy () { require('c') }
   require('b')
   console.log()
   lazy()

   // NOTE this *will* still cause out-of-order evaluation! 'b' will be evaluated before
   // console.log() is called.
   console.log()
   require('b')
   ```

## 3.3.0
 * Start changelog.
 * Add `iife: false` option to remove the outer `(function(){})` wrapper if you don't need it (@brechtcs)
 * Add `sourceType` option to not crash on `import` statements. (@brechtcs)
   Don't use this unless you are certain that you have a good use case for it.
