const winston = require('winston');
const path = require('path');
const fs = require('fs');
const DailyRotateFile = require('winston-daily-rotate-file');

// ============================================
// Log Directory Setup
// ============================================

const LOG_DIR = path.join(__dirname, '../../logs');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ============================================
// Log Format
// ============================================

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${stack || ''}`;
  })
);

// ============================================
// Transports
// ============================================

const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    )
  }),

  // Error log file
  new DailyRotateFile({
    filename: path.join(LOG_DIR, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '30d',
    format: logFormat
  }),

  // Combined log file
  new DailyRotateFile({
    filename: path.join(LOG_DIR, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    format: logFormat
  })
];

// ============================================
// Create Logger
// ============================================

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports,
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat
    })
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat
    })
  ]
});

// ============================================
// Stream for Morgan (HTTP request logging)
// ============================================

logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// ============================================
// Helper Methods
// ============================================

logger.performance = (name, duration, metadata = {}) => {
  logger.info(`Performance: ${name}`, {
    type: 'performance',
    name,
    duration,
    ...metadata
  });
};

logger.audit = (action, userId, resource, metadata = {}) => {
  logger.info(`Audit: ${action}`, {
    type: 'audit',
    action,
    userId,
    resource,
    ...metadata
  });
};

logger.security = (event, severity, userId, metadata = {}) => {
  const level = severity === 'high' ? 'error' : 'warn';
  logger[level](`Security: ${event}`, {
    type: 'security',
    event,
    severity,
    userId,
    ...metadata
  });
};

logger.api = (req, res, duration, metadata = {}) => {
  const logData = {
    type: 'api',
    method: req.method,
    path: req.originalUrl || req.url,
    statusCode: res.statusCode,
    duration,
    ip: req.ip,
    userId: req.user?._id
  };

  if (res.statusCode >= 500) {
    logger.error(`API ${req.method} ${req.originalUrl}`, { ...logData, ...metadata });
  } else if (res.statusCode >= 400) {
    logger.warn(`API ${req.method} ${req.originalUrl}`, { ...logData, ...metadata });
  } else {
    logger.http(`API ${req.method} ${req.originalUrl}`, { ...logData, ...metadata });
  }
};

logger.middleware = () => {
  return (req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.api(req, res, duration);
    });
    
    next();
  };
};

// ============================================
// Export Logger
// ============================================

module.exports = logger;
