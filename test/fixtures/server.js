var http = require('http');

var lorem = require('./lorem_tree');

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({
    words: lorem
  }));
});

module.exports = server;
