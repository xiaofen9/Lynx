module.exports = Alert

function Alert() {}

Alert.prototype.view = __dirname;

Alert.prototype.create = function(model, dom) {
  this.model.setNull('hidden', false);
};

Alert.prototype.show = function(model, dom) {
  this.model.set('faded', false);
  this.model.set('hidden', false);
};

Alert.prototype.hide = function() {
  var model = this.model;
  model.set('faded', true);
  setTimeout(function() {
    model.set('hidden', true);
  }, 300);
};