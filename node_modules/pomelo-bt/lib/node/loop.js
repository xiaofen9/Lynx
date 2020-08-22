var bt = require('../bt');
var util = require('util');
var Decorator = require('./decorator');

/**
 * Loop node: a decorator node that invoke child in loop.
 *
 * @param opts {Object} 
 *        opts.blackboard {Object} blackboard object
 *        opts.child {Object} origin action that is decorated
 *        opts.loopCond(blackboard) {Function} loop condition callback. Return true to continue the loop.
 * @return {Number} 
 *          bt.RES_SUCCESS if loop finished successfully;
 *          bt.RES_FAIL and break loop if child return fail;
 *          bt.RES_WAIT if child return wait or loop is continue.
 */
var Node = function(opts) {
  Decorator.call(this, opts.blackboard, opts.child);
  this.loopCond = opts.loopCond;
};

util.inherits(Node, Decorator);

module.exports = Node;

var pro = Node.prototype;

pro.doAction = function() {
  var res = this.child.doAction();
  if(res !== bt.RES_SUCCESS) {
    return res;
  }

  if(this.loopCond && this.loopCond.call(null, this.blackboard)) {
    //wait next tick
    return bt.RES_WAIT;
  }

  return bt.RES_SUCCESS;
};
