// Storage types
export const STORAGE_TYPES = {
  LOCAL: 'local',
  SESSION: 'session',
  MEMORY: 'memory',
  INDEXED_DB: 'indexed_db',
  COOKIE: 'cookie',
  CACHE: 'cache'
};

// Storage priorities
export const STORAGE_PRIORITIES = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3
};

// Data types
export const DATA_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  OBJECT: 'object',
  ARRAY: 'array',
  DATE: 'date',
  BLOB: 'blob',
  FILE: 'file'
};

// Serialization formats
export const SERIALIZATION_FORMATS = {
  JSON: 'json',
  BASE64: 'base64',
  BINARY: 'binary',
  CUSTOM: 'custom'
};

// Compression algorithms
export const COMPRESSION_ALGORITHMS = {
  NONE: 'none',
  GZIP: 'gzip',
  DEFLATE: 'deflate',
  LZ77: 'lz77'
};

// Encryption algorithms
export const ENCRYPTION_ALGORITHMS = {
  NONE: 'none',
  AES: 'aes',
  DES: 'des',
  RSA: 'rsa'
};

// Storage quotas (in bytes)
export const STORAGE_QUOTAS = {
  [STORAGE_TYPES.LOCAL]: 5 * 1024 * 1024, // 5MB
  [STORAGE_TYPES.SESSION]: 5 * 1024 * 1024, // 5MB
  [STORAGE_TYPES.MEMORY]: 50 * 1024 * 1024, // 50MB
  [STORAGE_TYPES.INDEXED_DB]: 500 * 1024 * 1024, // 500MB
  [STORAGE_TYPES.COOKIE]: 4 * 1024, // 4KB
  [STORAGE_TYPES.CACHE]: 100 * 1024 * 1024 // 100MB
};

// Default expiry times (in milliseconds)
export const DEFAULT_EXPIRY = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 60 * 60 * 1000, // 1 hour
  LONG: 24 * 60 * 60 * 1000, // 1 day
  VERY_LONG: 7 * 24 * 60 * 60 * 1000, // 1 week
  PERMANENT: null // No expiry
};

// Storage events
export const STORAGE_EVENTS = {
  SET: 'storage:set',
  GET: 'storage:get',
  REMOVE: 'storage:remove',
  CLEAR: 'storage:clear',
  EXPIRED: 'storage:expired',
  QUOTA_EXCEEDED: 'storage:quota_exceeded',
  ERROR: 'storage:error'
};

