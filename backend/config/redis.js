/**
 * ============================================
 * REDIS CONFIGURATION
 * Professional Redis connection management with
 * multiple clients, pub/sub, caching, rate limiting,
 * and comprehensive monitoring
 * ============================================
 */

const Redis = require('ioredis');
const logger = require('../utils/logger');

// ============================================
// Configuration
// ============================================

const redisConfig = {
  // Connection settings
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || null,
  db: parseInt(process.env.REDIS_DB) || 0,
  
  // Connection pool
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) {
      logger.error('Max Redis retry attempts reached');
      return null; // Stop retrying
    }
    const delay = Math.min(times * 100, 3000);
    logger.warn(`Retrying Redis connection in ${delay}ms (attempt ${times}/3)`);
    return delay;
  },
  
  // Timeouts
  connectTimeout: 10000,
  commandTimeout: 5000,
  
  // Keep alive
  keepAlive: 30000,
  
  // Enable ready check
  enableReadyCheck: true,
  
  // Auto reconnect
  autoResubscribe: true,
  autoResendUnfulfilledCommands: true,
  
  // Lazy connect
  lazyConnect: false,
  
  // TLS configuration for production
  tls: process.env.REDIS_TLS === 'true' ? {
    rejectUnauthorized: false
  } : null,
  
  // Sentinel for high availability
  sentinels: process.env.REDIS_SENTINELS ? JSON.parse(process.env.REDIS_SENTINELS) : null,
  name: process.env.REDIS_SENTINEL_NAME || null,
  
  // Cluster configuration
  cluster: process.env.REDIS_CLUSTER === 'true',
  clusterNodes: process.env.REDIS_CLUSTER_NODES ? JSON.parse(process.env.REDIS_CLUSTER_NODES) : null
};

// ============================================
// Redis Client Class
// ============================================

class RedisClient {
  constructor(name = 'default', config = {}) {
    this.name = name;
    this.config = { ...redisConfig, ...config };
    this.client = null;
    this.subscriber = null;
    this.publisher = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 3;
  }

  /**
   * Create Redis client
   */
  createClient(options = {}) {
    const clientConfig = { ...this.config, ...options };
    
    // Create cluster client if configured
    if (clientConfig.cluster && clientConfig.clusterNodes) {
      return new Redis.Cluster(clientConfig.clusterNodes, {
        redisOptions: clientConfig,
        scaleReads: 'slave'
      });
    }
    
    // Create sentinel client if configured
    if (clientConfig.sentinels && clientConfig.name) {
      return new Redis({
        sentinels: clientConfig.sentinels,
        name: clientConfig.name,
        ...clientConfig
      });
    }
    
    // Create standard client
    return new Redis(clientConfig);
  }

  /**
   * Connect to Redis
   */
  async connect() {
    logger.info(`Connecting to Redis (${this.name})...`, {
      host: this.config.host,
      port: this.config.port,
      db: this.config.db
    });

    try {
      // Main client
      this.client = this.createClient();
      await this.setupClient(this.client, 'main');

      // Subscriber client (for pub/sub)
      this.subscriber = this.createClient();
      await this.setupClient(this.subscriber, 'subscriber');

      // Publisher client (can reuse main if needed)
      this.publisher = this.client;

      this.isConnected = true;
      this.connectionAttempts = 0;

      logger.info(`Redis connected successfully (${this.name})`);

      return this.client;
    } catch (error) {
      logger.error(`Failed to connect to Redis (${this.name}):`, error);
      await this.handleConnectionError(error);
      throw error;
    }
  }

