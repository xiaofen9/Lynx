#pomelo-bt - behavior tree for node.js
pomelo-bt是pomelo项目中AI模块所依赖的行为树模块，提供了基本的行为树实现。

+ Tags: node.js

##安装
```
npm install pomelo-bt
```

##行为树节点基类
###节点基类 Node
所有行为树节点都从该类派生，构造函数接受一个blackboard实例作为参数。
每个节点都提供一个执行的入口doAction方法。doAction执行完完毕后，向父节点返回执行结果：
RES_SUCCESS, RES_FAIL, RES_WAIT分别代表当前执行成功，失败和仍在执行中。
父节点根据子节点的返回值再做后续流程决策。

###组合节点基类 Composite
所有组合节点都从该类派生，内部可以维护多个孩子节点。提供addChild接口，添加孩子节点。

###装饰节点基类 Decorator
所有装饰节点都从该类派生，提供setChild接口，添加唯一的孩子节点。

##组合节点
###Sequence
实现行为树sequence语义。
####构造函数Sequenec(opts)
+ opts.blackboard - 构造行为树节点的blackboard实例。

###Parallel
实现行为树parallel语义。
####构造函数Parallel(opts)
+ opts.blackboard - 构造行为树节点的blackboard实例。
+ opts.policy - Parallel节点失败策略，可选值：Parallel.POLICY_FAIL_ON_ONE（默认值）, Parallel.POLICY_FAIL_ON_ALL。

###Selector
实现行为树selector语义。
####构造函数Selector(opts)
+ opts.blackboard - 构造行为树节点的blackboard实例。

##装饰节点
###Loop
循环节点。
####构造函数Loop(opts)
+ opts.blackboard - 构造行为树节点的blackboard实例。
+ opts.child - 孩子节点。
+ opts.loopCond(blackboard) - 循环条件判断函数。返回true表示循环条件成立，否则不成立。

##条件节点
###Condition
条件成立返回RES_SUCCESS, 反之返回RES_FAIL。
####构造函数Condition(opts)
+ opts.blackboard - 构造行为树节点的blackboard实例。
+ opts.cond(blackboard) - 条件判断函数，返回true表示条件成立，否则不成立。

##其他节点
###If
实现if语义，如果条件成立，则执行关联的孩子节点。
####构造函数If(opts)
+ opts.blackboard - 构造行为树节点的blackboard实例。
+ opts.action - 孩子节点。
+ opts.cond(blackboard) - 条件判断函数，返回true表示条件成立，否则不成立。

##用法
``` javascript
var util = require('util');
var bt = require('pomelo-bt');
var Sequence = bt.Sequence;
var Node = bt.Node;

// define some action nodes
var HelloNode = function(blackboard) {
  Node.call(this, blackboard);
};
util.inherits(HelloNode, Node);

HelloNode.prototype.doAction = function() {
  console.log('Hello ');
  return bt.RES_SUCCESS;
};


var WorldNode = function(blackboard) {
  Node.call(this, blackboard);
};
util.inherits(WorldNode, Node);

WorldNode.prototype.doAction = function() {
  console.log('World');
  return bt.RES_SUCCESS;
};

var blackboard = {};

// composite your behavior tree
var seq = new Sequence({blackboard: blackboard});
var hello = new HelloNode(blackboard);
var world = new WorldNode(blackboard);

seq.addChild(hello);
seq.addChild(world);

// run the behavior tree
seq.doAction();
``` 