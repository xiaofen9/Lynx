chai            = require 'chai'
sinon           = require 'sinon'
sinonChai       = require 'sinon-chai'
assert          = chai.assert
should          = chai.should()
chai.use(sinonChai)

defineProperty = require '../src/defineProperty'
describe "cloneObject", ->
  cloneObject = require('../src/clone-object')

  it "should clone a plain object", ->
    test = hi:12, thay: "asf", ah: [1,2,3]
    result = cloneObject(test)
    result.should.be.deep.equal test
    result.should.not.be.equal test

  it "should clone an array", ->
    test = [4,129,3,28834]
    result = cloneObject(test)
    result.should.be.deep.equal test
    result.should.be.instanceof Array
    Array.isArray(result).should.be.true
    result.should.not.be.equal test

  it "should clone a class instance", ->
    class Abc
      a: 'cc'
      constructor: (@hi, @world)->
    obj = new Abc('ho', 1394)
    result = cloneObject(obj)
    result.should.be.instanceof Abc
    result.should.be.deep.equal obj
    result.should.not.be.equal obj

  it "should clone a class instance via clone method", ->
    class Abc
      a: 'cc'
      clone: -> return new Abc(1,2)
      constructor: (@hi, @world)->
    obj = new Abc('ho', 1394)
    result = cloneObject(obj)
    result.should.be.instanceof Abc
    result.should.be.deep.equal new Abc(1,2)

  it "should clone a class instance via disable clone method", ->
    class Abc
      a: 'cc'
      clone: -> return new Abc(1,2)
      constructor: (@hi, @world)->
    obj = new Abc('ho', 1394)
    result = cloneObject(obj, false)
    result.should.be.instanceof Abc
    result.should.be.deep.equal obj
    result.should.not.be.equal obj
