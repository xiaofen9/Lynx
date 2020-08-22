var sliced = require('sliced')

module.exports = function () {
  return sliced(arguments).join(require('./externalSeparator'))
}
