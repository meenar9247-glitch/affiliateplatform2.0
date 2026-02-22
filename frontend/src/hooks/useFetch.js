import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request queue for handling concurrent requests
const requestQueue = new Map();
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/auth/refresh`,
          { refreshToken }
        );
        
        if (response.data.success) {
          const { token } = response.data;
          localStorage.setItem('auth_token', token);
          api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          processQueue(null, token);
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export const useFetch = (url, options = {}) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [headers, setHeaders] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());
  const requestIdRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const mountedRef = useRef(true);

  const {
    method = 'GET',
    params = {},
    body = null,
    headers: customHeaders = {},
    cache = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes default cache
    retries = 0,
    retryDelay = 1000,
    timeout = 30000,
    withAuth = true,
    transformRequest = null,
    transformResponse = null,
    validateStatus = (status) => status >= 200 && status < 300,
    onSuccess = null,
    onError = null,
    onFinally = null,
    debounce = 0,
    throttle = 0,
    dedupe = true,
    dependencies = []
  } = options;

  // Generate cache key
  const getCacheKey = useCallback(() => {
    const keyParts = [
      method,
      url,
      JSON.stringify(params),
      JSON.stringify(body),
      JSON.stringify(customHeaders)
    ];
    return keyParts.join('|');
  }, [method, url, params, body, customHeaders]);

  // Check cache
  const getCachedData = useCallback((key) => {
    if (!cache) return null;
    
    const cached = cacheRef.current.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > cacheTime;
    if (isExpired) {
      cacheRef.current.delete(key);
      return null;
    }
    
    return cached.data;
  }, [cache, cacheTime]);

  // Set cache
  const setCachedData = useCallback((key, data) => {
    if (!cache) return;
    
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Clean old cache entries
    const now = Date.now();
    for (const [key, value] of cacheRef.current.entries()) {
      if (now - value.timestamp > cacheTime) {
        cacheRef.current.delete(key);
      }
    }
  }, [cache, cacheTime]);

  // Cancel ongoing request
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Invalidate cache for specific URL
  const invalidateCache = useCallback((urlPattern) => {
    const regex = new RegExp(urlPattern);
    for (const key of cacheRef.current.keys()) {
      if (regex.test(key)) {
        cacheRef.current.delete(key);
      }
    }
  }, []);

  // Execute request
  const execute = useCallback(async (overrideOptions = {}) => {
    if (!mountedRef.current) return;

    // Cancel previous request if dedupe is enabled
    if (dedupe && requestIdRef.current) {
      cancelRequest();
    }

    const finalOptions = { ...options, ...overrideOptions };
    const {
      method = 'GET',
      params = {},
      body = null,
      headers: customHeaders = {},
      withAuth = true,
      transformRequest,
      transformResponse,
      validateStatus
    } = finalOptions;

    const cacheKey = getCacheKey();
    
    // Check cache
    if (method === 'GET' && cache) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        setError(null);
        return cachedData;
      }
    }

    // Check for duplicate request in queue
    if (dedupe && requestQueue.has(cacheKey)) {
      try {
        const result = await requestQueue.get(cacheKey);
        setData(result.data);
        setStatus(result.status);
        setHeaders(result.headers);
        return result.data;
      } catch (error) {
        setError(error);
        throw error;
      }
    }

    // Create abort controller
    abortControllerRef.current = new AbortController();
    requestIdRef.current = cacheKey;

    // Prepare request config
    const config = {
      method,
      url,
      params,
      data: body,
      headers: {
        ...customHeaders,
        ...(withAuth && user?.token ? { Authorization: `Bearer ${user.token}` } : {})
      },
      signal: abortControllerRef.current.signal,
      timeout,
      validateStatus
    };

    // Transform request if needed
    if (transformRequest) {
      config.data = transformRequest(config.data);
    }

    // Create request promise
    const requestPromise = (async () => {
      const startTime = Date.now();
      
      try {
        const response = await api(config);
        
        if (!mountedRef.current) return null;

        const responseData = transformResponse 
          ? transformResponse(response.data)
          : response.data;

        setData(responseData);
        setStatus(response.status);
        setHeaders(response.headers);
        setError(null);
        setResponseTime(Date.now() - startTime);

        // Cache successful GET requests
        if (method === 'GET' && cache) {
          setCachedData(cacheKey, responseData);
        }

        if (onSuccess) onSuccess(responseData, response);
        
        return responseData;
      } catch (err) {
        if (!mountedRef.current) return null;

        // Handle retries
        if (retries > 0 && retryCount < retries) {
          setRetryCount(prev => prev + 1);
          retryTimeoutRef.current = setTimeout(() => {
            execute(overrideOptions);
          }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
          return;
        }

        setError(err);
        setResponseTime(Date.now() - startTime);

        if (onError) onError(err);
        
        throw err;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          if (onFinally) onFinally();
        }
        requestQueue.delete(cacheKey);
        abortControllerRef.current = null;
        requestIdRef.current = null;
      }
    })();

    // Add to queue
    requestQueue.set(cacheKey, requestPromise);

    // Apply debounce
    if (debounce > 0) {
      return new Promise((resolve) => {
        setTimeout(async () => {
          const result = await requestPromise;
          resolve(result);
        }, debounce);
      });
    }

    // Apply throttle
    if (throttle > 0) {
      const now = Date.now();
      const lastCall = throttleCache.get(cacheKey) || 0;
      
      if (now - lastCall < throttle) {
        return getCachedData(cacheKey) || null;
      }
      
      throttleCache.set(cacheKey, now);
    }

    return requestPromise;
  }, [url, options, getCacheKey, getCachedData, setCachedData, cancelRequest, retryCount]);
  // Execute on mount and when dependencies change
useEffect(() => {
  mountedRef.current = true;
  
  if (method !== 'GET' || !url) {
    setLoading(false);
    return;
  }

  execute();

  return () => {
    mountedRef.current = false;
    cancelRequest();
  };
}, [url, ...dependencies]);

// Manual refetch
const refetch = useCallback(async (newOptions = {}) => {
  setRetryCount(0);
  return execute(newOptions);
}, [execute]);

// Mutate data (for POST, PUT, DELETE)
const mutate = useCallback(async (method, body = null, options = {}) => {
  return execute({
    method,
    body,
    cache: false,
    ...options
  });
}, [execute]);

// POST shortcut
const post = useCallback(async (body, options = {}) => {
  return mutate('POST', body, options);
}, [mutate]);

// PUT shortcut
const put = useCallback(async (body, options = {}) => {
  return mutate('PUT', body, options);
}, [mutate]);

// PATCH shortcut
const patch = useCallback(async (body, options = {}) => {
  return mutate('PATCH', body, options);
}, [mutate]);

// DELETE shortcut
const del = useCallback(async (options = {}) => {
  return mutate('DELETE', null, options);
}, [mutate]);

// Upload files
const upload = useCallback(async (url, files, options = {}) => {
  const formData = new FormData();
  
  if (Array.isArray(files)) {
    files.forEach(file => formData.append('files', file));
  } else {
    formData.append('file', files);
  }

  return execute({
    method: 'POST',
    url,
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    ...options
  });
}, [execute]);

// Download file
const download = useCallback(async (url, filename = null, options = {}) => {
  try {
    const response = await execute({
      method: 'GET',
      url,
      responseType: 'blob',
      ...options
    });

    const blob = new Blob([response]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || url.split('/').pop() || 'download';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    return true;
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}, [execute]);

// Polling
const startPolling = useCallback((interval = 5000) => {
  const poll = async () => {
    try {
      await execute();
    } catch (error) {
      console.error('Polling error:', error);
    }
  };

  const intervalId = setInterval(poll, interval);
  return () => clearInterval(intervalId);
}, [execute]);

// WebSocket connection
const connectWebSocket = useCallback((wsUrl, options = {}) => {
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnect = true,
    reconnectInterval = 3000,
    maxReconnects = 5
  } = options;

  let ws = null;
  let reconnectCount = 0;
  let reconnectTimer = null;

  const connect = () => {
    ws = new WebSocket(wsUrl);

    ws.onopen = (event) => {
      console.log('WebSocket connected');
      reconnectCount = 0;
      if (onOpen) onOpen(event);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
        setData(data);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected');
      if (onClose) onClose(event);

      if (reconnect && reconnectCount < maxReconnects) {
        reconnectTimer = setTimeout(() => {
          reconnectCount++;
          connect();
        }, reconnectInterval);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (onError) onError(error);
    };
  };

  connect();

  return () => {
    if (ws) {
      ws.close();
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
  };
}, []);

// Server-Sent Events
const connectSSE = useCallback((sseUrl, options = {}) => {
  const {
    onMessage,
    onOpen,
    onError,
    onComplete
  } = options;

  const eventSource = new EventSource(sseUrl);

  eventSource.onopen = (event) => {
    console.log('SSE connected');
    if (onOpen) onOpen(event);
  };

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (onMessage) onMessage(data);
      setData(data);
    } catch (error) {
      console.error('SSE message error:', error);
    }
  };

  eventSource.onerror = (error) => {
    console.error('SSE error:', error);
    if (onError) onError(error);
  };

  eventSource.oncomplete = (event) => {
    if (onComplete) onComplete(event);
  };

  return () => {
    eventSource.close();
  };
}, []);

// Progress tracking
const [progress, setProgress] = useState(0);

const trackProgress = useCallback(async (promise) => {
  const progressInterval = setInterval(() => {
    setProgress(prev => Math.min(prev + 10, 90));
  }, 500);

  try {
    const result = await promise;
    setProgress(100);
    clearInterval(progressInterval);
    setTimeout(() => setProgress(0), 1000);
    return result;
  } catch (error) {
    setProgress(0);
    clearInterval(progressInterval);
    throw error;
  }
}, []);

// Batch requests
const batch = useCallback(async (requests) => {
  const batchId = Math.random().toString(36).substring(7);
  
  try {
    const results = await Promise.all(
      requests.map(req => execute({
        ...req,
        headers: {
          ...req.headers,
          'X-Batch-ID': batchId
        }
      }))
    );
    
    return results;
  } catch (error) {
    console.error('Batch request failed:', error);
    throw error;
  }
}, [execute]);
  // Parallel requests
  const parallel = useCallback(async (requests, maxConcurrent = 3) => {
    const results = [];
    const queue = [...requests];
    
    const runWorker = async () => {
      while (queue.length > 0) {
        const request = queue.shift();
        const result = await execute(request);
        results.push(result);
      }
    };

    const workers = Array(maxConcurrent).fill().map(() => runWorker());
    await Promise.all(workers);
    
    return results;
  }, [execute]);

  // Retry with backoff
  const retryWithBackoff = useCallback(async (fn, maxRetries = 3, baseDelay = 1000) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }, []);

  // Cache management
  const cache = {
    get: (key) => cacheRef.current.get(key),
    set: (key, value) => cacheRef.current.set(key, value),
    delete: (key) => cacheRef.current.delete(key),
    clear: clearCache,
    invalidate: invalidateCache,
    size: () => cacheRef.current.size,
    keys: () => Array.from(cacheRef.current.keys()),
    values: () => Array.from(cacheRef.current.values())
  };

  // Request queue management
  const queue = {
    size: () => requestQueue.size,
    clear: () => requestQueue.clear(),
    pending: () => Array.from(requestQueue.keys()),
    cancel: (key) => {
      if (requestQueue.has(key)) {
        // Cancel the request
        // Implementation depends on how requests are stored
        requestQueue.delete(key);
      }
    }
  };

  // Status helpers
  const isIdle = !loading && !error && !data;
  const isSuccess = !loading && !error && data;
  const isError = !!error;
  const isLoading = loading;

  // Response metadata
  const response = {
    data,
    loading,
    error,
    status,
    headers,
    responseTime,
    retryCount,
    progress
  };

  // Request methods
  const requests = {
    get: execute,
    post,
    put,
    patch,
    delete: del,
    upload,
    download,
    batch,
    parallel
  };

  // Real-time methods
  const realtime = {
    poll: startPolling,
    ws: connectWebSocket,
    sse: connectSSE
  };

  // Utility methods
  const utils = {
    refetch,
    cancel: cancelRequest,
    clearCache,
    invalidateCache,
    retry: () => execute(),
    trackProgress,
    retryWithBackoff
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRequest();
    };
  }, [cancelRequest]);

  return {
    // Data
    ...response,
    
    // Status flags
    isIdle,
    isSuccess,
    isError,
    isLoading,
    
    // Request methods
    ...requests,
    
    // Real-time
    ...realtime,
    
    // Utilities
    ...utils,
    
    // Cache management
    cache,
    
    // Queue management
    queue,
    
    // Response object
    response,
    
    // Original execute function
    execute,
    
    // Mutate function
    mutate
  };
};

// Throttle cache for request throttling
const throttleCache = new Map();

// Export configured axios instance
export { api as fetchApi };

// Export utility functions
export const fetchUtils = {
  // Check if response is OK
  isOk: (status) => status >= 200 && status < 300,
  
  // Get error message from response
  getErrorMessage: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },
  
  // Parse response data
  parseResponse: async (response) => {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    if (contentType?.includes('text/')) {
      return response.text();
    }
    if (contentType?.includes('multipart/form-data')) {
      return response.formData();
    }
    return response.blob();
  },
  
  // Create query string from params
  createQueryString: (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    return searchParams.toString();
  },
  
  // Merge headers
  mergeHeaders: (...headerObjects) => {
    return headerObjects.reduce((merged, headers) => {
      return { ...merged, ...headers };
    }, {});
  },
  
  // Generate request ID
  generateRequestId: () => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
  
  // Check if request is cacheable
  isCacheable: (method, status) => {
    return method === 'GET' && status >= 200 && status < 300;
  },
  
  // Calculate retry delay with jitter
  calculateRetryDelay: (baseDelay, attempt, jitter = true) => {
    const delay = baseDelay * Math.pow(2, attempt);
    if (!jitter) return delay;
    return delay * (0.5 + Math.random());
  },
  
  // Parse content disposition filename
  parseFilename: (contentDisposition) => {
    const match = contentDisposition?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    return match ? match[1].replace(/['"]/g, '') : null;
  }
};

// Export constants
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
};

export const CACHE_STRATEGIES = {
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};
