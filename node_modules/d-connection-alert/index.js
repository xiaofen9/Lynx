module.exports = ConnectionAlert;
function ConnectionAlert() {}
ConnectionAlert.prototype.view = __dirname;

ConnectionAlert.prototype.reconnect = function() {
  var model = this.model;
  // Hide the reconnect link for a second after clicking it
  model.set('hideReconnect', true);
  setTimeout(function() {
    model.set('hideReconnect', false);
  }, 1000);
  model.reconnect();
};

ConnectionAlert.prototype.reload = function() {
  window.location.reload();
};

ConnectionAlert.prototype.sentenceCase = function(text) {
  return text && (text.charAt(0).toUpperCase() + text.slice(1));
};
