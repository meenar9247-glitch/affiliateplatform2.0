import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import { useDebounce } from './useDebounce';
import { useThrottle } from './useThrottle';

// Breakpoint constants for responsive design
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
  '4xl': 2560,
};

// Device types
export const DEVICE_TYPES = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  LAPTOP: 'laptop',
  DESKTOP: 'desktop',
  TV: 'tv',
};

// Orientation types
export const ORIENTATIONS = {
  PORTRAIT: 'portrait',
  LANDSCAPE: 'landscape',
};

// Aspect ratios
export const ASPECT_RATIOS = {
  SQUARE: '1:1',
  STANDARD: '4:3',
  WIDESCREEN: '16:9',
  ULTRAWIDE: '21:9',
  CINEMATIC: '2.35:1',
};

// Viewport categories
export const VIEWPORT_CATEGORIES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  '2XL': '2xl',
  '3XL': '3xl',
  '4XL': '4xl',
};

// Default options
const DEFAULT_OPTIONS = {
  debounceDelay: 150,
  throttleDelay: 100,
  includeScrollbar: true,
  includeOrientation: true,
  includeAspectRatio: true,
  includeDeviceType: true,
  includeBreakpoints: true,
  includeDimensions: true,
  includePosition: false,
  includeMotion: false,
  includePerformance: false,
  onResize: null,
  onOrientationChange: null,
  onBreakpointChange: null,
};

