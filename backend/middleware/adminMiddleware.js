/**
 * ============================================
 * ADMIN MIDDLEWARE
 * Professional admin authorization and validation
 * Multi-level admin checks, permissions, and audit logging
 * ============================================
 */

const User = require('../models/User');
const Log = require('../models/Log');
const logger = require('../utils/logger');

// ============================================
// Helper Functions
// ============================================

/**
 * Log admin activity
 * @param {Object} req - Express request object
 * @param {String} action - Admin action performed
 * @param {Object} details - Additional details
 */
const logAdminActivity = async (req, action, details = {}) => {
  try {
    await Log.create({
      level: 'info',
      category: 'admin',
      message: `Admin ${action}`,
      user: req.user._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      audit: {
        action,
        resource: details.resource || { type: 'admin' },
        changes: details.changes,
        timestamp: Date.now()
      },
      metadata: {
        method: req.method,
        path: req.originalUrl,
        requestId: req.requestId
      }
    });
  } catch (error) {
    logger.error('Error logging admin activity:', error);
  }
};

/**
 * Check if user has required role
 * @param {Object} user - User object
 * @param {Array|String} requiredRoles - Required roles
 * @returns {Boolean}
 */
const hasRequiredRole = (user, requiredRoles) => {
  if (!user || !user.role) return false;
  
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(user.role);
  }
  
  return user.role === requiredRoles;
};

/**
 * Check if user has required permission
 * @param {Object} user - User object
 * @param {String} permission - Required permission
 * @returns {Boolean}
 */
const hasPermission = (user, permission) => {
  if (!user || !user.permissions) return false;
  
  // Admin has all permissions
  if (user.role === 'admin') return true;
  
  return user.permissions.includes(permission);
};

// ============================================
// Basic Admin Check
// ============================================

/**
 * @desc    Check if user is admin
 * @access  Private
 */
