import { createSlice, createSelector } from '@reduxjs/toolkit';

// ==================== UI Constants ====================

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
  DIM: 'dim',
  CONTRAST: 'high-contrast'
};

export const LAYOUTS = {
  DEFAULT: 'default',
  COMPACT: 'compact',
  COZY: 'cozy',
  WIDE: 'wide'
};

export const SIDEBAR_STATES = {
  EXPANDED: 'expanded',
  COLLAPSED: 'collapsed',
  HIDDEN: 'hidden',
  MOBILE: 'mobile'
};

export const MODAL_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  FULL: 'full',
  AUTO: 'auto'
};

export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  DEFAULT: 'default'
};

export const TOAST_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center'
};

export const ANIMATION_TYPES = {
  FADE: 'fade',
  SLIDE: 'slide',
  ZOOM: 'zoom',
  BOUNCE: 'bounce',
  NONE: 'none'
};

export const NOTIFICATION_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left'
};

// ==================== Initial State ====================

const initialState = {
  // Theme
  theme: THEMES.LIGHT,
  customTheme: null,
  
  // Layout
  layout: LAYOUTS.DEFAULT,
  layoutConfig: {
    containerWidth: '1200px',
    gutter: 16,
    columns: 12
  },
  
  // Sidebar
  sidebar: {
    open: true,
    state: SIDEBAR_STATES.EXPANDED,
    width: 280,
    collapsedWidth: 80,
    mobileWidth: '100%',
    activeItem: null,
    pinned: false,
    hovered: false
  },
  
  // Header
  header: {
    visible: true,
    sticky: true,
    height: 64,
    transparent: false,
    searchVisible: false
  },
  
  // Footer
  footer: {
    visible: true,
    height: 60
  },
  
  // Modals
  modals: {},
  modalHistory: [],
  activeModal: null,
  
  // Toasts
  toasts: [],
  maxToasts: 5,
  toastDefaults: {
    duration: 5000,
    position: TOAST_POSITIONS.TOP_RIGHT,
    type: TOAST_TYPES.DEFAULT,
    animation: ANIMATION_TYPES.SLIDE,
    dismissible: true
  },
  
  // Loading states
  loading: {
    global: false,
    page: false,
    overlay: false,
    skeleton: false,
    spinners: {}
  },
  
  // Progress indicators
  progress: {
    show: false,
    value: 0,
    indeterminate: false,
    message: null
  },
  
  // Notifications
  notifications: [],
  notificationDefaults: {
    position: NOTIFICATION_POSITIONS.TOP_RIGHT,
    duration: 5000,
    dismissible: true,
    icon: null
  },
  
  // Alerts
  alerts: [],
  
  // Drawers
  drawers: {},
  activeDrawer: null,
  
  // Tabs
  tabs: {},
  activeTab: {},
  
  // Accordions
  accordions: {},
  
  // Pagination
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    pageSizes: [10, 25, 50, 100]
  },
  
  // Filters
  filters: {},
  
  // Sort
  sort: {
    field: null,
    order: 'asc'
  },
  
  // Search
  search: {
    query: '',
    visible: false,
    recent: [],
    suggestions: []
  },
  
  // Breadcrumbs
  breadcrumbs: [],
  
  // Navigation
  navigation: {
    currentPath: '/',
    previousPath: null,
    history: []
  },
  
  // Scroll
  scroll: {
    positions: {},
    scrollToTop: false,
    smoothScroll: true
  },
  
  // Responsive
  responsive: {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    breakpoint: 'lg',
    dimensions: {
      width: 0,
      height: 0
    }
  },
  
  // Accessibility
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    screenReader: false,
    keyboardFocus: false
  },
  
  // Performance
  performance: {
    slowNetwork: false,
    lowMemory: false,
    offline: false,
    reducedData: false
  },
  
  // Feature flags
  features: {},
  
  // User preferences
  preferences: {
    compactMode: false,
    darkMode: false,
    language: 'en',
    fontSize: 'medium',
    reducedAnimations: false
  },
  
  // Context menus
  contextMenus: {},
  
  // Tooltips
  tooltips: {
    enabled: true,
    delay: 300,
    position: 'top'
  },
  
  // Errors
  errors: [],
  
  // Success messages
  success: [],
  
  // Warnings
  warnings: [],
  
  // Info messages
  info: [],
  
  // Debug
  debug: {
    enabled: false,
    logs: []
  },
  
  // Timestamps
  lastUpdated: Date.now(),
  lastAction: null
};

// ==================== Helper Functions ====================

