import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDebounce } from './useDebounce';

// Pagination strategies
export const PAGINATION_STRATEGIES = {
  OFFSET: 'offset', // Traditional offset-based pagination
  CURSOR: 'cursor', // Cursor-based pagination
  KEYSET: 'keyset', // Keyset pagination for infinite scroll
  TIME_BASED: 'time', // Time-based pagination
  SEARCH_AFTER: 'search_after' // Elasticsearch style pagination
};

// Display modes
export const DISPLAY_MODES = {
  PAGINATED: 'paginated', // Traditional page numbers
  INFINITE_SCROLL: 'infinite', // Infinite scroll
  LOAD_MORE: 'load_more', // Load more button
  VIRTUALIZED: 'virtualized' // Virtualized list
};

// Sort directions
export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc'
};

// Default options
const DEFAULT_OPTIONS = {
  // Core options
  initialPage: 1,
  initialPageSize: 10,
  initialTotal: 0,
  strategy: PAGINATION_STRATEGIES.OFFSET,
  mode: DISPLAY_MODES.PAGINATED,
  
  // Behavior options
  autoResetPage: true,
  autoResetPageSize: true,
  preserveState: true,
  syncWithUrl: false,
  
  // Server-side options
  serverSide: false,
  serverSideSorting: false,
  serverSideFiltering: false,
  
  // Client-side options
  clientSideData: [],
  clientSideFilter: null,
  clientSideSort: null,
  
  // UI options
  showFirstLast: true,
  showPrevNext: true,
  showPageNumbers: true,
  showPageSize: true,
  showTotal: true,
  showJumpToPage: false,
  
  // Page size options
  pageSizeOptions: [5, 10, 25, 50, 100],
  pageSize: 10,
  
  // Infinite scroll options
  infiniteScrollThreshold: 100,
  infiniteScrollDirection: 'down',
  
  // Caching options
  cachePages: true,
  cacheTime: 5 * 60 * 1000, // 5 minutes
  maxCacheSize: 50,
  
  // Callbacks
  onPageChange: null,
  onPageSizeChange: null,
  onSortChange: null,
  onFilterChange: null,
  onDataChange: null,
  onError: null
};

export const usePagination = (data = [], options = {}) => {
  // Merge options with defaults
  const {
    initialPage = 1,
    initialPageSize = 10,
    initialTotal = data.length,
    strategy = PAGINATION_STRATEGIES.OFFSET,
    mode = DISPLAY_MODES.PAGINATED,
    autoResetPage = true,
    autoResetPageSize = true,
    preserveState = true,
    syncWithUrl = false,
    serverSide = false,
    serverSideSorting = false,
    serverSideFiltering = false,
    clientSideData = data,
    clientSideFilter = null,
    clientSideSort = null,
    showFirstLast = true,
    showPrevNext = true,
    showPageNumbers = true,
    showPageSize = true,
    showTotal = true,
    showJumpToPage = false,
    pageSizeOptions = [5, 10, 25, 50, 100],
    pageSize: initialPageSize,
    infiniteScrollThreshold = 100,
    infiniteScrollDirection = 'down',
    cachePages = true,
    cacheTime = 5 * 60 * 1000,
    maxCacheSize = 50,
    onPageChange = null,
    onPageSizeChange = null,
    onSortChange = null,
    onFilterChange = null,
    onDataChange = null,
    onError = null
  } = { ...DEFAULT_OPTIONS, ...options };

  // Core pagination state
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialTotal / initialPageSize));
  
  // Data state
  const [currentData, setCurrentData] = useState([]);
  const [allData, setAllData] = useState(clientSideData);
  
  // Sorting state
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState(SORT_DIRECTIONS.ASC);
  
  // Filtering state
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cursor/Keyset state
  const [cursors, setCursors] = useState({});
  const [nextCursor, setNextCursor] = useState(null);
  const [prevCursor, setPrevCursor] = useState(null);
  
  // Loading and error state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Cache
  const [cache, setCache] = useState({});
  
  // Refs
  const loadingRef = useRef(false);
  const observerRef = useRef(null);
  const cacheTimerRef = useRef(null);
  const initialLoadRef = useRef(true);

  // Calculate derived values
  const startIndex = useMemo(() => {
    if (strategy === PAGINATION_STRATEGIES.CURSOR) return null;
    return (page - 1) * pageSize;
  }, [page, pageSize, strategy]);

  const endIndex = useMemo(() => {
    if (strategy === PAGINATION_STRATEGIES.CURSOR) return null;
    return startIndex + pageSize;
  }, [startIndex, pageSize, strategy]);

  const hasNextPage = useMemo(() => {
    if (strategy === PAGINATION_STRATEGIES.CURSOR) {
      return !!nextCursor;
    }
    return page < totalPages;
  }, [page, totalPages, strategy, nextCursor]);

  const hasPrevPage = useMemo(() => {
    if (strategy === PAGINATION_STRATEGIES.CURSOR) {
      return !!prevCursor;
    }
    return page > 1;
  }, [page, strategy, prevCursor]);

  const from = useMemo(() => {
    if (strategy === PAGINATION_STRATEGIES.CURSOR) return null;
    return Math.min(startIndex + 1, total);
  }, [startIndex, total, strategy]);

  const to = useMemo(() => {
    if (strategy === PAGINATION_STRATEGIES.CURSOR) return null;
    return Math.min(endIndex, total);
  }, [endIndex, total, strategy]);

  // Generate cache key
  const getCacheKey = useCallback(() => {
    return `${page}_${pageSize}_${sortBy}_${sortDirection}_${JSON.stringify(filters)}_${searchQuery}`;
  }, [page, pageSize, sortBy, sortDirection, filters, searchQuery]);
  // Apply client-side filtering and sorting
