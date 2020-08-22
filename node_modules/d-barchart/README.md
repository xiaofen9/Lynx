d-barchart
==================

Example d3 Bar chart Derby component.  
also see:  
[d-barchart-vanilla](http://github.com/codeparty/d-barchart-vanilla)  
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
The benefit here is we get server-side rendering and readable templates that react to changes in the data. The trade-off is that we lose d3's transitions because we don't use the selection api.
