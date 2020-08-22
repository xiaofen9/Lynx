chai            = require 'chai'
sinon           = require 'sinon'
sinonChai       = require 'sinon-chai'
assert          = chai.assert
should          = chai.should()
chai.use(sinonChai)

injectMethods  = require '../src/injectMethods'

describe "injectMethods", ->
  it "should inject methods to an object", ->
    orgExec = sinon.spy()
    orgRun  = sinon.spy()
    class Test
      exec: orgExec
      run: orgRun
    newExec = sinon.spy (a,b)->
        @super("hi",1)
        @.self.should.be.equal t
    newRun = sinon.spy (a,b)->
        @super("my",2)
        @.self.should.be.equal t
    injectMethods Test::,
      'exec': newExec
      'run':  newRun
    t = new Test
    t.exec(1,2)
    orgExec.should.have.been.calledOnce
    orgExec.should.have.been.calledWith 'hi',1
    newExec.should.have.been.calledOnce
    newExec.should.have.been.calledWith 1,2
    t.run(4,5)
    orgRun.should.have.been.calledOnce
    orgRun.should.have.been.calledWith 'my',2
    newRun.should.have.been.calledOnce
    newRun.should.have.been.calledWith 4,5
  it "should inject new methods to an object", ->
    class Test
    newExec = sinon.spy (a,b)->
        should.not.exist @super
        @should.be.equal t
    newRun = sinon.spy (a,b)->
        should.not.exist @super
        @should.be.equal t
    injectMethods Test::,
      'exec': newExec
      'run':  newRun
    Test::exec.should.be.equal newExec
    Test::run.should.be.equal newRun
    t = new Test
    t.exec 1,2
    newExec.should.have.been.calledOnce
    newExec.should.have.been.calledWith 1,2
    t.run 4,5
    newRun.should.have.been.calledOnce
    newRun.should.have.been.calledWith 4,5
  it "should inject (class) methods to an object", ->
    orgExec = sinon.spy()
    orgRun  = sinon.spy()
    class Test
      @exec: orgExec
      @run: orgRun
    newExec = sinon.spy (a,b)->
        @super("hi",1)
    newRun = sinon.spy (a,b)->
        @super("my",2)
    injectMethods Test,
      'exec': newExec
      'run':  newRun
    Test.exec(1,2)
    orgExec.should.have.been.calledOnce
    orgExec.should.have.been.calledWith 'hi',1
    newExec.should.have.been.calledOnce
    newExec.should.have.been.calledWith 1,2
    Test.run(4,5)
    orgRun.should.have.been.calledOnce
    orgRun.should.have.been.calledWith 'my',2
    newRun.should.have.been.calledOnce
    newRun.should.have.been.calledWith 4,5
  it "should replace class methods to an object", ->
    orgExec = sinon.spy()
    orgRun  = sinon.spy()
    class Test
      @exec: orgExec
      @run: orgRun
    newExec = sinon.spy (a,b)->
        @should.not.ownProperty 'super'
    newRun = sinon.spy (a,b)->
        @super("my",2)
    injectMethods Test,
      'exec': newExec
      'run':  newRun
    ,
      replacedMethods:
        'exec': true
    Test.exec(1,2)
    orgExec.should.have.not.been.called
    newExec.should.have.been.calledOnce
    newExec.should.have.been.calledWith 1,2
    Test.run(4,5)
    orgRun.should.have.been.calledOnce
    orgRun.should.have.been.calledWith 'my',2
    newRun.should.have.been.calledOnce
    newRun.should.have.been.calledWith 4,5

