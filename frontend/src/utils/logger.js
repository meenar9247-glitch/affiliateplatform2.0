// ==================== Logger Constants ====================

export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal'
};

export const LOG_COLORS = {
  [LOG_LEVELS.DEBUG]: '#6c757d',  // Gray
  [LOG_LEVELS.INFO]: '#17a2b8',   // Cyan
  [LOG_LEVELS.WARN]: '#ffc107',    // Yellow
  [LOG_LEVELS.ERROR]: '#dc3545',   // Red
  [LOG_LEVELS.FATAL]: '#721c24'    // Dark Red
};

export const LOG_ICONS = {
  [LOG_LEVELS.DEBUG]: '🔍',
  [LOG_LEVELS.INFO]: 'ℹ️',
  [LOG_LEVELS.WARN]: '⚠️',
  [LOG_LEVELS.ERROR]: '❌',
  [LOG_LEVELS.FATAL]: '💀'
};

export const LOG_CATEGORIES = {
  AUTH: 'auth',
  API: 'api',
  USER: 'user',
  PAYMENT: 'payment',
  AFFILIATE: 'affiliate',
  SYSTEM: 'system',
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  NETWORK: 'network',
  DATABASE: 'database',
  RENDER: 'render',
  ROUTER: 'router',
  STORE: 'store',
  COMPONENT: 'component'
};

export const LOG_OUTPUTS = {
  CONSOLE: 'console',
  FILE: 'file',
  REMOTE: 'remote',
  LOCAL_STORAGE: 'localStorage'
};

export const LOG_FORMATS = {
  JSON: 'json',
  TEXT: 'text',
  CSV: 'csv',
  XML: 'xml'
};

// Default logger configuration
export const DEFAULT_CONFIG = {
  level: process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG,
  outputs: [LOG_OUTPUTS.CONSOLE],
  format: LOG_FORMATS.TEXT,
  includeTimestamp: true,
  includeLevel: true,
  includeCategory: true,
  includeStack: true,
  maxEntries: 1000,
  remoteUrl: null,
  batchSize: 10,
  flushInterval: 5000,
  enableBuffer: true,
  enableSampling: false,
  sampleRate: 1.0,
  enableRedaction: true,
  redactedKeys: ['password', 'token', 'secret', 'key', 'authorization'],
  enableConsoleColors: true,
  enableEmoji: true
};

// ==================== Base Logger Class ====================

export class Logger {
  constructor(name = 'app', config = {}) {
    this.name = name;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.buffer = [];
    this.history = [];
    this.listeners = new Map();
    this.flushTimer = null;
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();

    if (this.config.enableBuffer) {
      this.startFlushTimer();
    }
  }

  // Generate session ID
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Start flush timer
  startFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  // Stop flush timer
  stopFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  // Check if level should be logged
  shouldLog(level) {
    const levels = Object.values(LOG_LEVELS);
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  // Apply sampling
  shouldSample() {
    if (!this.config.enableSampling) return true;
    return Math.random() < this.config.sampleRate;
  }

  // Redact sensitive data
  redact(data) {
    if (!this.config.enableRedaction || !data) return data;
    
    const redacted = { ...data };
    
    const redactValue = (obj, key) => {
      if (obj[key] !== undefined) {
        obj[key] = '***REDACTED***';
      }
    };
    
    const traverse = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      
      Object.keys(obj).forEach(key => {
        if (this.config.redactedKeys.includes(key.toLowerCase())) {
          redactValue(obj, key);
        } else if (typeof obj[key] === 'object') {
          traverse(obj[key]);
        }
      });
    };
    
    traverse(redacted);
    return redacted;
  }

  // Format log entry
  formatLogEntry(level, message, category, data = {}) {
    const entry = {
      id: this.generateEntryId(),
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data: this.redact(data),
      logger: this.name,
      sessionId: this.sessionId,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      url: typeof window !== 'undefined' ? window.location.href : null,
      performance: this.getPerformanceMetrics()
    };

    if (level === LOG_LEVELS.ERROR || level === LOG_LEVELS.FATAL) {
      entry.stack = new Error().stack;
    }

    return entry;
  }

