if (Buffer && typeof Buffer.isBuffer === 'function')
  module.exports = Buffer.isBuffer;
else
  module.exports = function isBuffer(arg) {
    return arg && typeof arg === 'object'
      && typeof arg.copy === 'function'
      && typeof arg.fill === 'function'
      && typeof arg.binarySlice === 'function'
    ;
  }

