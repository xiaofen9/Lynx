module.exports = function(app, options) {
  app.component(require('./dropdown'));
  app.component(require('./modal'));
  app.component(require('./tabs'));
  app.component(require('./alert'));
  app.component(require('./contextMenu'));
  if (require && require.resolve && !options || (options && options.loadStyles)) {
    var filename = require.resolve('bootstrap/dist/css/bootstrap.min.css');
    app.loadStyles(filename);
  }
};