const generateId = (prefix = '') => {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const calculateBreakpoint = (width) => {
  if (width < 576) return 'xs';
  if (width < 768) return 'sm';
  if (width < 992) return 'md';
  if (width < 1200) return 'lg';
  if (width < 1400) return 'xl';
  return 'xxl';
};

// ==================== UI Slice ====================

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    setTheme: (state, action) => {
      state.theme = action.payload;
      state.preferences.darkMode = action.payload === THEMES.DARK;
    },
    
    toggleTheme: (state) => {
      state.theme = state.theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
      state.preferences.darkMode = state.theme === THEMES.DARK;
    },
    
    setCustomTheme: (state, action) => {
      state.customTheme = action.payload;
    },
    
    // Layout actions
    setLayout: (state, action) => {
      state.layout = action.payload;
    },
    
    setLayoutConfig: (state, action) => {
      state.layoutConfig = { ...state.layoutConfig, ...action.payload };
    },
    
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebar.open = !state.sidebar.open;
      state.sidebar.state = state.sidebar.open ? SIDEBAR_STATES.EXPANDED : SIDEBAR_STATES.COLLAPSED;
    },
    
    setSidebarOpen: (state, action) => {
      state.sidebar.open = action.payload;
      state.sidebar.state = action.payload ? SIDEBAR_STATES.EXPANDED : SIDEBAR_STATES.COLLAPSED;
    },
    
    setSidebarState: (state, action) => {
      state.sidebar.state = action.payload;
      state.sidebar.open = action.payload !== SIDEBAR_STATES.COLLAPSED;
    },
    
    setSidebarWidth: (state, action) => {
      state.sidebar.width = action.payload;
    },
    
    setSidebarActiveItem: (state, action) => {
      state.sidebar.activeItem = action.payload;
    },
    
    pinSidebar: (state) => {
      state.sidebar.pinned = true;
    },
    
    unpinSidebar: (state) => {
      state.sidebar.pinned = false;
    },
    
    toggleSidebarPin: (state) => {
      state.sidebar.pinned = !state.sidebar.pinned;
    },
    
    setSidebarHovered: (state, action) => {
      state.sidebar.hovered = action.payload;
    },
    
    // Header actions
    setHeaderVisible: (state, action) => {
      state.header.visible = action.payload;
    },
    
    setHeaderSticky: (state, action) => {
      state.header.sticky = action.payload;
    },
    
    setHeaderTransparent: (state, action) => {
      state.header.transparent = action.payload;
    },
    
    toggleHeaderSearch: (state) => {
      state.header.searchVisible = !state.header.searchVisible;
    },
    
    // Footer actions
    setFooterVisible: (state, action) => {
      state.footer.visible = action.payload;
    },
    
    // Modal actions
    openModal: (state, action) => {
      const { id, data, size = MODAL_SIZES.MD, options = {} } = action.payload;
      const modalId = id || generateId('modal_');
      
      state.modals[modalId] = {
        id: modalId,
        open: true,
        data: data || {},
        size,
        options,
        timestamp: Date.now()
      };
      
      state.modalHistory.push(modalId);
      state.activeModal = modalId;
    },
    
    closeModal: (state, action) => {
      const modalId = action.payload;
      
      if (modalId) {
        if (state.modals[modalId]) {
          state.modals[modalId].open = false;
        }
        state.modalHistory = state.modalHistory.filter(id => id !== modalId);
        
        // Set active modal to last in history
        state.activeModal = state.modalHistory[state.modalHistory.length - 1] || null;
      } else {
        // Close all modals
        Object.keys(state.modals).forEach(id => {
          state.modals[id].open = false;
        });
        state.modalHistory = [];
        state.activeModal = null;
      }
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(id => {
        state.modals[id].open = false;
      });
      state.modalHistory = [];
      state.activeModal = null;
    },
    
    updateModalData: (state, action) => {
      const { id, data } = action.payload;
      if (state.modals[id]) {
        state.modals[id].data = { ...state.modals[id].data, ...data };
      }
    },
    
    // Toast actions
    showToast: (state, action) => {
      const { message, type = TOAST_TYPES.DEFAULT, duration, position, options = {} } = action.payload;
      const id = generateId('toast_');
      
      const toast = {
        id,
        message,
        type,
        duration: duration || state.toastDefaults.duration,
        position: position || state.toastDefaults.position,
        animation: state.toastDefaults.animation,
        dismissible: state.toastDefaults.dismissible,
        timestamp: Date.now(),
        ...options
      };
      
      state.toasts.push(toast);
      
      // Limit number of toasts
      if (state.toasts.length > state.maxToasts) {
        state.toasts.shift();
      }
    },
    
    hideToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    
    clearToasts: (state) => {
      state.toasts = [];
    },
    
    // Loading actions
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    
    setPageLoading: (state, action) => {
      state.loading.page = action.payload;
    },
    
    setOverlayLoading: (state, action) => {
      state.loading.overlay = action.payload;
    },
    
    setSkeletonLoading: (state, action) => {
      state.loading.skeleton = action.payload;
    },
    
    setSpinnerLoading: (state, action) => {
      const { key, isLoading } = action.payload;
      state.loading.spinners[key] = isLoading;
    },
    
    // Progress actions
    showProgress: (state, action) => {
      state.progress.show = true;
      if (action.payload) {
        state.progress = { ...state.progress, ...action.payload };
      }
    },
    
    hideProgress: (state) => {
      state.progress.show = false;
      state.progress.value = 0;
      state.progress.message = null;
    },
    
    setProgress: (state, action) => {
      state.progress.value = action.payload;
    },
    
    setProgressMessage: (state, action) => {
      state.progress.message = action.payload;
    },
    
    // Notification actions
    addNotification: (state, action) => {
      const { message, type = 'info', duration, options = {} } = action.payload;
      const id = generateId('notif_');
      
      state.notifications.push({
        id,
        message,
        type,
        duration: duration || state.notificationDefaults.duration,
        position: state.notificationDefaults.position,
        dismissible: state.notificationDefaults.dismissible,
        icon: state.notificationDefaults.icon,
        timestamp: Date.now(),
        read: false,
        ...options
      });
    },
    
    markNotificationRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    },
    
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(n => {
        n.read = true;
      });
    },
    
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Alert actions
    addAlert: (state, action) => {
      state.alerts.push({
        id: generateId('alert_'),
        timestamp: Date.now(),
        ...action.payload
      });
    },
    
    removeAlert: (state, action) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },
    
    clearAlerts: (state) => {
      state.alerts = [];
    },
    
    // Drawer actions
    openDrawer: (state, action) => {
      const { id, data, position = 'right', size = 'md', options = {} } = action.payload;
      const drawerId = id || generateId('drawer_');
      
      state.drawers[drawerId] = {
        id: drawerId,
        open: true,
        data: data || {},
        position,
        size,
        options,
        timestamp: Date.now()
      };
      
      state.activeDrawer = drawerId;
    },
    
    closeDrawer: (state, action) => {
      const drawerId = action.payload;
      
      if (drawerId && state.drawers[drawerId]) {
        state.drawers[drawerId].open = false;
      } else {
        Object.keys(state.drawers).forEach(id => {
          state.drawers[id].open = false;
        });
        state.activeDrawer = null;
      }
    },
    
    // Tab actions
    setActiveTab: (state, action) => {
      const { group, tab } = action.payload;
      state.activeTab[group] = tab;
    },
    
    // Accordion actions
    toggleAccordion: (state, action) => {
      const { group, index } = action.payload;
      if (!state.accordions[group]) {
        state.accordions[group] = [];
      }
      state.accordions[group][index] = !state.accordions[group][index];
    },
    
    setAccordionOpen: (state, action) => {
      const { group, index, open } = action.payload;
      if (!state.accordions[group]) {
        state.accordions[group] = [];
      }
      state.accordions[group][index] = open;
    }
  }
});