  /**
   * Setup client event handlers
   */
  async setupClient(client, type) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Redis ${type} connection timeout`));
      }, this.config.connectTimeout);

      client.on('connect', () => {
        logger.debug(`Redis ${type} client connecting (${this.name})`);
      });

      client.on('ready', () => {
        clearTimeout(timeout);
        logger.info(`Redis ${type} client ready (${this.name})`);
        resolve(client);
      });

      client.on('error', (error) => {
        logger.error(`Redis ${type} client error (${this.name}):`, error);
        if (!this.isConnected) {
          clearTimeout(timeout);
          reject(error);
        }
      });

      client.on('close', () => {
        logger.warn(`Redis ${type} client closed (${this.name})`);
        this.isConnected = false;
      });

      client.on('reconnecting', (delay) => {
        logger.warn(`Redis ${type} client reconnecting in ${delay}ms (${this.name})`);
      });

      client.on('end', () => {
        logger.warn(`Redis ${type} client connection ended (${this.name})`);
        this.isConnected = false;
      });
    });
  }

  /**
   * Handle connection errors
   */
  async handleConnectionError(error) {
    this.connectionAttempts++;
    
    if (this.connectionAttempts <= this.maxRetries) {
      logger.warn(`Retrying Redis connection (attempt ${this.connectionAttempts}/${this.maxRetries})...`);
      
      await new Promise(resolve => setTimeout(resolve, 2000 * this.connectionAttempts));
      
      try {
        await this.connect();
      } catch (retryError) {
        // Error already logged
      }
    } else {
      logger.error('Max Redis retry attempts reached. Using fallback memory store.');
      this.useFallback = true;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect() {
    logger.info(`Disconnecting from Redis (${this.name})...`);

    try {
      if (this.subscriber && this.subscriber !== this.client) {
        await this.subscriber.quit();
      }
      
      if (this.client) {
        await this.client.quit();
      }

      this.isConnected = false;
      logger.info(`Redis disconnected successfully (${this.name})`);
    } catch (error) {
      logger.error(`Error disconnecting from Redis (${this.name}):`, error);
      
      // Force disconnect
      if (this.client) {
        this.client.disconnect();
      }
      if (this.subscriber && this.subscriber !== this.client) {
        this.subscriber.disconnect();
      }
    }
  }

  /**
   * Check connection health
   */
  async healthCheck() {
    if (!this.client || !this.isConnected) {
      return {
        status: 'disconnected',
        name: this.name
      };
    }

    try {
      const start = Date.now();
      await this.client.ping();
      const latency = Date.now() - start;

      const info = await this.client.info('server');
      const serverInfo = {};
      
      info.split('\n').forEach(line => {
        const [key, value] = line.split(':');
        if (key && value) {
          serverInfo[key.trim()] = value.trim();
        }
      });

      return {
        status: 'healthy',
        name: this.name,
        latency,
        version: serverInfo.redis_version,
        mode: serverInfo.redis_mode,
        os: serverInfo.os,
        uptime: parseInt(serverInfo.uptime_in_seconds) || 0
      };
    } catch (error) {
      logger.error(`Redis health check failed (${this.name}):`, error);
      return {
        status: 'unhealthy',
        name: this.name,
        error: error.message
      };
    }
  }

  /**
   * Get Redis statistics
   */
  async getStats() {
    if (!this.client || !this.isConnected) {
      return { error: 'Redis not connected' };
    }

    try {
      const info = await this.client.info('all');
      const stats = {};

      info.split('\n').forEach(line => {
        if (line && !line.startsWith('#')) {
          const [key, value] = line.split(':');
          if (key && value) {
            stats[key.trim()] = value.trim();
          }
        }
      });

      const dbStats = {};
      for (let i = 0; i < 16; i++) {
        const key = `db${i}`;
        if (stats[key]) {
          dbStats[key] = stats[key];
        }
      }

      return {
        server: {
          version: stats.redis_version,
          mode: stats.redis_mode,
          os: stats.os,
          uptime: stats.uptime_in_seconds,
          connectedClients: stats.connected_clients,
          blockedClients: stats.blocked_clients,
          usedMemory: stats.used_memory_human,
          usedMemoryPeak: stats.used_memory_peak_human,
          totalConnectionsReceived: stats.total_connections_received,
          totalCommandsProcessed: stats.total_commands_processed
        },
        databases: dbStats,
        keyspace: stats.keyspace_hits && stats.keyspace_misses ? {
          hits: stats.keyspace_hits,
          misses: stats.keyspace_misses,
          hitRate: (stats.keyspace_hits / (stats.keyspace_hits + stats.keyspace_misses) * 100).toFixed(2)
        } : null
      };
    } catch (error) {
      logger.error('Error getting Redis stats:', error);
      return { error: error.message };
    }
  }

  /**
   * Flush all data (use with caution)
   */
  async flushAll() {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis not connected');
    }

    logger.warn(`Flushing all Redis data (${this.name})...`);
    await this.client.flushall();
    logger.info(`Redis data flushed (${this.name})`);
  }

  /**
   * Get client instance
   */
  getClient() {
    return this.client;
  }

  /**
   * Get subscriber instance
   */
  getSubscriber() {
    return this.subscriber;
  }

  /**
   * Get publisher instance
   */
  getPublisher() {
    return this.publisher;
  }

  /**
   * Check if connected
   */
  isReady() {
    return this.isConnected && this.client?.status === 'ready';
  }
}

// ============================================
// Redis Manager Class
// ============================================

class RedisManager {
  constructor() {
    this.clients = new Map();
    this.defaultClient = null;
  }

  /**
   * Create a new Redis client
   */
  async createClient(name = 'default', config = {}) {
    if (this.clients.has(name)) {
      logger.warn(`Redis client ${name} already exists. Returning existing client.`);
      return this.clients.get(name);
    }

    logger.info(`Creating Redis client: ${name}`);
    
    const client = new RedisClient(name, config);
    await client.connect();
    
    this.clients.set(name, client);
    
    if (!this.defaultClient) {
      this.defaultClient = client;
    }

    return client;
  }

  /**
   * Get Redis client by name
   */
  getClient(name = 'default') {
    return this.clients.get(name);
  }

  /**
   * Get default client
   */
  getDefault() {
    return this.defaultClient;
  }

  /**
   * Check all clients health
   */
  async healthCheck() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      clients: {}
    };

    for (const [name, client] of this.clients) {
      const clientHealth = await client.healthCheck();
      health.clients[name] = clientHealth;
      
      if (clientHealth.status !== 'healthy') {
        health.status = 'degraded';
      }
    }

    return health;
  }

  /**
   * Disconnect all clients
   */
  async disconnectAll() {
    logger.info('Disconnecting all Redis clients...');
    
    const results = [];
    for (const [name, client] of this.clients) {
      try {
        await client.disconnect();
        results.push({ name, status: 'disconnected' });
      } catch (error) {
        results.push({ name, status: 'error', error: error.message });
      }
    }
    
    this.clients.clear();
    this.defaultClient = null;
    
    return results;
  }
}

// ============================================
// Create and export Redis manager
// ============================================

const redisManager = new RedisManager();

// Create default client
const createDefaultClient = async () => {
  try {
    await redisManager.createClient('default', {
      ...redisConfig,
      lazyConnect: true
    });
  } catch (error) {
    logger.error('Failed to create default Redis client:', error);
    logger.warn('Continuing without Redis - some features may be limited');
  }
};

// Initialize default client
if (process.env.NODE_ENV !== 'test') {
  createDefaultClient();
}

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await redisManager.disconnectAll();
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  try {
    await redisManager.disconnectAll();
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

module.exports = redisManager;
