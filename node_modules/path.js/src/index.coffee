win32 = require('./win')
posix = require('./posix')

isWindows = win32.isWindows

module.exports = if isWindows then win32 else posix

module.exports.posix = posix
module.exports.win32 = win32
