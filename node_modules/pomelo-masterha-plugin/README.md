pomelo-masterha-plugin
======================

master ha plugin for pomelo, it can be used in pomelo(>=0.6).

pomelo-masterha-plugin is a master ha plugin for pomelo, which uses zookeeper to make master as high availability cluster.

##Installation

```
npm install pomelo-masterha-plugin
```

##Usage

Make sure you have installed zookeeper first, then you have built the path you pass to pomelo. The configure code in app.js is as follows:

```
var masterhaPlugin = require('pomelo-masterha-plugin');

app.configure('production|development', function() {
  
  app.use(masterhaPlugin, {
    zookeeper: {
      server: '127.0.0.1:2181',
      path: '/pomelo/master'
    }
  });

});

```

You can start your application using pomelo start as before, then use [pomelo-daemon](https://github.com/fantasyni/pomelo-daemon) to start a slave master.
