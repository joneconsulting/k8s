var http = require('http');
var os = require("os");
var hostname = os.hostname();

var content = function(req, resp) {
 var ip = req.headers['x-forwarded-for'] ||
     req.connection.remoteAddress ||
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;

 resp.end("Hello Docker and Swarm - " + ip + ", " + hostname); 
 resp.writeHead(200);
}
var w = http.createServer(content);
w.listen(8000);