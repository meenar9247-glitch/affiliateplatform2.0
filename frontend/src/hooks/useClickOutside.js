import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Event types for click outside detection
export const EVENT_TYPES = {
  CLICK: 'click',
  MOUSE_DOWN: 'mousedown',
  MOUSE_UP: 'mouseup',
  TOUCH_START: 'touchstart',
  TOUCH_END: 'touchend',
  FOCUS_OUT: 'focusout',
  BLUR: 'blur',
  SCROLL: 'scroll',
  RESIZE: 'resize',
};

// Default options
const DEFAULT_OPTIONS = {
  eventType: 'mousedown', // Default event type
  enabled: true, // Whether the hook is enabled
  capture: false, // Use capture phase
  passive: false, // Use passive event listener
  once: false, // Trigger only once
  stopPropagation: false, // Stop event propagation
  preventDefault: false, // Prevent default event behavior
  excludeScroll: true, // Exclude scroll events from outside detection
  excludeResize: true, // Exclude resize events from outside detection
  excludeClasses: [], // Classes to exclude from outside detection
  excludeIds: [], // IDs to exclude from outside detection
  excludeRefs: [], // Additional refs to exclude
  includeRefs: [], // Refs to include (inverse of exclude)
  threshold: 0, // Threshold in pixels for edge detection
  debounceDelay: 0, // Debounce delay in ms
  throttleDelay: 0, // Throttle delay in ms
  onOutsideClick: null, // Callback for outside click
  onInsideClick: null, // Callback for inside click
  onEdgeClick: null, // Callback for edge clicks
};

