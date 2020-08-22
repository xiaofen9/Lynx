chai            = require 'chai'
sinon           = require 'sinon'
sinonChai       = require 'sinon-chai'
assert          = chai.assert
should          = chai.should()
chai.use(sinonChai)

defineProperty = require '../../src/defineProperty'
describe "get-non-enumerable-names", ->
  getNames = require('../../src/get-non-enumerable-names')

  it "should get non-enumerable names", ->
    test = hi:12, thay: "asf"
    defineProperty test, 'non1', 1
    defineProperty test, 'non2', 2
    result = getNames test
    result.should.be.deep.equal [
      'non1'
      'non2'
    ]

  it "should get non-enumerable names with empty object", ->
    test = {}
    result = getNames test
    result.should.be.deep.equal []

  it "should get non-enumerable names with inherits object", ->
    class Root
      ro1: 12
    class Test extends Root
      defineProperty Test::, 'non1', 1
      constructor: ->
        defineProperty @, 'non2', 1

    test = new Test
    result = getNames test
    result.should.be.deep.equal ['non2']
