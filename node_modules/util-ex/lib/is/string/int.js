(function() {
  var int;

  int = /^(?:[-+]?(?:0|(?:0[xX])?[0-9]*))$/;

  module.exports = function(str) {
    return str !== '' && int.test(str);
  };

}).call(this);

//# sourceMappingURL=int.js.map
