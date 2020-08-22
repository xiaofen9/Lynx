var d3 = require('d3');

module.exports = BarChart;
function BarChart() {}
BarChart.prototype.view = __dirname;

BarChart.prototype.init = function() {
  var model = this.model;
  model.setNull("data", []);
  model.setNull("width", 200);
  model.setNull("height", 100);

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
    that.draw()
  });
  that.draw();
};

BarChart.prototype.transform = function() {
  var model = this.model;
  var that = this;
  var data = model.get("data") || [];

  this.xScale.domain(d3.range(data.length));
  // this could be implemented as extent for a relative scale
  this.yScale.domain([0, d3.max(data, function(d) { return d.value })]);
};

BarChart.prototype.draw = function() {
  var that = this;
  var model = this.model;
  var data = model.get("data");
  var barSel = d3.select(this.chart).selectAll("rect.bar")
    .data(data);

  barSel.enter()
    .append("rect")
    .classed("bar", true)
  barSel.exit()
    .remove()

  barSel
    .transition()
  .attr({
    x: function(d,i) { return that.x(d,i) },
    y: function(d,i) { return that.y(d,i) },
    width: function(d,i) { return that.width(d,i) },
    height: function(d,i) { return that.height(d,i) }
  });

  barSel.on("click", function(d,i) {
    console.log("clicked!", d,i,this);
  })
};

BarChart.prototype.x = function(d,i) { return this.xScale(i); };
BarChart.prototype.y = function(d,i) { return this.yScale.range()[1] - this.yScale(d.value); };
BarChart.prototype.width = function(d,i) { return this.xScale.rangeBand()/2; };
BarChart.prototype.height = function(d,i) { return this.yScale(d.value); };