  // Generate entry ID
  generateEntryId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get performance metrics
  getPerformanceMetrics() {
    if (typeof performance === 'undefined') return null;
    
    return {
      memory: performance.memory,
      navigation: performance.navigation,
      timing: performance.timing,
      timeOrigin: performance.timeOrigin
    };
  }

  // Get browser info
  getBrowserInfo() {
    if (typeof navigator === 'undefined') return null;
    
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack
    };
  }

  // Write to console
  writeToConsole(entry) {
    const { level, message, category, data } = entry;
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${category}]`;
    
    const consoleMethod = level === LOG_LEVELS.ERROR || level === LOG_LEVELS.FATAL
      ? 'error'
      : level === LOG_LEVELS.WARN
      ? 'warn'
      : level === LOG_LEVELS.INFO
      ? 'info'
      : 'debug';

    if (this.config.enableConsoleColors) {
      const color = LOG_COLORS[level];
      const icon = this.config.enableEmoji ? LOG_ICONS[level] : '';
      console[consoleMethod](`%c${icon} ${prefix} ${message}`, `color: ${color}; font-weight: bold;`, data || '');
    } else {
      const icon = this.config.enableEmoji ? LOG_ICONS[level] : '';
      console[consoleMethod](`${icon} ${prefix} ${message}`, data || '');
    }
  }

  // Write to local storage
  writeToLocalStorage(entry) {
    try {
      const key = `logs_${this.name}`;
      const logs = JSON.parse(localStorage.getItem(key) || '[]');
      logs.push(entry);
      
      // Keep only last N entries
      if (logs.length > this.config.maxEntries) {
        logs.splice(0, logs.length - this.config.maxEntries);
      }
      
      localStorage.setItem(key, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to write to localStorage:', error);
    }
  }

  // Write to remote
  async writeToRemote(entry) {
    if (!this.config.remoteUrl) return;
    
    try {
      const response = await fetch(this.config.remoteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });
      
      if (!response.ok) {
        console.error('Failed to send log to remote:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to send log to remote:', error);
    }
  }

  // Process log entry
  async log(level, message, category = LOG_CATEGORIES.SYSTEM, data = {}) {
    if (!this.shouldLog(level)) return;
    if (!this.shouldSample()) return;

    const entry = this.formatLogEntry(level, message, category, data);
    
    // Add to history
    this.history.push(entry);
    if (this.history.length > this.config.maxEntries) {
      this.history.shift();
    }
    
    // Add to buffer
    if (this.config.enableBuffer) {
      this.buffer.push(entry);
    }
    
    // Write to outputs
    this.config.outputs.forEach(output => {
      switch (output) {
        case LOG_OUTPUTS.CONSOLE:
          this.writeToConsole(entry);
          break;
        case LOG_OUTPUTS.LOCAL_STORAGE:
          this.writeToLocalStorage(entry);
          break;
        case LOG_OUTPUTS.REMOTE:
          this.writeToRemote(entry);
          break;
      }
    });
    
    // Emit event
    this.emit('log', entry);
    
    return entry;
  }
// Convenience methods
debug(message, category = LOG_CATEGORIES.SYSTEM, data = {}) {
  return this.log(LOG_LEVELS.DEBUG, message, category, data);
}

info(message, category = LOG_CATEGORIES.SYSTEM, data = {}) {
  return this.log(LOG_LEVELS.INFO, message, category, data);
}

warn(message, category = LOG_CATEGORIES.SYSTEM, data = {}) {
  return this.log(LOG_LEVELS.WARN, message, category, data);
}

error(message, category = LOG_CATEGORIES.SYSTEM, data = {}) {
  return this.log(LOG_LEVELS.ERROR, message, category, data);
}

fatal(message, category = LOG_CATEGORIES.SYSTEM, data = {}) {
  return this.log(LOG_LEVELS.FATAL, message, category, data);
}

// API logging
logApiCall(method, url, requestData, responseData, status, duration) {
  return this.info(
    `API ${method} ${url}`,
    LOG_CATEGORIES.API,
    {
      method,
      url,
      request: requestData,
      response: responseData,
      status,
      duration: `${duration}ms`
    }
  );
}

// User action logging
logUserAction(action, userId, details = {}) {
  return this.info(
    `User action: ${action}`,
    LOG_CATEGORIES.USER,
    {
      userId,
      action,
      ...details
    }
  );
}

// Security event logging
logSecurityEvent(event, userId, details = {}) {
  return this.warn(
    `Security event: ${event}`,
    LOG_CATEGORIES.SECURITY,
    {
      userId,
      event,
      ...details
    }
  );
}

// Performance logging
logPerformance(metric, value, details = {}) {
  return this.debug(
    `Performance: ${metric}`,
    LOG_CATEGORIES.PERFORMANCE,
    {
      metric,
      value,
      ...details
    }
  );
}

// Payment logging
logPayment(transactionId, amount, status, details = {}) {
  return this.info(
    `Payment ${status}: ${transactionId}`,
    LOG_CATEGORIES.PAYMENT,
    {
      transactionId,
      amount,
      status,
      ...details
    }
  );
}

// Affiliate logging
logAffiliateAction(action, affiliateId, details = {}) {
  return this.info(
    `Affiliate action: ${action}`,
    LOG_CATEGORIES.AFFILIATE,
    {
      affiliateId,
      action,
      ...details
    }
  );
}

// Flush buffer
async flush() {
  if (this.buffer.length === 0) return;
  
  const bufferCopy = [...this.buffer];
  this.buffer = [];
  
  if (this.config.outputs.includes(LOG_OUTPUTS.REMOTE) && this.config.remoteUrl) {
    try {
      await fetch(this.config.remoteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bufferCopy)
      });
    } catch (error) {
      console.error('Failed to flush logs:', error);
      // Re-add to buffer
      this.buffer = [...bufferCopy, ...this.buffer];
    }
  }
}

// Clear logs
clear() {
  this.history = [];
  this.buffer = [];
  
  if (this.config.outputs.includes(LOG_OUTPUTS.LOCAL_STORAGE)) {
    localStorage.removeItem(`logs_${this.name}`);
  }
}

// Get logs
getLogs(filters = {}) {
  let logs = [...this.history];
  
  if (filters.level) {
    logs = logs.filter(log => log.level === filters.level);
  }
  
  if (filters.category) {
    logs = logs.filter(log => log.category === filters.category);
  }
  
  if (filters.startDate) {
    logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
  }
  
  if (filters.endDate) {
    logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
  }
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    logs = logs.filter(log => 
      log.message.toLowerCase().includes(searchLower) ||
      JSON.stringify(log.data).toLowerCase().includes(searchLower)
    );
  }
  
  return logs;
}

// Get logs by level
getLogsByLevel(level) {
  return this.history.filter(log => log.level === level);
}

// Get logs by category
getLogsByCategory(category) {
  return this.history.filter(log => log.category === category);
}

// Get error logs
getErrors() {
  return this.history.filter(log => 
    log.level === LOG_LEVELS.ERROR || log.level === LOG_LEVELS.FATAL
  );
}

// Get recent logs
getRecentLogs(count = 10) {
  return this.history.slice(-count);
}

// Get log statistics
getStats() {
  const stats = {
    total: this.history.length,
    byLevel: {},
    byCategory: {},
    timeRange: {
      start: this.history[0]?.timestamp,
      end: this.history[this.history.length - 1]?.timestamp
    },
    sessionDuration: Date.now() - this.startTime
  };
  
  this.history.forEach(log => {
    // By level
    if (!stats.byLevel[log.level]) {
      stats.byLevel[log.level] = 0;
    }
    stats.byLevel[log.level]++;
    
    // By category
    if (!stats.byCategory[log.category]) {
      stats.byCategory[log.category] = 0;
    }
    stats.byCategory[log.category]++;
  });
  
  return stats;
}

// Export logs
exportLogs(format = LOG_FORMATS.JSON) {
  const logs = this.history;
  
  switch (format) {
    case LOG_FORMATS.JSON:
      return JSON.stringify(logs, null, 2);
      
    case LOG_FORMATS.CSV:
      const headers = ['id', 'timestamp', 'level', 'category', 'message', 'data'];
      const csv = [
        headers.join(','),
        ...logs.map(log => [
          log.id,
          log.timestamp,
          log.level,
          log.category,
          `"${log.message.replace(/"/g, '""')}"`,
          `"${JSON.stringify(log.data).replace(/"/g, '""')}"`
        ].join(','))
      ];
      return csv.join('\n');
      
    case LOG_FORMATS.XML:
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<logs>\n';
      logs.forEach(log => {
        xml += '  <log>\n';
        Object.entries(log).forEach(([key, value]) => {
          if (typeof value === 'object') {
            xml += `    <${key}>${JSON.stringify(value)}</${key}>\n`;
          } else {
            xml += `    <${key}>${value}</${key}>\n`;
          }
        });
        xml += '  </log>\n';
      });
      xml += '</logs>';
      return xml;
      
    default:
      return JSON.stringify(logs, null, 2);
  }
}

