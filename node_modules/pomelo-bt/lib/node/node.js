var BTNode = require('./node');
var util = require('util');

/**
 * Parent of all behavior tree nodes.
 */
var Node = function(blackboard) {
  this.blackboard = blackboard;
};

module.exports = Node;
