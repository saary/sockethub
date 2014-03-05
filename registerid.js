
/**
 * Module dependencies.
 */

var RouterSocket = require('axon').RouterSocket;

/**
 * Register Id plugin.
 *
 * registers a socket with a router on connection.
 *
 * Emits:
 *  - `registered` (code) when the socket is registered
 *
 * @param {Object} options
 * @api private
 */

module.exports = function (options) {
  options = options || {};

  return function (sock) {
    if (!sock.identity) throw new Error('sock must have an identity');

    sock.on('connect', function () {
      var socket = sock.socks[sock.socks.length - 1];

      if (socket.writable) {
        var args = [{ id: sock.identity, type: RouterSocket.REGISTER }, sock.identity + ':register'];
        socket.write(sock.pack(args));
      }

      sock.once('message', function (code) {
        sock.emit('registered', code);
      });
    });
  };
};

