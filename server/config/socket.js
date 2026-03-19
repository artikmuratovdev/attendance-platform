const { Server } = require('socket.io');

function createSocketServer(httpServer) {
  const allowedOrigins = (process.env.CLIENT_URL)
    .split(',')
    .map(u => u.trim())
    .filter(Boolean);

  return new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
}

module.exports = { createSocketServer };