// Base Storage Class
class BaseStorage {
  constructor(options = {}) {
    this.type = options.type || STORAGE_TYPES.MEMORY;
    this.prefix = options.prefix || 'app_';
    this.encryption = options.encryption || ENCRYPTION_ALGORITHMS.NONE;
    this.compression = options.compression || COMPRESSION_ALGORITHMS.NONE;
    this.serialization = options.serialization || SERIALIZATION_FORMATS.JSON;
    this.defaultExpiry = options.defaultExpiry || DEFAULT_EXPIRY.MEDIUM;
    this.maxSize = options.maxSize || STORAGE_QUOTAS[this.type];
    this.priority = options.priority || STORAGE_PRIORITIES.MEDIUM;
    this.encryptionKey = options.encryptionKey || null;
    this.compressionLevel = options.compressionLevel || 6;
    this.enableCache = options.enableCache !== false;
    this.enableCompression = options.enableCompression !== false;
    this.enableEncryption = options.enableEncryption !== false;
    this.enableExpiry = options.enableExpiry !== false;
    
    this.cache = new Map();
    this.listeners = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      removes: 0,
      clears: 0,
      size: 0,
      items: 0
    };
  }

  // Generate key with prefix
  getKey(key) {
    return `${this.prefix}${key}`;
  }

  // Serialize data
  serialize(data) {
    switch (this.serialization) {
      case SERIALIZATION_FORMATS.JSON:
        return JSON.stringify(data);
      case SERIALIZATION_FORMATS.BASE64:
        return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
      default:
        return data;
    }
  }

  // Deserialize data
  deserialize(data) {
    if (!data) return null;
    
    switch (this.serialization) {
      case SERIALIZATION_FORMATS.JSON:
        return JSON.parse(data);
      case SERIALIZATION_FORMATS.BASE64:
        return JSON.parse(decodeURIComponent(escape(atob(data))));
      default:
        return data;
    }
  }

  // Compress data
  compress(data) {
    if (!this.enableCompression || this.compression === COMPRESSION_ALGORITHMS.NONE) {
      return data;
    }
    
    // Simple compression simulation (implement actual compression)
    return data;
  }

  // Decompress data
  decompress(data) {
    if (!this.enableCompression || this.compression === COMPRESSION_ALGORITHMS.NONE) {
      return data;
    }
    
    // Simple decompression simulation (implement actual decompression)
    return data;
  }

  // Encrypt data
  encrypt(data) {
    if (!this.enableEncryption || this.encryption === ENCRYPTION_ALGORITHMS.NONE) {
      return data;
    }
    
    // Simple encryption simulation (implement actual encryption)
    return data;
  }

  // Decrypt data
  decrypt(data) {
    if (!this.enableEncryption || this.encryption === ENCRYPTION_ALGORITHMS.NONE) {
      return data;
    }
    
    // Simple decryption simulation (implement actual decryption)
    return data;
  }

  // Prepare data for storage
  prepareForStorage(value, expiry = null) {
    const data = {
      value: this.serialize(value),
      type: typeof value,
      timestamp: Date.now(),
      expiry: expiry || this.defaultExpiry ? Date.now() + this.defaultExpiry : null,
      compressed: this.enableCompression,
      encrypted: this.enableEncryption,
      size: new Blob([JSON.stringify(value)]).size
    };
    
    let processed = JSON.stringify(data);
    
    if (this.enableCompression) {
      processed = this.compress(processed);
    }
    
    if (this.enableEncryption) {
      processed = this.encrypt(processed);
    }
    
    return processed;
  }

  // Parse data from storage
  parseFromStorage(stored) {
    try {
      let processed = stored;
      
      if (this.enableEncryption) {
        processed = this.decrypt(processed);
      }
      
      if (this.enableCompression) {
        processed = this.decompress(processed);
      }
      
      const data = JSON.parse(processed);
      
      // Check expiry
      if (this.enableExpiry && data.expiry && Date.now() > data.expiry) {
        this.emit(STORAGE_EVENTS.EXPIRED, { key: data.key });
        return null;
      }
      
      return this.deserialize(data.value);
    } catch (error) {
      this.emit(STORAGE_EVENTS.ERROR, { error });
      return null;
    }
  }

  // Check if key exists
  has(key) {
    return this.cache.has(this.getKey(key));
  }

  // Get item size
  getSize(key) {
    const item = this.cache.get(this.getKey(key));
    return item ? item.size : 0;
  }

  // Get storage stats
  getStats() {
    return { ...this.stats };
  }

  // Clear stats
  clearStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      removes: 0,
      clears: 0,
      size: 0,
      items: 0
    };
  }

  // Add event listener
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
  }

  // Remove event listener
  off(event, handler) {
    if (this.listeners.has(event)) {
      const handlers = this.listeners.get(event).filter(h => h !== handler);
      if (handlers.length > 0) {
        this.listeners.set(event, handlers);
      } else {
        this.listeners.delete(event);
      }
    }
  }

  // Emit event
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Event handler error:', error);
        }
      });
    }
  }

  // Check quota
  checkQuota(size) {
    if (this.stats.size + size > this.maxSize) {
      this.emit(STORAGE_EVENTS.QUOTA_EXCEEDED, { 
        current: this.stats.size,
        required: size,
        max: this.maxSize 
      });
      return false;
    }
    return true;
  }

  // Update stats
  updateStats(type, size = 0) {
    switch (type) {
      case 'hit':
        this.stats.hits++;
        break;
      case 'miss':
        this.stats.misses++;
        break;
      case 'set':
        this.stats.sets++;
        this.stats.items++;
        this.stats.size += size;
        break;
      case 'remove':
        this.stats.removes++;
        this.stats.items--;
        this.stats.size -= size;
        break;
      case 'clear':
        this.stats.clears++;
        this.stats.items = 0;
        this.stats.size = 0;
        break;
    }
  }
  }
// Memory Storage
class MemoryStorage extends BaseStorage {
  constructor(options = {}) {
    super({ ...options, type: STORAGE_TYPES.MEMORY });
    this.storage = new Map();
  }

