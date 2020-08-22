var o2s = Object.prototype.toString;

module.exports = function objectToString(o) {
  return o2s.call(o);
}