export const useClickOutside = (ref, handler, options = {}) => {
  // Merge options with defaults
  const {
    eventType = DEFAULT_OPTIONS.eventType,
    enabled = DEFAULT_OPTIONS.enabled,
    capture = DEFAULT_OPTIONS.capture,
    passive = DEFAULT_OPTIONS.passive,
    once = DEFAULT_OPTIONS.once,
    stopPropagation = DEFAULT_OPTIONS.stopPropagation,
    preventDefault = DEFAULT_OPTIONS.preventDefault,
    excludeScroll = DEFAULT_OPTIONS.excludeScroll,
    excludeResize = DEFAULT_OPTIONS.excludeResize,
    excludeClasses = DEFAULT_OPTIONS.excludeClasses,
    excludeIds = DEFAULT_OPTIONS.excludeIds,
    excludeRefs = DEFAULT_OPTIONS.excludeRefs,
    includeRefs = DEFAULT_OPTIONS.includeRefs,
    threshold = DEFAULT_OPTIONS.threshold,
    debounceDelay = DEFAULT_OPTIONS.debounceDelay,
    throttleDelay = DEFAULT_OPTIONS.throttleDelay,
    onOutsideClick = DEFAULT_OPTIONS.onOutsideClick,
    onInsideClick = DEFAULT_OPTIONS.onInsideClick,
    onEdgeClick = DEFAULT_OPTIONS.onEdgeClick,
  } = options;

  // State for tracking clicks
  const [isInside, setIsInside] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [clickTarget, setClickTarget] = useState(null);
  const [clickCount, setClickCount] = useState(0);
  
  // Refs for performance
  const handlerRef = useRef(handler);
  const timeoutRef = useRef(null);
  const throttleRef = useRef(null);
  const lastCallRef = useRef(0);
  const excludedElementsRef = useRef(new Set());
  const includedElementsRef = useRef(new Set());
  const observerRef = useRef(null);

  // Update handler ref when handler changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  // Combine all refs to exclude
  const allExcludeRefs = useMemo(() => {
    const refs = [ref, ...excludeRefs];
    return refs.filter(Boolean);
  }, [ref, excludeRefs]);

  // Combine all refs to include
  const allIncludeRefs = useMemo(() => {
    return includeRefs.filter(Boolean);
  }, [includeRefs]);

  // Check if element matches excluded classes/IDs
  const isExcludedBySelector = useCallback((element) => {
    if (!element) return false;

    // Check classes
    for (const className of excludeClasses) {
      if (element.classList?.contains(className)) return true;
      if (element.closest?.(`.${className}`)) return true;
    }

    // Check IDs
    for (const id of excludeIds) {
      if (element.id === id) return true;
      if (element.closest?.(`#${id}`)) return true;
    }

    return false;
  }, [excludeClasses, excludeIds]);

  // Check if element is inside any of the included refs
  const isInsideIncluded = useCallback((element) => {
    if (allIncludeRefs.length === 0) return false;

    return allIncludeRefs.some(includeRef => {
      if (!includeRef.current) return false;
      return includeRef.current.contains(element);
    });
  }, [allIncludeRefs]);

  // Check if element is inside any of the excluded refs
  const isInsideExcluded = useCallback((element) => {
    return allExcludeRefs.some(excludeRef => {
      if (!excludeRef.current) return false;
      return excludeRef.current.contains(element);
    }) || isExcludedBySelector(element);
  }, [allExcludeRefs, isExcludedBySelector]);

  // Check if click is on the edge of the element
  const isEdgeClick = useCallback((event, element) => {
    if (!element || threshold === 0) return false;

    const rect = element.getBoundingClientRect();
    const { clientX, clientY } = event;

    const isLeftEdge = clientX <= rect.left + threshold;
    const isRightEdge = clientX >= rect.right - threshold;
    const isTopEdge = clientY <= rect.top + threshold;
    const isBottomEdge = clientY >= rect.bottom - threshold;

    return isLeftEdge || isRightEdge || isTopEdge || isBottomEdge;
  }, [threshold]);

  // Get click position relative to element
  const getRelativePosition = useCallback((event, element) => {
    if (!element) return { x: 0, y: 0, percentageX: 0, percentageY: 0 };

    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    return {
      x,
      y,
      percentageX: (x / rect.width) * 100,
      percentageY: (y / rect.height) * 100,
      clampedX: Math.max(0, Math.min(x, rect.width)),
      clampedY: Math.max(0, Math.min(y, rect.height)),
    };
  }, []);

  // Check if element is visible
  const isElementVisible = useCallback((element) => {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    );
  }, []);
  // Main click outside handler
  const handleEvent = useCallback((event) => {
    if (!enabled) return;

    // Get the target element
    const target = event.target;
    setClickTarget(target);
    setClickPosition({ x: event.clientX, y: event.clientY });
    setClickCount(prev => prev + 1);

    // Handle scroll events
    if (event.type === EVENT_TYPES.SCROLL && excludeScroll) return;
  
    // Handle resize events
    if (event.type === EVENT_TYPES.RESIZE && excludeResize) return;

    // Check if target exists
    if (!target) return;

    // Check if any of the main refs exist
    if (allExcludeRefs.length === 0) return;

    // Check if click is inside included refs (inverse logic)
    if (allIncludeRefs.length > 0) {
      const isIncluded = isInsideIncluded(target);
      if (!isIncluded) {
      // Click is outside included refs, trigger outside handler
        handlerRef.current?.(event, {
          type: 'outside',
          target,
          position: { x: event.clientX, y: event.clientY },
          relativePosition: null,
        });
        onOutsideClick?.(event, target);
        return;
      }
    }

    // Check if click is inside any excluded element
    const isInside = allExcludeRefs.some(excludeRef => {
      if (!excludeRef.current) return false;
      return excludeRef.current.contains(target);
    }) || isExcludedBySelector(target);

    // Update inside state
    setIsInside(isInside);

    // Get relative position for inside clicks
    let relativePosition = null;
    let edgeDetected = false;

    if (isInside) {
      const mainRef = allExcludeRefs[0]; // Use first ref for relative positioning
      if (mainRef?.current) {
        relativePosition = getRelativePosition(event, mainRef.current);
      
        // Check for edge clicks
        if (isEdgeClick(event, mainRef.current)) {
          edgeDetected = true;
          onEdgeClick?.(event, mainRef.current, relativePosition);
        }
      }

      // Trigger inside click callback
      onInsideClick?.(event, target, relativePosition);
    } else {
    // Click is outside, trigger handler
      handlerRef.current?.(event, {
        type: 'outside',
        target,
        position: { x: event.clientX, y: event.clientY },
        relativePosition: null,
      });
      onOutsideClick?.(event, target);
    }

    // Stop propagation if needed
    if (stopPropagation) {
      event.stopPropagation();
    }

    // Prevent default if needed
    if (preventDefault) {
      event.preventDefault();
    }
  }, [
    enabled,
    excludeScroll,
    excludeResize,
    allExcludeRefs,
    allIncludeRefs,
    isInsideIncluded,
    isExcludedBySelector,
    getRelativePosition,
    isEdgeClick,
    stopPropagation,
    preventDefault,
    onOutsideClick,
    onInsideClick,
    onEdgeClick,
  ]);

  // Debounced event handler
  const debouncedHandler = useCallback((event) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      handleEvent(event);
    }, debounceDelay);
  }, [handleEvent, debounceDelay]);

  // Throttled event handler
  const throttledHandler = useCallback((event) => {
    const now = Date.now();

    if (now - lastCallRef.current >= throttleDelay) {
      handleEvent(event);
      lastCallRef.current = now;
    } else {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }

      throttleRef.current = setTimeout(() => {
        handleEvent(event);
        lastCallRef.current = Date.now();
      }, throttleDelay - (now - lastCallRef.current));
    }
  }, [handleEvent, throttleDelay]);

  // Choose the appropriate handler
  const eventHandler = useMemo(() => {
    if (debounceDelay > 0) return debouncedHandler;
    if (throttleDelay > 0) return throttledHandler;
    return handleEvent;
  }, [debounceDelay, throttleDelay, debouncedHandler, throttledHandler, handleEvent]);

  // Setup MutationObserver to watch for DOM changes
  useEffect(() => {
    if (typeof MutationObserver === 'undefined') return;

    observerRef.current = new MutationObserver((mutations) => {
    // Clear and rebuild excluded elements cache if needed
      excludedElementsRef.current.clear();
      includedElementsRef.current.clear();
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (!enabled || allExcludeRefs.length === 0) return;

    // Handle multiple event types
    const events = Array.isArray(eventType) ? eventType : [eventType];

    // Add event listeners
    events.forEach(type => {
      document.addEventListener(type, eventHandler, {
        capture,
        passive,
        once,
      });
    });

    // Cleanup
    return () => {
      events.forEach(type => {
        document.removeEventListener(type, eventHandler, { capture });
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, [enabled, eventType, eventHandler, capture, passive, once, allExcludeRefs]);

  // Handle iframe clicks (cross-origin iframes need special handling)
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleBlur = () => {
    // Check if we lost focus to an iframe
      setTimeout(() => {
        const activeElement = document.activeElement;
        if (activeElement?.tagName === 'IFRAME') {
        // Treat as outside click
          const fakeEvent = { type: 'iframe-blur', target: activeElement };
          handleEvent(fakeEvent);
        }
      }, 0);
    };

    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, [enabled, handleEvent]);
  // Return value with additional utilities
  return {
    // Core state
    isInside,
    clickPosition,
    clickTarget,
    clickCount,
    
    // Methods
    reset: useCallback(() => {
      setClickCount(0);
      setClickTarget(null);
      setClickPosition({ x: 0, y: 0 });
    }, []),
    
    // Check if element is inside ref
    isElementInside: useCallback((element) => {
      if (!element) return false;
      return allExcludeRefs.some(ref => ref.current?.contains(element));
    }, [allExcludeRefs]),
    
    // Get click position relative to ref
    getClickPosition: useCallback(() => {
      if (!allExcludeRefs[0]?.current) return null;
      return getRelativePosition(
        { clientX: clickPosition.x, clientY: clickPosition.y },
        allExcludeRefs[0].current,
      );
    }, [clickPosition, allExcludeRefs, getRelativePosition]),
    
    // Check if element is visible
    isVisible: useCallback((element) => {
      return isElementVisible(element || allExcludeRefs[0]?.current);
    }, [allExcludeRefs, isElementVisible]),
    
    // Focus trap management
    focusTrap: useCallback((enable = true) => {
      if (!allExcludeRefs[0]?.current) return;

      const element = allExcludeRefs[0].current;
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (enable && focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }, [allExcludeRefs]),
  };
};

// Hook for multiple refs
export const useClickOutsideMultiple = (refs, handler, options = {}) => {
  return useClickOutside(refs[0], handler, {
    ...options,
    excludeRefs: refs.slice(1),
  });
};

// Hook for modal/dialog
export const useModalOutside = (isOpen, onClose, options = {}) => {
  const modalRef = useRef(null);
  const [shouldClose, setShouldClose] = useState(false);

  useClickOutside(modalRef, (event, info) => {
    if (info.type === 'outside' && isOpen && !shouldClose) {
      onClose?.(event);
    }
  }, {
    enabled: isOpen,
    ...options,
  });

  return {
    modalRef,
    shouldClose,
    setShouldClose,
  };
};

// Hook for dropdown
export const useDropdownOutside = (options = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useClickOutsideMultiple([dropdownRef, buttonRef], () => {
    setIsOpen(false);
  }, {
    enabled: isOpen,
    ...options,
  });

  return {
    isOpen,
    setIsOpen,
    dropdownRef,
    buttonRef,
    toggle: () => setIsOpen(prev => !prev),
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
};

// Hook for popover
export const usePopoverOutside = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  useClickOutsideMultiple([popoverRef, triggerRef], () => {
    setIsVisible(false);
  }, {
    enabled: isVisible,
    ...options,
  });

  return {
    isVisible,
    setIsVisible,
    popoverRef,
    triggerRef,
    show: () => setIsVisible(true),
    hide: () => setIsVisible(false),
    toggle: () => setIsVisible(prev => !prev),
  };
};

// Hook for tooltip
export const useTooltipOutside = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);
  const targetRef = useRef(null);
  const timeoutRef = useRef(null);

  const {
    delay = 300,
    ...outsideOptions
  } = options;

  useClickOutside(tooltipRef, () => {
    setIsVisible(false);
  }, {
    enabled: isVisible,
    ...outsideOptions,
  });

  const show = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  }, []);

  return {
    isVisible,
    tooltipRef,
    targetRef,
    show,
    hide,
    toggle: () => setIsVisible(prev => !prev),
  };
};

// Hook for context menu
export const useContextMenuOutside = (options = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);

  useClickOutside(menuRef, () => {
    setIsOpen(false);
  }, {
    enabled: isOpen,
    ...options,
  });

  const open = useCallback((event) => {
    event.preventDefault();
    setPosition({ x: event.clientX, y: event.clientY });
    setIsOpen(true);
  }, []);

  return {
    isOpen,
    position,
    menuRef,
    open,
    close: () => setIsOpen(false),
  };
};

