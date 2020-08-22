module.exports = BarChart;
function BarChart() {}
BarChart.prototype.view = __dirname;

BarChart.prototype.init = function() {
  var model = this.model;
  model.setNull("data", []);
  model.setNull("width", 200);
  model.setNull("height", 100);
  model.set("layout", []);

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

  var width = model.get("width");
  var height = model.get("height");

  var yMax = 0;
  data.forEach(function(d) { if(d.value > yMax) yMax = d.value });
  var barWidth = width / data.length;

  var yScale = function(v) {
    return v * height / yMax;
  };

  // update the layout
  var layout = data.map(function(d,i) {
    return {
      x: i * barWidth,
      y: height - yScale(d.value),
      width: barWidth/2,
      height: yScale(d.value)
    }
  });
  // we do more computing in js (setDiffDeep) to avoid extra re-rendering
  model.setDiffDeep("layout", layout);
};

BarChart.prototype.clicker = function(d,i,evt,el) {
  console.log("clicked!", d,i,el)
};
