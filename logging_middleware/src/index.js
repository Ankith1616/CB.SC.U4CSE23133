/**
 * Afford Logging Middleware
 *
 * Provides a Log(stack, level, package, message) function that sends logs
 * to the remote evaluation service API, and an Express middleware that
 * automatically logs every request/response.
 *
 * Remote API: POST http://20.207.122.201/evaluation-service/logs
 *
 * Usage:
 *   Log("backend", "error", "handler", "received string, expected bool")
 *   Log("backend", "fatal", "db", "Critical database connection failure.")
 */

const http = require('http');

/* ───────────────────────────────────────────
   Constants & Validation
   ─────────────────────────────────────────── */

const LOG_API_URL = 'http://20.207.122.201/evaluation-service/logs';

const VALID_STACKS = ['backend', 'frontend'];
const VALID_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];

const LEVEL_PRIORITY = { debug: 0, info: 1, warn: 2, error: 3, fatal: 4 };

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
};

const LEVEL_COLORS = {
  debug: COLORS.dim,
  info: COLORS.cyan,
  warn: COLORS.yellow,
  error: COLORS.red,
  fatal: `${COLORS.red}${COLORS.bright}`,
};

/* ───────────────────────────────────────────
   Core Log Function
   ─────────────────────────────────────────── */

/**
 * Sends a structured log entry to the remote evaluation service.
 *
 * @param {string} stack   - "backend" or "frontend"
 * @param {string} level   - "debug" | "info" | "warn" | "error" | "fatal"
 * @param {string} pkg     - The package/module name (e.g. "handler", "db", "server")
 * @param {string} message - Human-readable log message
 * @returns {Promise<object|null>} Parsed response body, or null on failure
 */
function Log(stack, level, pkg, message) {
  // ── Validate inputs ──
  if (!VALID_STACKS.includes(stack)) {
    console.error(`${COLORS.red}[Log] Invalid stack "${stack}". Must be one of: ${VALID_STACKS.join(', ')}${COLORS.reset}`);
    return Promise.resolve(null);
  }
  if (!VALID_LEVELS.includes(level)) {
    console.error(`${COLORS.red}[Log] Invalid level "${level}". Must be one of: ${VALID_LEVELS.join(', ')}${COLORS.reset}`);
    return Promise.resolve(null);
  }

  const payload = JSON.stringify({
    stack,
    level,
    package: pkg,
    message,
  });

  // ── Local console output (color-coded) ──
  const color = LEVEL_COLORS[level] || COLORS.white;
  const timestamp = new Date().toISOString();
  console.log(
    `${COLORS.dim}[${timestamp}]${COLORS.reset} ` +
    `${color}${level.toUpperCase().padEnd(5)}${COLORS.reset} ` +
    `${COLORS.magenta}[${stack}/${pkg}]${COLORS.reset} ` +
    `${message}`
  );

  // ── Send to remote API ──
  return new Promise((resolve) => {
    try {
      const url = new URL(LOG_API_URL);

      const rawToken = process.env.LOG_API_TOKEN || '';
      const token = rawToken.replace(/^["']|["']$/g, '');

      const options = {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {}),
        },
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve(body);
          }
        });
      });

      req.on('error', (err) => {
        console.error(`${COLORS.dim}[Log] Remote API error: ${err.message}${COLORS.reset}`);
        resolve(null);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        resolve(null);
      });

      req.write(payload);
      req.end();
    } catch (err) {
      console.error(`${COLORS.dim}[Log] Failed to send log: ${err.message}${COLORS.reset}`);
      resolve(null);
    }
  });
}

/* ───────────────────────────────────────────
   Express Middleware
   ─────────────────────────────────────────── */

function getStatusLevel(statusCode) {
  if (statusCode >= 500) return 'error';
  if (statusCode >= 400) return 'warn';
  return 'info';
}

/**
 * Creates an Express middleware that automatically logs each request/response
 * using the Log() function.
 *
 * @param {Object} options
 * @param {string}   options.stack        - "backend" or "frontend" (default: "backend")
 * @param {string}   options.pkg          - Package name for logs (default: "server")
 * @param {string}   options.level        - Minimum log level (default: "info")
 * @param {string[]} options.excludePaths - Paths to skip logging (default: [])
 * @returns {Function} Express middleware
 */
function createLoggingMiddleware(options = {}) {
  const {
    stack = 'backend',
    pkg = 'server',
    level = 'info',
    excludePaths = [],
  } = options;

  const minLevel = LEVEL_PRIORITY[level] ?? LEVEL_PRIORITY.info;

  return function loggingMiddleware(req, res, next) {
    // Skip excluded paths
    if (excludePaths.some((p) => req.path.startsWith(p))) {
      return next();
    }

    const startTime = process.hrtime.bigint();
    const { method, originalUrl } = req;

    // Log incoming request
    if (minLevel <= LEVEL_PRIORITY.info) {
      Log(stack, 'info', pkg, `${method} ${originalUrl} ← incoming`);
    }

    // Capture response finish
    const originalEnd = res.end;
    res.end = function (...args) {
      const duration = (Number(process.hrtime.bigint() - startTime) / 1e6).toFixed(1);
      const statusLevel = getStatusLevel(res.statusCode);

      if (LEVEL_PRIORITY[statusLevel] >= minLevel) {
        Log(stack, statusLevel, pkg, `${method} ${originalUrl} → ${res.statusCode} (${duration}ms)`);
      }

      originalEnd.apply(res, args);
    };

    next();
  };
}

module.exports = { Log, createLoggingMiddleware };
