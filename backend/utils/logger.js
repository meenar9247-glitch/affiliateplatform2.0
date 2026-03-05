/**
 * ============================================
 * LOGGER UTILITY
 * Professional logging with multiple transports, log levels,
 * rotation, and external service integration
 * ============================================
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');
const DailyRotateFile = require('winston-daily-rotate-file');
const { ElasticsearchTransport } = require('winston-elasticsearch');

// ============================================
// Configuration
// ============================================

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  verbose: 5,
  silly: 6
};

const LOG_COLORS = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
  verbose: 'cyan',
  silly: 'gray'
};

// Add colors to winston
winston.addColors(LOG_COLORS);

// ============================================
// Log Directory Setup
// ============================================

const createLogDirectory = () => {
  const logDir = path.join(__dirname, '../../logs');
  
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  return logDir;
};

const LOG_DIR = createLogDirectory();

// ============================================
// Custom Log Format
// ============================================

const { combine, timestamp, printf, colorize, json, metadata, errors } = winston.format;

// Console format with colors
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
  printf(({ timestamp, level, message, metadata, stack }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (metadata && Object.keys(metadata).length > 0) {
      log += `\n${JSON.stringify(metadata, null, 2)}`;
    }
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// File format (no colors)
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
  json()
);

// ============================================
// Custom Transports
// ============================================

// Console transport
const consoleTransport = new winston.transports.Console({
  level: process.env.LOG_LEVEL || 'info',
  format: consoleFormat
});

// Daily rotate file transport - errors
const errorFileTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  format: fileFormat,
  maxSize: '20m',
  maxFiles: '30d',
  zippedArchive: true
});

// Daily rotate file transport - combined logs
const combinedFileTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  format: fileFormat,
  maxSize: '20m',
  maxFiles: '30d',
  zippedArchive: true
});

// Daily rotate file transport - HTTP logs
const httpFileTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'http-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'http',
  format: fileFormat,
  maxSize: '20m',
  maxFiles: '30d',
  zippedArchive: true
});

// ============================================
// Elasticsearch Transport (Optional)
// ============================================

let elasticsearchTransport = null;

if (process.env.ELASTICSEARCH_URL) {
  try {
    elasticsearchTransport = new ElasticsearchTransport({
      level: 'info',
      clientOpts: {
        node: process.env.ELASTICSEARCH_URL,
        auth: process.env.ELASTICSEARCH_AUTH
      },
      index: 'affiliate-logs',
      format: fileFormat
    });
  } catch (error) {
    console.error('Failed to initialize Elasticsearch transport:', error);
  }
}

// ============================================
// Create Logger Instance
// ============================================

const transports = [
  consoleTransport,
  errorFileTransport,
  combinedFileTransport,
  httpFileTransport
];

if (elasticsearchTransport) {
  transports.push(elasticsearchTransport);
}

const logger = winston.createLogger({
  levels: LOG_LEVELS,
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  transports,
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(LOG_DIR, 'exceptions.log'),
      format: fileFormat
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(LOG_DIR, 'rejections.log'),
      format: fileFormat
    })
  ],
  exitOnError: false
});

// ============================================
// Stream for Morgan (HTTP request logging)
// ============================================

logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// ============================================
// Child Logger Factory
// ============================================

/**
 * Create a child logger with additional metadata
 */
logger.child = (metadata) => {
  return logger.child(metadata);
};

// ============================================
// Context Logger
// ============================================

/**
 * Create a context-aware logger for request/response cycles
 */
logger.createContextLogger = (context = {}) => {
  return {
    error: (message, meta = {}) => logger.error(message, { ...context, ...meta }),
    warn: (message, meta = {}) => logger.warn(message, { ...context, ...meta }),
    info: (message, meta = {}) => logger.info(message, { ...context, ...meta }),
    http: (message, meta = {}) => logger.http(message, { ...context, ...meta }),
    debug: (message, meta = {}) => logger.debug(message, { ...context, ...meta }),
    verbose: (message, meta = {}) => logger.verbose(message, { ...context, ...meta })
  };
};

// ============================================
// Performance Logger
// ============================================

/**
 * Log performance metrics
 */
logger.performance = (name, duration, metadata = {}) => {
  logger.info(`Performance: ${name}`, {
    type: 'performance',
    name,
    duration,
    unit: 'ms',
    ...metadata
  });
};

// ============================================
// Audit Logger
// ============================================

/**
 * Log audit events
 */
