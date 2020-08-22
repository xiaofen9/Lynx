var aoiService = require('../lib/aoiService');
var config;

function initAoi(){
  config = {
    width: 10000,
    height: 10000,
    towerWidth: 100,
    towerHeight: 100
  };

  return aoiService.getService(config);
}

var users;

function testCase(){
  var aoi = initAoi();
  var w = config.width;
  var h = config.height;

  var count = 10000;

  users = {};
  var id = 0;
  var types = ['player', 'mob', 'npc'];
  for(var i = 0; i < count; i++, id++){
    users[id] = {
      id: id,
      pos : {
        x : Math.floor(Math.random()*w),
        y : Math.floor(Math.random()*h)
      },
      type: types[i%3]
    };
  }

  for(id in users){
    aoi.addObject(users[id], users[id].pos);
  }

  posTest(w, h, aoi, types);
  //pathTest(users, w, h, aoi);
}

function pathTest(w, h, aoi){
  var testCount = 100;
  var testPath = [];
  var width = config.width;
  var height = config.height;

  //The max move distance
  var max = 600;
  var direction = 1;
  for (var i = 0; i < testCount; i++){
    var start = {
      x : Math.floor(Math.random()*w),
      y : Math.floor(Math.random()*h)
    };

    //Éú³ÉÐéÄâÒÆ¶¯

    var dis = Math.floor(Math.random()*max);
    direction = Math.random>0.5?-1:1;
    var xMove = Math.floor(Math.random()*dis) * direction;
    direction = Math.random>0.5?-1:1;
    var yMove = Math.floor(Math.sqrt(dis*dis - xMove*xMove)) * direction;
    direction *= -1;


    var x = start.x + xMove;
    var y = start.y + yMove;
    x = x<0?0:x>width?width:x;
    y = y<0?0:y>height?height:y;

    var end = {
      x: x,
      y: y
    };

    testPath.push([start, end]);
  }

  var avg = 0;
  for(var i = 0; i < testCount; i++){
    //aoi.updateObject(10, testPath[i][0], testPath[i][1]);
    var ids1 = aoi.getIdsByPath(testPath[i][0], testPath[i][1]).sort(sort);
    var ids2 = getRightArrByPath(testPath[i], users);

    if(!equals(ids1, ids2)){
      console.error('test case error, path : ' + JSON.stringify(testPath[i]));
      console.error(ids1.length);
      console.error(ids2.length);
      printUsers(ids1, users);
      printUsers(ids2, users);
      console.error(ids1.towers);
      break;
    }

    avg += (ids1.length -avg)/(i+1);
  }

  console.error(avg);
}

function posTest(w, h, aoi, types){
  var testCount = 100;
  var testPos = [];
  var i;

  for (i = 0; i < testCount; i++){
    testPos.push({
      x : Math.floor(Math.random()*w),
      y : Math.floor(Math.random()*h)
    });
  }

  var range = 3;
  for(i = 0; i < testCount; i++){
    var ids1 = aoi.getIdsByRange(testPos[i], range, types);

    for(var type in ids1)
      ids1[type].sort(sort);
    var ids2 = getRightArrByPos(testPos[i], range, types);

    if(!mapEquals(ids1, ids2, types)){
      console.error('test case error! pos : %j', testPos[i]);
      console.error(ids1);
      console.error(ids2);
      break;
    }
  }
}

function getRightArrByPos(pos, range, types){
  var result = {};
  var w = config.towerWidth;
  var h = config.towerHeight;

  var x = Math.floor(pos.x/w) * w;
  var y = Math.floor(pos.y/h) * h;

  var x1 = x - w*range, x2 = x + w*(range+1);
  var y1 = y - h*range, y2 = y + h*(range+1);

  var limit = getPosLimit(pos, range);

  //console.log('right pos start : %j, end : %j', limit.start, limit.end);
  for(var id in users){
    var p = users[id].pos;
    var type = users[id].type;
    if(p.x >= limit.start.x && p.x < limit.end.x && p.y >= limit.start.y && p.y < limit.end.y){
      if(!result[type])
        result[type] = [];

      result[type].push(users[id].id);
    }
  }

  for(var type in result){
    result[type].sort(sort);
  }
  return result;
}

function getRightArrByPath(path, users){
  var result = [];
  var w = config.towerWidth;
  var h = config.towerHeight;

  var p1 = path[0], p2 = path[1];

  var x1 = Math.floor((p1.x<p2.x?p1.x:p2.x)/w) * w - w;
  var y1 = Math.floor((p1.y<p2.y?p1.y:p2.y)/h) * h - h;

  var x2 = Math.floor((p1.x>p2.x?p1.x:p2.x)/w) * w + w + w;
  var y2 = Math.floor((p1.y>p2.y?p1.y:p2.y)/h) * h + h + h;

  //console.error('x1 : ' + x1 + ' , x2 : ' + x2 + ' , y1 : ' + y1 + ' , y2 : ' + y2)

  for(var id in users){
    var pos = users[id].pos;
    if(pos.x >= x1 && pos.x < x2 && pos.y >= y1 && pos.y < y2){
      result.push(id);
    }
  }
  return result.sort(sort);
}

function sort(a, b){
  return a - b;
}

function arrayEquals(arr1, arr2){
  if(arr1.length != arr2.length){
    return false;
  }

  for(var i = 0; i < arr1.length; i++){
    if(arr1[i] != arr2[i])
      return false;
  }

  return true;
}

function mapEquals(map1, map2, keys){
  for(var i = 0; i < keys.length; i++){
    var key = keys[i];

    if(!map1[key] && !map2[key])
      continue;
    if(!map1[key] || !map2[key]){
      return false;
    }

    if(!arrayEquals(map1[key], map2[key])){
      return false;
    }
  }

  return true;
}

function printUsers(uids, users){
  for(var key in uids){
    var uid = uids[key];
    console.log(users[uid]);
  }
}

function getPosLimit(p, range){
  var w = config.towerWidth;
  var h = config.towerHeight;

  var max = {
    x : config.width/w,
    y : config.height/h
  };


  var pos = {
    x : Math.floor(p.x/w),
    y : Math.floor(p.y/h)
  };

  var result = {};
  var start = {}, end = {};

  if(pos.x - range < 0){
    start.x = 0;
    end.x = 2*range;
  }else if(pos.x + range >= max.x){
    end.x = max.x;
    start.x = max.x - 2*range - 1;
  }else{
    start.x = pos.x - range;
    end.x = pos.x + range;
  }

  if(pos.y - range < 0){
    start.y = 0;
    end.y = 2*range;
  }else if(pos.y + range >= max.y){
    end.y = max.y;
    start.y = max.y - 2*range - 1;
  }else{
    start.y = pos.y - range;
    end.y = pos.y + range;
  }

  start.x = (start.x>=0?start.x:0) * w;
  end.x = (end.x<=max.x?end.x:max.x) * w + w;
  start.y = (start.y>=0?start.y:0) * h;
  end.y = (end.y<=max.y?end.y:max.y) * h + h;

  return {start: start, end :end};
}

var start = Date.now();
testCase();
var end = Date.now();

console.log('test success for %jms!', end-start);
