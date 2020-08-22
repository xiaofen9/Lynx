// Helper to expose a module.
module.exports = function exposedRequire (m, jumped) {
  // A locally exposed module
  if (exposedRequire.m.hasOwnProperty(m)) {
    return exposedRequire.m[m]
  }
  // A module exposed on a later chunk
  if (typeof require === 'function' && !jumped) {
    return require(m, 1)
  }
  // A module exposed on a previous chunk
  if (typeof exposedRequire.r === 'function') {
    return exposedRequire.r(m, 1)
  }
}