// Hook for date picker
export const useDatePickerOutside = (options = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);
  const inputRef = useRef(null);

  useClickOutsideMultiple([pickerRef, inputRef], () => {
    setIsOpen(false);
  }, {
    enabled: isOpen,
    ...options,
  });

  return {
    isOpen,
    setIsOpen,
    pickerRef,
    inputRef,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
};

// Utility functions
export const clickOutsideUtils = {
  // Check if click is outside element
  isClickOutside: (event, element) => {
    if (!element) return true;
    return !element.contains(event.target);
  },

  // Get click coordinates
  getClickCoordinates: (event) => ({
    x: event.clientX,
    y: event.clientY,
    pageX: event.pageX,
    pageY: event.pageY,
    screenX: event.screenX,
    screenY: event.screenY,
  }),

  // Get element bounds
  getElementBounds: (element) => {
    if (!element) return null;
    return element.getBoundingClientRect();
  },

  // Check if element is in viewport
  isInViewport: (element) => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Get distance from click to element edges
  getDistanceFromEdges: (event, element) => {
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {
      top: Math.abs(event.clientY - rect.top),
      right: Math.abs(rect.right - event.clientX),
      bottom: Math.abs(rect.bottom - event.clientY),
      left: Math.abs(event.clientX - rect.left),
    };
  },
};

// Export constants
export const CLICK_EVENT_TYPES = EVENT_TYPES;

export default useClickOutside;
