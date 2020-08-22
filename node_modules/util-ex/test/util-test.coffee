chai            = require 'chai'
sinon           = require 'sinon'
sinonChai       = require 'sinon-chai'
assert          = chai.assert
should          = chai.should()

util            = require "../src/"
log             = require "../src/log"

chai.use(sinonChai)

describe "isEmptyObject", ->
  isEmpty = util.isEmptyObject

  it "should be empty", ->
    assert.ok isEmpty(null)
    assert.ok isEmpty({})
    assert.notOk isEmpty(length: 0)
    assert.notOk isEmpty(k: undefined)

describe "isEmpty", ->
  isEmpty = util.isEmpty
  isEmptyFunction = util.isEmptyFunction

  it "should be empty", ->
    assert.ok isEmpty(null)
    assert.ok isEmpty("")
    assert.ok isEmpty({})
    assert.ok isEmpty([])
    (->
      assert.ok isEmpty(arguments)
    )()
    assert.notOk isEmpty("hi")
    assert.notOk isEmpty(length: 0)
    assert.notOk isEmpty([1])
    (->
      assert.notOk isEmpty(arguments)
    ) 1

  it "should be empty function", ->
    emptyFunc = ->
    isEmpty(emptyFunc).should.be.true "emptyFunc"
    emptyFunc = (abc, ase)->
    isEmpty(emptyFunc).should.be.true "emptyFunc2"
    isEmptyFunction("function(arg1, arg2, arg3){\n}").should.be.true
    isEmptyFunction("function(arg1, arg2, arg3){\n;}").should.be.true
    isEmptyFunction("function   asFn  (arg1, arg2, arg3){\n\n;}").should.be.true
    isEmptyFunction("function(arg1, arg2, arg3){abs;}").should.not.be.true
    
describe "inject", ->
  inject = util.inject
  it "should inject a function before execution", ->
    run = (a,b,c)->[a,b,c]
    onBefore = sinon.spy()
    run = inject(run, onBefore)
    run(1,"b",3).should.be.deep.equal [1,"b",3]
    onBefore.should.have.been.calledWith(1,"b",3)
    onBefore.should.have.been.calledOnce

  it "should inject a function before execution and change the arguments", ->
    runOrg = sinon.spy (a,b,c)->[a,b,c]
    onBefore = sinon.spy (a,b,c)->a=2;b="B";c=4;arguments
    run = inject(runOrg, onBefore)
    run(1,"b",3).should.be.deep.equal [2,"B", 4]
    onBefore.should.have.been.calledWith(1,"b",3)
    onBefore.should.have.been.calledOnce
    runOrg.should.have.been.calledOnce

  it "should inject a function before execution and deny the original function execution", ->
    runOrg = sinon.spy (a,b,c)->[a,b,c]
    onBefore = sinon.spy ->false
    run = inject(runOrg, onBefore)
    run(1,"b",3).should.be.false
    onBefore.should.have.been.calledWith(1,"b",3)
    onBefore.should.have.been.calledOnce
    runOrg.should.have.not.been.called

  it "should inject a function after execution", ->
    runOrg = sinon.spy (a,b,c)->[a,b,c]
    onAfter = sinon.spy (a,b,c, result, isDenied)->
      a.should.be.equal 1
      b.should.be.equal "b" 
      c.should.be.equal 3
      result.should.be.deep.equal [1,"b",3]
      isDenied.should.be.false
      return
    run = inject(runOrg, null, onAfter)
    run(1,"b",3).should.be.deep.equal [1,"b",3]
    onAfter.should.have.been.calledWith(1,"b",3)
    onAfter.should.have.been.calledOnce
    runOrg.should.have.been.calledOnce

  it "should inject a function after execution and change result", ->
    runOrg = sinon.spy (a,b,c)->[a,b,c]
    onAfter = sinon.spy (a,b,c, result, isDenied)->
      a.should.be.equal 1
      b.should.be.equal "b" 
      c.should.be.equal 3
      result.should.be.deep.equal [1,"b",3]
      isDenied.should.be.false
      [1,2,3]
    run = inject(runOrg, null, onAfter)
    run(1,"b",3).should.be.deep.equal [1,2,3]
    onAfter.should.have.been.calledWith(1,"b",3)
    onAfter.should.have.been.calledOnce
    runOrg.should.have.been.calledOnce

  it "should inject a function before and after execution", ->
    runOrg = sinon.spy (a,b,c)->[a,b,c]
    onBefore = sinon.spy()
    onAfter = sinon.spy (a,b,c, result, isDenied)->
      a.should.be.equal 1
      b.should.be.equal "b" 
      c.should.be.equal 3
      result.should.be.deep.equal [1,"b",3]
      isDenied.should.be.false
      return
    run = inject(runOrg, onBefore, onAfter)
    run(1,"b",3).should.be.deep.equal [1,"b",3]
    onBefore.should.have.been.calledWith(1,"b",3)
    onBefore.should.have.been.calledOnce
    onAfter.should.have.been.calledWith(1,"b",3)
    onAfter.should.have.been.calledOnce
    runOrg.should.have.been.calledOnce

describe "isRegExp", ->
  isRegExp = util.isRegExp
  it "should check a RegExp instance correct", ->
    isRegExp(/ahi/).should.be.true
    isRegExp(new RegExp()).should.be.true
  it "should check an illegal RegExp argument correct", ->
    isRegExp().should.be.false
    isRegExp(RegExp).should.be.false
    isRegExp("/sdd/g").should.be.false

