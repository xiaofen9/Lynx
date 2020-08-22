var logger = require('pomelo-logger').getLogger('pomelo-rpc', 'mqtt2-mailbox');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../../util/constants');
var Tracer = require('../../util/tracer');
var MqttCon = require('mqtt-connection');
var utils = require('../../util/utils');
var Coder = require('../../util/coder');
var util = require('util');
var net = require('net');

var CONNECT_TIMEOUT = 2000;

var MailBox = function(server, opts) {
  EventEmitter.call(this);
  this.curId = 0;
  this.id = server.id;
  this.host = server.host;
  this.port = server.port;
  this.requests = {};
  this.timeout = {};
  this.queue = [];
  this.servicesMap = {};
  this.bufferMsg = opts.bufferMsg;
  this.keepalive = opts.keepalive || Constants.DEFAULT_PARAM.KEEPALIVE;
  this.interval = opts.interval || Constants.DEFAULT_PARAM.INTERVAL;
  this.timeoutValue = opts.timeout || Constants.DEFAULT_PARAM.CALLBACK_TIMEOUT;
  this.keepaliveTimer = null;
  this.lastPing = -1;
  this.lastPong = -1;
  this.connected = false;
  this.closed = false;
  this.opts = opts;
  this.serverId = opts.context.serverId;
};

util.inherits(MailBox, EventEmitter);

MailBox.prototype.connect = function(tracer, cb) {
  tracer && tracer.info('client', __filename, 'connect', 'mqtt-mailbox try to connect');
  if (this.connected) {
    tracer && tracer.error('client', __filename, 'connect', 'mailbox has already connected');
    return cb(new Error('mailbox has already connected.'));
  }

  var self = this;

  var stream = net.createConnection(this.port, this.host);
  this.socket = MqttCon(stream);

  var connectTimeout = setTimeout(function() {
    logger.error('rpc client %s connect to remote server %s timeout', self.serverId, self.id);
    self.emit('close', self.id);
  }, CONNECT_TIMEOUT);

  this.socket.connect({
    clientId: 'MQTT_RPC_' + Date.now()
  }, function() {
    if (self.connected) {
      return;
    }

    clearTimeout(connectTimeout);
    self.connected = true;
    if (self.bufferMsg) {
      self._interval = setInterval(function() {
        flush(self);
      }, self.interval);
    }

    self.setupKeepAlive();
  });

  this.socket.on('publish', function(pkg) {
    if(pkg.topic == Constants['TOPIC_HANDSHAKE']) {
      upgradeHandshake(self, pkg.payload);
      return cb();
    }
    try {
      pkg = Coder.decodeClient(pkg.payload);
      processMsg(self, pkg);
    } catch (err) {
      logger.error('rpc client %s process remote server %s message with error: %s', self.serverId, self.id, err.stack);
    }
  });

  this.socket.on('error', function(err) {
    logger.error('rpc socket %s is error, remote server %s host: %s, port: %s', self.serverId, self.id, self.host, self.port);
    self.emit('close', self.id);
    self.close();
  });

  this.socket.on('pingresp', function() {
    self.lastPong = Date.now();
  });

  this.socket.on('disconnect', function(reason) {
    logger.error('rpc socket %s is disconnect from remote server %s, reason: %s', self.serverId, self.id, reason);
    var reqs = self.requests;
    for (var id in reqs) {
      var ReqCb = reqs[id];
      ReqCb(tracer, new Error(self.serverId + ' disconnect with remote server ' + self.id));
    }
    self.emit('close', self.id);
  });
};

/**
 * close mailbox
 */
MailBox.prototype.close = function() {
  this.closed = true;
  this.connected = false;
  if (this._interval) {
    clearInterval(this._interval);
    this._interval = null;
  }
  if(this.keepaliveTimer) {
    clearInterval(this.keepaliveTimer);
    this.keepaliveTimer = null;
  }
  if(this.socket) {
    this.socket.destroy();
  }
};

/**
 * send message to remote server
 *
 * @param msg {service:"", method:"", args:[]}
 * @param opts {} attach info to send method
 * @param cb declaration decided by remote interface
 */
MailBox.prototype.send = function(tracer, msg, opts, cb) {
  tracer && tracer.info('client', __filename, 'send', 'mqtt-mailbox try to send');
  if (!this.connected) {
    tracer && tracer.error('client', __filename, 'send', 'mqtt-mailbox not init');
    cb(tracer, new Error(this.serverId + ' mqtt-mailbox is not init ' + this.id));
    return;
  }

  if (this.closed) {
    tracer && tracer.error('client', __filename, 'send', 'mailbox has already closed');
    cb(tracer, new Error(this.serverId + ' mqtt-mailbox has already closed ' + this.id));
    return;
  }

  var id = this.curId++;
  this.requests[id] = cb;
  setCbTimeout(this, id, tracer, cb);

  var pkg;
  if (tracer && tracer.isEnabled) {
    pkg = {
      traceId: tracer.id,
      seqId: tracer.seq,
      source: tracer.source,
      remote: tracer.remote,
      id: id,
      msg: msg
    };
  } else {
    pkg = Coder.encodeClient(id, msg, this.servicesMap);
    // pkg = {
    //   id: id,
    //   msg: msg
    // };
  }
  if (this.bufferMsg) {
    enqueue(this, pkg);
  } else {
    doSend(this.socket, pkg);
  }
};

