(function() {
  var float;

  float = /^(?:[-+]?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/;

  module.exports = function(str) {
    return str !== '' && float.test(str);
  };

}).call(this);

//# sourceMappingURL=float.js.map
