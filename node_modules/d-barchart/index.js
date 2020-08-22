var d3 = require('d3');

module.exports = BarChart;
function BarChart() {}
BarChart.prototype.view = __dirname;

BarChart.prototype.init = function() {
  var model = this.model;
  model.setNull("data", []);
  model.setNull("width", 200);
  model.setNull("height", 100);
  model.set("layout", []);

  this.yScale = d3.scale.linear()
    .range([0, model.get("height")]);
  this.xScale = d3.scale.ordinal()
    .rangeBands([0, model.get("width")], 0.1);
  this.transform()
};

BarChart.prototype.create = function() {
  var model = this.model;
  var that = this;

  // changes in values inside the array
  model.on("all", "data**", function() {
    //console.log("event data:", arguments);
    that.transform()
  });
};

BarChart.prototype.transform = function() {
  var model = this.model;
  var that = this;
  var data = model.get("data") || [];

  this.xScale.domain(d3.range(data.length));
  // this could be implemented as extent for a relative scale
  this.yScale.domain([0, d3.max(data, function(d) { return d.value })]);

  // update the layout
  var layout = data.map(function(d,i) {
    return {
      x: that.xScale(i),
      y: that.yScale.range()[1] - that.yScale(d.value),
      width: that.xScale.rangeBand()/2,
      height: that.yScale(d.value)
    }
  })
  // we do more computing in js (setDiffDeep) to avoid extra re-rendering
  model.setDiffDeep("layout", layout);
};

BarChart.prototype.clicker = function(d,i,evt,el) {
  console.log("clicked!", d,i,el)
};