  async set(key, value, expiry = null) {
    try {
      const storageKey = this.getKey(key);
      const processed = this.prepareForStorage(value, expiry);
      const size = new Blob([processed]).size;
      
      if (!this.checkQuota(size)) {
        return false;
      }
      
      this.storage.set(storageKey, processed);
      this.cache.set(storageKey, { value, expiry, size });
      this.updateStats('set', size);
      this.emit(STORAGE_EVENTS.SET, { key, value, expiry });
      
      return true;
    } catch (error) {
      this.emit(STORAGE_EVENTS.ERROR, { error });
      return false;
    }
  }

  async get(key) {
    try {
      const storageKey = this.getKey(key);
      const stored = this.storage.get(storageKey);
      
      if (!stored) {
        this.updateStats('miss');
        return null;
      }
      
      const value = this.parseFromStorage(stored);
      
      if (value === null) {
        this.storage.delete(storageKey);
        this.cache.delete(storageKey);
      } else {
        this.updateStats('hit');
      }
      
      return value;
    } catch (error) {
      this.emit(STORAGE_EVENTS.ERROR, { error });
      return null;
    }
  }

  async remove(key) {
    const storageKey = this.getKey(key);
    const size = this.getSize(key);
    this.storage.delete(storageKey);
    this.cache.delete(storageKey);
    this.updateStats('remove', size);
    this.emit(STORAGE_EVENTS.REMOVE, { key });
    return true;
  }

  async clear() {
    this.storage.clear();
    this.cache.clear();
    this.updateStats('clear');
    this.emit(STORAGE_EVENTS.CLEAR, {});
    return true;
  }

  async keys() {
    return Array.from(this.storage.keys())
      .map(key => key.replace(this.prefix, ''));
  }

  async length() {
    return this.storage.size;
  }
}

// Local Storage
class LocalStorage extends BaseStorage {
  constructor(options = {}) {
    super({ ...options, type: STORAGE_TYPES.LOCAL });
    this.storage = window.localStorage;
    this.init();
  }

  init() {
    // Load existing items into cache
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key.startsWith(this.prefix)) {
        try {
          const value = this.storage.getItem(key);
          const size = new Blob([value]).size;
          this.cache.set(key, { size });
          this.stats.size += size;
          this.stats.items++;
        } catch (error) {
          console.error('Failed to load storage item:', error);
        }
      }
    }
  }

  async set(key, value, expiry = null) {
    try {
      const storageKey = this.getKey(key);
      const processed = this.prepareForStorage(value, expiry);
      const size = new Blob([processed]).size;
      
      if (!this.checkQuota(size)) {
        return false;
      }
      
      this.storage.setItem(storageKey, processed);
      this.cache.set(storageKey, { size });
      this.updateStats('set', size);
      this.emit(STORAGE_EVENTS.SET, { key, value, expiry });
      
      return true;
    } catch (error) {
      this.emit(STORAGE_EVENTS.ERROR, { error });
      return false;
    }
  }

  async get(key) {
    try {
      const storageKey = this.getKey(key);
      const stored = this.storage.getItem(storageKey);
      
      if (!stored) {
        this.updateStats('miss');
        return null;
      }
      
      const value = this.parseFromStorage(stored);
      
      if (value === null) {
        this.storage.removeItem(storageKey);
        this.cache.delete(storageKey);
      } else {
        this.updateStats('hit');
      }
      
      return value;
    } catch (error) {
      this.emit(STORAGE_EVENTS.ERROR, { error });
      return null;
    }
  }

  async remove(key) {
    const storageKey = this.getKey(key);
    const size = this.getSize(key);
    this.storage.removeItem(storageKey);
    this.cache.delete(storageKey);
    this.updateStats('remove', size);
    this.emit(STORAGE_EVENTS.REMOVE, { key });
    return true;
  }

  async clear() {
    const keys = await this.keys();
    for (const key of keys) {
      await this.remove(key);
    }
    this.updateStats('clear');
    this.emit(STORAGE_EVENTS.CLEAR, {});
    return true;
  }

  async keys() {
    const keys = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ''));
      }
    }
    return keys;
  }

  async length() {
    return (await this.keys()).length;
  }
}

// Session Storage
class SessionStorage extends BaseStorage {
  constructor(options = {}) {
    super({ ...options, type: STORAGE_TYPES.SESSION });
    this.storage = window.sessionStorage;
    this.init();
  }

