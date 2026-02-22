import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Debounce strategies
export const DEBOUNCE_STRATEGIES = {
  LEADING: 'leading', // Execute on leading edge
  TRAILING: 'trailing', // Execute on trailing edge
  BOTH: 'both', // Execute on both edges
  IMMEDIATE: 'immediate' // Execute immediately, then debounce
};

// Default options
const DEFAULT_OPTIONS = {
  delay: 300,
  strategy: DEBOUNCE_STRATEGIES.TRAILING,
  maxWait: null,
  leading: false,
  trailing: true,
  immediate: false,
  context: null,
  onStart: null,
  onEnd: null,
  onCancel: null,
  onError: null
};

/**
 * Custom hook for debouncing values and functions
 * @param {any} value - Value to debounce
 * @param {Object} options - Configuration options
 * @returns {Array} [debouncedValue, functions]
 */
export const useDebounce = (value, options = {}) => {
  const {
    delay = 300,
    strategy = DEBOUNCE_STRATEGIES.TRAILING,
    maxWait = null,
    leading = false,
    trailing = true,
    immediate = false,
    context = null,
    onStart = null,
    onEnd = null,
    onCancel = null,
    onError = null
  } = { ...DEFAULT_OPTIONS, ...options };

  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isPending, setIsPending] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [executionCount, setExecutionCount] = useState(0);
  const [error, setError] = useState(null);

  // Refs for managing timeouts
  const timeoutRef = useRef(null);
  const maxWaitTimeoutRef = useRef(null);
  const startTimeRef = useRef(null);
  const valueRef = useRef(value);
  const handlerRef = useRef(null);
  const mountedRef = useRef(true);

  // Update value ref
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxWaitTimeoutRef.current) {
      clearTimeout(maxWaitTimeoutRef.current);
      maxWaitTimeoutRef.current = null;
    }
  }, []);

  // Cancel debounce
  const cancel = useCallback(() => {
    cleanup();
    setIsPending(false);
    setIsCancelled(true);
    onCancel?.();
  }, [cleanup, onCancel]);

  // Flush debounce (execute immediately)
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setDebouncedValue(valueRef.current);
      setIsPending(false);
      setExecutionCount(prev => prev + 1);
      onEnd?.(valueRef.current);
    }
  }, [onEnd]);

  // Execute with strategy
  const executeWithStrategy = useCallback((currentValue) => {
    try {
      setIsPending(true);
      setIsCancelled(false);
      onStart?.(currentValue);

      const execute = () => {
        if (!mountedRef.current) return;
        
        setDebouncedValue(currentValue);
        setIsPending(false);
        setExecutionCount(prev => prev + 1);
        onEnd?.(currentValue);
        
        // Clear max wait timeout
        if (maxWaitTimeoutRef.current) {
          clearTimeout(maxWaitTimeoutRef.current);
          maxWaitTimeoutRef.current = null;
        }
      };

      // Handle different strategies
      switch (strategy) {
        case DEBOUNCE_STRATEGIES.LEADING:
          if (!timeoutRef.current) {
            execute();
          }
          break;

        case DEBOUNCE_STRATEGIES.BOTH:
          if (!timeoutRef.current) {
            execute();
          }
          break;

        case DEBOUNCE_STRATEGIES.IMMEDIATE:
          if (!timeoutRef.current) {
            execute();
          }
          break;

        default: // TRAILING
          // Will execute after delay
          break;
      }

      // Set timeout for trailing execution
      if (trailing || strategy === DEBOUNCE_STRATEGIES.TRAILING) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          if (strategy !== DEBOUNCE_STRATEGIES.LEADING) {
            execute();
          }
          timeoutRef.current = null;
        }, delay);
      }

      // Set max wait timeout
      if (maxWait && !maxWaitTimeoutRef.current) {
        maxWaitTimeoutRef.current = setTimeout(() => {
          flush();
        }, maxWait);
      }

    } catch (err) {
      setError(err);
      onError?.(err);
      setIsPending(false);
    }
  }, [delay, strategy, trailing, maxWait, flush, onStart, onEnd, onError]);

  // Effect for debouncing value changes
  useEffect(() => {
    if (immediate) {
      setDebouncedValue(value);
      return;
    }

    executeWithStrategy(value);

    return cleanup;
  }, [value, immediate, executeWithStrategy, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);
    return [
    debouncedValue,
    {
      // Core functions
      isPending,
      isCancelled,
      executionCount,
      error,
      
      // Control functions
      cancel,
      flush,
      
      // Getters
      getValue: () => valueRef.current,
      getDebouncedValue: () => debouncedValue,
      
      // State getters
      getIsPending: () => isPending,
      getIsCancelled: () => isCancelled,
      
      // Metadata
      metadata: {
        delay,
        strategy,
        maxWait,
        leading,
        trailing,
        immediate
      }
    }
  ];
};

