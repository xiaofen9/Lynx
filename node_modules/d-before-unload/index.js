module.exports = BeforeUnload;
function BeforeUnload() {}
BeforeUnload.prototype.name = 'd-before-unload';

BeforeUnload.prototype.create = function(model, dom) {
  // Stop the user from leaving the page whenever a change might be pending
  dom.on('beforeunload', window, listenerFn(model));
};

function listenerFn(model) {
  return function beforeunloadListener(e) {
    if (!model.hasWritePending()) return;
    var confirmationMessage = model.get('message') ||
      'You have unsaved changes. Do you want to leave this page and discard your changes?';
    e.returnValue = confirmationMessage;
    return confirmationMessage;
  };
}
