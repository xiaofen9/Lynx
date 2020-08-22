var BTNode = require('./node');
var util = require('util');

/**
 * Decorator node: parent of nodes that decorate other node. 
 */
var Node = function(blackboard, child) {
  BTNode.call(this, blackboard);
  this.child = child;
};
util.inherits(Node, BTNode);

module.exports = Node;

var pro = Node.prototype;

/**
 * set the child fo the node
 */
pro.setChild = function(node) {
  this.child = node;
};
