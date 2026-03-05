const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  // Log level
  level: {
    type: String,
    enum: [
      'error',
      'warn',
      'info',
      'debug',
      'verbose',
      'silly',
      'http',
      'audit',
      'security',
      'performance'
    ],
    required: true,
    index: true
  },

  // Log message
  message: {
    type: String,
    required: true,
    trim: true
  },

  // Log category/type
  category: {
    type: String,
    enum: [
      'system',
      'user',
      'auth',
      'api',
      'database',
      'network',
      'payment',
      'email',
      'sms',
      'notification',
      'cron',
      'job',
      'file',
      'security',
      'audit',
      'performance',
      'affiliate',
      'commission',
      'referral',
      'withdrawal',
      'payout',
      'wallet',
      'transaction',
      'ticket'
    ],
    default: 'system',
    index: true
  },

  // User associated with log (if any)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },

  // IP Address
  ipAddress: {
    type: String,
    trim: true,
    index: true
  },

  // User Agent
  userAgent: {
    type: String,
    trim: true
  },

  // Request details
  request: {
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']
    },
    url: String,
    path: String,
    query: mongoose.Schema.Types.Mixed,
    params: mongoose.Schema.Types.Mixed,
    body: mongoose.Schema.Types.Mixed,
    headers: mongoose.Schema.Types.Mixed,
    timestamp: Date
  },

  // Response details
  response: {
    statusCode: Number,
    statusMessage: String,
    headers: mongoose.Schema.Types.Mixed,
    body: mongoose.Schema.Types.Mixed,
    responseTime: Number, // in milliseconds
    timestamp: Date
  },

  // Error details
  error: {
    name: String,
    message: String,
    stack: String,
    code: String,
    statusCode: Number,
    details: mongoose.Schema.Types.Mixed
  },

  // Performance metrics
  performance: {
    duration: Number, // in milliseconds
    memory: {
      heapUsed: Number,
      heapTotal: Number,
      external: Number,
      arrayBuffers: Number,
      rss: Number
    },
    cpu: {
      user: Number,
      system: Number
    },
    network: {
      bytesIn: Number,
      bytesOut: Number,
      packetsIn: Number,
      packetsOut: Number
    },
    database: {
      queryCount: Number,
      queryTime: Number,
      connectionCount: Number
    },
    timestamp: Date
  },

  // Database query details
  database: {
    operation: {
      type: String,
      enum: ['find', 'insert', 'update', 'delete', 'aggregate', 'count']
    },
    collection: String,
    query: mongoose.Schema.Types.Mixed,
    options: mongoose.Schema.Types.Mixed,
    result: mongoose.Schema.Types.Mixed,
    documentsAffected: Number,
    executionTime: Number, // in milliseconds
    timestamp: Date
  },

  // API details
  api: {
    endpoint: String,
    method: String,
    clientId: String,
    apiKey: String,
    version: String,
    rateLimit: {
      limit: Number,
      remaining: Number,
      reset: Date
    },
    timestamp: Date
  },

  // Security details
  security: {
    event: {
      type: String,
      enum: [
        'login_success',
        'login_failed',
        'logout',
        'password_change',
        'password_reset',
        'email_verified',
        'two_factor_enabled',
        'two_factor_disabled',
        'two_factor_verified',
        'permission_denied',
        'rate_limit_exceeded',
        'suspicious_activity',
        'account_locked',
        'account_unlocked',
        'role_changed',
        'permission_changed'
      ]
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    threatLevel: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'severe']
    },
    details: mongoose.Schema.Types.Mixed,
    timestamp: Date
  },

  // Audit details
  audit: {
    action: {
      type: String,
      enum: [
        'create',
        'read',
        'update',
        'delete',
        'export',
        'import',
        'login',
        'logout',
        'view',
        'download',
        'upload',
        'approve',
        'reject',
        'assign',
        'transfer',
        'archive'
      ]
    },
    resource: {
      type: {
        type: String,
        enum: [
          'user',
          'affiliate',
          'commission',
          'referral',
          'payout',
          'wallet',
          'transaction',
          'ticket',
          'setting',
          'role',
          'permission',
          'log',
          'report'
        ]
      },
      id: mongoose.Schema.Types.ObjectId,
      name: String
    },
    changes: [{
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed
    }],
    reason: String,
    timestamp: Date
  },

  // Job details
  job: {
    name: String,
    type: String,
    status: {
      type: String,
      enum: ['started', 'completed', 'failed', 'cancelled', 'paused', 'resumed']
    },
    startedAt: Date,
    completedAt: Date,
    duration: Number,
    result: mongoose.Schema.Types.Mixed,
    error: mongoose.Schema.Types.Mixed,
    metadata: mongoose.Schema.Types.Mixed
  },

  // Email details
  email: {
    from: String,
    to: [String],
    cc: [String],
    bcc: [String],
    subject: String,
    template: String,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed']
    },
    messageId: String,
    provider: String,
    sentAt: Date,
    deliveredAt: Date,
    openedAt: Date,
    clickedAt: Date,
    bouncedAt: Date,
    failedAt: Date,
    error: String
  },

  // SMS details
  sms: {
    from: String,
    to: String,
    body: String,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed']
    },
    messageId: String,
    provider: String,
    sentAt: Date,
    deliveredAt: Date,
    failedAt: Date,
    error: String
  },

  // Notification details
  notification: {
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'in_app']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    title: String,
    body: String,
    status: {
      type: String,
      enum: ['queued', 'sent', 'delivered', 'opened', 'failed']
    },
    sentAt: Date,
    deliveredAt: Date,
    openedAt: Date,
    failedAt: Date,
    error: String
  },

  // Payment details
  payment: {
    provider: String,
    transactionId: String,
    amount: Number,
    currency: String,
    status: String,
    method: String,
    initiatedAt: Date,
    completedAt: Date,
    failedAt: Date,
    error: String,
    metadata: mongoose.Schema.Types.Mixed
  },

  // File details
  file: {
    name: String,
    path: String,
    size: Number,
    type: String,
    operation: {
      type: String,
      enum: ['upload', 'download', 'delete', 'rename', 'move']
    },
    status: {
      type: String,
      enum: ['success', 'failed']
    },
    timestamp: Date,
    error: String
  },

  // System details
  system: {
    hostname: String,
    platform: String,
    arch: String,
    release: String,
    uptime: Number,
    loadavg: [Number],
    freemem: Number,
    totalmem: Number,
    cpus: [{
      model: String,
      speed: Number,
      times: {
        user: Number,
        nice: Number,
        sys: Number,
        idle: Number,
        irq: Number
      }
    }],
    networkInterfaces: mongoose.Schema.Types.Mixed,
    process: {
      pid: Number,
      title: String,
      argv: [String],
      versions: mongoose.Schema.Types.Mixed,
      uptime: Number,
      memoryUsage: mongoose.Schema.Types.Mixed,
      cpuUsage: mongoose.Schema.Types.Mixed
    }
  },

  // Environment details
  environment: {
    nodeEnv: String,
    appEnv: String,
    version: String,
    buildNumber: String,
    commitHash: String,
    branch: String,
    deploymentId: String,
    containerId: String,
    podName: String,
    namespace: String
  },

  // Tags for categorization
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    index: true
  }],

  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },

  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
    immutable: true
  }
});

