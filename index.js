var dns = require('native-dns');
var server = dns.createServer();
var util = require('util');
var clone = require('clone');
var path = require('path');
var fs = require('fs');

var configPath = path.resolve(__dirname, 'config/dns-proxy.json');
var CONFIG = JSON.parse(fs.readFileSync(configPath));

server.on('request', function (request, response) {
  var serviceName = request.question[0].name.split(".");
  var domain = serviceName.pop();
  serviceName = serviceName.join(".");
  var start = Date.now();
  var targetDomain = CONFIG.domains[domain];
  if (!targetDomain || !targetDomain.host) {
    console.log("ERR! Domain", domain, "not mapped");
    return response.send();
  }
  var question = clone(request.question[0]);
  question.name = serviceName;
  if (targetDomain.suffix) {
    question.name += '.' + targetDomain.suffix;
  }
  var req = dns.Request({
    question: question,
    server: { address: targetDomain.host, port: targetDomain.port || 53, type: targetDomain.proto || 'udp' },
    timeout: targetDomain.timeout || 1000
  });
  req.on('timeout', function () {
    console.log('Timeout in making request', question);
  });
  req.on('message', function (err, answer) {
    console.log(request.question[0].name, 'resolved to', answer.answer.length, 'hosts via', targetDomain.host);
    answer.answer.forEach(function (a) {
      a.name = a.name.replace(new RegExp(targetDomain.suffix + '$'), domain);
      response.answer.push(a);
    });
    response.send();
  });
  req.on('end', function () {
    var delta = (Date.now()) - start;
    console.log('Request done: ' + delta.toString() + 'ms');
  });
  req.send();
});
server.on('error', function (err, buff, req, res) {
  console.log(err.stack);
});
server.serve(CONFIG.port || 1553);
console.log('Alive and kicking at port', CONFIG.port || 1553);