logger.audit = (action, userId, resource, metadata = {}) => {
  logger.info(`Audit: ${action}`, {
    type: 'audit',
    action,
    userId,
    resource,
    timestamp: new Date().toISOString(),
    ...metadata
  });
};

// ============================================
// Security Logger
// ============================================

/**
 * Log security events
 */
logger.security = (event, severity, userId, metadata = {}) => {
  const level = severity === 'high' ? 'error' : 'warn';
  
  logger[level](`Security: ${event}`, {
    type: 'security',
    event,
    severity,
    userId,
    timestamp: new Date().toISOString(),
    ...metadata
  });
};

// ============================================
// Database Logger
// ============================================

/**
 * Log database operations
 */
logger.database = (operation, collection, duration, metadata = {}) => {
  logger.debug(`Database: ${operation} on ${collection}`, {
    type: 'database',
    operation,
    collection,
    duration,
    unit: 'ms',
    ...metadata
  });
};

// ============================================
// API Logger
// ============================================

/**
 * Log API requests/responses
 */
logger.api = (req, res, duration, metadata = {}) => {
  const logData = {
    type: 'api',
    method: req.method,
    path: req.originalUrl || req.url,
    statusCode: res.statusCode,
    duration,
    unit: 'ms',
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?._id,
    requestId: req.requestId,
    ...metadata
  };

  if (res.statusCode >= 500) {
    logger.error(`API ${req.method} ${req.originalUrl}`, logData);
  } else if (res.statusCode >= 400) {
    logger.warn(`API ${req.method} ${req.originalUrl}`, logData);
  } else {
    logger.http(`API ${req.method} ${req.originalUrl}`, logData);
  }
};

// ============================================
// Business Logger
// ============================================

/**
 * Log business events (commissions, payouts, etc.)
 */
logger.business = (event, data) => {
  logger.info(`Business: ${event}`, {
    type: 'business',
    event,
    ...data
  });
};

// ============================================
// Cleanup Old Logs
// ============================================

/**
 * Manually trigger log cleanup
 */
logger.cleanup = (days = 30) => {
  const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
  
  fs.readdir(LOG_DIR, (err, files) => {
    if (err) {
      logger.error('Failed to read log directory:', err);
      return;
    }
    
    files.forEach(file => {
      const filePath = path.join(LOG_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtimeMs < cutoffDate) {
        fs.unlink(filePath, (err) => {
          if (err) {
            logger.error(`Failed to delete old log file ${file}:`, err);
          } else {
            logger.info(`Deleted old log file: ${file}`);
          }
        });
      }
    });
  });
};

// ============================================
// Logger Middleware
// ============================================

/**
 * Express middleware to add request logger
 */
logger.middleware = () => {
  return (req, res, next) => {
    const startTime = Date.now();
    const requestId = req.requestId || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    req.requestId = requestId;
    req.logger = logger.createContextLogger({
      requestId,
      ip: req.ip,
      method: req.method,
      path: req.originalUrl || req.url
    });
    
    // Log response on finish
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      logger.api(req, res, duration, {
        requestId,
        query: req.query,
        params: req.params
      });
      
      // Log slow requests
      if (duration > 1000) {
        logger.warn('Slow request detected', {
          requestId,
          method: req.method,
          path: req.originalUrl,
          duration,
          unit: 'ms'
        });
      }
    });
    
    next();
  };
};

// ============================================
// Test Logger
// ============================================

/**
 * Test logger configuration
 */
logger.test = () => {
  console.log('\n=== Testing Logger Configuration ===\n');
  
  logger.error('Test error message', { test: true, component: 'logger' });
  logger.warn('Test warning message', { test: true });
  logger.info('Test info message', { test: true });
  logger.http('Test http message', { test: true });
  logger.debug('Test debug message', { test: true });
  
  logger.performance('test-operation', 150);
  logger.audit('test-action', 'user123', { type: 'test' });
  logger.security('test-event', 'medium', 'user123');
  logger.database('query', 'users', 50);
  logger.business('test-event', { value: 100 });
  
  console.log('\n=== Logger Test Complete ===\n');
  
  return 'Logger test completed. Check logs directory.';
};

// ============================================
// Export configured logger
// ============================================

module.exports = logger;

// ============================================
// Auto-run test in development
// ============================================

if (process.env.NODE_ENV === 'development' && process.env.TEST_LOGGER === 'true') {
  logger.test();
}