export const useWindowSize = (options = {}) => {
  const {
    debounceDelay = 150,
    throttleDelay = 100,
    includeScrollbar = true,
    includeOrientation = true,
    includeAspectRatio = true,
    includeDeviceType = true,
    includeBreakpoints = true,
    includeDimensions = true,
    includePosition = false,
    includeMotion = false,
    includePerformance = false,
    onResize = null,
    onOrientationChange = null,
    onBreakpointChange = null,
  } = { ...DEFAULT_OPTIONS, ...options };

  // Core dimensions
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    outerWidth: typeof window !== 'undefined' ? window.outerWidth : 0,
    outerHeight: typeof window !== 'undefined' ? window.outerHeight : 0,
    screenWidth: typeof window !== 'undefined' ? window.screen.width : 0,
    screenHeight: typeof window !== 'undefined' ? window.screen.height : 0,
    availWidth: typeof window !== 'undefined' ? window.screen.availWidth : 0,
    availHeight: typeof window !== 'undefined' ? window.screen.availHeight : 0,
    colorDepth: typeof window !== 'undefined' ? window.screen.colorDepth : 0,
    pixelDepth: typeof window !== 'undefined' ? window.screen.pixelDepth : 0,
  });

  // Scrollbar dimensions
  const [scrollbarSize, setScrollbarSize] = useState({
    width: 0,
    height: 0,
  });

  // Position and motion
  const [position, setPosition] = useState({
    scrollX: typeof window !== 'undefined' ? window.scrollX : 0,
    scrollY: typeof window !== 'undefined' ? window.scrollY : 0,
    pageXOffset: typeof window !== 'undefined' ? window.pageXOffset : 0,
    pageYOffset: typeof window !== 'undefined' ? window.pageYOffset : 0,
    screenX: typeof window !== 'undefined' ? window.screenX : 0,
    screenY: typeof window !== 'undefined' ? window.screenY : 0,
  });

  const [motion, setMotion] = useState({
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    mozOrientation: typeof window !== 'undefined' ? window.screen?.mozOrientation : null,
    orientation: typeof window !== 'undefined' ? window.screen?.orientation : null,
  });

  // Performance metrics
  const [performance, setPerformance] = useState({
    frameRate: 0,
    frameCount: 0,
    lastFrameTime: 0,
    averageFPS: 0,
  });

  // Refs for performance tracking
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const mediaQueryListsRef = useRef({});
  const orientationChangeRef = useRef(null);

  // Calculate derived values
  const orientation = useMemo(() => {
    if (!includeOrientation) return null;
    return windowSize.width > windowSize.height ? ORIENTATIONS.LANDSCAPE : ORIENTATIONS.PORTRAIT;
  }, [windowSize.width, windowSize.height, includeOrientation]);

  const aspectRatio = useMemo(() => {
    if (!includeAspectRatio) return null;
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(windowSize.width, windowSize.height);
    return `${windowSize.width / divisor}:${windowSize.height / divisor}`;
  }, [windowSize.width, windowSize.height, includeAspectRatio]);

  const deviceType = useMemo(() => {
    if (!includeDeviceType) return null;
    
    const width = windowSize.width;
    const height = windowSize.height;
    const ratio = width / height;

    if (width < BREAKPOINTS.sm) return DEVICE_TYPES.MOBILE;
    if (width < BREAKPOINTS.md) return DEVICE_TYPES.TABLET;
    if (width < BREAKPOINTS.lg) return DEVICE_TYPES.LAPTOP;
    if (width < BREAKPOINTS['4xl']) return DEVICE_TYPES.DESKTOP;
    return DEVICE_TYPES.TV;
  }, [windowSize.width, windowSize.height, includeDeviceType]);

  const currentBreakpoint = useMemo(() => {
    if (!includeBreakpoints) return null;
    
    const width = windowSize.width;
    
    if (width >= BREAKPOINTS['4xl']) return VIEWPORT_CATEGORIES['4XL'];
    if (width >= BREAKPOINTS['3xl']) return VIEWPORT_CATEGORIES['3XL'];
    if (width >= BREAKPOINTS['2xl']) return VIEWPORT_CATEGORIES['2XL'];
    if (width >= BREAKPOINTS.xl) return VIEWPORT_CATEGORIES.XL;
    if (width >= BREAKPOINTS.lg) return VIEWPORT_CATEGORIES.LG;
    if (width >= BREAKPOINTS.md) return VIEWPORT_CATEGORIES.MD;
    if (width >= BREAKPOINTS.sm) return VIEWPORT_CATEGORIES.SM;
    return VIEWPORT_CATEGORIES.XS;
  }, [windowSize.width, includeBreakpoints]);

  const breakpoints = useMemo(() => {
    if (!includeBreakpoints) return null;
    
    return {
      isXs: windowSize.width < BREAKPOINTS.sm,
      isSm: windowSize.width >= BREAKPOINTS.sm && windowSize.width < BREAKPOINTS.md,
      isMd: windowSize.width >= BREAKPOINTS.md && windowSize.width < BREAKPOINTS.lg,
      isLg: windowSize.width >= BREAKPOINTS.lg && windowSize.width < BREAKPOINTS.xl,
      isXl: windowSize.width >= BREAKPOINTS.xl && windowSize.width < BREAKPOINTS['2xl'],
      is2xl: windowSize.width >= BREAKPOINTS['2xl'] && windowSize.width < BREAKPOINTS['3xl'],
      is3xl: windowSize.width >= BREAKPOINTS['3xl'] && windowSize.width < BREAKPOINTS['4xl'],
      is4xl: windowSize.width >= BREAKPOINTS['4xl'],
      
      // Helper methods
      greaterThan: (breakpoint) => windowSize.width > BREAKPOINTS[breakpoint],
      greaterThanOrEqual: (breakpoint) => windowSize.width >= BREAKPOINTS[breakpoint],
      lessThan: (breakpoint) => windowSize.width < BREAKPOINTS[breakpoint],
      lessThanOrEqual: (breakpoint) => windowSize.width <= BREAKPOINTS[breakpoint],
      between: (min, max) => 
        windowSize.width >= BREAKPOINTS[min] && windowSize.width < BREAKPOINTS[max],
    };
  }, [windowSize.width, includeBreakpoints]);

  // Calculate scrollbar size
  useEffect(() => {
    if (!includeScrollbar) return;

    const calculateScrollbarSize = () => {
      const inner = document.createElement('div');
      inner.style.width = '100%';
      inner.style.height = '100%';

      const outer = document.createElement('div');
      outer.style.position = 'absolute';
      outer.style.top = '0';
      outer.style.left = '0';
      outer.style.visibility = 'hidden';
      outer.style.width = '100px';
      outer.style.height = '100px';
      outer.style.overflow = 'hidden';
      outer.appendChild(inner);

      document.body.appendChild(outer);
      
      const widthNoScroll = inner.offsetWidth;
      outer.style.overflow = 'scroll';
      const widthWithScroll = inner.offsetWidth;
      
      document.body.removeChild(outer);

      setScrollbarSize({
        width: widthNoScroll - widthWithScroll,
        height: widthNoScroll - widthWithScroll,
      });
    };

    calculateScrollbarSize();
    window.addEventListener('resize', calculateScrollbarSize);
    
    return () => window.removeEventListener('resize', calculateScrollbarSize);
  }, [includeScrollbar]);
  // Handle resize with debounce/throttle
  const handleResize = useCallback(() => {
    const newSize = {
      width: window.innerWidth,
      height: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
    };

    setWindowSize(newSize);
    onResize?.(newSize);
  }, [onResize]);

  const debouncedResize = useDebounce(handleResize, debounceDelay);
  const throttledResize = useThrottle(handleResize, throttleDelay);

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (!includePosition) return;
  
    setPosition({
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      pageXOffset: window.pageXOffset,
      pageYOffset: window.pageYOffset,
      screenX: window.screenX,
      screenY: window.screenY,
    });
  }, [includePosition]);

  const debouncedScroll = useDebounce(handleScroll, debounceDelay);
  const throttledScroll = useThrottle(handleScroll, throttleDelay);

  // Handle orientation change
  const handleOrientationChange = useCallback(() => {
    if (!includeOrientation) return;
  
    setMotion(prev => ({
      ...prev,
      orientation: window.screen?.orientation,
      mozOrientation: window.screen?.mozOrientation,
    }));
  
    onOrientationChange?.({
      orientation,
      aspectRatio,
      deviceType,
    });
  }, [includeOrientation, orientation, aspectRatio, deviceType, onOrientationChange]);

  // Setup event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Choose resize handler based on options
    const resizeHandler = debounceDelay > 0 ? debouncedResize : 
      throttleDelay > 0 ? throttledResize : 
        handleResize;

    window.addEventListener('resize', resizeHandler);
  
    // Initial call
    handleResize();

    // Scroll listener
    if (includePosition) {
      const scrollHandler = debounceDelay > 0 ? debouncedScroll : 
        throttleDelay > 0 ? throttledScroll : 
          handleScroll;
    
      window.addEventListener('scroll', scrollHandler);
      handleScroll();
    
      return () => {
        window.removeEventListener('scroll', scrollHandler);
      };
    }

    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [debouncedResize, throttledResize, handleResize, debouncedScroll, throttledScroll, handleScroll, includePosition, debounceDelay, throttleDelay]);

  // Setup ResizeObserver for more accurate measurements
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ResizeObserver) return;

    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === document.documentElement) {
          handleResize();
        }
      }
    });

    resizeObserverRef.current.observe(document.documentElement);

    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, [handleResize]);

  // Setup media query listeners for breakpoints
  useEffect(() => {
    if (!includeBreakpoints || typeof window === 'undefined') return;

    const mediaQueries = Object.entries(BREAKPOINTS).map(([key, value]) => ({
      key,
      query: window.matchMedia(`(min-width: ${value}px)`),
    }));

    const handleMediaChange = () => {
      const newBreakpoint = currentBreakpoint;
      onBreakpointChange?.(newBreakpoint);
    };

    mediaQueries.forEach(({ key, query }) => {
      mediaQueryListsRef.current[key] = query;
      query.addEventListener('change', handleMediaChange);
    });

    return () => {
      mediaQueries.forEach(({ key, query }) => {
        query.removeEventListener('change', handleMediaChange);
      });
    };
  }, [includeBreakpoints, currentBreakpoint, onBreakpointChange]);

  // Setup orientation change listener
  useEffect(() => {
    if (!includeOrientation || typeof window === 'undefined') return;

    window.addEventListener('orientationchange', handleOrientationChange);
  
    // Also listen for screen orientation changes
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationChange);
    }

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientationChange);
      }
    };
  }, [includeOrientation, handleOrientationChange]);

  // Performance monitoring
  useEffect(() => {
    if (!includePerformance) return;

    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;
    
      if (delta >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / delta);
        setPerformance(prev => ({
          ...prev,
          frameRate: fps,
          averageFPS: prev.averageFPS === 0 ? fps : (prev.averageFPS + fps) / 2,
          lastFrameTime: now,
        }));
      
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
    
      frameCountRef.current++;
      animationFrameRef.current = requestAnimationFrame(measureFPS);
    };

    animationFrameRef.current = requestAnimationFrame(measureFPS);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [includePerformance]);

  // Memory management
  useEffect(() => {
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Helper functions
  const isInViewport = useCallback((element, offset = 0) => {
    if (!element) return false;
  
    const rect = element.getBoundingClientRect();
    return (
      rect.top + offset >= 0 &&
    rect.left + offset >= 0 &&
    rect.bottom - offset <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right - offset <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }, []);

  const getElementPosition = useCallback((element) => {
    if (!element) return null;
  
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      bottom: rect.bottom + window.scrollY,
      right: rect.right + window.scrollX,
      width: rect.width,
      height: rect.height,
      x: rect.x,
      y: rect.y,
    };
  }, []);

  const isElementVisible = useCallback((element, threshold = 0) => {
    if (!element) return false;
  
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
    const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
    const visibleWidth = Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);
    const visibleArea = visibleHeight * visibleWidth;
    const totalArea = rect.height * rect.width;
  
    return visibleArea >= totalArea * threshold;
  }, []);
    // Compose return object
  const returnValue = useMemo(() => {
    const result = {
      // Core dimensions
      ...windowSize,
      
      // Scrollbar size
      scrollbar: scrollbarSize,
      
      // Orientation and aspect ratio
      orientation,
      aspectRatio,
      deviceType,
      
      // Breakpoints
      breakpoint: currentBreakpoint,
      breakpoints,
      
      // Position
      ...(includePosition ? position : {}),
      
      // Motion
      ...(includeMotion ? motion : {}),
      
      // Performance
      ...(includePerformance ? performance : {}),
      
      // Utility functions
      isInViewport,
      getElementPosition,
      isElementVisible,
      
      // Helper booleans
      isPortrait: orientation === ORIENTATIONS.PORTRAIT,
      isLandscape: orientation === ORIENTATIONS.LANDSCAPE,
      isMobile: deviceType === DEVICE_TYPES.MOBILE,
      isTablet: deviceType === DEVICE_TYPES.TABLET,
      isLaptop: deviceType === DEVICE_TYPES.LAPTOP,
      isDesktop: deviceType === DEVICE_TYPES.DESKTOP,
      isTv: deviceType === DEVICE_TYPES.TV,
      
      // Breakpoint booleans
      ...(breakpoints || {}),
    };

    // Add dimension categories
    if (includeDimensions) {
      result.dimensions = {
        inner: { width: windowSize.width, height: windowSize.height },
        outer: { width: windowSize.outerWidth, height: windowSize.outerHeight },
        screen: { width: windowSize.screenWidth, height: windowSize.screenHeight },
        available: { width: windowSize.availWidth, height: windowSize.availHeight },
      };
    }

    return result;
  }, [
    windowSize,
    scrollbarSize,
    orientation,
    aspectRatio,
    deviceType,
    currentBreakpoint,
    breakpoints,
    position,
    motion,
    performance,
    includePosition,
    includeMotion,
    includePerformance,
    includeDimensions,
    isInViewport,
    getElementPosition,
    isElementVisible,
  ]);

  return returnValue;
};