const processClientSideData = useCallback(() => {
  if (serverSide) return;

  let processed = [...allData];

  // Apply filters
  if (clientSideFilter) {
    processed = clientSideFilter(processed, filters, searchQuery);
  } else {
    // Basic filtering
    if (searchQuery) {
      processed = processed.filter(item => 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    // Apply custom filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        processed = processed.filter(item => item[key] === value);
      }
    });
  }

  // Apply sorting
  if (clientSideSort && sortBy) {
    processed = clientSideSort(processed, sortBy, sortDirection);
  } else if (sortBy) {
    processed.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === SORT_DIRECTIONS.ASC ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (sortDirection === SORT_DIRECTIONS.ASC) {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }

  return processed;
}, [allData, serverSide, clientSideFilter, clientSideSort, filters, searchQuery, sortBy, sortDirection]);

// Get current page data
const getCurrentPageData = useCallback(() => {
  if (serverSide) {
    return currentData;
  }

  const processed = processClientSideData();
  setTotal(processed.length);
  setTotalPages(Math.ceil(processed.length / pageSize));

  if (strategy === PAGINATION_STRATEGIES.CURSOR) {
    // Implement cursor logic
    return processed.slice(0, pageSize);
  }

  return processed.slice(startIndex, endIndex);
}, [serverSide, currentData, processClientSideData, pageSize, strategy, startIndex, endIndex]);

// Update data when dependencies change
useEffect(() => {
  if (!serverSide) {
    const newData = getCurrentPageData();
    setCurrentData(newData);
    onDataChange?.(newData);
  }
}, [page, pageSize, sortBy, sortDirection, filters, searchQuery, allData, serverSide]);

// Reset page when data changes (optional)
useEffect(() => {
  if (autoResetPage && !initialLoadRef.current) {
    setPage(1);
  }
  initialLoadRef.current = false;
}, [filters, searchQuery, sortBy, sortDirection, allData, autoResetPage]);

// Page navigation functions
const goToPage = useCallback((newPage) => {
  if (newPage < 1 || newPage > totalPages) return;
  
  setPage(newPage);
  onPageChange?.(newPage, pageSize);
  
  // Check cache
  const cacheKey = getCacheKey();
  if (cachePages && cache[cacheKey]) {
    setCurrentData(cache[cacheKey]);
  }
}, [totalPages, pageSize, onPageChange, cachePages, cache, getCacheKey]);

