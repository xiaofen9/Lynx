chai            = require 'chai'
sinon           = require 'sinon'
sinonChai       = require 'sinon-chai'
assert          = chai.assert
should          = chai.should()
chai.use(sinonChai)

defineProperty = require '../../src/defineProperty'

describe 'object/map', ->
  map = require('../../src/object/map')
  it 'should map an object values to an array', ->
    result = map
      a:23
      b:34
      c:'dfg'
    result.should.be.deep.equal [23,34,'dfg']
  it 'should map an object all(includes non-enumerable) values to an array', ->
    obj =
      a:23
      b:34
    defineProperty obj, 'nonEnum', 'hi'
    result = map obj, nonEnumerable:true
    result.should.be.deep.equal [23,34,'hi']

  it 'should map an object non-enumerable values to an array', ->
    obj =
      a:23
      b:34
    defineProperty obj, 'nonEnum', 'hi'
    result = map obj, nonEnumerable:true, enumerable:false
    result.should.be.deep.equal ['hi']
