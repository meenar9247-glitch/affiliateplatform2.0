import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for managing localStorage with type safety, expiration, and sync across tabs
 * @param {string} key - The localStorage key
 * @param {any} initialValue - Initial value if no stored value exists
 * @param {Object} options - Configuration options
 * @param {number} options.expiry - Expiry time in milliseconds
 * @param {boolean} options.sync - Sync across tabs/windows
 * @param {boolean} options.compress - Compress data using LZString
 * @param {boolean} options.encrypt - Encrypt data (requires encryption key)
 * @param {string} options.encryptionKey - Key for encryption
 * @param {Function} options.serialize - Custom serialize function
 * @param {Function} options.deserialize - Custom deserialize function
 * @param {boolean} options.quiet - Suppress console warnings
 * @returns {Array} [storedValue, setValue, removeValue, clearAll, isLoaded, error]
 */
export const useLocalStorage = (key, initialValue = null, options = {}) => {
  const {
    expiry = null,
    sync = true,
    compress = false,
    encrypt = false,
    encryptionKey = 'default-key',
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    quiet = false
  } = options;

  const [storedValue, setStoredValue] = useState(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const storageListeners = useRef(new Set());
  const timeoutRef = useRef(null);
  const isMounted = useRef(true);

  // Storage event listener for cross-tab communication
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && sync) {
        try {
          if (e.newValue === null) {
            setStoredValue(initialValue);
          } else {
            const parsed = deserialize(e.newValue);
            
            // Check expiry
            if (parsed && parsed._expiry && Date.now() > parsed._expiry) {
              localStorage.removeItem(key);
              setStoredValue(initialValue);
            } else {
              setStoredValue(parsed?.value ?? parsed);
            }
          }
          setLastUpdated(Date.now());
        } catch (err) {
          if (!quiet) console.error('Storage sync error:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, sync, deserialize, quiet]);

  // Load initial value from localStorage
  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      
      if (item !== null) {
        let parsed;
        
        // Decrypt if enabled
        if (encrypt) {
          // Simple XOR encryption for demo (use proper encryption in production)
          parsed = decryptData(item, encryptionKey);
        } else {
          parsed = deserialize(item);
        }
        
        // Decompress if enabled
        if (compress) {
          parsed = decompressData(parsed);
        }
        
        // Check if item has expiry
        if (parsed && parsed._expiry) {
          if (Date.now() > parsed._expiry) {
            localStorage.removeItem(key);
            setStoredValue(initialValue);
          } else {
            setStoredValue(parsed.value);
          }
        } else {
          setStoredValue(parsed ?? initialValue);
        }
      } else {
        setStoredValue(initialValue);
      }
      
      setError(null);
    } catch (err) {
      setError(err);
      if (!quiet) console.error('Error reading localStorage:', err);
      setStoredValue(initialValue);
    } finally {
      setIsLoaded(true);
    }

    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, initialValue, encrypt, encryptionKey, compress, deserialize, quiet]);

  // Compression utilities
  const compressData = (data) => {
    // Simple compression for demo (use proper compression in production)
    const str = typeof data === 'string' ? data : serialize(data);
    return btoa(encodeURIComponent(str));
  };

  const decompressData = (data) => {
    try {
      const str = decodeURIComponent(atob(data));
      return deserialize(str);
    } catch {
      return data;
    }
  };

  // Encryption utilities (simple XOR for demo - use proper encryption in production)
  const encryptData = (data, key) => {
    const str = serialize(data);
    const keyBytes = key.split('').map(c => c.charCodeAt(0));
    const result = [];
    
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i) ^ keyBytes[i % keyBytes.length];
      result.push(String.fromCharCode(charCode));
    }
    
    return btoa(result.join(''));
  };

  const decryptData = (data, key) => {
    try {
      const str = atob(data);
      const keyBytes = key.split('').map(c => c.charCodeAt(0));
      const result = [];
      
      for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i) ^ keyBytes[i % keyBytes.length];
        result.push(String.fromCharCode(charCode));
      }
      
      return deserialize(result.join(''));
    } catch {
      return data;
    }
  };
