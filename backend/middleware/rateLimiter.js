/**
 * ============================================
 * RATE LIMITER MIDDLEWARE
 * Advanced rate limiting with Redis store,
 * multiple limit tiers, and intelligent throttling
 * ============================================
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redisClient = require('../config/redis');
const logger = require('../utils/logger');
const { AppError } = require('./errorMiddleware');

// ============================================
// Redis Connection Check
// ============================================

const checkRedisConnection = () => {
  if (!redisClient || redisClient.status !== 'ready') {
    logger.warn('Redis not available, falling back to memory store');
    return false;
  }
  return true;
};

// ============================================
// Rate Limit Configuration
// ============================================

/**
 * Base rate limiter configuration
 */
const baseConfig = {
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    const identifier = req.user?._id?.toString() || req.ip;
    return identifier;
  },
  skip: (req) => {
    // Skip rate limiting for certain paths
    const skipPaths = ['/health', '/api-docs'];
    return skipPaths.includes(req.path);
  },
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      identifier: req.user?._id || req.ip,
      path: req.originalUrl,
      method: req.method
    });

    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000) || 60,
      limit: req.rateLimit.limit,
      remaining: 0
    });
  }
};

// ============================================
// Rate Limiter Tiers
// ============================================

/**
 * Public API rate limiter
 * Strict limits for unauthenticated users
 */
exports.publicLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  keyGenerator: (req) => req.ip // Always use IP for public routes
});

/**
 * Authenticated user rate limiter
 * Higher limits for logged-in users
 */
exports.authLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000,
  max: 200, // 200 requests per 15 minutes
  skipSuccessfulRequests: true // Don't count successful requests
});

/**
 * API rate limiter
 * Standard limits for API endpoints
 */
exports.apiLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'API rate limit exceeded'
});

/**
 * Strict rate limiter
 * Very strict limits for sensitive operations
 */
exports.strictLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  message: 'Too many attempts, please try again after 1 hour',
  skipSuccessfulRequests: true // Only count failed attempts
});

/**
 * Login rate limiter
 * Prevent brute force attacks
 */
exports.loginLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 failed attempts per 15 minutes
  skipSuccessfulRequests: true, // Reset on successful login
  keyGenerator: (req) => {
    // Use email + IP to prevent distributed attacks
    return `${req.body.email || 'unknown'}:${req.ip}`;
  },
  handler: (req, res) => {
    logger.warn('Login rate limit exceeded', {
      email: req.body.email,
      ip: req.ip
    });

    res.status(429).json({
      success: false,
      message: 'Too many login attempts, please try again later',
      retryAfter: 900 // 15 minutes in seconds
    });
  }
});

/**
 * Registration rate limiter
 * Prevent account creation spam
 */
exports.registerLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per IP per hour
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    logger.warn('Registration rate limit exceeded', {
      ip: req.ip,
      email: req.body.email
    });

    res.status(429).json({
      success: false,
      message: 'Too many registration attempts from this IP',
      retryAfter: 3600
    });
  }
});

/**
 * Password reset rate limiter
 * Prevent password reset abuse
 */
exports.passwordResetLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset requests per hour
  keyGenerator: (req) => req.body.email || req.ip,
  skipSuccessfulRequests: true
});

/**
 * API key rate limiter
 * For external API consumers
 */
exports.apiKeyLimiter = (maxRequests = 1000) => rateLimit({
  ...baseConfig,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: maxRequests, // Configurable per API key
  keyGenerator: (req) => req.apiKey || req.ip,
  handler: (req, res) => {
    logger.warn('API key rate limit exceeded', {
      apiKey: req.apiKey,
      ip: req.ip
    });

    res.status(429).json({
      success: false,
      message: 'API rate limit exceeded for your key',
      retryAfter: 86400,
      limit: maxRequests
    });
  }
});

// ============================================
// Redis Store Configuration
// ============================================

/**
 * Create Redis store for rate limiting
 */
const createRedisStore = (prefix = 'rl') => {
  if (!checkRedisConnection()) return null;

  return new RedisStore({
    client: redisClient,
    prefix: `${prefix}:`,
    sendCommand: (...args) => redisClient.call(...args)
  });
};

// ============================================
// Dynamic Rate Limiter
// ============================================

/**
 * Dynamic rate limiter based on user role
 */
exports.dynamicLimiter = (req, res, next) => {
  // Skip for admin users
  if (req.user?.role === 'admin') {
    return next();
  }

  // Determine limits based on user role
  let max = 100; // Default
  let windowMs = 15 * 60 * 1000; // 15 minutes

  if (req.user) {
    switch(req.user.role) {
      case 'affiliate':
        max = 300;
        break;
      case 'user':
        max = 200;
        break;
      default:
        max = 100;
    }
  }

  const limiter = rateLimit({
    ...baseConfig,
    windowMs,
    max,
    store: createRedisStore(`rl:${req.user?.role || 'public'}`)
  });

  return limiter(req, res, next);
};

