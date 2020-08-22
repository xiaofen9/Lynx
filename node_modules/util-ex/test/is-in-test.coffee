chai            = require 'chai'
sinon           = require 'sinon'
sinonChai       = require 'sinon-chai'
assert          = chai.assert
should          = chai.should()
chai.use(sinonChai)

describe 'is/in', ->
  isIn = require('../src/is/in')
  it 'should test a case-sensitive string whether in a list', ->
    assert.ok isIn('1ad', ['k2d8', '1ad'], true)
    assert.notOk isIn('1Ad', ['k2d8', '1ad'], true)

  it 'should test a string whether in a list', ->
    assert.ok isIn('1ad', ['1ad'])
    assert.ok isIn('1Ad', ['k2d8','1ad'])
    assert.ok isIn('3df', ['1ad', '3df'])
    assert.notOk isIn('3af', ['1ad', '3df'])
    assert.notOk isIn('3af', [])
    assert.notOk isIn('', ['sss'])

  it 'should test a string whether in a list with RegExp', ->
    assert.ok isIn('1ab', ['1ad', /\d+/])
    assert.ok isIn('Summary', [/Summary/])
    assert.ok isIn('summary', [/Summary/])
    assert.ok isIn('1234s', ['1ad', /\d+/])
    assert.notOk isIn('12343d', ['1ad', /^\d+$/])

  it 'should test a case-sensitive string whether in a list with RegExp', ->
    assert.ok isIn('1ab', ['1ad', /1ab/], true)
    assert.notOk isIn('1Ab', [/1ab/], true)