// Set value in localStorage
const setValue = useCallback((value) => {
  try {
    // Allow value to be a function for previous state
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    
    // Prepare data with expiry if needed
    let dataToStore = valueToStore;
    
    if (expiry) {
      dataToStore = {
        value: valueToStore,
        _expiry: Date.now() + expiry
      };
    }
    
    // Compress if enabled
    let processedData = dataToStore;
    if (compress) {
      processedData = compressData(dataToStore);
    }
    
    // Encrypt if enabled
    if (encrypt) {
      processedData = encryptData(processedData, encryptionKey);
    } else {
      processedData = serialize(processedData);
    }
    
    // Save to localStorage
    localStorage.setItem(key, processedData);
    
    // Update state
    if (isMounted.current) {
      setStoredValue(valueToStore);
      setLastUpdated(Date.now());
      setError(null);
    }
    
    // Dispatch custom event for same-tab sync
    if (sync) {
      const event = new CustomEvent('localStorageChange', {
        detail: { key, newValue: processedData }
      });
      window.dispatchEvent(event);
    }
    
    // Set expiry timeout
    if (expiry) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        removeValue();
      }, expiry);
    }
    
    return valueToStore;
  } catch (err) {
    setError(err);
    if (!quiet) console.error('Error setting localStorage:', err);
    return null;
  }
}, [key, storedValue, expiry, compress, encrypt, encryptionKey, serialize, sync, quiet]);

// Remove value from localStorage
const removeValue = useCallback(() => {
  try {
    localStorage.removeItem(key);
    
    if (isMounted.current) {
      setStoredValue(initialValue);
      setLastUpdated(Date.now());
      setError(null);
    }
    
    if (sync) {
      const event = new CustomEvent('localStorageChange', {
        detail: { key, newValue: null }
      });
      window.dispatchEvent(event);
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  } catch (err) {
    setError(err);
    if (!quiet) console.error('Error removing localStorage:', err);
  }
}, [key, initialValue, sync, quiet]);

// Clear all localStorage items with matching prefix
const clearAll = useCallback((prefix = '') => {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey.startsWith(prefix)) {
        keys.push(storageKey);
      }
    }
    
    keys.forEach(k => localStorage.removeItem(k));
    
    if (isMounted.current) {
      setStoredValue(initialValue);
      setLastUpdated(Date.now());
      setError(null);
    }
    
    if (sync) {
      keys.forEach(k => {
        const event = new CustomEvent('localStorageChange', {
          detail: { key: k, newValue: null }
        });
        window.dispatchEvent(event);
      });
    }
    
    return keys.length;
  } catch (err) {
    setError(err);
    if (!quiet) console.error('Error clearing localStorage:', err);
    return 0;
  }
}, [initialValue, sync, quiet]);

// Batch set multiple values
const setBatch = useCallback((items) => {
  try {
    const results = {};
    
    Object.entries(items).forEach(([k, v]) => {
      const serialized = serialize(v);
      localStorage.setItem(k, serialized);
      results[k] = v;
    });
    
    if (sync) {
      const event = new CustomEvent('localStorageBatch', {
        detail: { items }
      });
      window.dispatchEvent(event);
    }
    
    return results;
  } catch (err) {
    setError(err);
    if (!quiet) console.error('Error setting batch:', err);
    return {};
  }
}, [serialize, sync, quiet]);

// Get multiple values
const getBatch = useCallback((keys) => {
  try {
    const results = {};
    
    keys.forEach(k => {
      const item = localStorage.getItem(k);
      if (item !== null) {
        try {
          results[k] = deserialize(item);
        } catch {
          results[k] = item;
        }
      }
    });
    
    return results;
  } catch (err) {
    setError(err);
    if (!quiet) console.error('Error getting batch:', err);
    return {};
  }
}, [deserialize, quiet]);

