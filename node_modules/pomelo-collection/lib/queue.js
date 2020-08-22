/**
 * A FIFO queue for node js
 */
var Queue = function(limit){
	this.limit = limit||1000;
	this.length = 0;
	
	this.head = 0;
	this.tail = 0;
	
	this.__array = new Array(this.limit);
};

var pro = Queue.prototype;

/**
 * Push an element into the queue
 */
pro.push = function(e){
	if(this.length >= this.limit){
		return false;
	}
	
	this.__array[this.tail] = e;
	this.tail++;
	this.length++;
	
	if(this.tail == this.__array.length)
		this.tail = 0;
	return true;
};

/**
 * Pop an element from the queue
 */
pro.pop = function(){
	if(this.length === 0)
		return null;
	
	var e = this.__array[this.head];
	this.head++;
	this.length--;
	
	if(this.head == this.__array.length)
		this.head = 0;
	
	return e;
};

/**
 * Get the size of the queue
 * @return {Integer} The size of the queue
 */
pro.size = function(){
	return this.length;
}

module.exports = Queue;