// Custom hook for specific breakpoint checks
export const useBreakpoint = (breakpoint) => {
  const { width } = useWindowSize({ includeBreakpoints: false });
  
  return useMemo(() => {
    if (breakpoint.startsWith('>=')) {
      const bp = breakpoint.slice(2);
      return width >= BREAKPOINTS[bp];
    }
    if (breakpoint.startsWith('<=')) {
      const bp = breakpoint.slice(2);
      return width <= BREAKPOINTS[bp];
    }
    if (breakpoint.startsWith('>')) {
      const bp = breakpoint.slice(1);
      return width > BREAKPOINTS[bp];
    }
    if (breakpoint.startsWith('<')) {
      const bp = breakpoint.slice(1);
      return width < BREAKPOINTS[bp];
    }
    return width >= BREAKPOINTS[breakpoint];
  }, [width, breakpoint]);
};

// Custom hook for responsive value based on breakpoints
export const useResponsive = (values) => {
  const { breakpoint } = useWindowSize();
  
  return useMemo(() => {
    if (!values || typeof values !== 'object') return values;
    
    // Return value for current breakpoint
    if (values[breakpoint] !== undefined) return values[breakpoint];
    
    // Fallback to smaller breakpoint
    const breakpoints = Object.keys(BREAKPOINTS).reverse();
    for (const bp of breakpoints) {
      if (values[bp] !== undefined && BREAKPOINTS[bp] <= BREAKPOINTS[breakpoint]) {
        return values[bp];
      }
    }
    
    // Fallback to default
    return values.default || values.base || null;
  }, [values, breakpoint]);
};