  init() {
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key.startsWith(this.prefix)) {
        try {
          const value = this.storage.getItem(key);
          const size = new Blob([value]).size;
          this.cache.set(key, { size });
          this.stats.size += size;
          this.stats.items++;
        } catch (error) {
          console.error('Failed to load storage item:', error);
        }
      }
    }
  }

  async set(key, value, expiry = null) {
    try {
      const storageKey = this.getKey(key);
      const processed = this.prepareForStorage(value, expiry);
      const size = new Blob([processed]).size;
      
      if (!this.checkQuota(size)) {
        return false;
      }
      
      this.storage.setItem(storageKey, processed);
      this.cache.set(storageKey, { size });
      this.updateStats('set', size);
      this.emit(STORAGE_EVENTS.SET, { key, value, expiry });
      
      return true;
    } catch (error) {
      this.emit(STORAGE_EVENTS.ERROR, { error });
      return false;
    }
  }

  async get(key) {
    try {
      const storageKey = this.getKey(key);
      const stored = this.storage.getItem(storageKey);
      
      if (!stored) {
        this.updateStats('miss');
        return null;
      }
      
      const value = this.parseFromStorage(stored);
      
      if (value === null) {
        this.storage.removeItem(storageKey);
        this.cache.delete(storageKey);
      } else {
        this.updateStats('hit');
      }
      
      return value;
    } catch (error) {
      this.emit(STORAGE_EVENTS.ERROR, { error });
      return null;
    }
  }

  async remove(key) {
    const storageKey = this.getKey(key);
    const size = this.getSize(key);
    this.storage.removeItem(storageKey);
    this.cache.delete(storageKey);
    this.updateStats('remove', size);
    this.emit(STORAGE_EVENTS.REMOVE, { key });
    return true;
  }

  async clear() {
    const keys = await this.keys();
    for (const key of keys) {
      await this.remove(key);
    }
    this.updateStats('clear');
    this.emit(STORAGE_EVENTS.CLEAR, {});
    return true;
  }

  async keys() {
    const keys = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ''));
      }
    }
    return keys;
  }

  async length() {
    return (await this.keys()).length;
  }
}

// Cookie Storage
class CookieStorage extends BaseStorage {
  constructor(options = {}) {
    super({ ...options, type: STORAGE_TYPES.COOKIE });
    this.path = options.path || '/';
    this.domain = options.domain || '';
    this.secure = options.secure || window.location.protocol === 'https:';
    this.sameSite = options.sameSite || 'Lax';
    this.init();
  }

