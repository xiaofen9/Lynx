d-codemirror
==================

Example CodeMirror Derby component.

# Usage
[Example usage](http://github.com/derbyjs/derby-examples/tree/master/codemirror)

## In your template
```
<Head:>
  <view name="d-codemirror:includes" static="/cm"></view>
<Body:>
  <view name="d-codemirror" text={{_page.text}} options="{{ { tabSize: 2 } }}"></view>
```

## Your data
```
model.set("_page.text", "Hello World");
```

## Your CodeMirror

You can serve the CodeMirror files from your public folder. If you install them through NPM
you will have to add an extra static route to your Express app:

````
var expressApp = express()
  (…)
  .use('/cm', serveStatic(process.cwd() + '/node_modules/d-codemirror/node_modules/codemirror/'))
  (…)
````

See the [derby-examples](http://github.com/derbyjs/derby-examples/tree/master/codemirror)
repo for an example using real-time data subscriptions to power multi-player editing.
