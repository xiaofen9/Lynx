(function() {
  module.exports = function(aFuncString) {
    var result;
    return result = /^[;\s]*function(\s+\S*)?\s*\(.*\)\s*{.*}[;\s]*$/.test(aFuncString);
  };

}).call(this);

//# sourceMappingURL=function.js.map
