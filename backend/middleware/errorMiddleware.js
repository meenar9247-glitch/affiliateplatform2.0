/**
 * ============================================
 * ERROR HANDLING MIDDLEWARE
 * Professional error handling with multiple error types,
 * logging, monitoring integration, and client-friendly responses
 * ============================================
 */

const logger = require('../utils/logger');
const { sendErrorAlert } = require('../services/alertService');

// ============================================
// Custom Error Classes
// ============================================

class AppError extends Error {
  constructor(message, statusCode, errorCode = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode || `ERR_${statusCode}`;
    this.details = details;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'ERR_VALIDATION', details);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', details = null) {
    super(message, 401, 'ERR_AUTHENTICATION', details);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Not authorized', details = null) {
    super(message, 403, 'ERR_AUTHORIZATION', details);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource', details = null) {
    super(`${resource} not found`, 404, 'ERR_NOT_FOUND', details);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists', details = null) {
    super(message, 409, 'ERR_CONFLICT', details);
    this.name = 'ConflictError';
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests', details = null) {
    super(message, 429, 'ERR_RATE_LIMIT', details);
    this.name = 'RateLimitError';
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database error occurred', details = null) {
    super(message, 500, 'ERR_DATABASE', details);
    this.name = 'DatabaseError';
  }
}

class ExternalServiceError extends AppError {
  constructor(service, message = 'External service error', details = null) {
    super(`${service}: ${message}`, 502, 'ERR_EXTERNAL_SERVICE', details);
    this.name = 'ExternalServiceError';
  }
}

// ============================================
// Error Handler for 404 Not Found
// ============================================

/**
 * Handle 404 errors for undefined routes
 */
exports.notFound = (req, res, next) => {
  const error = new NotFoundError('Route', {
    path: req.originalUrl,
    method: req.method,
    availableRoutes: req.availableRoutes || []
  });
  
  next(error);
};

// ============================================
// Main Error Handler
// ============================================

/**
 * Global error handling middleware
 */
exports.errorHandler = (err, req, res, next) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.errorCode = err.errorCode || 'ERR_INTERNAL';
  
  // Log error
  logError(err, req);
  
  // Send alerts for critical errors
  if (err.statusCode >= 500) {
    sendCriticalErrorAlert(err, req);
  }
  
  // Handle specific error types
  if (err.name === 'ValidationError' || err.name === 'ValidatorError') {
    err = handleValidationError(err);
  }
  
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    err = handleCastError(err);
  }
  
  if (err.code === 11000) {
    err = handleDuplicateKeyError(err);
  }
  
  if (err.name === 'JsonWebTokenError') {
    err = handleJWTError(err);
  }
  
  if (err.name === 'TokenExpiredError') {
    err = handleJWTExpiredError(err);
  }
  
  if (err.name === 'MulterError') {
    err = handleMulterError(err);
  }
  
  // Prepare error response
  const errorResponse = buildErrorResponse(err, req);
  
  // Send response
  res.status(err.statusCode).json(errorResponse);
};

// ============================================
// Specific Error Handlers
// ============================================

/**
 * Handle Mongoose validation errors
 */
const handleValidationError = (err) => {
  const errors = {};
  
  Object.keys(err.errors).forEach(key => {
    errors[key] = err.errors[key].message;
  });
  
  return new ValidationError('Validation failed', errors);
};

/**
 * Handle Mongoose cast errors (invalid ObjectId)
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400, 'ERR_INVALID_ID', {
    field: err.path,
    value: err.value
  });
};

/**
 * Handle MongoDB duplicate key errors
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyPattern)[0];
  const value = err.keyValue[field];
  const message = `${field} '${value}' already exists`;
  
  return new ConflictError(message, {
    field,
    value
  });
};

/**
 * Handle JWT errors
 */
const handleJWTError = (err) => {
  return new AuthenticationError('Invalid token', {
    reason: err.message
  });
};

/**
 * Handle JWT expiration
 */
const handleJWTExpiredError = (err) => {
  return new AuthenticationError('Token expired', {
    expiredAt: err.expiredAt
  });
};

/**
 * Handle Multer file upload errors
 */
const handleMulterError = (err) => {
  let message = 'File upload error';
  let details = { code: err.code };
  
  switch(err.code) {
    case 'LIMIT_FILE_SIZE':
      message = 'File too large';
      details.maxSize = err.limit;
      break;
    case 'LIMIT_FILE_COUNT':
      message = 'Too many files';
      details.maxCount = err.limit;
      break;
    case 'LIMIT_UNEXPECTED_FILE':
      message = 'Unexpected file field';
      details.field = err.field;
      break;
    case 'LIMIT_PART_COUNT':
      message = 'Too many parts in request';
      break;
  }
  
  return new AppError(message, 400, 'ERR_UPLOAD', details);
};

