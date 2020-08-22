chai            = require 'chai'
sinon           = require 'sinon'
sinonChai       = require 'sinon-chai'
assert          = chai.assert
should          = chai.should()
chai.use(sinonChai)

createFunction  = require '../src/createFunction'

describe "createFunction", ->
  it "should create an empty named function", ->
    fn = createFunction "myFn"
    should.exist fn, "fn"
    fn.should.have.property 'name', 'myFn'
    fn.should.have.length 0
  it "should create an empty named function with args", ->
    fn = createFunction "myFn", ['arg1', 'arg2']
    should.exist fn, "fn"
    fn.should.have.property 'name', 'myFn'
    fn.should.have.length 2
  it "should create a function", ->
    fn = createFunction "myFn", ['arg1', 'arg2'], "return arg1+arg2"
    should.exist fn, "fn"
    fn.should.have.property 'name', 'myFn'
    fn.should.have.length 2
    fn(10,2).should.be.equal 12
  it "should create a function without args", ->
    fn = createFunction "myFn", "return 'hello!'"
    should.exist fn, "fn"
    fn.should.have.property 'name', 'myFn'
    fn.should.have.length 0
    fn().should.be.equal "hello!"
  it "should create a function with specified scope", ->
    b = 123
    fn = createFunction "myFn", ['arg1', 'arg2'], "return arg1+arg2+b", {b:b}
    should.exist fn, "fn"
    fn.should.have.property 'name', 'myFn'
    fn.should.have.length 2
    fn(10,2).should.be.equal 135
  it "should create a function with specified scope value array", ->
    b = 123
    fn = createFunction "myFn", ['arg1', 'arg2'], "return arg1+arg2+b", ['b'], [b]
    should.exist fn, "fn"
    fn.should.have.property 'name', 'myFn'
    fn.should.have.length 2
    fn(10,2).should.be.equal 135

