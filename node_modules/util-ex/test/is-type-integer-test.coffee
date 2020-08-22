chai            = require 'chai'
sinon           = require 'sinon'
sinonChai       = require 'sinon-chai'
assert          = chai.assert
should          = chai.should()
chai.use(sinonChai)

describe "is/type/integer", ->
  isInt = require('../src/is/type/integer')
  it "should test value whether integer", ->
    assert.equal isInt(12883), true
    assert.equal isInt(0), true
    assert.equal isInt(0x12883), true
    assert.equal isInt("12883"), false
    assert.equal isInt(128e-10), false
    assert.equal isInt(128.83), false