// Event system
on(event, callback) {
  if (!this.listeners.has(event)) {
    this.listeners.set(event, []);
  }
  this.listeners.get(event).push(callback);
}

off(event, callback) {
  if (this.listeners.has(event)) {
    const callbacks = this.listeners.get(event).filter(cb => cb !== callback);
    if (callbacks.length > 0) {
      this.listeners.set(event, callbacks);
    } else {
      this.listeners.delete(event);
    }
  }
}

emit(event, data) {
  if (this.listeners.has(event)) {
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Event callback error:', error);
      }
    });
  }
}
// ==================== Logger Instances ====================

// Main app logger
export const appLogger = new Logger('app', {
  level: process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG,
  outputs: [LOG_OUTPUTS.CONSOLE, LOG_OUTPUTS.LOCAL_STORAGE],
  enableBuffer: true,
  enableRedaction: true
});

// API logger
export const apiLogger = new Logger('api', {
  level: LOG_LEVELS.INFO,
  outputs: [LOG_OUTPUTS.CONSOLE, LOG_OUTPUTS.LOCAL_STORAGE],
  category: LOG_CATEGORIES.API
});

// Auth logger
export const authLogger = new Logger('auth', {
  level: LOG_LEVELS.INFO,
  outputs: [LOG_OUTPUTS.CONSOLE, LOG_OUTPUTS.LOCAL_STORAGE],
  category: LOG_CATEGORIES.AUTH,
  redactedKeys: ['password', 'token', 'authorization']
});

