d-d3-barchart
==================

Example d3 Bar chart Derby component.  
see also:  
[d-barchart-vanilla](http://github.com/codeparty/d-barchart-vanilla)  
[d-barchart](http://github.com/codeparty/d-d3-barchart)  

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

We let d3 handle the DOM manipulation to take advantage of its transition API. We also render the DOM elements with Derby in an __unbound__ template block so that the initial bar chart gets rendered on the server.  
d3's selection API finds the existing elements and binds it's data to them.