  init() {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (key.startsWith(this.prefix)) {
        try {
          const size = new Blob([value]).size;
          this.cache.set(key, { size });
          this.stats.size += size;
          this.stats.items++;
        } catch (error) {
          console.error('Failed to load cookie:', error);
        }
      }
    }
  }

  async set(key, value, expiry = null) {
    try {
      const cookieKey = this.getKey(key);
      const processed = this.prepareForStorage(value, expiry);
      const size = new Blob([processed]).size;
      
      if (!this.checkQuota(size)) {
        return false;
      }
      
      let cookie = `${cookieKey}=${encodeURIComponent(processed)}`;
      cookie += `; path=${this.path}`;
      
      if (this.domain) {
        cookie += `; domain=${this.domain}`;
      }
      
      if (this.secure) {
        cookie += '; secure';
      }
      
      cookie += `; samesite=${this.sameSite}`;
      
      const expiryDate = expiry || this.defaultExpiry;
      if (expiryDate) {
        const date = new Date(Date.now() + expiryDate);
        cookie += `; expires=${date.toUTCString()}`;
      }
      
      document.cookie = cookie;
      this.cache.set(cookieKey, { size });
      this.updateStats('set', size);
      this.emit(STORAGE_EVENTS.SET, { key, value, expiry });
      
      return true;
    } catch (error) {
      this.emit(STORAGE_EVENTS.ERROR, { error });
      return false;
    }
  }

  async get(key) {
    try {
      const cookieKey = this.getKey(key);
      const cookies = document.cookie.split('; ');
      
      for (const cookie of cookies) {
        const [ckey, cvalue] = cookie.split('=');
        if (ckey === cookieKey) {
          const value = this.parseFromStorage(decodeURIComponent(cvalue));
          
          if (value === null) {
            await this.remove(key);
          } else {
            this.updateStats('hit');
          }
          
          return value;
        }
      }
      
      this.updateStats('miss');
      return null;
    } catch (error) {
      this.emit(STORAGE_EVENTS.ERROR, { error });
      return null;
    }
  }

  async remove(key) {
    const cookieKey = this.getKey(key);
    const size = this.getSize(key);
    
    document.cookie = `${cookieKey}=; path=${this.path}; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
    
    this.cache.delete(cookieKey);
    this.updateStats('remove', size);
    this.emit(STORAGE_EVENTS.REMOVE, { key });
    
    return true;
  }

  async clear() {
    const keys = await this.keys();
    for (const key of keys) {
      await this.remove(key);
    }
    this.updateStats('clear');
    this.emit(STORAGE_EVENTS.CLEAR, {});
    return true;
  }

  async keys() {
    const keys = [];
    const cookies = document.cookie.split('; ');
    
    for (const cookie of cookies) {
      const [key] = cookie.split('=');
      if (key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ''));
      }
    }
    
    return keys;
  }

  async length() {
    return (await this.keys()).length;
  }
  }
// IndexedDB Storage
class IndexedDBStorage extends BaseStorage {
  constructor(options = {}) {
    super({ ...options, type: STORAGE_TYPES.INDEXED_DB });
    this.dbName = options.dbName || 'AppStorage';
    this.storeName = options.storeName || 'keyvaluepairs';
    this.version = options.version || 1;
    this.db = null;
    this.initPromise = this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => {
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        this.loadCache();
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async loadCache() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onerror = () => {
        reject(request.error);
      };
      
      request.onsuccess = () => {
        const items = request.result;
        items.forEach(item => {
          const size = new Blob([JSON.stringify(item)]).size;
          this.cache.set(item.key, { size });
          this.stats.size += size;
          this.stats.items++;
        });
        resolve();
      };
    });
  }

  async set(key, value, expiry = null) {
    await this.initPromise;
    
    return new Promise((resolve, reject) => {
      const storageKey = this.getKey(key);
      const processed = this.prepareForStorage(value, expiry);
      const size = new Blob([processed]).size;
      
      if (!this.checkQuota(size)) {
        resolve(false);
        return;
      }
      
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(processed, storageKey);
      
      request.onerror = () => {
        this.emit(STORAGE_EVENTS.ERROR, { error: request.error });
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.cache.set(storageKey, { size });
        this.updateStats('set', size);
        this.emit(STORAGE_EVENTS.SET, { key, value, expiry });
        resolve(true);
      };
    });
  }

  async get(key) {
    await this.initPromise;
    
    return new Promise((resolve, reject) => {
      const storageKey = this.getKey(key);
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(storageKey);
      
      request.onerror = () => {
        reject(request.error);
      };
      
      request.onsuccess = async () => {
        if (!request.result) {
          this.updateStats('miss');
          resolve(null);
          return;
        }
        
        const value = this.parseFromStorage(request.result);
        
        if (value === null) {
          await this.remove(key);
        } else {
          this.updateStats('hit');
        }
        
        resolve(value);
      };
    });
  }

  async remove(key) {
    await this.initPromise;
    
    return new Promise((resolve, reject) => {
      const storageKey = this.getKey(key);
      const size = this.getSize(key);
      
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(storageKey);
      
      request.onerror = () => {
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.cache.delete(storageKey);
        this.updateStats('remove', size);
        this.emit(STORAGE_EVENTS.REMOVE, { key });
        resolve(true);
      };
    });
  }

  async clear() {
    await this.initPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      
      request.onerror = () => {
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.cache.clear();
        this.updateStats('clear');
        this.emit(STORAGE_EVENTS.CLEAR, {});
        resolve(true);
      };
    });
  }

  async keys() {
    await this.initPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();
      
      request.onerror = () => {
        reject(request.error);
      };
      
      request.onsuccess = () => {
        const keys = request.result
          .filter(key => key.startsWith(this.prefix))
          .map(key => key.replace(this.prefix, ''));
        resolve(keys);
      };
    });
  }

  async length() {
    const keys = await this.keys();
    return keys.length;
  }
}

// Storage Service Class
class StorageService {
  constructor() {
    this.storages = new Map();
    this.defaultStorage = null;
  }

  // Register storage
  register(type, storage, setDefault = false) {
    this.storages.set(type, storage);
    if (setDefault) {
      this.defaultStorage = storage;
    }
    return this;
  }

  // Get storage by type
  getStorage(type) {
    return this.storages.get(type) || this.defaultStorage;
  }

  // Create storage instance
  createStorage(type, options = {}) {
    let storage;
    
    switch (type) {
      case STORAGE_TYPES.MEMORY:
        storage = new MemoryStorage(options);
        break;
      case STORAGE_TYPES.LOCAL:
        storage = new LocalStorage(options);
        break;
      case STORAGE_TYPES.SESSION:
        storage = new SessionStorage(options);
        break;
      case STORAGE_TYPES.COOKIE:
        storage = new CookieStorage(options);
        break;
      case STORAGE_TYPES.INDEXED_DB:
        storage = new IndexedDBStorage(options);
        break;
      default:
        throw new Error(`Unknown storage type: ${type}`);
    }
    
    this.register(type, storage);
    return storage;
  }

  // Initialize default storages
  initialize(options = {}) {
    // Create memory storage (always available)
    this.createStorage(STORAGE_TYPES.MEMORY, options);
    
    // Create local storage if available
    if (this.isStorageAvailable(STORAGE_TYPES.LOCAL)) {
      this.createStorage(STORAGE_TYPES.LOCAL, options);
      this.defaultStorage = this.getStorage(STORAGE_TYPES.LOCAL);
    }
    
    // Create session storage if available
    if (this.isStorageAvailable(STORAGE_TYPES.SESSION)) {
      this.createStorage(STORAGE_TYPES.SESSION, options);
    }
    
    // Create cookie storage
    this.createStorage(STORAGE_TYPES.COOKIE, options);
    
    // Create IndexedDB if available
    if (this.isStorageAvailable(STORAGE_TYPES.INDEXED_DB)) {
      this.createStorage(STORAGE_TYPES.INDEXED_DB, options);
    }
    
    return this;
  }

  // Check if storage type is available
  isStorageAvailable(type) {
    try {
      switch (type) {
        case STORAGE_TYPES.LOCAL:
          return typeof window.localStorage !== 'undefined';
        case STORAGE_TYPES.SESSION:
          return typeof window.sessionStorage !== 'undefined';
        case STORAGE_TYPES.INDEXED_DB:
          return typeof window.indexedDB !== 'undefined';
        case STORAGE_TYPES.COOKIE:
          return typeof document.cookie !== 'undefined';
        default:
          return true;
      }
    } catch {
      return false;
    }
  }

  // Get best available storage
  getBestStorage(preferred = STORAGE_TYPES.LOCAL) {
    if (this.isStorageAvailable(preferred)) {
      return this.getStorage(preferred) || this.defaultStorage;
    }
    
    // Fallback to memory storage
    return this.getStorage(STORAGE_TYPES.MEMORY);
  }

  // Set value in storage
  async set(key, value, options = {}) {
    const { type = null, expiry = null, ...storageOptions } = options;
    const storage = type ? this.getStorage(type) : this.getBestStorage();
    
    if (!storage) {
      throw new Error('No storage available');
    }
    
    return storage.set(key, value, expiry, storageOptions);
  }

  // Get value from storage
  async get(key, options = {}) {
    const { type = null, ...storageOptions } = options;
    const storage = type ? this.getStorage(type) : this.getBestStorage();
    
    if (!storage) {
      throw new Error('No storage available');
    }
    
    return storage.get(key, storageOptions);
  }

  // Remove value from storage
  async remove(key, options = {}) {
    const { type = null } = options;
    const storage = type ? this.getStorage(type) : this.getBestStorage();
    
    if (!storage) {
      throw new Error('No storage available');
    }
    
    return storage.remove(key);
  }

  // Clear storage
  async clear(options = {}) {
    const { type = null } = options;
    
    if (type) {
      const storage = this.getStorage(type);
      if (storage) {
        return storage.clear();
      }
    } else {
      const results = [];
      for (const storage of this.storages.values()) {
        results.push(await storage.clear());
      }
      return results.every(r => r === true);
    }
  }

  // Get all keys
  async keys(options = {}) {
    const { type = null } = options;
    
    if (type) {
      const storage = this.getStorage(type);
      return storage ? storage.keys() : [];
    } else {
      const allKeys = [];
      for (const storage of this.storages.values()) {
        allKeys.push(...await storage.keys());
      }
      return [...new Set(allKeys)];
    }
  }

  // Get storage stats
  getStats(type = null) {
    if (type) {
      const storage = this.getStorage(type);
      return storage ? storage.getStats() : null;
    } else {
      const stats = {};
      for (const [type, storage] of this.storages) {
        stats[type] = storage.getStats();
      }
      return stats;
    }
  }

  // Clear all stats
  clearStats(type = null) {
    if (type) {
      const storage = this.getStorage(type);
      if (storage) {
        storage.clearStats();
      }
    } else {
      for (const storage of this.storages.values()) {
        storage.clearStats();
      }
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();

// Initialize with default options
storageService.initialize({
  prefix: 'app_',
  defaultExpiry: DEFAULT_EXPIRY.MEDIUM,
  enableCompression: true,
  enableEncryption: false,
  enableExpiry: true
});

// Export helper functions
export const storageHelpers = {
  // Format size for display
  formatSize: (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  // Check if value is stored
  isStored: async (key) => {
    return storageService.get(key) !== null;
  },

  // Get multiple values
  getMultiple: async (keys, options = {}) => {
    const values = {};
    for (const key of keys) {
      values[key] = await storageService.get(key, options);
    }
    return values;
  },

  // Set multiple values
  setMultiple: async (items, options = {}) => {
    const results = {};
    for (const [key, value] of Object.entries(items)) {
      results[key] = await storageService.set(key, value, options);
    }
    return results;
  },

  // Remove multiple values
  removeMultiple: async (keys, options = {}) => {
    const results = {};
    for (const key of keys) {
      results[key] = await storageService.remove(key, options);
    }
    return results;
  },

  // Migrate data between storages
  migrate: async (sourceType, targetType, keys = null) => {
    const source = storageService.getStorage(sourceType);
    const target = storageService.getStorage(targetType);
    
    if (!source || !target) {
      throw new Error('Source or target storage not found');
    }
    
    const migrateKeys = keys || await source.keys();
    const results = [];
    
    for (const key of migrateKeys) {
      const value = await source.get(key);
      if (value !== null) {
        const success = await target.set(key, value);
        if (success) {
          await source.remove(key);
        }
        results.push({ key, success });
      }
    }
    
    return results;
  },

  // Export storage data
  exportData: async (type = null, format = 'json') => {
    const data = {};
    const keys = await storageService.keys({ type });
    
    for (const key of keys) {
      data[key] = await storageService.get(key, { type });
    }
    
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }
    
    return data;
  },

  // Import storage data
  importData: async (data, type = null, overwrite = false) => {
    const imported = typeof data === 'string' ? JSON.parse(data) : data;
    const results = [];
    
    for (const [key, value] of Object.entries(imported)) {
      if (overwrite || !(await storageService.get(key, { type }))) {
        const success = await storageService.set(key, value, { type });
        results.push({ key, success });
      }
    }
    
    return results;
  },

  // Get storage usage
  getUsage: (type = null) => {
    const stats = storageService.getStats(type);
    
    if (type) {
      return storageHelpers.formatSize(stats.size);
    }
    
    const usage = {};
    for (const [t, s] of Object.entries(stats)) {
      usage[t] = storageHelpers.formatSize(s.size);
    }
    return usage;
  },

  // Check if storage is almost full
  isAlmostFull: (type = null, threshold = 0.9) => {
    const stats = storageService.getStats(type);
    
    if (type) {
      const storage = storageService.getStorage(type);
      return stats.size >= storage.maxSize * threshold;
    }
    
    const results = {};
    for (const [t, s] of Object.entries(stats)) {
      const storage = storageService.getStorage(t);
      results[t] = s.size >= storage.maxSize * threshold;
    }
    return results;
  },

  // Clean expired items
  cleanExpired: async (type = null) => {
    const keys = await storageService.keys({ type });
    let cleaned = 0;
    
    for (const key of keys) {
      const value = await storageService.get(key, { type });
      if (value === null) {
        cleaned++;
      }
    }
    
    return cleaned;
  }
};

// Export constants
export const STORAGE_CONSTANTS = {
  TYPES: STORAGE_TYPES,
  PRIORITIES: STORAGE_PRIORITIES,
  DATA_TYPES,
  SERIALIZATION_FORMATS,
  COMPRESSION_ALGORITHMS,
  ENCRYPTION_ALGORITHMS,
  QUOTAS: STORAGE_QUOTAS,
  DEFAULT_EXPIRY,
  EVENTS: STORAGE_EVENTS
};

export default storageService;