// ============================================
// IP-based Rate Limiter
// ============================================

/**
 * IP-based rate limiter with whitelist support
 */
exports.ipBasedLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    whitelist = [],
    blacklist = []
  } = options;

  return async (req, res, next) => {
    const clientIp = req.ip;

    // Check whitelist
    if (whitelist.includes(clientIp)) {
      return next();
    }

    // Check blacklist
    if (blacklist.includes(clientIp)) {
      logger.warn('Blocked blacklisted IP', { ip: clientIp });
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const limiter = rateLimit({
      ...baseConfig,
      windowMs,
      max,
      keyGenerator: () => clientIp,
      store: createRedisStore(`rl:ip:${clientIp}`)
    });

    return limiter(req, res, next);
  };
};

// ============================================
// Endpoint-specific Rate Limiters
// ============================================

/**
 * Search endpoint rate limiter
 */
exports.searchLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  keyGenerator: (req) => req.user?._id || req.ip
});

/**
 * Export endpoint rate limiter
 */
exports.exportLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 exports per hour
  keyGenerator: (req) => req.user?._id || req.ip
});

/**
 * Webhook endpoint rate limiter
 */
exports.webhookLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 webhook calls per minute
  keyGenerator: (req) => req.ip
});

// ============================================
// Customizable Rate Limiter Factory
// ============================================

/**
 * Create custom rate limiter with options
 */
exports.createLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000,
    max = 60,
    message = 'Rate limit exceeded',
    keyGenerator = (req) => req.user?._id || req.ip,
    skipFailedRequests = false,
    skipSuccessfulRequests = false,
    store = createRedisStore('rl:custom')
  } = options;

  return rateLimit({
    windowMs,
    max,
    message,
    keyGenerator,
    skipFailedRequests,
    skipSuccessfulRequests,
    store: store || undefined,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Custom rate limit exceeded', {
        identifier: keyGenerator(req),
        path: req.originalUrl,
        limit: max,
        windowMs
      });

      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000),
        limit: max
      });
    }
  });
};

// ============================================
// Rate Limit Headers Middleware
// ============================================

/**
 * Add rate limit headers to response
 */
exports.addRateLimitHeaders = async (req, res, next) => {
  const store = createRedisStore('rl:headers');
  
  if (store && redisClient) {
    try {
      const key = `rl:headers:${req.user?._id || req.ip}`;
      const current = await redisClient.get(key);
      const limit = req.user?.role === 'admin' ? 1000 : 100;
      
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', limit - (parseInt(current) || 0));
      res.setHeader('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + 900);
    } catch (error) {
      logger.error('Error adding rate limit headers:', error);
    }
  }
  
  next();
};

// ============================================
// Rate Limit Monitoring
// ============================================

/**
 * Monitor rate limit hits
 */
exports.monitorRateLimits = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    if (res.statusCode === 429) {
      const duration = Date.now() - startTime;
      
      logger.warn('Rate limit triggered', {
        identifier: req.user?._id || req.ip,
        path: req.originalUrl,
        method: req.method,
        duration,
        timestamp: new Date().toISOString()
      });

      // Store in database for analytics
      if (process.env.ENABLE_RATE_LIMIT_ANALYTICS === 'true') {
        const RateLimitLog = mongoose.model('RateLimitLog');
        new RateLimitLog({
          identifier: req.user?._id || req.ip,
          path: req.originalUrl,
          method: req.method,
          timestamp: new Date()
        }).save().catch(err => logger.error('Failed to save rate limit log:', err));
      }
    }
  });

  next();
};

// ============================================
// Export configured rate limiters
// ============================================

module.exports = {
  publicLimiter: exports.publicLimiter,
  authLimiter: exports.authLimiter,
  apiLimiter: exports.apiLimiter,
  strictLimiter: exports.strictLimiter,
  loginLimiter: exports.loginLimiter,
  registerLimiter: exports.registerLimiter,
  passwordResetLimiter: exports.passwordResetLimiter,
  apiKeyLimiter: exports.apiKeyLimiter,
  dynamicLimiter: exports.dynamicLimiter,
  ipBasedLimiter: exports.ipBasedLimiter,
  searchLimiter: exports.searchLimiter,
  exportLimiter: exports.exportLimiter,
  webhookLimiter: exports.webhookLimiter,
  createLimiter: exports.createLimiter,
  addRateLimitHeaders: exports.addRateLimitHeaders,
  monitorRateLimits: exports.monitorRateLimits
};