/**
 * Hook for debouncing functions
 * @param {Function} fn - Function to debounce
 * @param {Object} options - Configuration options
 * @returns {Function} Debounced function
 */
export const useDebouncedCallback = (fn, options = {}) => {
  const {
    delay = 300,
    strategy = DEBOUNCE_STRATEGIES.TRAILING,
    maxWait = null,
    leading = false,
    trailing = true,
    immediate = false,
    context = null,
    onStart = null,
    onEnd = null,
    onCancel = null,
    onError = null
  } = { ...DEFAULT_OPTIONS, ...options };

  const timeoutRef = useRef(null);
  const maxWaitTimeoutRef = useRef(null);
  const fnRef = useRef(fn);
  const argsRef = useRef([]);
  const mountedRef = useRef(true);
  const callCountRef = useRef(0);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  // Update function ref
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxWaitTimeoutRef.current) {
      clearTimeout(maxWaitTimeoutRef.current);
      maxWaitTimeoutRef.current = null;
    }
  }, []);

  // Cancel
  const cancel = useCallback(() => {
    cleanup();
    setIsPending(false);
    onCancel?.();
  }, [cleanup, onCancel]);

  // Flush
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      
      try {
        const result = fnRef.current.apply(context, argsRef.current);
        setIsPending(false);
        onEnd?.(result);
        return result;
      } catch (err) {
        setError(err);
        onError?.(err);
        setIsPending(false);
      }
    }
  }, [context, onEnd, onError]);

  // Debounced function
  const debounced = useCallback((...args) => {
    argsRef.current = args;
    callCountRef.current++;

    try {
      setIsPending(true);
      onStart?.(args);

      const shouldCallLeading = leading || strategy === DEBOUNCE_STRATEGIES.LEADING || 
                                strategy === DEBOUNCE_STRATEGIES.IMMEDIATE;
      const shouldCallTrailing = trailing || strategy === DEBOUNCE_STRATEGIES.TRAILING;

      // Handle leading edge execution
      if (shouldCallLeading && !timeoutRef.current) {
        if (strategy === DEBOUNCE_STRATEGIES.IMMEDIATE) {
          const result = fnRef.current.apply(context, args);
          onEnd?.(result);
          setIsPending(false);
        } else {
          fnRef.current.apply(context, args);
        }
      }

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for trailing edge
      if (shouldCallTrailing) {
        timeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            try {
              const result = fnRef.current.apply(context, argsRef.current);
              onEnd?.(result);
            } catch (err) {
              setError(err);
              onError?.(err);
            } finally {
              setIsPending(false);
              timeoutRef.current = null;
            }
          }
        }, delay);
      }

      // Set max wait timeout
      if (maxWait && !maxWaitTimeoutRef.current) {
        maxWaitTimeoutRef.current = setTimeout(() => {
          flush();
        }, maxWait);
      }

    } catch (err) {
      setError(err);
      onError?.(err);
      setIsPending(false);
    }
  }, [delay, strategy, leading, trailing, maxWait, context, flush, onStart, onEnd, onError]);

  // Cancel on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      cancel();
    };
  }, [cancel]);

  // Return debounced function with utilities
  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.isPending = isPending;
  debounced.error = error;
  debounced.callCount = callCountRef.current;

  return debounced;
};

/**
 * Hook for debouncing with leading/trailing options
 */
export const useDebounceLeading = (value, delay = 300) => {
  return useDebounce(value, { 
    strategy: DEBOUNCE_STRATEGIES.LEADING, 
    delay 
  });
};

export const useDebounceTrailing = (value, delay = 300) => {
  return useDebounce(value, { 
    strategy: DEBOUNCE_STRATEGIES.TRAILING, 
    delay 
  });
};

export const useDebounceBoth = (value, delay = 300) => {
  return useDebounce(value, { 
    strategy: DEBOUNCE_STRATEGIES.BOTH, 
    delay 
  });
};

export const useDebounceImmediate = (value, delay = 300) => {
  return useDebounce(value, { 
    strategy: DEBOUNCE_STRATEGIES.IMMEDIATE, 
    delay 
  });
};/**
 * Hook for debouncing search inputs
 */