// Continue reducers
// Pagination actions
setPagination: (state, action) => {
  state.pagination = { ...state.pagination, ...action.payload };
},

setCurrentPage: (state, action) => {
  state.pagination.currentPage = action.payload;
},

setItemsPerPage: (state, action) => {
  state.pagination.itemsPerPage = action.payload;
},

// Filter actions
setFilters: (state, action) => {
  state.filters = { ...state.filters, ...action.payload };
},

clearFilters: (state) => {
  state.filters = {};
},

// Sort actions
setSort: (state, action) => {
  state.sort = { ...state.sort, ...action.payload };
},

clearSort: (state) => {
  state.sort = { field: null, order: 'asc' };
},

// Search actions
setSearchQuery: (state, action) => {
  state.search.query = action.payload;
  
  // Add to recent searches
  if (action.payload && !state.search.recent.includes(action.payload)) {
    state.search.recent.unshift(action.payload);
    if (state.search.recent.length > 10) {
      state.search.recent.pop();
    }
  }
},

toggleSearch: (state) => {
  state.search.visible = !state.search.visible;
},

setSearchSuggestions: (state, action) => {
  state.search.suggestions = action.payload;
},

clearSearchRecent: (state) => {
  state.search.recent = [];
},

// Breadcrumb actions
setBreadcrumbs: (state, action) => {
  state.breadcrumbs = action.payload;
},

