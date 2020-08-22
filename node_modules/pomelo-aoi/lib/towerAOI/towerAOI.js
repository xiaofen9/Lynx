var Tower = require('./tower');
var exp = module.exports;
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var TowerAOI = function(config){
  this.width = config.width;
  this.height = config.height;

  this.towerWidth = config.towerWidth;
  this.towerHeight = config.towerHeight;

  this.towers = {};

  this.rangeLimit = 5 || config.limit;

  this.init();
};

util.inherits(TowerAOI, EventEmitter);

var pro = TowerAOI.prototype;

pro.init = function(){
  this.max = {
    x: Math.ceil(this.width/this.towerWidth) - 1,
    y: Math.ceil(this.height/this.towerHeight) - 1
  };

	for(var i = 0; i<Math.ceil(this.width/this.towerWidth); i++){
		this.towers[i] = {};
		for(var j = 0; j < Math.ceil(this.height/this.towerHeight); j++){
      this.towers[i][j] = Tower.create();
   }
 }
};

/**
 * Get given type object ids from tower aoi by range and types
 * @param pos {Object} The pos to find objects
 * @param range {Number} The range to find the object, in tower aoi, it means the tower number from the pos
 * @param types {Array} The types of the object need to find
 */
pro.getIdsByRange = function(pos, range, types){
  if(!this.checkPos(pos) || range < 0 || range > this.rangeLimit)
    return [];

  var result = {};
  var p = this.transPos(pos);
  var limit = getPosLimit(p, range, this.max);

  //console.error('get Ids p : %j, range : %j limit : %j, max : %j', p, range, limit, this.max);
  for(var i = limit.start.x; i <= limit.end.x; i++){
    for(var j = limit.start.y; j <= limit.end.y; j++){
      result = addMapByTypes(result, this.towers[i][j].getIdsByTypes(types), types);
    }
  }
  return result;
};

/**
 * Get all object ids from tower aoi by pos and range
 */
pro.getIdsByPos = function(pos, range){
  if(!this.checkPos(pos) || range < 0)
    return [];

  var result = [];
  range = range>5?5:range;

  var p = this.transPos(pos);
  var limit = getPosLimit(p, range, this.max);

  //console.error('get Ids p : %j, range : %j limit : %j, max : %j', p, range, limit, this.max);
  for(var i = limit.start.x; i <= limit.end.x; i++){
    for(var j = limit.start.y; j <= limit.end.y; j++){
      result = addMap(result, this.towers[i][j].getIds());
    }
  }
  return result;
};

/**
 * Add an object to tower aoi at given pos
 */
pro.addObject = function(obj, pos){
  if(this.checkPos(pos)){
    var p = this.transPos(pos);
    this.towers[p.x][p.y].add(obj);
    this.emit('add', {id: obj.id, type:obj.type, watchers:this.towers[p.x][p.y].watchers});
    return true;
  }

  return false;
};

/**
 * Remove object from aoi module
 */
pro.removeObject = function(obj, pos){
  if(this.checkPos(pos)){
    var p = this.transPos(pos);
    this.towers[p.x][p.y].remove(obj);
    this.emit('remove', {id: obj.id, type:obj.type, watchers:this.towers[p.x][p.y].watchers});
    return true;
  }

  return false;
};

pro.updateObject = function(obj, oldPos, newPos){
  if(!this.checkPos(oldPos) || !this.checkPos(newPos))
    return false;

  var p1 = this.transPos(oldPos);
  var p2 = this.transPos(newPos);

  if(p1.x===p2.x && p1.y===p2.y)
    return true;
  else{
  	if(!this.towers[p1.x] || !this.towers[p2.x]){
  		console.error('AOI pos error ! oldPos : %j, newPos : %j, p1 : %j, p2 : %j', oldPos, newPos, p1, p2);
  		console.trace();
  		return;
  	}
		var oldTower = this.towers[p1.x][p1.y];
		var newTower = this.towers[p2.x][p2.y];

		oldTower.remove(obj);
		newTower.add(obj);

		this.emit('update', {id: obj.id, type:obj.type, oldWatchers:oldTower.watchers, newWatchers:newTower.watchers})
  }
};


/**
 * Check if the pos is valid;
 * @return {Boolean} Test result
 */
pro.checkPos = function(pos){
  if(!pos)
    return false;
  if(pos.x < 0 || pos.y < 0 || pos.x >= this.width || pos.y >= this.height)
    return false;
  return true;
};

/**
 * Trans the absolut pos to tower pos. For example : (210, 110} -> (1, 0), for tower width 200, height 200
 *
 */
pro.transPos = function(pos){
  return {
    x : Math.floor(pos.x/this.towerWidth),
    y : Math.floor(pos.y/this.towerHeight)
  };
};

pro.addWatcher = function(watcher, pos, range){
	if(range < 0)
		return;

	range = range > 5?5:range;
	var p = this.transPos(pos);
	var limit = getPosLimit(p, range, this.max);

  for(var i = limit.start.x; i <= limit.end.x; i++){
    for(var j = limit.start.y; j <= limit.end.y; j++){
      this.towers[i][j].addWatcher(watcher);
    }
  }
};