// Payment logger
export const paymentLogger = new Logger('payment', {
  level: LOG_LEVELS.INFO,
  outputs: [LOG_OUTPUTS.CONSOLE, LOG_OUTPUTS.LOCAL_STORAGE],
  category: LOG_CATEGORIES.PAYMENT,
  redactedKeys: ['cardNumber', 'cvv', 'password', 'token']
});

// Performance logger
export const performanceLogger = new Logger('performance', {
  level: LOG_LEVELS.DEBUG,
  outputs: [LOG_OUTPUTS.CONSOLE],
  category: LOG_CATEGORIES.PERFORMANCE
});

// Security logger
export const securityLogger = new Logger('security', {
  level: LOG_LEVELS.WARN,
  outputs: [LOG_OUTPUTS.CONSOLE, LOG_OUTPUTS.LOCAL_STORAGE],
  category: LOG_CATEGORIES.SECURITY
});

// ==================== Helper Functions ====================

// Create a child logger
export const createLogger = (name, config = {}) => {
  return new Logger(name, config);
};

// Measure execution time
export const measureTime = async (fn, logger, operation) => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logger.logPerformance(operation, duration, { success: true });
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.logPerformance(operation, duration, { success: false, error: error.message });
    throw error;
  }
};

// Create a performance decorator
export const withPerformanceLogging = (fn, logger, operation) => {
  return async (...args) => {
    return measureTime(() => fn(...args), logger, operation);
  };
};

// Log unhandled errors
export const setupGlobalErrorHandling = (logger = appLogger) => {
  if (typeof window === 'undefined') return;

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error(
      'Unhandled Promise Rejection',
      LOG_CATEGORIES.SYSTEM,
      {
        reason: event.reason,
        stack: event.reason?.stack
      }
    );
  });

  // Uncaught errors
  window.addEventListener('error', (event) => {
    logger.error(
      'Uncaught Error',
      LOG_CATEGORIES.SYSTEM,
      {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack
      }
    );
  });

  // Console errors
  const originalConsoleError = console.error;
  console.error = (...args) => {
    logger.error(
      'Console Error',
      LOG_CATEGORIES.SYSTEM,
      { args }
    );
    originalConsoleError.apply(console, args);
  };
};

