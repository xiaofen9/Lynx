'use strict'

inherits  = require 'inherits-ex'
Path      = require '../path'

class PosixPath
  inherits PosixPath, Path
  constructor: -> super()
  cwd: -> process.cwd()

module.exports = new PosixPath
