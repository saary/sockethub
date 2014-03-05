var axon = require('axon');
var router = axon.socket('router');
var registerid = require('./registerid.js');
var RouterSocket = axon.RouterSocket;

var port = 12345;

function createClient(id) {
  var client = axon.socket('rep');

  client.identity = 'service' + id;
  client.use(registerid());

  client.connect(port, '127.0.0.1');

  client.on('registered', function(code) {
    if (code !== RouterSocket.REGISTER_SUCCESS) {
      return client.close();
    }

    client.on('message', function(reqAddress, data, reply) {
      console.log(client.identity + ': calculating for ', data);
      reply(reqAddress, data*2);
    });
  });


  return client;
}

var clients = [];

function setupClients(count) {
  for(var i=0; i<count; i++) {
    clients.push(createClient(i));
  }
}

router.identity = 'router';
router.on('message', function(dest_id, data) {
  console.log(router.identity + ': received ' + dest_id.id + ' - ' + data.toString());
});

router.bind(port, function() {
  setupClients(5);

  var client = axon.socket('req');
  client.identity = 'client';
  
  client.connect(port, '127.0.0.1', function() {
    setInterval(function() {
      var value = Math.floor(Math.random()*100);
      var serviceName = 'service' + (value % 5);
      client.send({id: serviceName}, value, function(envalope, data) {
        if (envalope.err) {
          return console.error(envalope.err);
        }

        console.log(client.identity + ': answer data ' + data);
      });

      console.log('%s asking %s about %d', client.identity, serviceName, value);
    }, 100);
  });
});


