if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
  console.log('should do this')
  module.exports = factory()
} else {
  console.log('should not do this')
  this.Standalone = factory()
}

function factory () {
  return { value: 10 }
}