MailBox.prototype.setupKeepAlive = function() {
  var self = this;
  this.keepaliveTimer = setInterval(function() {
    self.checkKeepAlive();
  }, this.keepalive);
}

MailBox.prototype.checkKeepAlive = function() {
  if (this.closed) {
    return;
  }

  // console.log('checkKeepAlive lastPing %d lastPong %d ~~~', this.lastPing, this.lastPong);
  var now = Date.now();
  var KEEP_ALIVE_TIMEOUT = this.keepalive * 2;
  if (this.lastPing > 0) {
    if (this.lastPong < this.lastPing) {
      if (now - this.lastPing > KEEP_ALIVE_TIMEOUT) {
        logger.error('mqtt rpc client %s checkKeepAlive timeout from remote server %s for %d lastPing: %s lastPong: %s', this.serverId, this.id, KEEP_ALIVE_TIMEOUT, this.lastPing, this.lastPong);
        this.emit('close', this.id);
        this.lastPing = -1;
        // this.close();
      }
    } else {
      this.socket.pingreq();
      this.lastPing = Date.now();
    }
  } else {
    this.socket.pingreq();
    this.lastPing = Date.now();
  }
}

var enqueue = function(mailbox, msg) {
  mailbox.queue.push(msg);
};

var flush = function(mailbox) {
  if (mailbox.closed || !mailbox.queue.length) {
    return;
  }
  doSend(mailbox.socket, mailbox.queue);
  mailbox.queue = [];
};

var doSend = function(socket, msg) {
  socket.publish({
    topic: 'rpc',
    payload: msg
    // payload: JSON.stringify(msg)
  });
}

var upgradeHandshake = function(mailbox, msg) {
  var servicesMap = JSON.parse(msg.toString());
  mailbox.servicesMap = servicesMap;
}

var processMsgs = function(mailbox, pkgs) {
  for (var i = 0, l = pkgs.length; i < l; i++) {
    processMsg(mailbox, pkgs[i]);
  }
};

var processMsg = function(mailbox, pkg) {
  var pkgId = pkg.id;
  clearCbTimeout(mailbox, pkgId);
  var cb = mailbox.requests[pkgId];
  if (!cb) {
    return;
  }

  delete mailbox.requests[pkgId];
  var rpcDebugLog = mailbox.opts.rpcDebugLog;
  var tracer = null;
  var sendErr = null;
  if (rpcDebugLog) {
    tracer = new Tracer(mailbox.opts.rpcLogger, mailbox.opts.rpcDebugLog, mailbox.opts.clientId, pkg.source, pkg.resp, pkg.traceId, pkg.seqId);
  }
  var pkgResp = pkg.resp;

  cb(tracer, sendErr, pkgResp);
};

var setCbTimeout = function(mailbox, id, tracer, cb) {
  // console.log('setCbTimeout %d', id);
  var timer = setTimeout(function() {
    // logger.warn('rpc request is timeout, id: %s, host: %s, port: %s', id, mailbox.host, mailbox.port);
    clearCbTimeout(mailbox, id);
    if (mailbox.requests[id]) {
      delete mailbox.requests[id];
    }
    var eMsg = util.format('rpc %s callback timeout %d, remote server %s host: %s, port: %s', mailbox.serverId, mailbox.timeoutValue, id, mailbox.host, mailbox.port);
    logger.error(eMsg);
    cb(tracer, new Error(eMsg));
  }, mailbox.timeoutValue);
  mailbox.timeout[id] = timer;
};

var clearCbTimeout = function(mailbox, id) {
  // console.log('clearCbTimeout %d', id);
  if (!mailbox.timeout[id]) {
    logger.warn('timer is not exsits, serverId: %s remote: %s, host: %s, port: %s', mailbox.serverId, id, mailbox.host, mailbox.port);
    return;
  }
  clearTimeout(mailbox.timeout[id]);
  delete mailbox.timeout[id];
};

/**
 * Factory method to create mailbox
 *
 * @param {Object} server remote server info {id:"", host:"", port:""}
 * @param {Object} opts construct parameters
 *                      opts.bufferMsg {Boolean} msg should be buffered or send immediately.
 *                      opts.interval {Boolean} msg queue flush interval if bufferMsg is true. default is 50 ms
 */
module.exports.create = function(server, opts) {
  return new MailBox(server, opts || {});
};