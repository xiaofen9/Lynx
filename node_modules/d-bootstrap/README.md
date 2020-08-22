# Derby Boot

A Derby component library based on Twitter Bootstrap.

## Installation

```
npm install d-bootstrap
```

## Usage

To use the component library in a Derby project pass it to `app.use` as usual.

```javascript
app.use(require('d-bootstrap'));
```

Twitter Bootstrap is installed via npm dependencies, but one can choose whether or not to have the component load the Bootstrap styles by passing an options object to the component through `app.use`. The object should contain a boolean `loadStyles` which dictates if styles are loaded or not. If no options are provided, the styles are loaded automatically.

```javascript
// Loads styles
app.use(require('d-bootstrap')); 

// Loads styles
app.use(require('d-bootstrap'), {loadStyles: true});

// Does not load styles
app.use(require('d-bootstrap'), {loadStyles: false});
```

# Contributors wanted!

This project should implement each of the [Bootstrap JavaScript plugins](http://getbootstrap.com/javascript/) as Derby components.

## MIT License
Copyright (c) 2011 by Nate Smith

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
