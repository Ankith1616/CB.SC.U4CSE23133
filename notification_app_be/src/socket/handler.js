const jwt = require('jsonwebtoken');
const { Log } = require('../middleware/logging');

/**
 * Configures Socket.IO event handlers.
 * Authenticates users via JWT and assigns them to private rooms.
 */
function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    Log('backend', 'info', 'socket', `Socket connected: ${socket.id}`);

    // Client sends JWT token to authenticate
    socket.on('authenticate', (data) => {
      try {
        const { token } = data;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Join user-specific room
        socket.join(`user:${userId}`);
        socket.userId = userId;

        Log('backend', 'info', 'socket', `Socket ${socket.id} authenticated as user:${userId}`);
        socket.emit('authenticated', { userId, message: 'Successfully authenticated' });
      } catch (err) {
        Log('backend', 'error', 'socket', `Socket ${socket.id} auth failed: ${err.message}`);
        socket.emit('auth_error', { message: 'Authentication failed' });
      }
    });

    socket.on('disconnect', (reason) => {
      Log('backend', 'info', 'socket', `Socket disconnected: ${socket.id} (${reason})${socket.userId ? ` [user:${socket.userId}]` : ''}`);
    });
  });
}

module.exports = { setupSocketHandlers };
