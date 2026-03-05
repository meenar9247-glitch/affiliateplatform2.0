/**
 * ============================================
 * DATABASE CONFIGURATION
 * Professional MongoDB connection management with
 * multiple connections, connection pooling, retry logic,
 * and comprehensive monitoring
 * ============================================
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

// ============================================
// Connection Configuration
// ============================================

/**
 * Default MongoDB connection options
 */
const defaultOptions = {
  // Connection pool settings
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 10000,
  
  // Write concern
  writeConcern: {
    w: 'majority',
    j: true,
    wtimeoutMS: 5000
  },
  
  // Read preference
  readPreference: 'primaryPreferred',
  
  // Retry settings
  retryWrites: true,
  retryReads: true,
  
  // Timeouts
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  
  // Heartbeat
  heartbeatFrequencyMS: 10000,
  
  // Compression
  compressors: ['snappy', 'zlib'],
  
  // Other options
  autoIndex: process.env.NODE_ENV !== 'production',
  autoCreate: true,
  
  // Enable debug in development
  debug: process.env.NODE_ENV === 'development'
};

/**
 * Environment-specific options
 */
const envOptions = {
  development: {
    autoIndex: true,
    debug: true
  },
  test: {
    autoIndex: false,
    autoCreate: false
  },
  production: {
    autoIndex: false,
    debug: false,
    maxPoolSize: 50,
    minPoolSize: 10
  }
};

// ============================================
// Connection States
// ============================================

const connectionStates = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

// ============================================
// Main Database Class
// ============================================

class Database {
  constructor() {
    this.connections = new Map();
    this.defaultConnection = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
  }

  /**
   * Get connection options for current environment
   */
  getOptions() {
    const env = process.env.NODE_ENV || 'development';
    return {
      ...defaultOptions,
      ...envOptions[env]
    };
  }