// Custom hook for media query
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  const [mediaQuery, setMediaQuery] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia(query);
    setMediaQuery(mq);
    setMatches(mq.matches);

    const handler = (e) => setMatches(e.matches);
    mq.addEventListener('change', handler);

    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

// Custom hook for viewport units (vh, vw)
export const useViewportUnits = () => {
  const { width, height } = useWindowSize();
  
  return useMemo(() => ({
    vh: (value) => (height * value) / 100,
    vw: (value) => (width * value) / 100,
    vmin: (value) => (Math.min(width, height) * value) / 100,
    vmax: (value) => (Math.max(width, height) * value) / 100,
  }), [width, height]);
};

// Custom hook for element dimensions
export const useElementSize = (ref) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref]);

  return size;
};

// Custom hook for element visibility
export const useElementVisibility = (ref, threshold = 0) => {
  const [isVisible, setIsVisible] = useState(false);
  const { isInViewport } = useWindowSize();

  useEffect(() => {
    if (!ref.current) return;

    const checkVisibility = () => {
      setIsVisible(isInViewport(ref.current, threshold));
    };

    checkVisibility();
    
    window.addEventListener('scroll', checkVisibility);
    window.addEventListener('resize', checkVisibility);

    return () => {
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
    };
  }, [ref, threshold, isInViewport]);

  return isVisible;
};

