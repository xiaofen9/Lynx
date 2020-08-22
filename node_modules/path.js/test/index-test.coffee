chai            = require 'chai'
sinon           = require 'sinon'
sinonChai       = require 'sinon-chai'
assert          = chai.assert
should          = chai.should()
chai.use(sinonChai)

path            = require "../"


isWindows = process.platform == 'win32'

describe "nodejs path module", ->
  it "should have win32 and posix object", ->
    # windows
    assert.equal path.win32.sep, '\\'
    # posix
    assert.equal path.posix.sep, '/'
    # path.delimiter tests
    # windows
    assert.equal path.win32.delimiter, ';'
    # posix
    assert.equal path.posix.delimiter, ':'
    if isWindows
      assert.deepEqual path, path.win32, 'should be win32 path module'
    else
      assert.deepEqual path, path.posix, 'should be posix path module'
