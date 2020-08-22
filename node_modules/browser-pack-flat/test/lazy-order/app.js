require('./a')
global.later = function () {
  require('./b') // should not run immediately
}
if (require('./d')>0.5) {
  require('./c') // should not always run
}