export const useDebouncedSearch = (searchFn, delay = 300, options = {}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebouncedCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await searchFn(searchQuery);
      setResults(searchResults);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, { delay, ...options });

  const handleSearch = useCallback((value) => {
    setQuery(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  return {
    query,
    results,
    loading,
    error,
    setQuery: handleSearch,
    cancel: debouncedSearch.cancel,
    flush: debouncedSearch.flush
  };
};

/**
 * Hook for debouncing form inputs
 */
export const useDebouncedForm = (initialValues = {}, delay = 300) => {
  const [values, setValues] = useState(initialValues);
  const [debouncedValues, { isPending }] = useDebounce(values, { delay });

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = useCallback((onSubmit) => {
    return (e) => {
      e?.preventDefault();
      onSubmit(debouncedValues);
    };
  }, [debouncedValues]);

  return {
    values,
    debouncedValues,
    isPending,
    handleChange,
    handleSubmit,
    setValues,
    reset: () => setValues(initialValues)
  };
};

/**
 * Hook for debouncing API calls
 */
export const useDebouncedApi = (apiFunction, delay = 300, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedCall = useDebouncedCallback(async (...args) => {
    setLoading(true);
    try {
      const result = await apiFunction(...args);
      setData(result);
      setError(null);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, { delay, ...options });

  return {
    data,
    loading,
    error,
    call: debouncedCall,
    cancel: debouncedCall.cancel,
    flush: debouncedCall.flush
  };
};

/**
 * Hook for debouncing scroll events
 */
export const useDebouncedScroll = (callback, delay = 100, options = {}) => {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState({ x: null, y: null });

  const lastPosition = useRef({ x: 0, y: 0 });

  const debouncedCallback = useDebouncedCallback((position) => {
    callback?.(position);
  }, { delay, ...options });

  const handleScroll = useCallback(() => {
    const newPosition = {
      x: window.scrollX,
      y: window.scrollY
    };

    setDirection({
      x: newPosition.x > lastPosition.current.x ? 'right' : 
         newPosition.x < lastPosition.current.x ? 'left' : null,
      y: newPosition.y > lastPosition.current.y ? 'down' : 
         newPosition.y < lastPosition.current.y ? 'up' : null
    });

    setScrollPosition(newPosition);
    debouncedCallback(newPosition);
    lastPosition.current = newPosition;
  }, [debouncedCallback]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return {
    position: scrollPosition,
    direction,
    cancel: debouncedCallback.cancel,
    flush: debouncedCallback.flush
  };
};

/**
 * Hook for debouncing resize events
 */
export const useDebouncedResize = (callback, delay = 150, options = {}) => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const debouncedCallback = useDebouncedCallback((size) => {
    callback?.(size);
  }, { delay, ...options });

  const handleResize = useCallback(() => {
    const newDimensions = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    setDimensions(newDimensions);
    debouncedCallback(newDimensions);
  }, [debouncedCallback]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return {
    dimensions,
    cancel: debouncedCallback.cancel,
    flush: debouncedCallback.flush
  };
};

/**
 * Hook for debouncing mouse move events
 */
export const useDebouncedMouseMove = (callback, delay = 50, options = {}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const debouncedCallback = useDebouncedCallback((pos) => {
    callback?.(pos);
  }, { delay, ...options });

  const handleMouseMove = useCallback((e) => {
    const newPosition = { x: e.clientX, y: e.clientY };
    setPosition(newPosition);
    debouncedCallback(newPosition);
  }, [debouncedCallback]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return {
    position,
    cancel: debouncedCallback.cancel,
    flush: debouncedCallback.flush
  };
};

/**
 * Hook for debouncing with RAF (requestAnimationFrame)
 */
export const useDebouncedRaf = (callback, options = {}) => {
  const rafRef = useRef(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debounced = useCallback((...args) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      callbackRef.current(...args);
      rafRef.current = null;
    });
  }, []);

  const cancel = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  return { debounced, cancel };
};

/**
 * Utility functions for debouncing
 */
export const debounceUtils = {
  // Create debounced function
  createDebounced: (fn, delay = 300) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  },

  // Create throttled function
  createThrottled: (fn, limit = 300) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Create debounced with leading/trailing
  createAdvancedDebounced: (fn, delay = 300, leading = false, trailing = true) => {
    let timeoutId;
    let leadingCalled = false;

    return (...args) => {
      if (leading && !leadingCalled) {
        fn(...args);
        leadingCalled = true;
        setTimeout(() => leadingCalled = false, delay);
      }

      if (trailing) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
      }
    };
  },

  // Create debounced with max wait
  createDebouncedWithMaxWait: (fn, delay = 300, maxWait = 1000) => {
    let timeoutId;
    let maxWaitTimeoutId;
    let lastArgs;

    return (...args) => {
      lastArgs = args;
      clearTimeout(timeoutId);

      if (!maxWaitTimeoutId) {
        maxWaitTimeoutId = setTimeout(() => {
          fn(...lastArgs);
          maxWaitTimeoutId = null;
        }, maxWait);
      }

      timeoutId = setTimeout(() => {
        fn(...lastArgs);
        clearTimeout(maxWaitTimeoutId);
        maxWaitTimeoutId = null;
      }, delay);
    };
  }
};

// Export constants
export const DEBOUNCE_DEFAULTS = DEFAULT_OPTIONS;

export default useDebounce;