// Indexes for performance
logSchema.index({ level: 1, timestamp: -1 });
logSchema.index({ category: 1, timestamp: -1 });
logSchema.index({ user: 1, timestamp: -1 });
logSchema.index({ ipAddress: 1, timestamp: -1 });
logSchema.index({ 'api.endpoint': 1, timestamp: -1 });
logSchema.index({ 'security.event': 1, timestamp: -1 });
logSchema.index({ 'audit.action': 1, timestamp: -1 });
logSchema.index({ tags: 1, timestamp: -1 });
logSchema.index({ timestamp: -1 });
logSchema.index({ level: 1, category: 1, timestamp: -1 });

// Compound indexes for common queries
logSchema.index({ level: 1, category: 1, timestamp: -1 });
logSchema.index({ user: 1, level: 1, timestamp: -1 });
logSchema.index({ 'audit.action': 1, 'audit.resource.type': 1, timestamp: -1 });

// TTL index for automatic log cleanup (e.g., 30 days)
logSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

// Virtual for time ago
logSchema.virtual('timeAgo').get(function() {
  const diff = Date.now() - this.timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
});

// Virtual for formatted level
logSchema.virtual('levelDisplay').get(function() {
  const colors = {
    'error': '🔴 ERROR',
    'warn': '🟡 WARN',
    'info': '🔵 INFO',
    'debug': '🟢 DEBUG',
    'verbose': '🟣 VERBOSE',
    'silly': '⚪ SILLY',
    'http': '🌐 HTTP',
    'audit': '📋 AUDIT',
    'security': '🛡️ SECURITY',
    'performance': '⚡ PERFORMANCE'
  };
  return colors[this.level] || this.level.toUpperCase();
});