/**
 * Handle MongoDB connection errors
 */
exports.handleMongoError = (err) => {
  logger.error('MongoDB connection error:', err);
  
  let message = 'Database connection error';
  let errorCode = 'ERR_DB_CONNECTION';
  
  if (err.name === 'MongoNetworkError') {
    message = 'Database network error';
    errorCode = 'ERR_DB_NETWORK';
  }
  
  if (err.name === 'MongoTimeoutError') {
    message = 'Database timeout';
    errorCode = 'ERR_DB_TIMEOUT';
  }
  
  return new DatabaseError(message, {
    name: err.name,
    code: err.code
  });
};

// ============================================
// Error Logging
// ============================================

/**
 * Log error with context
 */
const logError = (err, req) => {
  const logData = {
    error: {
      message: err.message,
      stack: err.stack,
      code: err.errorCode,
      statusCode: err.statusCode
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: req.query,
      body: sanitizeBody(req.body),
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?._id,
      requestId: req.requestId
    },
    timestamp: new Date().toISOString()
  };

  // Log based on status code
  if (err.statusCode >= 500) {
    logger.error('Server Error:', logData);
  } else if (err.statusCode >= 400) {
    logger.warn('Client Error:', logData);
  } else {
    logger.info('Error:', logData);
  }
};

/**
 * Sanitize request body for logging (remove sensitive data)
 */
const sanitizeBody = (body) => {
  if (!body) return body;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'passwordConfirm', 'token', 'secret', 'apiKey'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

/**
 * Send alert for critical errors
 */
const sendCriticalErrorAlert = async (err, req) => {
  try {
    await sendErrorAlert({
      error: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user?._id,
      timestamp: new Date().toISOString()
    });
  } catch (alertError) {
    logger.error('Failed to send error alert:', alertError);
  }
};

// ============================================
// Build Error Response
// ============================================

/**
 * Build client-friendly error response
 */
const buildErrorResponse = (err, req) => {
  const response = {
    success: false,
    message: err.isOperational ? err.message : 'Something went wrong',
    errorCode: err.errorCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    requestId: req.requestId
  };

  // Add validation details if available
  if (err.details) {
    response.details = err.details;
  }

  // Add error code mapping for common errors
  if (err.statusCode === 429) {
    response.retryAfter = err.retryAfter || 60;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.error = err;
  }

  // Add specific error information
  if (err.errorCode === 'ERR_VALIDATION') {
    response.message = 'Validation failed';
  }

  if (err.errorCode === 'ERR_AUTHENTICATION') {
    response.message = 'Authentication failed';
  }

  if (err.errorCode === 'ERR_AUTHORIZATION') {
    response.message = 'Not authorized to access this resource';
  }

  if (err.errorCode === 'ERR_NOT_FOUND') {
    response.message = err.message || 'Resource not found';
  }

  if (err.errorCode === 'ERR_RATE_LIMIT') {
    response.message = 'Rate limit exceeded';
  }

  return response;
};

// ============================================
// Async Error Wrapper
// ============================================

/**
 * Wrap async route handlers to catch errors
 */
exports.catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// ============================================
// Unhandled Rejection/Exception Handlers
// ============================================

/**
 * Handle unhandled promise rejections
 */
exports.handleUnhandledRejection = (err) => {
  logger.error('UNHANDLED REJECTION! 💥', err);
  
  // Send critical alert
  sendCriticalErrorAlert(err, { originalUrl: 'SYSTEM', method: 'PROMISE_REJECTION' });
  
  // Gracefully shutdown in production
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
};

/**
 * Handle uncaught exceptions
 */
exports.handleUncaughtException = (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥', err);
  
  // Send critical alert
  sendCriticalErrorAlert(err, { originalUrl: 'SYSTEM', method: 'UNCAUGHT_EXCEPTION' });
  
  // Always exit on uncaught exception
  process.exit(1);
};

// ============================================
// Error Monitoring Setup
// ============================================

/**
 * Initialize error monitoring (Sentry, etc.)
 */
exports.initErrorMonitoring = () => {
  if (process.env.ENABLE_ERROR_MONITORING === 'true') {
    // Initialize Sentry or other monitoring service
    logger.info('Error monitoring initialized');
  }
};

// ============================================
// Export custom error classes
// ============================================

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  errorHandler: exports.errorHandler,
  notFound: exports.notFound,
  catchAsync: exports.catchAsync,
  handleUnhandledRejection: exports.handleUnhandledRejection,
  handleUncaughtException: exports.handleUncaughtException,
  initErrorMonitoring: exports.initErrorMonitoring
};
