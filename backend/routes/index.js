/**
 * ============================================
 * MASTER ROUTES INDEX
 * Central route configuration for the entire API
 * Professional implementation with all best practices
 * ============================================
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../docs/swagger.json');
const { protect, authorize } = require('../middleware/authMiddleware');
const { rateLimiter } = require('../middleware/rateLimiter');
const logger = require('../utils/logger');

// ============================================
// Import all route modules
// ============================================
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const affiliateRoutes = require('./affiliateRoutes');
const referralRoutes = require('./referralRoutes');
const earningRoutes = require('./earningRoutes');
const payoutRoutes = require('./payoutRoutes');
const walletRoutes = require('./walletRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const supportRoutes = require('./supportRoutes');
const adminRoutes = require('./adminRoutes');
const webhookRoutes = require('./webhookRoutes');
const healthRoutes = require('./healthRoutes');

// ============================================
// API Version and Metadata
// ============================================
const API_VERSION = 'v1';
const API_NAME = 'Affiliate Platform API';
const API_DESCRIPTION = 'Complete affiliate marketing platform with MLM, commissions, and real-time tracking';
const API_DOCS_URL = '/api/v1/docs';

// ============================================
// Route Groups Configuration
// ============================================
const routeGroups = {
  public: {
    basePath: '/',
    description: 'Public endpoints - no authentication required',
    routes: ['health', 'webhook']
  },
  auth: {
    basePath: '/auth',
    description: 'Authentication endpoints - login, register, verify',
    routes: ['auth']
  },
  user: {
    basePath: '/users',
    description: 'User management endpoints - profile, settings, activity',
    routes: ['user']
  },
  affiliate: {
    basePath: '/affiliates',
    description: 'Affiliate operations - links, clicks, conversions',
    routes: ['affiliate']
  },
  referral: {
    basePath: '/referrals',
       description: 'Referral system - MLM tree, rewards, tracking',
    routes: ['referral']
  },
  earnings: {
    basePath: '/earnings',
    description: 'Earnings management - commissions, analytics',
    routes: ['earning']
  },
  payout: {
    basePath: '/payouts',
    description: 'Payout operations - requests, processing, history',
    routes: ['payout']
  },
  wallet: {
    basePath: '/wallet',
    description: 'Wallet management - balance, transactions, limits',
    routes: ['wallet']
  },
  analytics: {
    basePath: '/analytics',
    description: 'Advanced analytics - reports, charts, forecasts',
    routes: ['analytics']
  },
  support: {
    basePath: '/support',
    description: 'Support system - tickets, FAQs, announcements',
    routes: ['support']
  },
  admin: {
    basePath: '/admin',
    description: 'Admin operations - user management, system config',
    routes: ['admin']
  }
};

// ============================================
// API Information Route
// ============================================

/**
 * @route   GET /api
 * @desc    Get API information and available endpoints
 * @access  Public
 */
