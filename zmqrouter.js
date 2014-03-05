var zmq = require('zmq');
var server = zmq.socket('router');
var port = 'tcp://127.0.0.1:12345';
var delimiter = new Buffer([]);

var clients = [];

function createClient(id) {
  var client = zmq.socket('dealer');
  client.identity = 'service' + id;
  client.connect(port);

  client.on('message', function(conn_id, data) {
    console.log(client.identity + ': calculating for ' + data);
    client.send([conn_id, data*2]);
  });

  return client;
}

function setupClients(count) {
  for(var i=0; i<count; i++) {
    clients.push(createClient(i));
  }
}

server.identity = 'router';
server.bind(port, function(err) {
  if (err) throw err;
  console.log('bound!');

  server.on('message', function(conn_id, dest_id, data) {
    console.log(server.identity + ': received ' + conn_id + ' - ' + data.toString());
    server.send([dest_id, conn_id, data]);
  });
});

setupClients(5);

var client = zmq.socket('dealer');
client.identity = 'client';
client.connect(port);

client.on('message', function(envalope, data) {
  console.log(client.identity + ': answer data ' + data);
});

setInterval(function() {
  var value = Math.floor(Math.random()*100);
  var serviceName = 'service' + (value % 5);
  client.send([serviceName, value]);

  console.log('%s asking %s about %d', client.identity, serviceName, value);
}, 100);

