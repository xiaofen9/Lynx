# observable-to-promise [![Build Status](https://travis-ci.org/sindresorhus/observable-to-promise.svg?branch=master)](https://travis-ci.org/sindresorhus/observable-to-promise)

> Convert an [Observable](https://github.com/tc39/proposal-observable) to a Promise


## Install

```
$ npm install observable-to-promise
```


## Usage

```js
const observableToPromise = require('observable-to-promise');

(async () => {
	const promise = observableToPromise(Observable.of(1, 2));

	console.log(await promise);
	//=> [1, 2]
})();
```


## Related

- [is-observable](https://github.com/sindresorhus/is-observable) - Check if a value is an Observable