// Virtual for formatted category
logSchema.virtual('categoryDisplay').get(function() {
  const icons = {
    'system': '⚙️',
    'user': '👤',
    'auth': '🔐',
    'api': '🌐',
    'database': '🗄️',
    'network': '🌍',
    'payment': '💰',
    'email': '📧',
    'sms': '📱',
    'notification': '🔔',
    'cron': '⏰',
    'job': '⚙️',
    'file': '📄',
    'security': '🛡️',
    'audit': '📋',
    'performance': '⚡',
    'affiliate': '🤝',
    'commission': '🏆',
    'referral': '👥',
    'withdrawal': '🏧',
    'payout': '💵',
    'wallet': '👛',
    'transaction': '💳',
    'ticket': '🎫'
  };
  return `${icons[this.category] || '📌'} ${this.category}`;
});

// Method to format log for display
logSchema.methods.format = function(options = {}) {
  let output = '';
  
  if (options.timestamp) {
    output += `[${this.timestamp.toISOString()}] `;
  }
  
  output += `${this.levelDisplay}: ${this.message}`;
  
  if (options.includeMetadata && this.user) {
    output += ` (User: ${this.user})`;
  }
  
  if (options.includeMetadata && this.ipAddress) {
    output += ` [${this.ipAddress}]`;
  }
  
  return output;
};

// Method to check if error log
logSchema.methods.isError = function() {
  return this.level === 'error';
};

// Method to check if warning log
logSchema.methods.isWarning = function() {
  return this.level === 'warn';
};

// Method to check if security log
logSchema.methods.isSecurity = function() {
  return this.level === 'security' || this.category === 'security';
};

// Method to get error details
logSchema.methods.getErrorDetails = function() {
  if (this.error) {
    return {
      name: this.error.name,
      message: this.error.message,
      code: this.error.code,
      stack: this.error.stack
    };
  }
  return null;
};

// Method to get performance metrics
logSchema.methods.getPerformanceMetrics = function() {
  if (this.performance) {
    return {
      duration: this.performance.duration,
      memory: this.performance.memory,
      cpu: this.performance.cpu
    };
  }
  return null;
};

// Static method to create error log
logSchema.statics.error = async function(message, options = {}) {
  return this.create({
    level: 'error',
    message,
    category: options.category || 'system',
    user: options.user,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    error: options.error,
    request: options.request,
    response: options.response,
    tags: options.tags,
    metadata: options.metadata
  });
};

// Static method to create warning log
logSchema.statics.warn = async function(message, options = {}) {
  return this.create({
    level: 'warn',
    message,
    category: options.category || 'system',
    user: options.user,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    tags: options.tags,
    metadata: options.metadata
  });
};

// Static method to create info log
logSchema.statics.info = async function(message, options = {}) {
  return this.create({
    level: 'info',
    message,
    category: options.category || 'system',
    user: options.user,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    tags: options.tags,
    metadata: options.metadata
  });
};

// Static method to create debug log
logSchema.statics.debug = async function(message, options = {}) {
  return this.create({
    level: 'debug',
    message,
    category: options.category || 'system',
    user: options.user,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    tags: options.tags,
    metadata: options.metadata
  });
};

