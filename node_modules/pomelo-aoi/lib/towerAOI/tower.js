var EventEmitter = require('events').EventEmitter;
var exp = module.exports;

var Tower = function(){
  this.ids = {};
  this.watchers = {};
  this.typeMap = {};
  
  this.size = 0;
}

var pro = Tower.prototype;

/**
 * Add an object to tower
 */
pro.add = function(obj){
  var id = obj.id;
  var type = obj.type;
    	
  this.ids[id] = id;
  
  if(!!obj.type){
    this.typeMap[type] = this.typeMap[type]||{};
    if(this.typeMap[type][id] === id)
    	return false;
    	
    this.typeMap[type][id] = id;
    this.size++;
    return true;
  }else{
  	return false;
  }
};

/**
 * Add watcher to tower
 */
pro.addWatcher = function(watcher){
	var type = watcher.type;
	var id = watcher.id;
	
	if(!!type){
		this.watchers[type] = this.watchers[type]||{};
		this.watchers[type][id] = id;
	}
};

/**
 * Remove watcher from tower
 */
pro.removeWatcher = function(watcher){
	var type = watcher.type;
	var id = watcher.id;
	
	if(!!type && !!this.watchers[type]){
		delete this.watchers[type][id];
	}
};

/**
 * Get all watchers by the given types in this tower
 */
pro.getWatchers = function(types){
	var result = {};
	
	if(!!types && types.length > 0){
		for(var i = 0; i < types.length; i++){
			var type = types[i];
			if(!!this.watchers[type]){
				result[type] = this.watchers[type];
			} 
		}
	}
	
	return result;
};

/**
 * Remove an object from this tower
 */
pro.remove = function(obj){
  var id = obj.id;
  var type = obj.type;
  
  if(!!this.ids[id]){
    delete this.ids[id];
    
    if(!!type)
      delete this.typeMap[type][id];
    this.size--;
  }
};

/**
 * Get all object ids in this tower
 */
pro.getIds = function(){
  return this.ids;
}

/**
 * Get object ids of given types in this tower
 */
pro.getIdsByTypes = function(types){
  var result = {};
  for(var i = 0; i < types.length; i++){
    var type = types[i];
    if(!!this.typeMap[type])
      result[type] = this.typeMap[type];
  }
  
  return result;
};

/**
 * Create a new tower
 */
exp.create = function(){
  return new Tower();
};