describe "isDate", ->
  isDate = util.isDate
  it "should check a Date instance correct", ->
    isDate(new Date()).should.be.true
    isDate(new Date(2015,1,1)).should.be.true
  it "should check an illegal date argument correct", ->
    isDate().should.be.false
    isDate(Date).should.be.false
    isDate("2015-01-01").should.be.false

describe "isUndefined", ->
  isUndefined = util.isUndefined
  it "should check undefined type correct", ->
    isUndefined(undefined).should.be.true
    isUndefined(`undefined`).should.be.true
  it "should check an other type to false", ->
    isUndefined(null).should.be.false
    isUndefined(Date).should.be.false
    isUndefined(false).should.be.false
    isUndefined(0).should.be.false
    isUndefined('undefined').should.be.false

describe "isNullOrUndefined", ->
  isNullOrUndefined = util.isNullOrUndefined
  it "should check undefined type correct", ->
    isNullOrUndefined(undefined).should.be.true
  it "should check null type correct", ->
    isNullOrUndefined(null).should.be.true
  it "should check an other type to false", ->
    isNullOrUndefined(Date).should.be.false
    isNullOrUndefined(false).should.be.false
    isNullOrUndefined(0).should.be.false
    isNullOrUndefined('undefined').should.be.false

describe "isObject", ->
  isObject = util.isObject
  it "should check object type correct", ->
    Obj = ->
    obj = Object.create(null)
    isObject({}).should.be.true
    isObject(obj).should.be.true
    isObject(new Obj()).should.be.true
    isObject(new Date()).should.be.true
    isObject(/dd/).should.be.true
  it "should check an other type to false", ->
    isObject(null).should.be.false
    isObject("object").should.be.false
    isObject(false).should.be.false
    isObject(true).should.be.false
    isObject(0).should.be.false
    isObject(->).should.be.false

describe "isFunction", ->
  isFunction = util.isFunction
  it "should check function type correct", ->
    isFunction(->).should.be.true
    isFunction(Date).should.be.true
    isFunction(RegExp).should.be.true
  it "should check an other type to false", ->
    isFunction(new RegExp()).should.be.false
    isFunction(new ->).should.be.false
    isFunction(false).should.be.false
    isFunction(true).should.be.false
    isFunction(0).should.be.false
    isFunction(null).should.be.false
    isFunction(undefined).should.be.false
    isFunction("").should.be.false

describe "isString", ->
  isString = util.isString
  it "should check string type correct", ->
    isString("").should.be.true
    isString("hello").should.be.true
  it "should check an other type to false", ->
    isString(new RegExp()).should.be.false
    isString(new ->).should.be.false
    isString(false).should.be.false
    isString(true).should.be.false
    isString(0).should.be.false
    isString(null).should.be.false
    isString(undefined).should.be.false
describe "_extend", ->
  extend = util._extend
  it "should extend an object", ->
    org = {a: 1, b:2}
    add = {a: 3}
    extend(org, add).should.be.equal org
    org.should.be.deep.equal {a:3, b:2}
    extend org, b:4, c:2
    org.should.be.deep.equal {a:3, b:4, c:2}
  it "should extend many object", ->
    org = {a: 1, b:2}
    add = {a: 3}
    third = {c:4}
    extend(org, add, third, {d:5, b:0}).should.be.equal org
    org.should.be.deep.equal {a:3, b:0, c:4, d:5}

describe "extend", ->
  extend = require('../src/extend')
  it "should extend an object", ->
    org = {a: 1, b:2}
    add = {a: 3}
    extend(org, add).should.be.equal org
    org.should.be.deep.equal {a:3, b:2}
    extend org, b:4, c:2
    org.should.be.deep.equal {a:3, b:4, c:2}
  it "should extend many object", ->
    org = {a: 1, b:2}
    add = {a: 3}
    third = {c:4}
    extend(org, [add, third, {d:5, b:0}]).should.be.equal org
    org.should.be.deep.equal {a:3, b:0, c:4, d:5}
  it "should extend an object and filter properties", ->
    org = {}
    add = {a:3,b:3,c:2,d:123}
    extend(org, add, (k,v)->k in ['a','c']).should.be.equal org
    org.should.be.deep.equal {a:3,c:2}

describe "defineProperty", ->
  defineProperty = require('../src/defineProperty')
  it "should define a property", ->
    obj = {}
    defineProperty obj, 'prop', 128
    obj.should.have.property 'prop', 128
    keys = Object.keys obj
    keys.should.have.length 0
  it "should define an enumerable property", ->
    obj = {}
    defineProperty obj, 'prop', 128, enumerable:true
    obj.should.have.property 'prop', 128
    keys = Object.keys obj
    keys.should.be.deep.equal ['prop']
  it "should define a property with getter", ->
    obj = {}
    defineProperty obj, 'prop', null, 
      get:->128
      writable:false
    obj.should.have.property 'prop', 128
    keys = Object.keys obj
    keys.should.have.length 0
  it "should define a configurable property", ->
    obj = {}
    defineProperty obj, 'prop', 128
    obj.should.have.property 'prop', 128
    delete obj.prop
    obj.should.not.have.ownProperty 'prop'
  it "should define a non-configurable property", ->
    obj = {}
    defineProperty obj, 'prop', 128, configurable:false
    obj.should.have.property 'prop', 128
    delete obj.prop
    obj.should.have.ownProperty 'prop'
  it "should define a property via options.value", ->
    obj = {}
    defineProperty obj, 'prop', undefined, configurable:false, value:128
    obj.should.have.property 'prop', 128