// Utility functions
export const windowSizeUtils = {
  // Convert pixels to rem
  pxToRem: (px, base = 16) => px / base,
  
  // Convert rem to pixels
  remToPx: (rem, base = 16) => rem * base,
  
  // Get CSS value with clamp for responsive sizing
  clamp: (min, preferred, max) => `clamp(${min}px, ${preferred}vw, ${max}px)`,
  
  // Get CSS value with min/max
  minmax: (min, max) => `minmax(${min}px, ${max}px)`,
  
  // Generate responsive grid columns
  gridColumns: (minWidth, gap = 16) => 
    `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
  
  // Check if element is in viewport
  isElementInViewport: (element, offset = 0) => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
      rect.top + offset >= 0 &&
      rect.left + offset >= 0 &&
      rect.bottom - offset <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right - offset <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },
  
  // Get scroll position
  getScrollPosition: () => ({
    x: window.scrollX,
    y: window.scrollY,
  }),
  
  // Smooth scroll to element
  scrollToElement: (element, options = {}) => {
    if (!element) return;
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      ...options,
    });
  },
};

// Export constants
export {
  BREAKPOINTS as SCREEN_BREAKPOINTS,
  DEVICE_TYPES as SCREEN_DEVICE_TYPES,
  ORIENTATIONS as SCREEN_ORIENTATIONS,
  ASPECT_RATIOS as SCREEN_ASPECT_RATIOS,
  VIEWPORT_CATEGORIES as SCREEN_CATEGORIES,
};

export default useWindowSize;
