var result = require('./externalModule')(
  require('./localModule'),
  require('./anotherLocalModule')
)

module.exports = result
