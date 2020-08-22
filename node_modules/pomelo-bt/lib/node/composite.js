var BTNode = require('./node');
var util = require('util');

/**
 * Composite node: parent of nodes that have multi-children. 
 */
var Node = function(blackboard) {
  BTNode.call(this, blackboard);
  this.blackboard = blackboard;
  this.children = [];
};
util.inherits(Node, BTNode);

module.exports = Node;

var pro = Node.prototype;

/**
 * Add a child to the node
 */
pro.addChild = function(node) {
  this.children.push(node);
};