// Check if key exists
const hasKey = useCallback((checkKey) => {
  return localStorage.getItem(checkKey) !== null;
}, []);

// Get all keys
const getKeys = useCallback(() => {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    keys.push(localStorage.key(i));
  }
  return keys;
}, []);

// Get storage size in bytes
const getSize = useCallback(() => {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    total += (key?.length || 0) + (value?.length || 0);
  }
  return total;
}, []);

// Check if storage is full
const isFull = useCallback(() => {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return false;
  } catch {
    return true;
  }
}, []);

// Get remaining space estimate
const getRemainingSpace = useCallback(() => {
  // Most browsers allow ~5-10MB
  const estimate = 5 * 1024 * 1024; // 5MB estimate
  const used = getSize();
  return Math.max(0, estimate - used);
}, [getSize]);

// Subscribe to changes
const subscribe = useCallback((callback) => {
  storageListeners.current.add(callback);
  
  return () => {
    storageListeners.current.delete(callback);
  };
}, []);

// Emit change to listeners
const emitChange = useCallback((newValue) => {
  storageListeners.current.forEach(callback => {
    try {
      callback(newValue);
    } catch (err) {
      if (!quiet) console.error('Listener error:', err);
    }
  });
}, [quiet]);
  // Listener for custom events
  useEffect(() => {
    const handleCustomEvent = (e) => {
      if (e.detail?.key === key) {
        try {
          if (e.detail.newValue === null) {
            setStoredValue(initialValue);
          } else {
            let parsed = deserialize(e.detail.newValue);
            
            if (parsed && parsed._expiry && Date.now() > parsed._expiry) {
              localStorage.removeItem(key);
              setStoredValue(initialValue);
            } else {
              setStoredValue(parsed?.value ?? parsed);
            }
          }
        } catch (err) {
          if (!quiet) console.error('Custom event error:', err);
        }
      }
    };

    const handleBatchEvent = (e) => {
      if (e.detail?.items && e.detail.items[key]) {
        try {
          setStoredValue(e.detail.items[key]);
        } catch (err) {
          if (!quiet) console.error('Batch event error:', err);
        }
      }
    };

    window.addEventListener('localStorageChange', handleCustomEvent);
    window.addEventListener('localStorageBatch', handleBatchEvent);
    
    return () => {
      window.removeEventListener('localStorageChange', handleCustomEvent);
      window.removeEventListener('localStorageBatch', handleBatchEvent);
    };
  }, [key, initialValue, deserialize, quiet]);

  return {
    // Core
    value: storedValue,
    setValue,
    remove: removeValue,
    clear: clearAll,
    
    // Status
    isLoaded,
    error,
    lastUpdated,
    
    // Batch operations
    setBatch,
    getBatch,
    
    // Utilities
    hasKey,
    getKeys,
    getSize,
    isFull,
    getRemainingSpace,
    subscribe,
    
    // Legacy array return for backward compatibility
    get: () => storedValue,
    set: setValue,
    delete: removeValue
  };
};

/**
 * Hook for managing sessionStorage
 */
export const useSessionStorage = (key, initialValue = null, options = {}) => {
  const [value, setValue] = useState(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const item = sessionStorage.getItem(key);
      setValue(item ? JSON.parse(item) : initialValue);
    } catch (err) {
      setError(err);
      console.error('Error reading sessionStorage:', err);
    } finally {
      setIsLoaded(true);
    }
  }, [key, initialValue]);

  const setSessionValue = useCallback((newValue) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      sessionStorage.setItem(key, JSON.stringify(valueToStore));
      setValue(valueToStore);
      setError(null);
    } catch (err) {
      setError(err);
      console.error('Error setting sessionStorage:', err);
    }
  }, [key, value]);

  const removeSessionValue = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
      setValue(initialValue);
      setError(null);
    } catch (err) {
      setError(err);
      console.error('Error removing sessionStorage:', err);
    }
  }, [key, initialValue]);

  return {
    value,
    setValue: setSessionValue,
    remove: removeSessionValue,
    isLoaded,
    error
  };
};

