const jwt = require('jsonwebtoken');
const { Log } = require('./logging');

/**
 * JWT Authentication Middleware
 * Extracts and verifies the Bearer token from the Authorization header.
 * Attaches decoded user data to req.user.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    Log('backend', 'warn', 'auth', `Unauthorized request: missing Bearer token on ${req.originalUrl}`);
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid Authorization header. Expected: Bearer <token>',
        status: 401,
      },
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, role }
    next();
  } catch (err) {
    Log('backend', 'warn', 'auth', `Invalid or expired token on ${req.originalUrl}: ${err.message}`);
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
        status: 401,
      },
    });
  }
};

/**
 * Generate a JWT token for testing / demo purposes.
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

module.exports = { authMiddleware, generateToken };
