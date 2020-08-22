var should = require('should');
var bt = require('../../');
var Sequence = bt.Sequence;

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

describe('Sequence Test', function() {
  it('should invoke the children one by one', function() {
    var bb = {
      scount: 0, 
      fcount: 0, 
      wcount: 0
    };
    var sq = new Sequence({blackboard: bb});
    sq.addChild(new SNode(bb));
    sq.addChild(new SNode(bb));
    sq.addChild(new SNode(bb));

    var res = sq.doAction();
    res.should.equal(bt.RES_SUCCESS);
    bb.scount.should.equal(3);
    bb.fcount.should.equal(0);
    bb.wcount.should.equal(0);

    res = sq.doAction();
    res.should.equal(bt.RES_SUCCESS);
    bb.scount.should.equal(6);
    bb.fcount.should.equal(0);
    bb.wcount.should.equal(0);
  });

  it('should fail if any child fail', function() {
    var bb = {
      scount: 0, 
      fcount: 0, 
      wcount: 0
    };
    var sq = new Sequence({blackboard: bb});
    sq.addChild(new SNode(bb));
    sq.addChild(new FNode(bb));
    sq.addChild(new SNode(bb));

    var res = sq.doAction();
    res.should.equal(bt.RES_FAIL);
    bb.scount.should.equal(1);
    bb.fcount.should.equal(1);
    bb.wcount.should.equal(0);

    res = sq.doAction();
    res.should.equal(bt.RES_FAIL);
    bb.scount.should.equal(2);
    bb.fcount.should.equal(2);
    bb.wcount.should.equal(0);

  });

  it('should wait if any child wait and reenter the waiting child directly on next tick', function() {
    var bb = {
      scount: 0, 
      fcount: 0, 
      wcount: 0
    };
    var sq = new Sequence({blackboard: bb});
    sq.addChild(new SNode(bb));
    sq.addChild(new WNode(bb));
    sq.addChild(new SNode(bb));

    var res = sq.doAction();
    res.should.equal(bt.RES_WAIT);
    bb.scount.should.equal(1);
    bb.fcount.should.equal(0);
    bb.wcount.should.equal(1);

    res = sq.doAction();
    res.should.equal(bt.RES_WAIT);
    bb.scount.should.equal(1);
    bb.fcount.should.equal(0);
    bb.wcount.should.equal(2);

    res = sq.doAction();
    res.should.equal(bt.RES_SUCCESS);
    bb.scount.should.equal(3);
    bb.fcount.should.equal(0);
    bb.wcount.should.equal(2);
  });
});
