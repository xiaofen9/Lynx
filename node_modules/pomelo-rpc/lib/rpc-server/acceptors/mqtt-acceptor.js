var logger = require('pomelo-logger').getLogger('pomelo-rpc', 'mqtt-acceptor');
var EventEmitter = require('events').EventEmitter;
var Tracer = require('../../util/tracer');
var utils = require('../../util/utils');
var MqttCon = require('mqtt-connection');
var util = require('util');
var net = require('net');

var curId = 1;

var Acceptor = function(opts, cb) {
  EventEmitter.call(this);
  this.interval = opts.interval; // flush interval in ms
  this.bufferMsg = opts.bufferMsg;
  this.rpcLogger = opts.rpcLogger;
  this.rpcDebugLog = opts.rpcDebugLog;
  this._interval = null; // interval object
  this.sockets = {};
  this.msgQueues = {};
  this.cb = cb;
};

util.inherits(Acceptor, EventEmitter);

var pro = Acceptor.prototype;

pro.listen = function(port) {
  //check status
  if (!!this.inited) {
    this.cb(new Error('already inited.'));
    return;
  }
  this.inited = true;

  var self = this;

  this.server = new net.Server();
  this.server.listen(port);

  this.server.on('error', function(err) {
    logger.error('rpc server is error: %j', err.stack);
    self.emit('error', err);
  });

  this.server.on('connection', function(stream) {
    var socket = MqttCon(stream);
    socket['id'] = curId++;

    socket.on('connect', function(pkg) {
      console.log('connected');
    });

    socket.on('publish', function(pkg) {
      pkg = pkg.payload.toString();
      var isArray = false;
      try {
        pkg = JSON.parse(pkg);
        if (pkg instanceof Array) {
          processMsgs(socket, self, pkg);
          isArray = true;
        } else {
          processMsg(socket, self, pkg);
        }
      } catch (err) {
        if (!isArray) {
          doSend(socket, {
            id: pkg.id,
            resp: [cloneError(err)]
          });
        }
        logger.error('process rpc message error %s', err.stack);
      }
    });

    socket.on('pingreq', function() {
      socket.pingresp();
    });

    socket.on('error', function() {
      self.onSocketClose(socket);
    });

    socket.on('close', function() {
      self.onSocketClose(socket);
    });

    self.sockets[socket.id] = socket;

    socket.on('disconnect', function(reason) {
      self.onSocketClose(socket);
    });
  });

  if (this.bufferMsg) {
    this._interval = setInterval(function() {
      flush(self);
    }, this.interval);
  }
};

pro.close = function() {
  if (this.closed) {
    return;
  }
  this.closed = true;
  if (this._interval) {
    clearInterval(this._interval);
    this._interval = null;
  }
  this.server.close();
  this.emit('closed');
};

pro.onSocketClose = function(socket) {
  if (!socket['closed']) {
    var id = socket.id;
    socket['closed'] = true;
    delete this.sockets[id];
    delete this.msgQueues[id];
  }
}

var cloneError = function(origin) {
  // copy the stack infos for Error instance json result is empty
  var res = {
    msg: origin.msg,
    stack: origin.stack
  };
  return res;
};

var processMsg = function(socket, acceptor, pkg) {
  var tracer = null;
  if (this.rpcDebugLog) {
    tracer = new Tracer(acceptor.rpcLogger, acceptor.rpcDebugLog, pkg.remote, pkg.source, pkg.msg, pkg.traceId, pkg.seqId);
    tracer.info('server', __filename, 'processMsg', 'mqtt-acceptor receive message and try to process message');
  }
  acceptor.cb(tracer, pkg.msg, function() {
    // var args = Array.prototype.slice.call(arguments, 0);
    var len = arguments.length;
    var args = new Array(len);
    for (var i = 0; i < len; i++) {
      args[i] = arguments[i];
    }

    var errorArg = args[0]; // first callback argument can be error object, the others are message
    if (errorArg && errorArg instanceof Error) {
      args[0] = cloneError(errorArg);
    }

    var resp;
    if (tracer && tracer.isEnabled) {
      resp = {
        traceId: tracer.id,
        seqId: tracer.seq,
        source: tracer.source,
        id: pkg.id,
        resp: args
      };
    } else {
      resp = {
        id: pkg.id,
        resp: args
      };
    }
    if (acceptor.bufferMsg) {
      enqueue(socket, acceptor, resp);
    } else {
      doSend(socket, resp);
    }
  });
};

var processMsgs = function(socket, acceptor, pkgs) {
  for (var i = 0, l = pkgs.length; i < l; i++) {
    processMsg(socket, acceptor, pkgs[i]);
  }
};

var enqueue = function(socket, acceptor, msg) {
  var id = socket.id;
  var queue = acceptor.msgQueues[id];
  if (!queue) {
    queue = acceptor.msgQueues[id] = [];
  }
  queue.push(msg);
};

var flush = function(acceptor) {
  var sockets = acceptor.sockets,
    queues = acceptor.msgQueues,
    queue, socket;
  for (var socketId in queues) {
    socket = sockets[socketId];
    if (!socket) {
      // clear pending messages if the socket not exist any more
      delete queues[socketId];
      continue;
    }
    queue = queues[socketId];
    if (!queue.length) {
      continue;
    }
    doSend(socket, queue);
    queues[socketId] = [];
  }
};

var doSend = function(socket, msg) {
  socket.publish({
    topic: 'rpc',
    payload: JSON.stringify(msg)
  });
}

/**
 * create acceptor
 *
 * @param opts init params
 * @param cb(tracer, msg, cb) callback function that would be invoked when new message arrives
 */
module.exports.create = function(opts, cb) {
  return new Acceptor(opts || {}, cb);
};