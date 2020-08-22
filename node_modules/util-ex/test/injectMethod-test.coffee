chai            = require 'chai'
sinon           = require 'sinon'
sinonChai       = require 'sinon-chai'
assert          = chai.assert
should          = chai.should()
chai.use(sinonChai)

injectMethod  = require '../src/injectMethod'

describe "injectMethod", ->
  it "should inject method to an object", ->
    orgExec = sinon.spy -> @should.be.equal t
    orgRun  = sinon.spy -> @should.be.equal t
    class Test
      exec: orgExec
      run: orgRun
    newExec = sinon.spy (a,b)->
        @super("hi",1)
        @self.should.be.equal t
    newRun = sinon.spy (a,b)->
        @super("my",2)
        @self.should.be.equal t
    injectMethod(Test::,'exec', newExec).should.be.true
    t = new Test
    t.exec(1,2)
    orgExec.should.have.been.calledOnce
    orgExec.should.have.been.calledWith 'hi',1
    newExec.should.have.been.calledOnce
    newExec.should.have.been.calledWith 1,2
  it "should inject new method to an object", ->
    class Test
    newExec = sinon.spy (a,b)->
        should.not.exist @super
        @should.be.equal t
    newRun = sinon.spy (a,b)->
        should.not.exist @super
        @should.be.equal t
    injectMethod(Test::,'exec', newExec).should.be.true
    Test::exec.should.be.equal newExec
    t = new Test
    t.exec 1,2
    newExec.should.have.been.calledOnce
    newExec.should.have.been.calledWith 1,2
  it "should inject (class) method to an object", ->
    orgExec = sinon.spy()
    orgRun  = sinon.spy()
    class Test
      @exec: orgExec
      @run: orgRun
    newExec = sinon.spy (a,b)->
        @super("hi",1)
    newRun = sinon.spy (a,b)->
        @super("my",2)
    injectMethod(Test,'exec', newExec).should.be.true
    Test.exec(1,2)
    orgExec.should.have.been.calledOnce
    orgExec.should.have.been.calledWith 'hi',1
    newExec.should.have.been.calledOnce
    newExec.should.have.been.calledWith 1,2

  it "should not inject method to a non-function attribute of an object", ->
    class Test
      exec: 123
    newExec = sinon.spy (a,b)->
        should.not.exist @super
        @should.be.equal t
    injectMethod(Test::,'exec', newExec).should.be.false
    Test::exec.should.be.equal 123
