exports.a = 1
exports.b = 2

require('./router')

if (!module.parent) {
  console.log(exports.a + exports.b)
}