const nextPage = useCallback(() => {
  if (hasNextPage) {
    if (strategy === PAGINATION_STRATEGIES.CURSOR) {
      setPage(prev => prev + 1);
      // Update cursor
    } else {
      goToPage(page + 1);
    }
  }
}, [hasNextPage, strategy, page, goToPage]);

const prevPage = useCallback(() => {
  if (hasPrevPage) {
    goToPage(page - 1);
  }
}, [hasPrevPage, page, goToPage]);

const firstPage = useCallback(() => {
  goToPage(1);
}, [goToPage]);

const lastPage = useCallback(() => {
  goToPage(totalPages);
}, [totalPages, goToPage]);

// Page size functions
const setNewPageSize = useCallback((newSize) => {
  setPageSize(newSize);
  setTotalPages(Math.ceil(total / newSize));
  
  if (autoResetPageSize) {
    setPage(1);
  }
  
  onPageSizeChange?.(newSize);
}, [total, autoResetPageSize, onPageSizeChange]);

// Sort functions
const setSorting = useCallback((field, direction = SORT_DIRECTIONS.ASC) => {
  setSortBy(field);
  setSortDirection(direction);
  onSortChange?.({ field, direction });
}, [onSortChange]);

const toggleSort = useCallback((field) => {
  if (sortBy === field) {
    setSortDirection(prev => 
      prev === SORT_DIRECTIONS.ASC ? SORT_DIRECTIONS.DESC : SORT_DIRECTIONS.ASC
    );
  } else {
    setSortBy(field);
    setSortDirection(SORT_DIRECTIONS.ASC);
  }
  onSortChange?.({ field: sortBy, direction: sortDirection });
}, [sortBy, sortDirection, onSortChange]);

// Filter functions
const setFilter = useCallback((key, value) => {
  setFilters(prev => ({
    ...prev,
    [key]: value
  }));
  onFilterChange?.({ ...filters, [key]: value });
}, [filters, onFilterChange]);

const removeFilter = useCallback((key) => {
  setFilters(prev => {
    const newFilters = { ...prev };
    delete newFilters[key];
    return newFilters;
  });
  onFilterChange?.(filters);
}, [filters, onFilterChange]);

const clearFilters = useCallback(() => {
  setFilters({});
  setSearchQuery('');
  onFilterChange?.({});
}, [onFilterChange]);

// Search function
const setSearch = useCallback((query) => {
  setSearchQuery(query);
  if (autoResetPage) {
    setPage(1);
  }
}, [autoResetPage]);

