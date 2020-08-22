d-barchart-vanilla
==================

Example Bar chart Derby component built in vanilla JS (with no d3) to illustrate the difference.  
see also:  
[d-barchart](http://github.com/codeparty/d-barchart)  
[d-d3-barchart](http://github.com/codeparty/d-d3-barchart)  

# Usage
[Example usage](http://github.com/codeparty/derby-examples/charts)

## In your template
```
<view name="d-barchart" data={{_page.data}} width=300 height=200></view>
```
some optional arguments
```
<view name="d-barchart" data={{_page.data}} margins={{_page.margins}}></view>
```


## Your data
```
model.set("_page.data", [ { value: 1 }, { value: 10 } ]);
```

Optional data
```
model.set("_page.margins", {top: 0, right: 20, bottom: 0, left: 20 });
```

## Implementation pattern

In this example we take advantage of derby's bindings to associate our data with the DOM.  
We use the __layout__ pattern where we transform input data into layout data, and then render the layout data.  
We don't use any d3 to both show a more bare-bones Derby example, as well as show what d3 makes more convenient regarding laying out data.