addBreadcrumb: (state, action) => {
  state.breadcrumbs.push(action.payload);
},

// Navigation actions
setCurrentPath: (state, action) => {
  state.navigation.previousPath = state.navigation.currentPath;
  state.navigation.currentPath = action.payload;
  state.navigation.history.push(action.payload);
  
  // Keep history manageable
  if (state.navigation.history.length > 50) {
    state.navigation.history.shift();
  }
},

goBack: (state) => {
  if (state.navigation.history.length > 1) {
    state.navigation.history.pop();
    state.navigation.currentPath = state.navigation.history[state.navigation.history.length - 1];
  }
},

// Scroll actions
setScrollPosition: (state, action) => {
  const { key, position } = action.payload;
  state.scroll.positions[key] = position;
},

scrollToTop: (state) => {
  state.scroll.scrollToTop = true;
},

resetScrollToTop: (state) => {
  state.scroll.scrollToTop = false;
},

// Responsive actions
setResponsive: (state, action) => {
  const { width, height } = action.payload;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 992;
  const isDesktop = width >= 992;
  const breakpoint = calculateBreakpoint(width);
  
  state.responsive = {
    isMobile,
    isTablet,
    isDesktop,
    breakpoint,
    dimensions: { width, height }
  };
},

// Accessibility actions
setReducedMotion: (state, action) => {
  state.accessibility.reducedMotion = action.payload;
  state.preferences.reducedAnimations = action.payload;
},

setHighContrast: (state, action) => {
  state.accessibility.highContrast = action.payload;
},

setScreenReader: (state, action) => {
  state.accessibility.screenReader = action.payload;
},

setKeyboardFocus: (state, action) => {
  state.accessibility.keyboardFocus = action.payload;
},

// Performance actions
setSlowNetwork: (state, action) => {
  state.performance.slowNetwork = action.payload;
},

setLowMemory: (state, action) => {
  state.performance.lowMemory = action.payload;
},

setOffline: (state, action) => {
  state.performance.offline = action.payload;
},

setReducedData: (state, action) => {
  state.performance.reducedData = action.payload;
},

// Feature flags
setFeatureFlag: (state, action) => {
  const { flag, enabled } = action.payload;
  state.features[flag] = enabled;
},

// Preferences
setCompactMode: (state, action) => {
  state.preferences.compactMode = action.payload;
  state.layout = action.payload ? LAYOUTS.COMPACT : LAYOUTS.DEFAULT;
},

setLanguage: (state, action) => {
  state.preferences.language = action.payload;
},

setFontSize: (state, action) => {
  state.preferences.fontSize = action.payload;
},

// Context menus
openContextMenu: (state, action) => {
  const { id, data, position } = action.payload;
  state.contextMenus[id] = {
    open: true,
    data,
    position,
    timestamp: Date.now()
  };
},

closeContextMenu: (state, action) => {
  const id = action.payload;
  if (id && state.contextMenus[id]) {
    state.contextMenus[id].open = false;
  } else {
    Object.keys(state.contextMenus).forEach(key => {
      state.contextMenus[key].open = false;
    });
  }
},

// Tooltips
setTooltipEnabled: (state, action) => {
  state.tooltips.enabled = action.payload;
},

// Messages
addError: (state, action) => {
  state.errors.push({
    id: generateId('error_'),
    message: action.payload,
    timestamp: Date.now()
  });
},

addSuccess: (state, action) => {
  state.success.push({
    id: generateId('success_'),
    message: action.payload,
    timestamp: Date.now()
  });
},

addWarning: (state, action) => {
  state.warnings.push({
    id: generateId('warning_'),
    message: action.payload,
    timestamp: Date.now()
  });
},

addInfo: (state, action) => {
  state.info.push({
    id: generateId('info_'),
    message: action.payload,
    timestamp: Date.now()
  });
},

clearMessages: (state) => {
  state.errors = [];
  state.success = [];
  state.warnings = [];
  state.info = [];
},

// Debug
toggleDebug: (state) => {
  state.debug.enabled = !state.debug.enabled;
},