exports.isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'admin') {
      // Log unauthorized attempt
      await logAdminActivity(req, 'unauthorized_access', {
        resource: { type: 'admin_check' },
        changes: {
          requiredRole: 'admin',
          userRole: req.user.role
        }
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
        required: 'admin',
        current: req.user.role
      });
    }

    // Log successful admin access
    await logAdminActivity(req, 'admin_access_granted', {
      resource: { type: 'admin_check' }
    });

    next();
  } catch (error) {
    logger.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ============================================
// Multi-level Admin Check
// ============================================

/**
 * @desc    Check if user has specific admin level
 * @param   {String|Array} levels - Allowed admin levels
 * @returns {Function} Middleware
 */
exports.hasAdminLevel = (levels) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const allowedLevels = Array.isArray(levels) ? levels : [levels];
      
      if (!allowedLevels.includes(req.user.adminLevel)) {
        await logAdminActivity(req, 'insufficient_admin_level', {
          resource: { type: 'admin_level_check' },
          changes: {
            required: allowedLevels,
            current: req.user.adminLevel
          }
        });

        return res.status(403).json({
          success: false,
          message: 'Insufficient admin level',
          required: allowedLevels,
          current: req.user.adminLevel
        });
      }

      next();
    } catch (error) {
      logger.error('Admin level middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};
// ============================================
// Permission-based Admin Check
// ============================================

/**
 * @desc    Check if user has specific permission
 * @param   {String|Array} permissions - Required permissions
 * @returns {Function} Middleware
 */
exports.hasPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
      
      // Admin has all permissions
      if (req.user.role === 'admin') {
        return next();
      }

      const userPermissions = req.user.permissions || [];
      const hasAllPermissions = requiredPermissions.every(p => 
        userPermissions.includes(p)
      );

      if (!hasAllPermissions) {
        const missingPermissions = requiredPermissions.filter(p => 
          !userPermissions.includes(p)
        );

        await logAdminActivity(req, 'insufficient_permissions', {
          resource: { type: 'permission_check' },
          changes: {
            required: requiredPermissions,
            current: userPermissions,
            missing: missingPermissions
          }
        });

        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: requiredPermissions,
          current: userPermissions,
          missing: missingPermissions
        });
      }

      next();
    } catch (error) {
      logger.error('Permission middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

// ============================================
// Resource-based Admin Check
// ============================================

/**
 * @desc    Check if admin can access/modify specific resource
 * @param   {String} resourceType - Type of resource (user, affiliate, etc.)
 * @param   {String} paramName - Parameter name containing resource ID
 * @returns {Function} Middleware
 */
exports.canAccessResource = (resourceType, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Super admin can access everything
      if (req.user.role === 'super_admin') {
        return next();
      }

      const resourceId = req.params[paramName];
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID required'
        });
      }

      // Get resource based on type
      let resource = null;
      let resourceOwner = null;

      switch(resourceType) {
        case 'user':
          resource = await User.findById(resourceId);
          resourceOwner = resource?._id;
          break;
        case 'affiliate':
          const Affiliate = require('../models/Affiliate');
          resource = await Affiliate.findById(resourceId).populate('user');
          resourceOwner = resource?.user?._id;
          break;
        // Add other resource types as needed
        default:
          resourceOwner = null;
      }

      // Check access based on admin level
      let hasAccess = false;

      switch(req.user.adminLevel) {
        case 'super':
          hasAccess = true;
          break;
        case 'senior':
          // Senior admins can access all resources
          hasAccess = true;
          break;
        case 'junior':
          // Junior admins can only access specific resources
          // Add logic based on your requirements
          hasAccess = true; // Modify as needed
          break;
        default:
          hasAccess = false;
      }

      if (!hasAccess) {
        await logAdminActivity(req, 'resource_access_denied', {
          resource: { type: resourceType, id: resourceId },
          changes: {
            adminLevel: req.user.adminLevel,
            reason: 'Insufficient privileges for this resource'
          }
        });

        return res.status(403).json({
          success: false,
          message: 'Access denied to this resource'
        });
      }

      // Attach resource to request for controllers
      req.resource = resource;
      next();
    } catch (error) {
      logger.error('Resource access middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

// ============================================
// IP-based Admin Restrictions
// ============================================

/**
 * @desc    Restrict admin access to specific IP addresses
 * @param   {Array} allowedIPs - Array of allowed IP addresses
 * @returns {Function} Middleware
 */
exports.restrictByIP = (allowedIPs = []) => {
  return async (req, res, next) => {
    try {
      const clientIP = req.ip || req.connection.remoteAddress;
      
      // Check if IP is allowed
      const isAllowed = allowedIPs.includes(clientIP) || 
                       allowedIPs.includes(req.user?.allowedIP);

      if (!isAllowed) {
        await logAdminActivity(req, 'ip_restriction_violation', {
          resource: { type: 'ip_check' },
          changes: {
            clientIP,
            allowedIPs
          }
        });

        // Log security event
        await Log.create({
          level: 'security',
          category: 'admin',
          message: 'Admin access blocked due to IP restriction',
          user: req.user?._id,
          ipAddress: clientIP,
          security: {
            event: 'ip_restriction_violation',
            severity: 'high',
            details: { allowedIPs }
          }
        });

        return res.status(403).json({
          success: false,
          message: 'Access denied from this IP address'
        });
      }

      next();
    } catch (error) {
      logger.error('IP restriction middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

// ============================================
// Time-based Admin Restrictions
// ============================================

/**
 * @desc    Restrict admin access to specific time windows
 * @param   {Object} timeWindow - Time window configuration
 * @returns {Function} Middleware
 */
exports.restrictByTime = (timeWindow = {}) => {
  return async (req, res, next) => {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

      const {
        allowedDays = [1,2,3,4,5], // Monday-Friday
        allowedHours = { start: 9, end: 17 }, // 9 AM - 5 PM
        allowedTimezones = ['UTC']
      } = timeWindow;

      // Check if current day is allowed
      if (!allowedDays.includes(currentDay)) {
        await logAdminActivity(req, 'time_restriction_violation', {
          resource: { type: 'time_check' },
          changes: {
            currentDay,
            allowedDays,
            reason: 'Day not allowed'
          }
        });

        return res.status(403).json({
          success: false,
          message: 'Admin access not allowed on this day',
          allowedDays
        });
      }

      // Check if current hour is allowed
      if (currentHour < allowedHours.start || currentHour > allowedHours.end) {
        await logAdminActivity(req, 'time_restriction_violation', {
          resource: { type: 'time_check' },
          changes: {
            currentHour,
            allowedHours,
            reason: 'Hour not allowed'
          }
        });

        return res.status(403).json({
          success: false,
          message: 'Admin access not allowed at this hour',
          allowedHours
        });
      }

      next();
    } catch (error) {
      logger.error('Time restriction middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};
// ============================================
// Two-Factor Authentication for Admin
// ============================================

/**
 * @desc    Require 2FA for admin actions
 * @param   {Boolean} requireForAll - Require 2FA for all actions
 * @returns {Function} Middleware
 */
exports.require2FA = (requireForAll = true) => {
  return async (req, res, next) => {
    try {
      // Skip if 2FA not required for this action
      if (!requireForAll && req.action?.level !== 'high') {
        return next();
      }

      const user = await User.findById(req.user._id).select('+twoFactorSecret');
      
      if (!user.twoFactorEnabled) {
        return res.status(403).json({
          success: false,
          message: '2FA must be enabled for admin actions'
        });
      }

      const twoFAToken = req.headers['x-2fa-token'] || req.body.twoFAToken;

      if (!twoFAToken) {
        return res.status(403).json({
          success: false,
          message: '2FA token required'
        });
      }

      // Verify 2FA token (implement your verification logic)
      const speakeasy = require('speakeasy');
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFAToken,
        window: 1
      });

      if (!verified) {
        await logAdminActivity(req, '2fa_failed', {
          resource: { type: '2fa_check' },
          changes: { token: twoFAToken }
        });

        return res.status(403).json({
          success: false,
          message: 'Invalid 2FA token'
        });
      }

      next();
    } catch (error) {
      logger.error('2FA middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

// ============================================
// Admin Action Audit
// ============================================

/**
 * @desc    Audit all admin actions
 * @param   {Object} options - Audit options
 * @returns {Function} Middleware
 */
exports.auditAdminAction = (options = {}) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    const originalJson = res.json;

    // Store request data
    const requestData = {
      body: req.body,
      params: req.params,
      query: req.query,
      headers: {
        'user-agent': req.get('user-agent'),
        'referer': req.get('referer'),
        'x-request-id': req.get('x-request-id')
      }
    };

    // Override res.json to capture response
    res.json = function(data) {
      const responseTime = Date.now() - startTime;

      // Log admin action
      logAdminActivity(req, options.action || 'admin_action', {
        resource: options.resource || { type: 'unknown' },
        changes: {
          request: requestData,
          response: {
            success: data?.success,
            statusCode: res.statusCode,
            responseTime
          }
        }
      });

      // Store in database for audit trail
      if (process.env.ENABLE_ADMIN_AUDIT === 'true') {
        const Audit = mongoose.model('Audit');
        new Audit({
          user: req.user._id,
          action: options.action || 'admin_action',
          resource: options.resource || { type: 'unknown' },
          request: requestData,
          response: data,
          statusCode: res.statusCode,
          responseTime,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          timestamp: new Date()
        }).save().catch(err => logger.error('Audit save error:', err));
      }

      // Check for suspicious activity
      if (responseTime > 5000) {
        logger.warn('Slow admin action detected:', {
          action: options.action,
          user: req.user._id,
          responseTime,
          path: req.originalUrl
        });
      }

      originalJson.call(this, data);
    };

    next();
  };
};

// ============================================
// Rate Limiting for Admin Actions
// ============================================

/**
 * @desc    Rate limit admin actions
 * @param   {Object} limits - Rate limit configuration
 * @returns {Function} Middleware
 */
exports.adminRateLimit = (limits = {}) => {
  const rateLimit = require('express-rate-limit');
  const RedisStore = require('rate-limit-redis');
  const redisClient = require('../config/redis');

  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each admin to 100 requests per windowMs
    skipSuccessful = true, // don't count successful requests
    keyGenerator = (req) => `admin:${req.user?._id || req.ip}`
  } = limits;

  return rateLimit({
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:admin:'
    }),
    windowMs,
    max,
    skipSuccessful,
    keyGenerator,
    handler: async (req, res) => {
      await logAdminActivity(req, 'rate_limit_exceeded', {
        resource: { type: 'rate_limit' },
        changes: {
          limit: max,
          windowMs
        }
      });

      res.status(429).json({
        success: false,
        message: 'Too many admin requests, please try again later',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// ============================================
// Admin Session Validation
// ============================================

/**
 * @desc    Validate admin session
 * @returns {Function} Middleware
 */
exports.validateAdminSession = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.cookies?.adminSession;

    if (!sessionId) {
      return res.status(401).json({
        success: false,
        message: 'No admin session found'
      });
    }

    // Check session in Redis
    const redisClient = require('../config/redis');
    const session = await redisClient.get(`admin:session:${sessionId}`);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }

    const sessionData = JSON.parse(session);

    // Check session expiry
    if (sessionData.expiresAt < Date.now()) {
      await redisClient.del(`admin:session:${sessionId}`);
      
      return res.status(401).json({
        success: false,
        message: 'Session expired'
      });
    }

    // Extend session if within threshold
    const extendThreshold = 5 * 60 * 1000; // 5 minutes
    if (sessionData.expiresAt - Date.now() < extendThreshold) {
      sessionData.expiresAt = Date.now() + 30 * 60 * 1000; // +30 minutes
      await redisClient.setex(
        `admin:session:${sessionId}`,
        30 * 60,
        JSON.stringify(sessionData)
      );
    }

    req.adminSession = sessionData;
    next();
  } catch (error) {
    logger.error('Admin session validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ============================================
// Admin Action Confirmation
// ============================================

/**
 * @desc    Require confirmation for sensitive admin actions
 * @param   {String} message - Confirmation message
 * @returns {Function} Middleware
 */
exports.requireConfirmation = (message = 'Are you sure you want to perform this action?') => {
  return async (req, res, next) => {
    const confirmed = req.headers['x-confirm'] === 'true' || req.body.confirmed === true;

    if (!confirmed) {
      return res.status(403).json({
        success: false,
        message: 'Confirmation required',
        confirmationMessage: message,
        instructions: 'Send x-confirm: true header or confirmed: true in body'
      });
    }

    next();
  };
};

// ============================================
// Admin Access Logging
// ============================================

/**
 * @desc    Log all admin access attempts
 * @returns {Function} Middleware
 */
exports.logAdminAccess = async (req, res, next) => {
  const startTime = Date.now();

  // Log access attempt
  await Log.create({
    level: 'info',
    category: 'admin',
    message: `Admin access: ${req.method} ${req.originalUrl}`,
    user: req.user?._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    audit: {
      action: 'access',
      resource: { type: 'admin', path: req.originalUrl },
      timestamp: Date.now()
    },
    metadata: {
      method: req.method,
      path: req.originalUrl,
      query: req.query,
      params: req.params,
      requestId: req.requestId
    }
  });

  // Track response time
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    logger.info('Admin access completed:', {
      user: req.user?._id,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      requestId: req.requestId
    });
  });

  next();
};

// ============================================
// Export combined admin middleware
// ============================================

module.exports = exports;


