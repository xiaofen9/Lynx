module.exports = ContextMenu;
function ContextMenu() {}
ContextMenu.prototype.view = __dirname;

ContextMenu.prototype.create = function(model, dom) {
  // Close when clicking outside of the context menu
  var contextMenu = this;
  dom.on('click', function(e) {
    if(contextMenu.menu.contains(e.target)) return;
    model.set('open', false);
  });
};

ContextMenu.prototype.open = function(e) {
  if(!e) throw new Error('You must provide a click event as the first argument to open() when opening the context menu.');

  e.preventDefault();
  var contextMenu = this;
  var model = this.model;
  var x = e.clientX + 'px';
  var y = e.clientY + 'px';

  var args = Array.prototype.slice.call(arguments);
  args.unshift('open');
  args.push(function() {
    contextMenu.menu.style.top = y;
    contextMenu.menu.style.left = x;
    model.set('open', true);
  });

  this.emitDelayable.apply(this, args);
};

ContextMenu.prototype.select = function(option) {
  this.model.set('value', optionValue(option));
  this.model.set('open', false);
  if(option.hasOwnProperty('action') && typeof option.action === 'function') option.action();
  this.emit('select');
};

function optionValue(option) {
  return (option.hasOwnProperty('value')) ? option.value : option.content;
}