# pomelo-collection
Pomelo-collection is the module for basic data structure in Node.JS. The prefix 'pomelo' means the module is build for the open source game server framework [pomelo](http://pomelo.netease.com/). 

Current the implemention data struction is priorityQueue and queue, more data structure will be added as need.
##Installation
```
npm install pomelo-collection
```

##How to Use

###Use PriorityQueue
```
	var coll = require('pomelo-collection');
	
	//Use priorityQueue
	var PriorityQueue = coll.priorityQueue;
	
	//var comparator = function(a, b){
		return a > b;
	}
	
	//build a priority queue with custom comparator
	var pq = new PriorityQueue(comparator);
	
	//Use offer to add element to priorityQueue
	pq.offer(1);
	pq,offer(2);
	pq.offer(3);
	
	//Peek will get the element but not remove it, in this case, it will print 3 on the console.
	console.log(pq.peek());
	
	//pq will get and remove the top element in priorityQueue. In this case, it will print 3, 2, 1.
	while(pq.size()>0){
		console.log(pq.pop());
	}
	
```
The comparator is not necessary and can be omitted, a default comparator will be used if no comparator is offered, in fact the default comparator is the same as we used in the example.
The priofityQueue is implement by an array, the cost of 'shift' and 'pop' are O(logN), where N is the element count in the priorityQueue, and the cost of 'peek' is O(1).
The memory cost is O(N).

###Use Queue
```
	var Queue = require('pomelo-collection').queue;
	
	//Construct a queue with size 10000
	var queue = new Queue(10000);
	
	//Use 'push' to add element
	queue.push(1);
	queue.push(2);
	queue.push(3);
	
	//Use 'pop' to remove element
	while(queue.size()>0){
		console.log(queue.pop());
	}
```
The Queue is implement with an array, the cost of 'push' , 'pop' and 'size' are all O(1).
Push will fail if size exceed limit.
