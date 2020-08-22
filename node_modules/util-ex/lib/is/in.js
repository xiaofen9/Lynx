(function() {
  var isRegExp;

  isRegExp = require('./type/regexp');

  module.exports = function(str, list, caseSensitive) {
    var i, item, j, len, result;
    if (!caseSensitive) {
      str = str.toLowerCase();
    }
    for (i = j = 0, len = list.length; j < len; i = ++j) {
      item = list[i];
      if (isRegExp(item)) {
        if (!(caseSensitive || item.ignoreCase)) {
          list[i] = item = RegExp(item.source, 'i');
        }
        result = item.test(str);
        if (result) {
          break;
        }
      } else {
        item = item.toString();
        if (!caseSensitive) {
          item = item.toLowerCase();
        }
        result = item === str;
        if (result) {
          break;
        }
      }
    }
    return result;
  };

}).call(this);

//# sourceMappingURL=in.js.map