pro.removeWatcher = function(watcher, pos, range){
	if(range < 0)
		return;

	range = range > 5?5:range;

	var p = this.transPos(pos);
	var limit = getPosLimit(p, range, this.max);

  for(var i = limit.start.x; i <= limit.end.x; i++){
    for(var j = limit.start.y; j <= limit.end.y; j++){
      this.towers[i][j].removeWatcher(watcher);
    }
  }
};

pro.updateWatcher = function(watcher, oldPos, newPos, oldRange, newRange){
  if(!this.checkPos(oldPos) || !this.checkPos(newPos))
    return false;

  var p1 = this.transPos(oldPos);
  var p2 = this.transPos(newPos);

  if(p1.x===p2.x && p1.y===p2.y && oldRange===newRange)
    return true;
  else{
    if(oldRange < 0 || newRange < 0){
      return false;
    }

    oldRange = oldRange>5?5:oldRange;
    newRange = newRange>5?5:newRange;

    var changedTowers = getChangedTowers(p1, p2, oldRange, newRange, this.towers, this.max);
    var removeTowers = changedTowers.removeTowers;
    var addTowers = changedTowers.addTowers;
    var addObjs = [];
    var removeObjs = [];

    var i, ids;
    for(i = 0; i < addTowers.length; i++){
      addTowers[i].addWatcher(watcher);
      ids = addTowers[i].getIds();
      addMap(addObjs, ids);
    }

    for(i = 0; i < removeTowers.length; i++){
      removeTowers[i].removeWatcher(watcher);
      ids = removeTowers[i].getIds();
      addMap(removeObjs, ids);
     }

    this.emit('updateWatcher', {id: watcher.id, type:watcher.type, addObjs: addObjs, removeObjs:removeObjs});
    return true;
  }
};

/**
 * Get changed towers for girven pos
 * @param p1 {Object} The origin position
 * @param p2 {Object} The now position
 * @param r1 {Number} The old range
 * @param r2 {Number} The new range
 * @param towers {Object} All towers of the aoi
 * @param max {Object} The position limit of the towers
 *
 */
function getChangedTowers(p1, p2, r1, r2, towers, max){
  var limit1 = getPosLimit(p1, r1, max);
  var limit2 = getPosLimit(p2, r2, max);
  var removeTowers = [];
  var addTowers = [];
  var unChangeTowers = [];

  for(var x = limit1.start.x; x <= limit1.end.x; x++){
  	for(var y = limit1.start.y; y <= limit1.end.y; y++){
  		if(isInRect({x: x, y : y}, limit2.start, limit2.end)){
  			unChangeTowers.push(towers[x][y]);
  		}else{
  			removeTowers.push(towers[x][y]);
  		}
  	}
  }

  for(var x = limit2.start.x; x <= limit2.end.x; x++){
  	for(var y = limit2.start.y; y <= limit2.end.y; y++){
  		if(!isInRect({x: x, y : y}, limit1.start, limit1.end)){
  			addTowers.push(towers[x][y]);
  		}
  	}
  }

  return {addTowers:addTowers, removeTowers: removeTowers, unChangeTowers: unChangeTowers};
}

/**
 * Get the postion limit of given range
 * @param pos {Object} The center position
 * @param range {Number} The range
 * @param max {max} The limit, the result will not exceed the limit
 * @return The pos limitition
 */
function getPosLimit(pos, range, max){
	var result = {};
	var start = {}, end = {};

	if(pos.x - range < 0){
		start.x = 0;
		end.x = 2*range;
	}else if(pos.x + range > max.x){
		end.x = max.x;
		start.x = max.x - 2*range;
	}else{
		start.x = pos.x - range;
		end.x = pos.x + range;
	}

	if(pos.y - range < 0){
		start.y = 0;
		end.y = 2*range;
	}else if(pos.y + range > max.y){
		end.y = max.y;
		start.y = max.y - 2*range;
	}else{
		start.y = pos.y - range;
		end.y = pos.y + range;
	}

	start.x = start.x>=0?start.x:0;
	end.x = end.x<=max.x?end.x:max.x;
	start.y = start.y>=0?start.y:0;
	end.y = end.y<=max.y?end.y:max.y;

	return {start: start, end :end};
}

/**
 * Check if the pos is in the rect
 */
function isInRect(pos, start, end){
	return (pos.x >= start.x && pos.x <= end.x && pos.y >= start.y && pos.y <= end.y);
}

pro.getWatchers = function(pos, types){
	if(this.checkPos(pos)){
    var p = this.transPos(pos);
    return this.towers[p.x][p.y].getWatchers(types);
  }

  return null;
};

/**
 * Combine map to arr
 * @param arr {Array} The array to add the map to
 * @param map {Map} The map to add to array
 */
function addMap(arr, map){
  for(var key in map)
    arr.push(map[key]);
  return arr;
}

/**
 * Add map to array by type
 */
function addMapByTypes(result, map, types){
  for(var i = 0; i < types.length; i++){
    var type = types[i];

    if(!map[type])
      continue;

    if(!result[type]){
      result[type] = [];
    }
    for(var key in map[type]){
      result[type].push(map[type][key]);
    }
  }
  return result;
}

exp.getService = function(config){
  return new TowerAOI(config);
};

