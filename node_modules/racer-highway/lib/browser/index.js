var racer = require('racer');
var Socket = require('./socket');
var CLIENT_OPTIONS = JSON.parse('{{clientOptions}}');

racer.Model.prototype._createSocket = function(bundle) {
  return new Socket(CLIENT_OPTIONS);
};

