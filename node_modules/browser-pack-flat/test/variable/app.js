exports.param = require('./param')
exports.something = function () {
  var exports = {}
  exports.something = require('./param')
  return exports
}
