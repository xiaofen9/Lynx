chai            = require 'chai'
sinon           = require 'sinon'
sinonChai       = require 'sinon-chai'
assert          = chai.assert
should          = chai.should()
chai.use(sinonChai)

describe "is/string/int", ->
  isInt = require('../src/is/string/int')
  it "should test string whether integer", ->
    assert.equal isInt("12883"), true
    assert.equal isInt("012883"), true
    assert.equal isInt("0x12883"), true
    assert.equal isInt("128.83"), false
    assert.equal isInt("128e83"), false
describe "is/string/json", ->
  isJson = require('../src/is/string/json')
  it "should test string integer whether json", ->
    assert.equal isJson("12883"), true
    assert.equal isJson("012883"), true
    assert.equal isJson("0x12883"), false
    assert.equal isJson("128.83"), true
    assert.equal isJson("128e83"), true
  it "should test string whether json", ->
    assert.equal isJson("'12883'"), false
    assert.equal isJson('"012883"'), true
    assert.equal isJson("'0x12883\""), false
  it "should test string object whether json", ->
    assert.equal isJson('{"a":12883}'), true
    assert.equal isJson("{a:12883}"), false
    assert.equal isJson("{a:12883,b}", true), true #almost json = true
  it "should test string array whether json", ->
    assert.equal isJson('["a", 12883]'), true
    assert.equal isJson('["a", 12883'), false
    assert.equal isJson('["a, 12883]'), false
    assert.equal isJson('["a, 12883]', true), true

describe "is/string/function", ->
  isFunctionStr  = require '../src/is/string/function'
  it "should test anonymous function string", ->
    isFunctionStr('function(){}').should.be.true
    isFunctionStr('function() \t {\t;}\t').should.be.true
    isFunctionStr(';function(a,b){}').should.be.true
    isFunctionStr('a;function(a,b){}').should.be.false
  it "should test function string", ->
    isFunctionStr('function abs(){}').should.be.true
    isFunctionStr('functionabs(){}').should.be.false