/**
 * Hook for managing cookies
 */
export const useCookie = (name, initialValue = '', options = {}) => {
  const {
    maxAge = 86400, // 1 day
    path = '/',
    domain = '',
    secure = false,
    sameSite = 'Lax'
  } = options;

  const [value, setValue] = useState(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  const getCookie = useCallback((cookieName) => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, val] = cookie.split('=').map(c => c.trim());
      if (key && val) acc[key] = decodeURIComponent(val);
      return acc;
    }, {});
    
    return cookies[cookieName] || null;
  }, []);

  const setCookie = useCallback((cookieName, cookieValue, cookieOptions = {}) => {
    const {
      maxAge: optMaxAge = maxAge,
      path: optPath = path,
      domain: optDomain = domain,
      secure: optSecure = secure,
      sameSite: optSameSite = sameSite
    } = cookieOptions;

    let cookieStr = `${cookieName}=${encodeURIComponent(cookieValue)}`;
    
    if (optMaxAge) cookieStr += `; max-age=${optMaxAge}`;
    if (optPath) cookieStr += `; path=${optPath}`;
    if (optDomain) cookieStr += `; domain=${optDomain}`;
    if (optSecure) cookieStr += '; secure';
    if (optSameSite) cookieStr += `; samesite=${optSameSite}`;
    
    document.cookie = cookieStr;
    setValue(cookieValue);
  }, [maxAge, path, domain, secure, sameSite]);

  const removeCookie = useCallback((cookieName) => {
    document.cookie = `${cookieName}=; max-age=0; path=${path}`;
    setValue(initialValue);
  }, [path, initialValue]);

  useEffect(() => {
    const cookieValue = getCookie(name);
    if (cookieValue !== null) {
      setValue(cookieValue);
    } else if (initialValue) {
      setCookie(name, initialValue);
    }
    setIsLoaded(true);
  }, [name, initialValue, getCookie, setCookie]);

  return {
    value,
    setValue: setCookie,
    remove: removeCookie,
    isLoaded
  };
};

/**
 * Hook for managing IndexedDB
 */
export const useIndexedDB = (dbName, storeName, key = 'default') => {
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [db, setDb] = useState(null);

  useEffect(() => {
    const request = indexedDB.open(dbName, 1);

    request.onerror = () => {
      setError(request.error);
      setLoading(false);
    };

    request.onsuccess = () => {
      setDb(request.result);
      loadData(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
  }, [dbName, storeName]);

  const loadData = (database) => {
    try {
      const transaction = database.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        setValue(request.result);
        setLoading(false);
      };

      request.onerror = () => {
        setError(request.error);
        setLoading(false);
      };
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const setIndexedValue = useCallback((newValue) => {
    if (!db) return;

    try {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(newValue, key);

      request.onsuccess = () => {
        setValue(newValue);
      };

      request.onerror = () => {
        setError(request.error);
      };
    } catch (err) {
      setError(err);
    }
  }, [db, storeName, key]);

  const removeIndexedValue = useCallback(() => {
    if (!db) return;

    try {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        setValue(null);
      };

      request.onerror = () => {
        setError(request.error);
      };
    } catch (err) {
      setError(err);
    }
  }, [db, storeName, key]);

  return {
    value,
    setValue: setIndexedValue,
    remove: removeIndexedValue,
    loading,
    error
  };
};

// Export utilities
export const storageUtils = {
  // Check if localStorage is available
  isAvailable: () => {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  // Get storage usage
  getUsage: () => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      total += (key?.length || 0) + (value?.length || 0);
    }
    return total;
  },

  // Clear all storage
  clearAll: () => {
    localStorage.clear();
    sessionStorage.clear();
  },

  // Export storage data
  exportData: () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      data[key] = value;
    }
    return JSON.stringify(data, null, 2);
  },

  // Import storage data
  importData: (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);
      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      return true;
    } catch {
      return false;
    }
  }
};

export default useLocalStorage;
