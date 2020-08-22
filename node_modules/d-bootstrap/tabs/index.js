module.exports = Tabs;
function Tabs() {}
Tabs.prototype.view = __dirname;

Tabs.prototype.init = function(model) {
  model.setNull('selectedIndex', 0);
};

Tabs.prototype.select = function(index) {
  this.model.set('selectedIndex', index);
};