router.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/api/${API_VERSION}`;
  
  const endpoints = Object.values(routeGroups).map(group => ({
    path: `${baseUrl}${group.basePath}`,
    description: group.description,
    routes: group.routes.map(route => `${baseUrl}${group.basePath}/${route}`)
  }));

  res.status(200).json({
    success: true,
    data: {
      name: API_NAME,
      description: API_DESCRIPTION,
      version: API_VERSION,
      documentation: `${baseUrl}${API_DOCS_URL}`,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      endpoints
    }
  });
});

// ============================================
// API Status Route
// ============================================

/**
 * @route   GET /api/status
 * @desc    Get API status and health check
 * @access  Public
 */
router.get('/status', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'operational',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: API_VERSION,
      services: {
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        redis: redisClient?.status || 'unknown'
      }
    }
  });
});

// ============================================
// API Documentation (Swagger)
// ============================================

/**
 * @route   GET /api/docs
 * @desc    Swagger API documentation
 * @access  Public (or protected in production)
 */
if (process.env.NODE_ENV !== 'production') {
  router.use('/docs', swaggerUi.serve);
  router.get('/docs', swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: `${API_NAME} Documentation`,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true
    }
  }));
} else {
  // In production, protect docs with authentication
  router.use('/docs', protect, authorize('admin'), swaggerUi.serve);
  router.get('/docs', protect, authorize('admin'), swaggerUi.setup(swaggerDocument));
  }
// ============================================
// API Versioning
// ============================================

/**
 * @route   ALL /api/v1/*
 * @desc    Version 1 API routes
 * @access  Mixed (based on route)
 */
router.use(`/v1/auth`, rateLimiter.auth, authRoutes);
router.use(`/v1/users`, protect, userRoutes);
router.use(`/v1/affiliates`, protect, affiliateRoutes);
router.use(`/v1/referrals`, protect, referralRoutes);
router.use(`/v1/earnings`, protect, earningRoutes);
router.use(`/v1/payouts`, protect, payoutRoutes);
router.use(`/v1/wallet`, protect, walletRoutes);
router.use(`/v1/analytics`, protect, analyticsRoutes);
router.use(`/v1/support`, supportRoutes); // Some routes public, some protected
router.use(`/v1/admin`, protect, authorize('admin'), adminRoutes);
router.use(`/v1/webhooks`, webhookRoutes); // Public but with signature verification
router.use(`/v1/health`, healthRoutes); // Public health checks

// ============================================
// Legacy Routes (for backward compatibility)
// ============================================

/**
 * @route   ALL /api/auth/*
 * @desc    Legacy auth routes (redirect to v1)
 */
router.use('/auth', (req, res, next) => {
  req.url = `/v1/auth${req.url}`;
  router.handle(req, res, next);
});

/**
 * @route   ALL /api/users/*
 * @desc    Legacy user routes (redirect to v1)
 */
router.use('/users', protect, (req, res, next) => {
  req.url = `/v1/users${req.url}`;
  router.handle(req, res, next);
});

// Add similar redirects for other legacy routes...

// ============================================
// Dynamic Route Discovery (for development)
// ============================================

/**
 * @route   GET /api/routes
 * @desc    Get all registered routes (development only)
 * @access  Private/Admin
 */
if (process.env.NODE_ENV === 'development') {
  router.get('/routes', protect, authorize('admin'), (req, res) => {
    const getRoutes = (stack, basePath = '') => {
      const routes = [];
      
      stack.forEach(layer => {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods)
            .filter(m => layer.route.methods[m])
            .map(m => m.toUpperCase());
          
          routes.push({
            path: basePath + layer.route.path,
            methods,
            middleware: layer.route.stack?.length || 0
          });
        } else if (layer.name === 'router' && layer.handle.stack) {
          const routerPath = layer.regexp.source
            .replace('\\/?(?=\\/|$)', '')
            .replace(/\\\//g, '/')
            .replace(/\^/g, '')
            .replace(/\?/g, '')
            .replace(/\(\?:\(\[\^\\\/\]\+\?\)\)/g, ':param');
          
          routes.push(...getRoutes(layer.handle.stack, basePath + routerPath));
        }
      });
      
      return routes;
    };

    const routes = getRoutes(router.stack);
    
    res.status(200).json({
      success: true,
      count: routes.length,
      routes: routes.sort((a, b) => a.path.localeCompare(b.path))
    });
  });
}

// ============================================
// Route Statistics
// ============================================

/**
 * @route   GET /api/stats/routes
 * @desc    Get route usage statistics
 * @access  Private/Admin
 */
router.get('/stats/routes', protect, authorize('admin'), async (req, res) => {
  try {
    const RouteStats = mongoose.model('RouteStats');
    
    const stats = await RouteStats.aggregate([
      {
        $group: {
          _id: '$path',
          totalHits: { $sum: 1 },
          avgResponseTime: { $avg: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' },
          lastAccessed: { $max: '$timestamp' },
          methods: { $addToSet: '$method' },
          statusCodes: { $addToSet: '$statusCode' }
        }
      },
      { $sort: { totalHits: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Health Check Aggregator
// ============================================

/**
 * @route   GET /api/health/all
 * @desc    Comprehensive health check for all services
 * @access  Private/Admin
 */
router.get('/health/all', protect, authorize('admin'), async (req, res) => {
  const checks = {
    timestamp: new Date().toISOString(),
    services: {}
  };

  // Check database
  try {
    await mongoose.connection.db.admin().ping();
    checks.services.database = {
      status: 'healthy',
      latency: Date.now() - req.startTime
    };
  } catch (error) {
    checks.services.database = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // Check Redis (if configured)
  if (redisClient) {
    try {
      const start = Date.now();
      await redisClient.ping();
      checks.services.redis = {
        status: 'healthy',
        latency: Date.now() - start
      };
    } catch (error) {
      checks.services.redis = {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  // Check external services
  const externalServices = ['email', 'sms', 'payment'];
  
  for (const service of externalServices) {
    try {
      // Implement actual health checks for each service
      checks.services[service] = {
        status: 'unknown',
        message: 'Health check not implemented'
      };
    } catch (error) {
      checks.services[service] = {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  const overallStatus = Object.values(checks.services).every(s => s.status === 'healthy')
    ? 'healthy'
    : 'degraded';

  res.status(overallStatus === 'healthy' ? 200 : 503).json({
    success: true,
    data: {
      status: overallStatus,
      ...checks
    }
  });
});
// ============================================
// Route Monitoring and Logging
// ============================================

// Track route usage
router.use((req, res, next) => {
  req.startTime = Date.now();
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override end function to log response
  res.end = function(chunk, encoding) {
    res.end = originalEnd;
    res.end(chunk, encoding);
    
    const responseTime = Date.now() - req.startTime;
    
    // Log to database if needed
    if (process.env.ENABLE_ROUTE_STATS === 'true') {
      try {
        const RouteStats = mongoose.model('RouteStats', new mongoose.Schema({
          path: String,
          method: String,
          statusCode: Number,
          responseTime: Number,
          userId: req.user?._id,
          timestamp: Date
        }));
        
        new RouteStats({
          path: req.path,
          method: req.method,
          statusCode: res.statusCode,
          responseTime,
          userId: req.user?._id,
          timestamp: new Date()
        }).save().catch(err => logger.error('Failed to save route stats:', err));
      } catch (error) {
        // Ignore schema errors
      }
    }
    
    // Log slow routes
    if (responseTime > 1000) {
      logger.warn('Slow route detected:', {
        path: req.path,
        method: req.method,
        responseTime,
        user: req.user?._id
      });
    }
  };
  
  next();
});

// ============================================
// Route Version Management
// ============================================

/**
 * @route   GET /api/versions
 * @desc    Get all API versions
 * @access  Public
 */
router.get('/versions', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      current: API_VERSION,
      supported: ['v1'],
      deprecated: [],
      sunset: []
    }
  });
});

/**
 * @route   GET /api/changelog
 * @desc    Get API changelog
 * @access  Public
 */
router.get('/changelog', (req, res) => {
  const changelog = [
    {
      version: 'v1.0.0',
      date: '2026-01-15',
      changes: [
        'Initial release',
        'Authentication system',
        'User management',
        'Affiliate tracking',
        'Commission system',
        'Payout processing'
      ]
    },
    {
      version: 'v1.1.0',
      date: '2026-02-01',
      changes: [
        'Added MLM referral system',
        'Enhanced analytics',
        'Real-time notifications',
        'Webhook support',
        'API rate limiting'
      ]
    },
    {
      version: 'v1.2.0',
      date: '2026-03-01',
      changes: [
        'Support ticket system',
        'FAQ management',
        'Announcement system',
        'Performance improvements',
        'Bug fixes'
      ]
    }
  ];

  res.status(200).json({
    success: true,
    data: changelog
  });
});

// ============================================
// Route Middleware Configuration
// ============================================

// Apply rate limiting to all routes
router.use(rateLimiter.api);

// Add request ID to all requests
router.use((req, res, next) => {
  req.requestId = require('crypto').randomBytes(16).toString('hex');
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

// Add response compression
const compression = require('compression');
router.use(compression());

// Add CORS headers
const cors = require('cors');
router.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  exposedHeaders: ['X-Request-ID']
}));

// Add security headers
const helmet = require('helmet');
router.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// ============================================
// Route Validation Middleware
// ============================================

// Validate API key for external services
router.use('/api/external', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.EXTERNAL_API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Invalid API key'
    });
  }
  
  next();
});

// Validate content type
router.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({
        success: false,
        message: 'Content-Type must be application/json'
      });
    }
  }
  
  next();
});

// ============================================
// Route Error Handlers
// ============================================

// 404 handler for undefined routes
router.use('*', (req, res) => {
  logger.warn('Route not found:', {
    path: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableVersions: ['v1'],
    documentation: `/api/${API_VERSION}/docs`
  });
});

// Global error handler for routes
router.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    success: false,
    message: err.message || 'Internal server error',
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Add validation errors if available
  if (err.errors) {
    errorResponse.errors = err.errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  logger.error('Route error:', {
    error: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    userId: req.user?._id,
    requestId: req.requestId
  });

  res.status(statusCode).json(errorResponse);
});

// ============================================
// Export configured router
// ============================================
module.exports = router;

// ============================================
// Route Configuration Summary
// ============================================
logger.info('Routes initialized successfully', {
  version: API_VERSION,
  environment: process.env.NODE_ENV,
  routes: Object.keys(routeGroups).length,
  timestamp: new Date().toISOString()
});
