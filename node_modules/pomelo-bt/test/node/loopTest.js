var should = require('should');
var bt = require('../../');
var Loop = bt.Loop;

var SNode = function(bb) {
  this.blackboard = bb;
};

SNode.prototype = {
  doAction: function() {
    this.blackboard.scount++;
    return bt.RES_SUCCESS;
  }
};

var FNode = function(bb) {
  this.blackboard = bb;
};
FNode.prototype = {
  doAction: function() {
    this.blackboard.fcount++;
    return bt.RES_FAIL;
  }
};

var WNode = function(bb) {
  this.blackboard = bb;
};
WNode.prototype = {
  doAction: function() {
    if(this.blackboard.wcount < 2) {
      this.blackboard.wcount++;
      return bt.RES_WAIT;
    } else {
      this.blackboard.scount++;
      return bt.RES_SUCCESS;
    }
  }
};

describe('Loop Test', function() {
  it('should invoke the child in loop', function() {
    var bb = {
      scount: 0, 
      fcount: 0, 
      wcount: 0
    };

    var loopConditionCount = 0;

    var lc = function(bb) {
      loopConditionCount++;
      return bb.scount <= 2;
    };

    var loop = new Loop({blackboard: bb, child: new SNode(bb), loopCond: lc});

    var res = loop.doAction();
    res.should.equal(bt.RES_WAIT);
    bb.scount.should.equal(1);
    bb.fcount.should.equal(0);
    bb.wcount.should.equal(0);
    loopConditionCount.should.equal(1);

    res = loop.doAction();
    res.should.equal(bt.RES_WAIT);
    bb.scount.should.equal(2);
    bb.fcount.should.equal(0);
    bb.wcount.should.equal(0);
    loopConditionCount.should.equal(2);

    res = loop.doAction();
    res.should.equal(bt.RES_SUCCESS);
    bb.scount.should.equal(3);
    bb.fcount.should.equal(0);
    bb.wcount.should.equal(0);
    loopConditionCount.should.equal(3);
  });

  it('should return fail and break loop if child return fail', function() {
    var bb = {
      scount: 0, 
      fcount: 0, 
      wcount: 0
    };
    
    var loopConditionCount = 0;

    var lc = function(bb) {
      //should never enter here
      loopConditionCount++;
      return  true;
    };

    var loop = new Loop({blackboard: bb, child: new FNode(bb), loopCond: lc});

    var res = loop.doAction();
    res.should.equal(bt.RES_FAIL);
    bb.scount.should.equal(0);
    bb.fcount.should.equal(1);
    bb.wcount.should.equal(0);
    loopConditionCount.should.equal(0);

    res = loop.doAction();
    res.should.equal(bt.RES_FAIL);
    bb.scount.should.equal(0);
    bb.fcount.should.equal(2);
    bb.wcount.should.equal(0);
    loopConditionCount.should.equal(0);
  });

  it('should return wait when the child return wait', function() {
    var bb = {
      scount: 0, 
      fcount: 0, 
      wcount: 0
    };

    var loopConditionCount = 0;

    var lc = function(bb) {
      loopConditionCount++;
      return  false;
    };

    var loop = new Loop({blackboard: bb, child: new WNode(bb), loopCond: lc});
    var res = loop.doAction();
    res.should.equal(bt.RES_WAIT);
    bb.scount.should.equal(0);
    bb.fcount.should.equal(0);
    bb.wcount.should.equal(1);
    loopConditionCount.should.equal(0);

    res = loop.doAction();
    res.should.equal(bt.RES_WAIT);
    bb.scount.should.equal(0);
    bb.fcount.should.equal(0);
    bb.wcount.should.equal(2);
    loopConditionCount.should.equal(0);

    res = loop.doAction();
    res.should.equal(bt.RES_SUCCESS);
    bb.scount.should.equal(1);
    bb.fcount.should.equal(0);
    bb.wcount.should.equal(2);
    loopConditionCount.should.equal(1);
  });
});
