var should = require('should');
var bt = require('../../');
var If = bt.If;

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

describe('If Test', function() {
  it('should invoke the action if condition return true', function() {
    var bb = {
      scount: 0, 
      fcount: 0, 
      wcount: 0
    };

    var cond = function(bb) {
      return true;
    };

    var i = new If({blackboard: bb, action: new SNode(bb), cond: cond});

    var res = i.doAction();
    res.should.equal(bt.RES_SUCCESS);
    bb.scount.should.equal(1);
    bb.fcount.should.equal(0);
    bb.wcount.should.equal(0);
  });

  it('should return fail if condition return false', function() {
    var bb = {
      scount: 0, 
      fcount: 0, 
      wcount: 0
    };

    var cond = function(bb) {
      return false;
    };

    var i = new If({blackboard: bb, action: new SNode(bb), cond: cond});

    var res = i.doAction();
    res.should.equal(bt.RES_FAIL);
    bb.scount.should.equal(0);
    bb.fcount.should.equal(0);
    bb.wcount.should.equal(0);
  });

  it('should return fail if action return false', function() {
    var bb = {
      scount: 0, 
      fcount: 0, 
      wcount: 0
    };

    var cond = function(bb) {
      return true;
    };

    var i = new If({blackboard: bb, action: new FNode(bb), cond: cond});

    var res = i.doAction();
    res.should.equal(bt.RES_FAIL);
    bb.scount.should.equal(0);
    bb.fcount.should.equal(1);
    bb.wcount.should.equal(0);
  });

  it('should return wait if the child return wait and reenter the child directly in next tick', function() {
    var bb = {
      scount: 0, 
      fcount: 0, 
      wcount: 0
    };

    var condCount = 0;
    var cond = function(bb) {
      condCount++;
      return true;
    };

    var i = new If({blackboard: bb, action: new WNode(bb), cond: cond});

    var res = i.doAction();
    res.should.equal(bt.RES_WAIT);
    bb.scount.should.equal(0);
    bb.fcount.should.equal(0);
    bb.wcount.should.equal(1);
    condCount.should.equal(1);

    res = i.doAction();
    res.should.equal(bt.RES_WAIT);
    bb.scount.should.equal(0);
    bb.fcount.should.equal(0);
    bb.wcount.should.equal(2);
    condCount.should.equal(1);

    res = i.doAction();
    res.should.equal(bt.RES_SUCCESS);
    bb.scount.should.equal(1);
    bb.fcount.should.equal(0);
    bb.wcount.should.equal(2);
    condCount.should.equal(1);
  });
});
