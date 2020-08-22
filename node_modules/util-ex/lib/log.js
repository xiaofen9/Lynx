var inspect = require('./inspect');
var format  = require('./format');

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

module.exports = function() {
  console.log('%s - %s', timestamp(), format.apply(exports, arguments));
};

/*
module.exports = function(msg, type, depth) {
  if (isNaN(depth)) depth = 10;
  if (!type) type = 'log';
  console[type](inspect(msg, {depth: depth}));
}
*/
