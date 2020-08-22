var util = require('util');
var crypto = require('crypto');
var utils = require('../util/utils');
var zookeeper = require('node-zookeeper-client');
var Event = zookeeper.Event;
var CreateMode = zookeeper.CreateMode;
var EventEmitter = require('events').EventEmitter;
var logger = require('pomelo-logger').getLogger('pomelo-masterha', __filename);

module.exports = function(app, opts) {
	var component =  new Component(app, opts);
	return component;
};

var Component = function(app, opts) {
  this.app = app;
  this.hosts = opts.server || '127.0.0.1:2181';
  this.path = opts.path || '/pomelo/master';
  this.lockPath = this.path + '/lock';
  this.username = opts.username || 'pomelo';
  this.password = opts.password || 'pomelo';
  this.setACL = opts.setACL;
  this.nodePath = this.lockPath + '/' + this.app.serverId + '-';
  this.version;
  this.onDataSet = false;
  this.authentication = this.username + ':' + this.password;
  var shaDigest = crypto.createHash('sha1').update(this.authentication).digest('base64');
  this.acls = [
    new zookeeper.ACL(
      zookeeper.Permission.ALL,
      new zookeeper.Id('digest', this.username + ':' + shaDigest)
    )
  ];


  this.client = zookeeper.createClient(this.hosts, {sessionTimeout: opts.timeout|| 5000});

  var self = this;
  this.client.once('connected', function() {
    self.client.addAuthInfo('digest', new Buffer(self.authentication));
    if(self.setACL) {
      self.client.setACL(self.path, self.acls, -1, function(error, stat) {
        if(error) {
          logger.warn('Failed to set ACL: %s.', error);
          return;
        }
        logger.info('ACL is set to: %j', self.acls);
      });
    }
    watchNode(self.client, self.path, onMasterUpdate.bind(self));
  });

  this.client.connect();
};

util.inherits(Component, EventEmitter);

Component.prototype.start = function(cb) {
  var self = this;

	if(this.app.serverType !== 'master') {
    logger.info('bind masterupdate event for %j', this.app.serverId);
    this.on('onMasterUpdate', this.reconnect.bind(this));
    utils.invokeCallback(cb);
  } else {
	 createNode(this.client, this.lockPath, function(err, result) {
    if(err) {
      logger.error('start zookeeper failed! err : %j', err);
      utils.invokeCallback(cb, err);
      return;
    }
    self.getLock(function(err, result) {
      if(err || !result) {
        self.on('onPromote', self.onPromote.bind(self));
        utils.invokeCallback(cb);
      } else {
        self.setData(self.app.getMaster(), function(err) {
          if(err) {
            logger.error('set master info failed!');
            utils.invokeCallback(cb);
            return;
          }
          utils.invokeCallback(cb);
        });
      }
    });
   });
  }
};

Component.prototype.stop = function(force, cb) {
	this.client.close();
  utils.invokeCallback(cb);
};

Component.prototype.setData = function(data, cb) {
  var buffer = new Buffer(JSON.stringify(data));
  var self = this;

  this.client.setData(this.path, buffer, function(err, result) {
    if(err) {
      logger.warn('set Data error for server %j', this.app.serverId);
      utils.invokeCallback(cb, err);
      return;
    }
    if(cb) {
      utils.invokeCallback(cb, err, result);
    }
  });
};

Component.prototype.getData = function(cb) {
  this.client.getData(this.path, function(err, data) {
    if(err) {
      logger.warn('get master info failed for server : %j!', this.serverId);
      utils.invokeCallback(cb, err);
      return;
    }
    utils.invokeCallback(cb, null, data.toString());
  });
};

Component.prototype.getLock = function(cb) {
  var self = this;
  var client = this.client;
  var serverId = this.app.serverId;
  
  if(this.version) {
    checkLock(this, cb);
  } else {
    client.create(this.nodePath, serverId, CreateMode.EPHEMERAL_SEQUENTIAL, function(err, path) {
      if(err) {
        logger.warn('getLock error! node path  %j, serverId : %j, err : %j', self.nodePath, serverId, err);
        utils.invokeCallback(cb, err);
        return;
      }
      self.version = parseInt(path.substr(path.lastIndexOf('-')+1), 10);
      checkLock(self, cb);
    });
  }
};

Component.prototype.onPromote = function() {
  var self = this;
  this.getLock(function(err, result) {
    if(result) {
      self.setData(self.app.getMaster(), function(err, result) {
        if(err) {
          logger.error('setData failed, err: ' + err.stack);
        } else {
          logger.info('server host: %s, port: %s now is promoted to master!', self.app.master.host, self.app.master.port);
        }
      });
    }
  });
};

Component.prototype.reconnect = function() {
  var self = this;
  this.getData(function(err, masterInfo) {
    if(err || !masterInfo) {
      logger.error('get masterInfo failed, err ' + err.stack);
      return;
    }
    var monitor = self.app.components.__monitor__;
    monitor.reconnect(JSON.parse(masterInfo));
  });
};

function checkLock(self, cb) {
  var client = self.client;
  var version = self.version;
  var lockPath = self.lockPath;

  client.getChildren(lockPath, function(err, children, stat) {
    if(err) {
      logger.warn('get children error for serverId %j!', this.app.serverId);
      utils.invokeCallback(cb, err);
      return;
    }

    var data = getVersion(children);
    var versions = data.versions;

    if(version === versions[0]) {
      cb(null, true);
    } else {
      var node = getWatchNode(version, data);
      var nodePath = lockPath + '/' + node;
      if(node) {
        watchNode(client, nodePath, onNodeChange.bind(self));
        utils.invokeCallback(cb, null, false);
        return;
      } else {
        cb(new Error('Can not find watch node!'));
      }
    }
  });
};

function getVersion(children) {
  var versions = [];
  var map = {};

  for(var i = 0; i < children.length; i++) {
    var child = children[i];
    var version = parseInt(child.substr(child.lastIndexOf('-') + 1), 10);

    versions.push(version);
    map[version] = child;
  }

  //sort the version numbers
  versions.sort();

  return {
    versions : versions,
    map : map
  };
};

function getWatchNode(version, data) {
  var versions = data.versions;
  var map = data.map;

  for(var i = 1; i < versions.length; i++) {
    if(version === versions[i]) {
      return map[versions[i-1]];
    }
  }
  return null;
}

function createNode(client, path, value, cb) {
  if(typeof(value) === 'function') {
    cb = value;
    value = null;
  }

  client.exists(path, function(err, stat) {
    if(err) {
      utils.invokeCallback(cb, err);
      return;
    }

    //If node not exist, create the node
    if(!stat) {
      client.create(path, value, function(err, result) {
        logger.info('create node result, path : %j, err : %j, result : %j', path, err, result);
        utils.invokeCallback(cb, err, result);
        return;
      });
    } else {
      utils.invokeCallback(cb);
      return;
    }
  });
};

function watchNode(client, path, func) {
  client.exists(path, func, function(err, stat) {
    if(err || !stat) {
      logger.warn('Watch path not exist! path: %j', path);
    }
  });
};

function onNodeChange(event) {
  if(event.type === Event.NODE_DELETED) {
    logger.info('promote master');
    this.emit('onPromote');
  }
};

function onMasterUpdate(event) {
  if(event.type === Event.NODE_DATA_CHANGED) {
    this.emit('onMasterUpdate');
  }

  if(event.type !== Event.NODE_DELETED) {
    watchNode(this.client, this.path, onMasterUpdate.bind(this));
  }
};