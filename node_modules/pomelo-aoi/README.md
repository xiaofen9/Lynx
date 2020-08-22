# pomelo-aoi
pomelo-schedule is the aoi module used in the demo of pomelo.

The aoi module include a set of aoi interface, and an implementation of tower aoi algorithm.  
##Installation
```
npm install pomelo-aoi
```
##Generate an aoi instance
For the aoi service can be used in many areas, each area use the aoi module should use it's own aoi instance.
We use a aoi factory to generate aoi instance, it accept an object as parameter, and return an aoi instance,  which can be used to implament the aoi function.   

``` javascript
var aoiManager = require('pomelo-aoi');
var config = {
	map : {
		width : 3200,
		height : 2400
	},
	tower : {
		width : 300,
		height : 300
	}
}

var aoi = qoiManager.getService(config);
```

##Use the aoi service
The aoi instace has the basic interface for aoi action.

``` javascript
	//Add object 
	aoi.addObject(obj, pos);
	
	//Remove object 
	aoi.removeObject(obj, pos);
	
	//Update object
	aoi.updateObject(obj, oldPos, newPos);
	
	//Add watcher 
	aoi.addWatcher(watcher, pos, range);
	
	//Remove watcher
	aoi.removeWatcher(watcher, pos, range0;
	
	//updateWatcher(watcher, oldPos, newPos, oldRange, newRange);
``` 
More api can be find in aoiService.js.

##Handle aoi event
The aoi service will generate event when the status of objects or watchers changes. You can handler these event :
``` javascript
	aoi.on('add', function(params){
		//Handle add event
	});

``` 
The event of tower aoi are: 'add', 'remove', 'update' for aoi object, and 'updateWatcher' for watcher.
Of course you can ignore all these events without do any effect to aoi function. 
