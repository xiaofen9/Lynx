pomelo-sync-plugin
==================

sync plugin for pomelo(>=0.6)


Use [pomelo-sync](https://github.com/NetEase/pomelo-sync) to compose this plugin, you can check the detail information in [here](https://github.com/NetEase/pomelo-sync/blob/master/README.md).


#Installation

```
npm install pomelo-sync-plugin
```

#Usage

```
var sync = require('pomelo-sync-plugin');

//app.js

app.use(sync, {sync: {
  key1: value1,
  key2: value2
}});

```