addDebugLog: (state, action) => {
  if (state.debug.enabled) {
    state.debug.logs.push({
      timestamp: Date.now(),
      ...action.payload
    });
    
    if (state.debug.logs.length > 100) {
      state.debug.logs.shift();
    }
  }
},

clearDebugLogs: (state) => {
  state.debug.logs = [];
},

// Reset UI state
resetUI: () => initialState,

updateLastAction: (state, action) => {
  state.lastAction = action.payload;
  state.lastUpdated = Date.now();
}
}
});

// ==================== Actions ====================

export const {
  // Theme
  setTheme,
  toggleTheme,
  setCustomTheme,
  
  // Layout
  setLayout,
  setLayoutConfig,
  
  // Sidebar
  toggleSidebar,
  setSidebarOpen,
  setSidebarState,
  setSidebarWidth,
  setSidebarActiveItem,
  pinSidebar,
  unpinSidebar,
  toggleSidebarPin,
  setSidebarHovered,
  
  // Header
  setHeaderVisible,
  setHeaderSticky,
  setHeaderTransparent,
  toggleHeaderSearch,
  
  // Footer
  setFooterVisible,
  
  // Modals
  openModal,
  closeModal,
  closeAllModals,
  updateModalData,
  
  // Toasts
  showToast,
  hideToast,
  clearToasts,
  
  // Loading
  setGlobalLoading,
  setPageLoading,
  setOverlayLoading,
  setSkeletonLoading,
  setSpinnerLoading,
  
  // Progress
  showProgress,
  hideProgress,
  setProgress,
  setProgressMessage,
  
  // Notifications
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
  clearNotifications,
  
  // Alerts
  addAlert,
  removeAlert,
  clearAlerts,
  
  // Drawers
  openDrawer,
  closeDrawer,
  
  // Tabs
  setActiveTab,
  
  // Accordions
  toggleAccordion,
  setAccordionOpen,
  
  // Pagination
  setPagination,
  setCurrentPage,
  setItemsPerPage,
  
  // Filters
  setFilters,
  clearFilters,
  
  // Sort
  setSort,
  clearSort,
  
  // Search
  setSearchQuery,
  toggleSearch,
  setSearchSuggestions,
  clearSearchRecent,
  
  // Breadcrumbs
  setBreadcrumbs,
  addBreadcrumb,
  
  // Navigation
  setCurrentPath,
  goBack,
  
  // Scroll
  setScrollPosition,
  scrollToTop,
  resetScrollToTop,
  
  // Responsive
  setResponsive,
  
  // Accessibility
  setReducedMotion,
  setHighContrast,
  setScreenReader,
  setKeyboardFocus,
  
  // Performance
  setSlowNetwork,
  setLowMemory,
  setOffline,
  setReducedData,
  
  // Features
  setFeatureFlag,
  
  // Preferences
  setCompactMode,
  setLanguage,
  setFontSize,
  
  // Context menus
  openContextMenu,
  closeContextMenu,
  
  // Tooltips
  setTooltipEnabled,
  
  // Messages
  addError,
  addSuccess,
  addWarning,
  addInfo,
  clearMessages,
  
  // Debug
  toggleDebug,
  addDebugLog,
  clearDebugLogs,
  
  // Reset
  resetUI,
  updateLastAction
} = uiSlice.actions;

// ==================== Selectors ====================

// Base selectors
export const selectUIState = (state) => state.ui;
export const selectTheme = (state) => state.ui.theme;
export const selectLayout = (state) => state.ui.layout;
export const selectSidebar = (state) => state.ui.sidebar;
export const selectHeader = (state) => state.ui.header;
export const selectFooter = (state) => state.ui.footer;
export const selectModals = (state) => state.ui.modals;
export const selectActiveModal = (state) => state.ui.activeModal;
export const selectToasts = (state) => state.ui.toasts;
export const selectLoading = (state) => state.ui.loading;
export const selectProgress = (state) => state.ui.progress;
export const selectNotifications = (state) => state.ui.notifications;
export const selectAlerts = (state) => state.ui.alerts;
export const selectDrawers = (state) => state.ui.drawers;
export const selectActiveDrawer = (state) => state.ui.activeDrawer;
export const selectPagination = (state) => state.ui.pagination;
export const selectFilters = (state) => state.ui.filters;
export const selectSort = (state) => state.ui.sort;
export const selectSearch = (state) => state.ui.search;
export const selectBreadcrumbs = (state) => state.ui.breadcrumbs;
export const selectNavigation = (state) => state.ui.navigation;
export const selectResponsive = (state) => state.ui.responsive;
export const selectAccessibility = (state) => state.ui.accessibility;
export const selectPerformance = (state) => state.ui.performance;
export const selectFeatures = (state) => state.ui.features;
export const selectPreferences = (state) => state.ui.preferences;

