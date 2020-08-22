# racer-highway
[![NPM](https://nodei.co/npm/racer-highway.png?downloads=true)](https://nodei.co/npm/racer-highway/)

Transport plugin for [Racer](https://github.com/codeparty/racer). It uses pure `websockets` and fallbacks to `browserchannel` in the case of old browsers and proxy errors. If you only need to use `websockets` try [racer-ws](https://github.com/derbyparty/racer-ws).

## Note

 * Since version 7.0.0 racer-highway supports only racer >= 0.8
 * Since version 8.0.0 racer-highway supports only racer >= 0.9

## Usage

In the server part of your app:

```js
var highway = require('racer-highway'); 

// ...
// var server = http.createServer
// ...

// ...
// var store  = racer.createStore 
// or
// var store  = derby.createStore
// ...

var handlers = highway(store);

expressApp = express();

// ...

expressApp.use(cookieParser());
expressApp.use(session());

// ...

expressApp.use(handlers.middleware);


server.on('upgrade', handlers.upgrade);
```

Connect session support in hooks:
```
var serverOptions = {
  session: session()
}
var handlers = racerHighWay(store, serverOptions);
```

## Browserify

Racer Highway will bundle the client browser script using Browserify in the
call to `store.bundle(...)`, as illustrated in the
[racer-examples](https://github.com/derbyjs/racer-examples).  However, if you
want to do this ahead of time, you can add this to your gulp browserify task
using something like:

```
var browserify = require('browserify');
var racerClientBundle = require('racer-highway/lib/bundle');

// ...

bundler = browserify(opts);
// this adds the racer-highway/lib/browser.js to our bundle
(racerClientBundle())(bundler);
```

## WebSocket Info

* [What is WebSocket?](https://www.websocket.org/)
* [Nginx WebSocket Info](http://nginx.org/en/docs/http/websocket.html)
* [Heroku WebSocket Info](https://devcenter.heroku.com/articles/websockets)

## MIT License
Copyright (c) 2015 by Artur Zayats

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
