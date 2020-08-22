module.exports = Dropdown;
function Dropdown() {}
Dropdown.prototype.view = __dirname;

Dropdown.prototype.create = function(model, dom) {
  // Close on click outside of the dropdown
  var dropdown = this;
  dom.on('click', function(e) {
    if (dropdown.toggleButton.contains(e.target)) return;
    if (dropdown.menu.contains(e.target)) return;
    model.set('open', false);
  });
  // Watch the change of the options and update the selected element if needed
  model.on('change', 'options', function() {
    model.set('value', model.get('value'));
  });
};

Dropdown.prototype.toggle = function() {
  this.model.set('open', !this.model.get('open'));
};

Dropdown.prototype.select = function(option) {
  this.model.set('value', optionValue(option));
  this.model.set('open', false);
};

Dropdown.prototype.label = function(value) {
  var options = this.getAttribute('options') || [];
  for (var i = 0, len = options.length; i < len; i++) {
    var option = options[i];
    if (value === optionValue(option)) {
      return option.content;
    }
  }
  return this.getAttribute('prompt') || 'Select';
};

function optionValue(option) {
  return (option.hasOwnProperty('value')) ? option.value : option.content;
}