// Computed selectors
export const selectIsSidebarOpen = createSelector(
  [selectSidebar],
  (sidebar) => sidebar.open
);

export const selectSidebarWidth = createSelector(
  [selectSidebar],
  (sidebar) => sidebar.open ? sidebar.width : sidebar.collapsedWidth
);

export const selectUnreadNotifications = createSelector(
  [selectNotifications],
  (notifications) => notifications.filter(n => !n.read).length
);

export const selectHasActiveModal = createSelector(
  [selectModals],
  (modals) => Object.values(modals).some(modal => modal.open)
);

export const selectHasActiveDrawer = createSelector(
  [selectDrawers],
  (drawers) => Object.values(drawers).some(drawer => drawer.open)
);

export const selectIsMobile = createSelector(
  [selectResponsive],
  (responsive) => responsive.isMobile
);

export const selectIsTablet = createSelector(
  [selectResponsive],
  (responsive) => responsive.isTablet
);

export const selectIsDesktop = createSelector(
  [selectResponsive],
  (responsive) => responsive.isDesktop
);

export const selectBreakpoint = createSelector(
  [selectResponsive],
  (responsive) => responsive.breakpoint
);

export const selectReducedMotion = createSelector(
  [selectAccessibility],
  (accessibility) => accessibility.reducedMotion
);

export const selectHighContrast = createSelector(
  [selectAccessibility],
  (accessibility) => accessibility.highContrast
);

export const selectOffline = createSelector(
  [selectPerformance],
  (performance) => performance.offline
);

export const selectSlowNetwork = createSelector(
  [selectPerformance],
  (performance) => performance.slowNetwork
);

export const selectCompactMode = createSelector(
  [selectPreferences],
  (preferences) => preferences.compactMode
);

export const selectDarkMode = createSelector(
  [selectTheme, selectPreferences],
  (theme, preferences) => theme === THEMES.DARK || preferences.darkMode
);

export const selectCurrentLanguage = createSelector(
  [selectPreferences],
  (preferences) => preferences.language
);

export const selectFontSize = createSelector(
  [selectPreferences],
  (preferences) => preferences.fontSize
);

export const selectGlobalLoading = createSelector(
  [selectLoading],
  (loading) => loading.global
);

export const selectPageLoading = createSelector(
  [selectLoading],
  (loading) => loading.page
);

export const selectOverlayLoading = createSelector(
  [selectLoading],
  (loading) => loading.overlay
);

export const selectSpinnerLoading = (key) => createSelector(
  [selectLoading],
  (loading) => loading.spinners[key] || false
);

export const selectRecentSearches = createSelector(
  [selectSearch],
  (search) => search.recent
);

export const selectCurrentPage = createSelector(
  [selectPagination],
  (pagination) => pagination.currentPage
);

export const selectItemsPerPage = createSelector(
  [selectPagination],
  (pagination) => pagination.itemsPerPage
);

export const selectSortField = createSelector(
  [selectSort],
  (sort) => sort.field
);

export const selectSortOrder = createSelector(
  [selectSort],
  (sort) => sort.order
);

export const selectSearchQuery = createSelector(
  [selectSearch],
  (search) => search.query
);

export const selectSearchVisible = createSelector(
  [selectSearch],
  (search) => search.visible
);

export const selectBreadcrumbItems = createSelector(
  [selectBreadcrumbs],
  (breadcrumbs) => breadcrumbs
);

export const selectCurrentPath = createSelector(
  [selectNavigation],
  (navigation) => navigation.currentPath
);

export const selectPreviousPath = createSelector(
  [selectNavigation],
  (navigation) => navigation.previousPath
);

export const selectNavigationHistory = createSelector(
  [selectNavigation],
  (navigation) => navigation.history
);

export const selectScrollPosition = (key) => createSelector(
  [(state) => state.ui.scroll.positions],
  (positions) => positions[key] || 0
);

export const selectModalById = (modalId) => createSelector(
  [selectModals],
  (modals) => modals[modalId]
);

export const selectDrawerById = (drawerId) => createSelector(
  [selectDrawers],
  (drawers) => drawers[drawerId]
);

export const selectFeatureFlag = (flag) => createSelector(
  [selectFeatures],
  (features) => features[flag] || false
);

// ==================== Export ====================

export default uiSlice.reducer;
