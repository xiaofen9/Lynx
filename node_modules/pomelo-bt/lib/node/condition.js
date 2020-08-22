var bt = require('../bt');
var util = require('util');
var BTNode = require('./node');

/**
 * Condition node.
 *
 * @param opts {Object} 
 *        opts.blackboard {Object} blackboard object
 *        opts.cond(blackboard) {Function} condition callback. Return true or false to decide the node return success or fail.
 * @return {Number} 
 *          bt.RES_SUCCESS if cond callback return true;
 *          bt.RES_FAIL if cond undefined or return false.
 */
var Node = function(opts) {
  BTNode.call(this, opts.blackboard);
  this.cond = opts.cond;
};
util.inherits(Node, BTNode);

module.exports = Node;

var pro = Node.prototype;

pro.doAction = function() {
  if(this.cond && this.cond.call(null, this.blackboard)) {
    return bt.RES_SUCCESS;
  }

  return bt.RES_FAIL;
};
