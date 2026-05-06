/**
 * Re-exports the logging middleware and Log function
 * from the shared logging_middleware package.
 */
const { Log, createLoggingMiddleware } = require('afford-logging-middleware');

const loggingMiddleware = createLoggingMiddleware({
  stack: 'backend',
  pkg: 'server',
  level: 'info',
  excludePaths: ['/health'],
});

module.exports = { Log, loggingMiddleware };