// Static method to create audit log
logSchema.statics.audit = async function(action, resource, changes, user, options = {}) {
  return this.create({
    level: 'audit',
    message: `${action} ${resource.type}`,
    category: 'audit',
    user,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    audit: {
      action,
      resource,
      changes,
      reason: options.reason,
      timestamp: Date.now()
    },
    tags: options.tags,
    metadata: options.metadata
  });
};

// Static method to create security log
logSchema.statics.security = async function(event, severity, details, user, options = {}) {
  return this.create({
    level: 'security',
    message: `Security event: ${event}`,
    category: 'security',
    user,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    security: {
      event,
      severity,
      threatLevel: options.threatLevel || 'none',
      details,
      timestamp: Date.now()
    },
    tags: options.tags,
    metadata: options.metadata
  });
};

// Static method to create performance log
logSchema.statics.performance = async function(operation, duration, metrics, options = {}) {
  return this.create({
    level: 'performance',
    message: `${operation} completed in ${duration}ms`,
    category: 'performance',
    performance: {
      duration,
      memory: metrics.memory,
      cpu: metrics.cpu,
      database: metrics.database,
      network: metrics.network,
      timestamp: Date.now()
    },
    tags: options.tags,
    metadata: options.metadata
  });
};

// Static method to create API log
logSchema.statics.api = async function(req, res, duration, options = {}) {
  return this.create({
    level: 'http',
    message: `${req.method} ${req.path} - ${res.statusCode}`,
    category: 'api',
    user: req.user?._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    request: {
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      query: req.query,
      params: req.params,
      body: options.logBody ? req.body : undefined,
      headers: options.logHeaders ? req.headers : undefined,
      timestamp: req._startTime
    },
    response: {
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      responseTime: duration,
      timestamp: Date.now()
    },
    tags: options.tags,
    metadata: options.metadata
  });
};

// Static method to create database log
logSchema.statics.database = async function(operation, collection, query, duration, result, options = {}) {
  return this.create({
    level: 'debug',
    message: `${operation} on ${collection}`,
    category: 'database',
    database: {
      operation,
      collection,
      query,
      options: options.options,
      documentsAffected: result?.length || result?.n || 0,
      executionTime: duration,
      timestamp: Date.now()
    },
    tags: options.tags,
    metadata: options.metadata
  });
};

// Static method to create job log
logSchema.statics.job = async function(jobName, status, options = {}) {
  return this.create({
    level: status === 'failed' ? 'error' : 'info',
    message: `Job ${jobName} ${status}`,
    category: 'job',
    job: {
      name: jobName,
      type: options.type,
      status,
      startedAt: options.startedAt,
      completedAt: options.completedAt,
      duration: options.duration,
      result: options.result,
      error: options.error,
      metadata: options.metadata
    },
    tags: options.tags,
    metadata: options.metadata
  });
};

// Static method to create email log
logSchema.statics.email = async function(emailData, status, options = {}) {
  return this.create({
    level: 'info',
    message: `Email ${status} to ${emailData.to}`,
    category: 'email',
    email: {
      ...emailData,
      status,
      sentAt: options.sentAt,
      deliveredAt: options.deliveredAt,
      openedAt: options.openedAt,
      clickedAt: options.clickedAt,
      bouncedAt: options.bouncedAt,
      failedAt: options.failedAt,
      error: options.error
    },
    tags: options.tags,
    metadata: options.metadata
  });
};

