var finalhandler = require('finalhandler');
var http = require('http');
var path = require('path');
var serveStatic = require('serve-static');


// Default port is 5555. Override it with `PORT=____`,
// or `PORT=0` to let Node pick an unused port.
var port = parseInt(process.env.PORT, 10);
if (!Number.isInteger(port)) {
  port = 5555;
}
// The test server only serves to this local machine by default.
// To access it from any other network device, use `HOST=0.0.0.0`,
// but be sure you trust the network you're on.
var bindHost = process.env.HOST || '127.0.0.1';


// Serve files under Saddle's base directory, since test.html
// loads Mocha from node_modules with a relative path.
var serveTestDir = serveStatic(path.dirname(__dirname));
var server = http.createServer(function onRequest(req, res) {
  serveTestDir(req, res, finalhandler(req, res));
});

server.listen(port, bindHost, function(err) {
  if (err) {
    console.log('Error starting browser test server:', err);
    server.close();
  } else {
    var testUrl = 'http://127.0.0.1:' + port + '/test/test.html';
    console.log('Test server started on network interface ' + bindHost + '.');
    console.log('\nTo run browser tests, visit this URL:\n');
    console.log('    ' + testUrl);
  }
});