// Log React component renders
export const withComponentLogging = (Component, name, logger = appLogger) => {
  return (props) => {
    const renderCount = React.useRef(0);
    renderCount.current++;

    React.useEffect(() => {
      logger.debug(
        `Component mounted: ${name}`,
        LOG_CATEGORIES.COMPONENT,
        { props }
      );

      return () => {
        logger.debug(
          `Component unmounted: ${name}`,
          LOG_CATEGORIES.COMPONENT
        );
      };
    }, []);

    React.useEffect(() => {
      logger.debug(
        `Component updated: ${name}`,
        LOG_CATEGORIES.COMPONENT,
        {
          renderCount: renderCount.current,
          prevProps: props,
          nextProps: props
        }
      );
    });

    return <Component {...props} />;
  };
};

// Log route changes
export const setupRouteLogging = (logger = appLogger) => {
  if (typeof window === 'undefined') return;

  let currentUrl = window.location.href;

  const logRouteChange = (url) => {
    logger.info(
      `Route changed: ${url}`,
      LOG_CATEGORIES.ROUTER,
      {
        from: currentUrl,
        to: url
      }
    );
    currentUrl = url;
  };

  // Listen to history changes
  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    logRouteChange(window.location.href);
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    logRouteChange(window.location.href);
  };

  // Listen to popstate events
  window.addEventListener('popstate', () => {
    logRouteChange(window.location.href);
  });
};

// Create log batch
export const createLogBatch = (logs, options = {}) => {
  const batch = {
    id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    count: logs.length,
    logs: logs,
    metadata: {
      appVersion: process.env.REACT_APP_VERSION,
      environment: process.env.NODE_ENV,
      ...options.metadata
    }
  };

  return batch;
};

// Compress logs
export const compressLogs = (logs) => {
  try {
    const json = JSON.stringify(logs);
    // Simple compression - could use actual compression library
    return btoa(encodeURIComponent(json));
  } catch (error) {
    console.error('Failed to compress logs:', error);
    return null;
  }
};

// Decompress logs
export const decompressLogs = (compressed) => {
  try {
    const json = decodeURIComponent(atob(compressed));
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to decompress logs:', error);
    return null;
  }
};

// Filter logs by time range
export const filterLogsByTimeRange = (logs, startDate, endDate) => {
  return logs.filter(log => {
    const logDate = new Date(log.timestamp);
    return (!startDate || logDate >= new Date(startDate)) &&
           (!endDate || logDate <= new Date(endDate));
  });
};

// Aggregate logs by time interval
export const aggregateLogsByInterval = (logs, interval = 'hour') => {
  const aggregated = {};
  
  logs.forEach(log => {
    const date = new Date(log.timestamp);
    let key;
    
    switch (interval) {
      case 'hour':
        key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:00`;
        break;
      case 'day':
        key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        break;
      default:
        key = log.timestamp;
    }
    
    if (!aggregated[key]) {
      aggregated[key] = {
        timestamp: key,
        total: 0,
        byLevel: {},
        byCategory: {}
      };
    }
    
    aggregated[key].total++;
    
    if (!aggregated[key].byLevel[log.level]) {
      aggregated[key].byLevel[log.level] = 0;
    }
    aggregated[key].byLevel[log.level]++;
    
    if (!aggregated[key].byCategory[log.category]) {
      aggregated[key].byCategory[log.category] = 0;
    }
    aggregated[key].byCategory[log.category]++;
  });
  
  return Object.values(aggregated);
};

// ==================== Export ====================

export const loggerUtils = {
  LOG_LEVELS,
  LOG_COLORS,
  LOG_ICONS,
  LOG_CATEGORIES,
  LOG_OUTPUTS,
  LOG_FORMATS,
  DEFAULT_CONFIG,
  
  Logger,
  appLogger,
  apiLogger,
  authLogger,
  paymentLogger,
  performanceLogger,
  securityLogger,
  
  createLogger,
  measureTime,
  withPerformanceLogging,
  setupGlobalErrorHandling,
  withComponentLogging,
  setupRouteLogging,
  createLogBatch,
  compressLogs,
  decompressLogs,
  filterLogsByTimeRange,
  aggregateLogsByInterval
};

export default loggerUtils;