// Static method to get logs by level
logSchema.statics.getByLevel = async function(level, limit = 100) {
  return this.find({ level })
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get logs by category
logSchema.statics.getByCategory = async function(category, limit = 100) {
  return this.find({ category })
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get logs by user
logSchema.statics.getByUser = async function(userId, limit = 100) {
  return this.find({ user: userId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get logs by IP
logSchema.statics.getByIP = async function(ipAddress, limit = 100) {
  return this.find({ ipAddress })
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get error logs
logSchema.statics.getErrors = async function(limit = 100) {
  return this.find({ level: 'error' })
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get security logs
logSchema.statics.getSecurityLogs = async function(limit = 100) {
  return this.find({ 
    $or: [
      { level: 'security' },
      { category: 'security' }
    ]
  })
  .sort({ timestamp: -1 })
  .limit(limit);
};

// Static method to get logs by date range
logSchema.statics.getByDateRange = async function(startDate, endDate, options = {}) {
  const query = {
    timestamp: { $gte: startDate, $lte: endDate }
  };
  
  if (options.level) query.level = options.level;
  if (options.category) query.category = options.category;
  if (options.user) query.user = options.user;
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(options.limit || 1000);
};

// Static method to get log statistics
logSchema.statics.getStats = async function(startDate, endDate) {
  const match = {};
  if (startDate || endDate) {
    match.timestamp = {};
    if (startDate) match.timestamp.$gte = startDate;
    if (endDate) match.timestamp.$lte = endDate;
  }
  
  const byLevel = await this.aggregate([
    { $match: match },
    { $group: { _id: '$level', count: { $sum: 1 } } }
  ]);
  
  const byCategory = await this.aggregate([
    { $match: match },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  
  const byUser = await this.aggregate([
    { $match: { ...match, user: { $exists: true } } },
    { $group: { _id: '$user', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  const errorRate = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        errors: {
          $sum: { $cond: [{ $eq: ['$level', 'error'] }, 1, 0] }
        },
        warnings: {
          $sum: { $cond: [{ $eq: ['$level', 'warn'] }, 1, 0] }
        }
      }
    }
  ]);
  
  const hourly = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          hour: { $hour: '$timestamp' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.hour': 1 } }
  ]);
  
  return {
    byLevel,
    byCategory,
    topUsers: byUser,
    errorRate: errorRate[0] || { total: 0, errors: 0, warnings: 0 },
    hourlyActivity: hourly
  };
};

// Static method to clean old logs
logSchema.statics.cleanOldLogs = async function(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const result = await this.deleteMany({
    timestamp: { $lt: cutoffDate }
  });
  
  return result.deletedCount;
};

// Static method to search logs
logSchema.statics.search = async function(query, options = {}) {
  const searchQuery = {
    $or: [
      { message: new RegExp(query, 'i') },
      { 'error.message': new RegExp(query, 'i') },
      { 'audit.action': new RegExp(query, 'i') },
      { 'security.event': new RegExp(query, 'i') },
      { tags: new RegExp(query, 'i') }
    ]
  };
  
  if (options.level) searchQuery.level = options.level;
  if (options.category) searchQuery.category = options.category;
  if (options.user) searchQuery.user = options.user;
  if (options.startDate || options.endDate) {
    searchQuery.timestamp = {};
    if (options.startDate) searchQuery.timestamp.$gte = options.startDate;
    if (options.endDate) searchQuery.timestamp.$lte = options.endDate;
  }
  
  return this.find(searchQuery)
    .sort({ timestamp: -1 })
    .limit(options.limit || 100)
    .skip(options.skip || 0);
};

// Static method to export logs
logSchema.statics.exportLogs = async function(format = 'json', options = {}) {
  const query = {};
  
  if (options.startDate || options.endDate) {
    query.timestamp = {};
    if (options.startDate) query.timestamp.$gte = options.startDate;
    if (options.endDate) query.timestamp.$lte = options.endDate;
  }
  
  if (options.level) query.level = options.level;
  if (options.category) query.category = options.category;
  
  const logs = await this.find(query)
    .sort({ timestamp: -1 })
    .limit(options.limit || 10000);
  
  if (format === 'json') {
    return logs;
  } else if (format === 'csv') {
    // Convert to CSV format
    return logs.map(log => ({
      timestamp: log.timestamp,
      level: log.level,
      category: log.category,
      message: log.message,
      user: log.user,
      ipAddress: log.ipAddress
    }));
  }
  
  return logs;
};

// Create and export model
const Log = mongoose.model('Log', logSchema);
module.exports = Log;