const debouncedSearch = useDebounce(setSearch, 300);
    // Infinite scroll logic
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = useCallback(() => {
    if (mode !== DISPLAY_MODES.INFINITE_SCROLL && mode !== DISPLAY_MODES.LOAD_MORE) return;
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    
    // Simulate loading more data
    setTimeout(() => {
      if (mode === DISPLAY_MODES.INFINITE_SCROLL) {
        // Load next page
        nextPage();
      }
      setLoadingMore(false);
    }, 500);
  }, [mode, hasMore, loadingMore, nextPage]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (mode !== DISPLAY_MODES.INFINITE_SCROLL) return;

    const options = {
      root: null,
      rootMargin: `${infiniteScrollThreshold}px`,
      threshold: 0
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && hasNextPage && !loading) {
          loadMore();
        }
      });
    }, options);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [mode, infiniteScrollThreshold, hasNextPage, loading, loadMore]);

  // Cache management
  const updateCache = useCallback((key, data) => {
    if (!cachePages) return;

    setCache(prev => {
      const newCache = { ...prev, [key]: data };
      
      // Limit cache size
      const keys = Object.keys(newCache);
      if (keys.length > maxCacheSize) {
        delete newCache[keys[0]];
      }
      
      // Set cache expiry
      if (cacheTimerRef.current) {
        clearTimeout(cacheTimerRef.current);
      }
      
      cacheTimerRef.current = setTimeout(() => {
        setCache({});
      }, cacheTime);
      
      return newCache;
    });
  }, [cachePages, maxCacheSize, cacheTime]);

  // Clear cache
  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  // Reset all state
  const reset = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
    setSortBy(null);
    setSortDirection(SORT_DIRECTIONS.ASC);
    setFilters({});
    setSearchQuery('');
    setCursors({});
    setNextCursor(null);
    setPrevCursor(null);
    setError(null);
    clearCache();
  }, [initialPage, initialPageSize, clearCache]);

  // URL synchronization
  useEffect(() => {
    if (!syncWithUrl) return;

    const params = new URLSearchParams(window.location.search);
    
    const urlPage = params.get('page');
    const urlPageSize = params.get('pageSize');
    const urlSortBy = params.get('sortBy');
    const urlSortDir = params.get('sortDir');
    const urlFilters = params.get('filters');
    const urlSearch = params.get('search');

    if (urlPage) setPage(parseInt(urlPage));
    if (urlPageSize) setPageSize(parseInt(urlPageSize));
    if (urlSortBy) setSortBy(urlSortBy);
    if (urlSortDir) setSortDirection(urlSortDir);
    if (urlFilters) setFilters(JSON.parse(decodeURIComponent(urlFilters)));
    if (urlSearch) setSearchQuery(urlSearch);
  }, [syncWithUrl]);

  useEffect(() => {
    if (!syncWithUrl) return;

    const params = new URLSearchParams();
    
    params.set('page', page.toString());
    params.set('pageSize', pageSize.toString());
    if (sortBy) params.set('sortBy', sortBy);
    if (sortDirection) params.set('sortDir', sortDirection);
    if (Object.keys(filters).length > 0) {
      params.set('filters', encodeURIComponent(JSON.stringify(filters)));
    }
    if (searchQuery) params.set('search', searchQuery);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [page, pageSize, sortBy, sortDirection, filters, searchQuery, syncWithUrl]);

  // Return object
  return {
    // Core state
    data: currentData,
    allData,
    page,
    pageSize,
    total,
    totalPages,
    
    // Navigation
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    hasNextPage,
    hasPrevPage,
    
    // Page info
    from,
    to,
    startIndex,
    endIndex,
    
    // Page size
    setPageSize: setNewPageSize,
    pageSizeOptions,
    
    // Sorting
    sortBy,
    sortDirection,
    setSorting,
    toggleSort,
    
    // Filtering
    filters,
    searchQuery,
    setFilter,
    removeFilter,
    clearFilters,
    setSearch,
    debouncedSearch,
    
    // Loading states
    loading,
    setLoading,
    loadingMore,
    error,
    setError,
    
    // Infinite scroll
    hasMore,
    loadMore,
    
    // Cache
    cache,
    updateCache,
    clearCache,
    
    // Reset
    reset,
    
    // Pagination range
    getPageRange: useCallback((range = 5) => {
      const half = Math.floor(range / 2);
      let start = Math.max(1, page - half);
      let end = Math.min(totalPages, start + range - 1);
      
      if (end - start + 1 < range) {
        start = Math.max(1, end - range + 1);
      }
      
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }, [page, totalPages]),
    
    // Status flags
    isFirstPage: page === 1,
    isLastPage: page === totalPages,
    isEmpty: currentData.length === 0,
    isSinglePage: totalPages <= 1,
    
    // Display options
    showFirstLast,
    showPrevNext,
    showPageNumbers,
    showPageSize,
    showTotal,
    showJumpToPage,
    
    // Strategies
    strategy,
    mode,
    
    // Utilities
    refresh: useCallback(() => {
      const newData = getCurrentPageData();
      setCurrentData(newData);
    }, [getCurrentPageData])
  };
};

// Specialized hooks for different use cases
export const useInfiniteScroll = (data, options = {}) => {
  return usePagination(data, {
    mode: DISPLAY_MODES.INFINITE_SCROLL,
    ...options
  });
};

export const useLoadMore = (data, options = {}) => {
  return usePagination(data, {
    mode: DISPLAY_MODES.LOAD_MORE,
    ...options
  });
};

export const useCursorPagination = (options = {}) => {
  return usePagination([], {
    strategy: PAGINATION_STRATEGIES.CURSOR,
    ...options
  });
};

// Export constants
export const PAGINATION_CONSTANTS = {
  STRATEGIES: PAGINATION_STRATEGIES,
  DISPLAY_MODES,
  SORT_DIRECTIONS,
  DEFAULTS: DEFAULT_OPTIONS
};

export default usePagination;