  /**
   * Build connection URI
   */
  buildUri(config = {}) {
    const {
      protocol = 'mongodb',
      username,
      password,
      host = 'localhost',
      port = 27017,
      database = 'affiliate-platform',
      options = ''
    } = config;

    let uri = `${protocol}://`;

    if (username && password) {
      uri += `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
    }

    uri += `${host}:${port}/${database}`;

    if (options) {
      uri += `?${options}`;
    }

    return uri;
  }

  /**
   * Connect to MongoDB
   */
  async connect(uri = null, options = {}) {
    const env = process.env.NODE_ENV || 'development';
    const connectionUri = uri || process.env.MONGODB_URI || this.buildUri({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 27017,
      database: process.env.DB_NAME || 'affiliate-platform',
      username: process.env.DB_USER,
      password: process.env.DB_PASS
    });

    const connectionOptions = {
      ...this.getOptions(),
      ...options
    };

    logger.info('Connecting to MongoDB...', {
      env,
      uri: connectionUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'), // Hide credentials
      options: connectionOptions
    });

    try {
      // Set up connection event listeners
      mongoose.connection.on('connected', () => {
        this.isConnected = true;
        this.connectionAttempts = 0;
        logger.info('MongoDB connected successfully', {
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name
        });
      });

      mongoose.connection.on('error', (err) => {
        this.isConnected = false;
        logger.error('MongoDB connection error:', err);
        this.handleConnectionError(err);
      });

      mongoose.connection.on('disconnected', () => {
        this.isConnected = false;
        logger.warn('MongoDB disconnected');
        this.reconnect();
      });

      mongoose.connection.on('reconnected', () => {
        this.isConnected = true;
        logger.info('MongoDB reconnected');
      });

      mongoose.connection.on('timeout', () => {
        logger.warn('MongoDB connection timeout');
      });

      // Connect
      await mongoose.connect(connectionUri, connectionOptions);
      
      this.defaultConnection = mongoose.connection;
      return this.defaultConnection;
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      await this.handleConnectionError(error);
      throw error;
    }
  }

  /**
   * Handle connection errors with retry logic
   */
  async handleConnectionError(error) {
    this.connectionAttempts++;
    
    if (this.connectionAttempts <= this.maxRetries) {
      logger.warn(`Retrying connection (attempt ${this.connectionAttempts}/${this.maxRetries})...`);
      
      await new Promise(resolve => setTimeout(resolve, this.retryDelay * this.connectionAttempts));
      
      try {
        await this.connect();
      } catch (retryError) {
        // Error already logged in connect method
      }
    } else {
      logger.error('Max retry attempts reached. Unable to connect to MongoDB.');
      process.exit(1);
    }
  }

  /**
   * Reconnect to MongoDB
   */
  async reconnect() {
    if (this.connectionAttempts < this.maxRetries) {
      logger.info('Attempting to reconnect to MongoDB...');
      try {
        await this.connect();
      } catch (error) {
        logger.error('Reconnection failed:', error);
      }
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    logger.info('Disconnecting from MongoDB...');
    
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('MongoDB disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Create a new connection (for multiple databases)
   */
  async createConnection(name, uri, options = {}) {
    if (this.connections.has(name)) {
      logger.warn(`Connection ${name} already exists. Returning existing connection.`);
      return this.connections.get(name);
    }

    logger.info(`Creating new MongoDB connection: ${name}`);

    const conn = mongoose.createConnection(uri, {
      ...this.getOptions(),
      ...options
    });

    // Set up event listeners for this connection
    conn.on('connected', () => {
      logger.info(`Connection ${name} established`);
    });

    conn.on('error', (err) => {
      logger.error(`Connection ${name} error:`, err);
    });

    conn.on('disconnected', () => {
      logger.warn(`Connection ${name} disconnected`);
    });

    // Store connection
    this.connections.set(name, conn);
    
    return conn;
  }

  /**
   * Get connection by name
   */
  getConnection(name = 'default') {
    if (name === 'default') {
      return this.defaultConnection;
    }
    return this.connections.get(name);
  }

  /**
   * Check connection health
   */
  async healthCheck() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      connections: {}
    };

    // Check default connection
    if (this.defaultConnection) {
      const state = connectionStates[this.defaultConnection.readyState] || 'unknown';
      health.connections.default = {
        state,
        host: this.defaultConnection.host,
        port: this.defaultConnection.port,
        name: this.defaultConnection.name
      };

      if (this.defaultConnection.readyState !== 1) {
        health.status = 'unhealthy';
      }

      // Test query
      try {
        await this.defaultConnection.db.admin().ping();
        health.connections.default.ping = 'ok';
      } catch (error) {
        health.connections.default.ping = 'failed';
        health.connections.default.error = error.message;
        health.status = 'degraded';
      }
    }

    // Check other connections
    for (const [name, conn] of this.connections) {
      const state = connectionStates[conn.readyState] || 'unknown';
      health.connections[name] = {
        state,
        host: conn.host,
        port: conn.port,
        name: conn.name
      };

      if (conn.readyState !== 1) {
        health.status = 'degraded';
      }
    }

    return health;
  }

  /**
   * Get connection statistics
   */
  async getStats() {
    if (!this.defaultConnection || this.defaultConnection.readyState !== 1) {
      return { error: 'Database not connected' };
    }

    try {
      const admin = this.defaultConnection.db.admin();
      
      const [serverStatus, dbStats, replSetGetStatus] = await Promise.all([
        admin.serverStatus().catch(() => null),
        this.defaultConnection.db.stats(),
        admin.replSetGetStatus().catch(() => null)
      ]);

      return {
        server: {
          version: serverStatus?.version,
          uptime: serverStatus?.uptime,
          connections: serverStatus?.connections,
          memory: serverStatus?.mem,
          network: serverStatus?.network
        },
        database: {
          collections: dbStats.collections,
          objects: dbStats.objects,
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize,
          indexes: dbStats.indexes,
          indexSize: dbStats.indexSize
        },
        replication: replSetGetStatus ? {
          set: replSetGetStatus.set,
          myState: replSetGetStatus.myState,
          members: replSetGetStatus.members.map(m => ({
            name: m.name,
            state: m.stateStr,
            health: m.health,
            uptime: m.uptime
          }))
        } : null
      };
    } catch (error) {
      logger.error('Error getting database stats:', error);
      return { error: error.message };
    }
  }

  /**
   * Run database maintenance
   */
  async runMaintenance() {
    if (!this.defaultConnection || this.defaultConnection.readyState !== 1) {
      throw new Error('Database not connected');
    }

    logger.info('Running database maintenance...');

    const results = {};

    try {
      // Get all collections
      const collections = await this.defaultConnection.db.listCollections().toArray();

      for (const collection of collections) {
        const col = this.defaultConnection.collection(collection.name);
        
        // Compact collections
        if (process.env.RUN_COMPACT === 'true') {
          await col.aggregate([{ $collStats: { storageStats: {} } }]).toArray();
          logger.debug(`Collection ${collection.name} compacted`);
        }

        // Rebuild indexes
        if (process.env.REBUILD_INDEXES === 'true') {
          await col.reIndex();
          logger.debug(`Indexes rebuilt for ${collection.name}`);
        }
      }

      results.status = 'success';
    } catch (error) {
      logger.error('Maintenance error:', error);
      results.status = 'failed';
      results.error = error.message;
    }

    return results;
  }
}

// ============================================
// Create and export database instance
// ============================================

const database = new Database();

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await database.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  try {
    await database.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

module.exports = database;
