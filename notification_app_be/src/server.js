require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { Log, loggingMiddleware } = require('./middleware/logging');
const { authMiddleware, generateToken } = require('./middleware/auth');
const { setupSocketHandlers } = require('./socket/handler');

const notificationRoutes = require('./routes/notifications');
const preferenceRoutes = require('./routes/preferences');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});

// Make io accessible in route handlers via req.app.get('io')
app.set('io', io);

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());
app.use(loggingMiddleware);

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Demo token endpoint (for testing without a full auth system)
app.post('/api/v1/auth/token', (req, res) => {
  const { userId = 'user-123', email = 'demo@afford.com', role = 'user' } = req.body;
  const token = generateToken({ userId, email, role });
  Log('backend', 'info', 'auth', `Token generated for user: ${userId}`);
  res.json({ success: true, data: { token, userId, email, role } });
});

// Protected API routes
app.use('/api/v1/notifications', authMiddleware, notificationRoutes);
app.use('/api/v1/preferences', authMiddleware, preferenceRoutes);

// 404 handler
app.use((req, res) => {
  Log('backend', 'warn', 'server', `Route not found: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: { code: 'RESOURCE_NOT_FOUND', message: `Route ${req.originalUrl} not found`, status: 404 },
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  Log('backend', 'error', 'server', `Unhandled error: ${err.message}`);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', status: 500 },
  });
});

// Socket.IO handlers
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    Log('backend', 'info', 'db', 'MongoDB connection established successfully');
    server.listen(PORT, () => {
      Log('backend', 'info', 'server', `Notification server started on port ${PORT}`);
      console.log(`\n\x1b[35m╔═══════════════════════════════════════════╗\x1b[0m`);
      console.log(`\x1b[35m║\x1b[0m  🚀 Notification Server running on :${PORT}    \x1b[35m║\x1b[0m`);
      console.log(`\x1b[35m║\x1b[0m  📡 Socket.IO ready for connections       \x1b[35m║\x1b[0m`);
      console.log(`\x1b[35m║\x1b[0m  📋 API: http://localhost:${PORT}/api/v1     \x1b[35m║\x1b[0m`);
      console.log(`\x1b[35m╚═══════════════════════════════════════════╝\x1b[0m\n`);
    });
  })
  .catch((err) => {
    Log('backend', 'fatal', 'db', `Critical database connection failure: ${err.message}`);
  });
