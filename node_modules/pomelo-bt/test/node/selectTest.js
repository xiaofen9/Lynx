var should = require('should');
var bt = require('../../');
var Select = bt.Select;

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

describe('Select Test', function() {
  it('should invoke one child only if success', function() {
    var bb = {
      scount: 0, 
      fcount: 0, 
      wcount: 0
    };
    var sl = new Select({blackboard: bb});
    sl.addChild(new SNode(bb));
    sl.addChild(new SNode(bb));
    sl.addChild(new SNode(bb));

    var res = sl.doAction();
    res.should.equal(bt.RES_SUCCESS);
    bb.scount.should.equal(1);
    bb.fcount.should.equal(0);
    bb.wcount.should.equal(0);

    res = sl.doAction();
    res.should.equal(bt.RES_SUCCESS);
    bb.scount.should.equal(2);
    bb.fcount.should.equal(0);
    bb.wcount.should.equal(0);
  });

  it('should fail if all child fail', function() {
    var bb = {
      scount: 0, 
      fcount: 0, 
      wcount: 0
    };
    var sl = new Select({blackboard: bb});
    sl.addChild(new FNode(bb));
    sl.addChild(new FNode(bb));
    sl.addChild(new FNode(bb));

    var res = sl.doAction();
    res.should.equal(bt.RES_FAIL);
    bb.scount.should.equal(0);
    bb.fcount.should.equal(3);
    bb.wcount.should.equal(0);

    res = sl.doAction();
    res.should.equal(bt.RES_FAIL);
    bb.scount.should.equal(0);
    bb.fcount.should.equal(6);
    bb.wcount.should.equal(0);
  });

  it('should success if and child success', function() {
    var bb = {
      scount: 0, 
      fcount: 0, 
      wcount: 0
    };
    var sl = new Select({blackboard: bb});
    sl.addChild(new FNode(bb));
    sl.addChild(new SNode(bb));
    sl.addChild(new FNode(bb));

    var res = sl.doAction();
    res.should.equal(bt.RES_SUCCESS);
    bb.scount.should.equal(1);
    bb.fcount.should.equal(1);
    bb.wcount.should.equal(0);

    res = sl.doAction();
    res.should.equal(bt.RES_SUCCESS);
    bb.scount.should.equal(2);
    bb.fcount.should.equal(2);
    bb.wcount.should.equal(0);
  });

  it('should wait if any child wait and reenter the wating child directly on next tick', function() {
    var bb = {
      scount: 0, 
      fcount: 0, 
      wcount: 0
    };
    var sl = new Select({blackboard: bb});
    sl.addChild(new FNode(bb));
    sl.addChild(new WNode(bb));
    sl.addChild(new SNode(bb));

    var res = sl.doAction();
    res.should.equal(bt.RES_WAIT);
    bb.scount.should.equal(0);
    bb.fcount.should.equal(1);
    bb.wcount.should.equal(1);

    res = sl.doAction();
    res.should.equal(bt.RES_WAIT);
    bb.scount.should.equal(0);
    bb.fcount.should.equal(1);
    bb.wcount.should.equal(2);

    res = sl.doAction();
    res.should.equal(bt.RES_SUCCESS);
    bb.scount.should.equal(1);
    bb.fcount.should.equal(1);
    bb.wcount.should.equal(2);
  });
});
