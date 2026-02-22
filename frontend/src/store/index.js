import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import sessionStorage from 'redux-persist/lib/storage/session';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { createEpicMiddleware } from 'redux-observable';
import { createBrowserHistory } from 'history';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { composeWithDevTools } from 'redux-devtools-extension';

// Import reducers
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import affiliateReducer from './slices/affiliateSlice';
import paymentReducer from './slices/paymentSlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';
import settingsReducer from './slices/settingsSlice';
import analyticsReducer from './slices/analyticsSlice';
import supportReducer from './slices/supportSlice';
import adminReducer from './slices/adminSlice';

// Import epics
import { rootEpic } from './epics';

// ==================== History ====================

export const history = createBrowserHistory();

// ==================== Persist Configuration ====================

const persistConfig = {
  key: 'root',
  storage: storage,
  whitelist: ['auth', 'settings', 'ui'], // reducers to persist
  blacklist: [], // reducers not to persist
  stateReconciler: autoMergeLevel2,
  version: 1,
  timeout: 0,
  transforms: []
};

const authPersistConfig = {
  key: 'auth',
  storage: storage,
  whitelist: ['user', 'token', 'isAuthenticated'],
  blacklist: ['loading', 'error']
};

const settingsPersistConfig = {
  key: 'settings',
  storage: storage,
  whitelist: ['theme', 'language', 'currency', 'notifications'],
  blacklist: ['loading', 'error']
};

const uiPersistConfig = {
  key: 'ui',
  storage: sessionStorage, // Use session storage for UI state
  whitelist: ['sidebar', 'theme', 'layout'],
  blacklist: ['modals', 'toasts']
};

// ==================== Root Reducer ====================

const rootReducer = combineReducers({
  router: connectRouter(history),
  auth: persistReducer(authPersistConfig, authReducer),
  user: userReducer,
  affiliate: affiliateReducer,
  payment: paymentReducer,
  notification: notificationReducer,
  ui: persistReducer(uiPersistConfig, uiReducer),
  settings: persistReducer(settingsPersistConfig, settingsReducer),
  analytics: analyticsReducer,
  support: supportReducer,
  admin: adminReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// ==================== Middleware ====================

const epicMiddleware = createEpicMiddleware();

const middleware = [
  thunk,
  routerMiddleware(history),
  epicMiddleware
];

// Add logger only in development
if (process.env.NODE_ENV === 'development') {
  const logger = createLogger({
    collapsed: true,
    diff: true,
    duration: true,
    timestamp: true,
    level: 'info',
    colors: {
      title: () => '#139BFE',
      prevState: () => '#1C5FAF',
      action: () => '#149945',
      nextState: () => '#A47104',
      error: () => '#ff0005'
    }
  });
  middleware.push(logger);
}

// ==================== Enhancers ====================

const enhancers = [];

// Add dev tools in development
let composeEnhancers = compose;
if (process.env.NODE_ENV === 'development') {
  composeEnhancers = composeWithDevTools({
    name: 'Affiliate Platform',
    trace: true,
    traceLimit: 25
  });
}

// ==================== Store Creation ====================

export const store = createStore(
  persistedReducer,
  composeEnhancers(
    applyMiddleware(...middleware),
    ...enhancers
  )
);

// ==================== Epic Middleware ====================

epicMiddleware.run(rootEpic);

// ==================== Persistor ====================

export const persistor = persistStore(store, null, () => {
  console.log('Redux store rehydrated');
});

// ==================== Store Actions ====================

export const storeActions = {
  // Dispatch action
  dispatch: (action) => store.dispatch(action),

  // Get state
  getState: () => store.getState(),

  // Subscribe to changes
  subscribe: (listener) => store.subscribe(listener),

  // Replace reducer (for hot reloading)
  replaceReducer: (nextReducer) => {
    store.replaceReducer(nextReducer);
  },

  // Purge persisted state
  purge: () => {
    persistor.purge();
  },

  // Flush persisted state
  flush: () => {
    persistor.flush();
  },

  // Pause persistence
  pause: () => {
    persistor.pause();
  },

  // Resume persistence
  resume: () => {
    persistor.resume();
  }
};
// ==================== Store Selectors ====================

export const storeSelectors = {
  // Auth selectors
  auth: {
    getUser: (state) => state.auth.user,
    getToken: (state) => state.auth.token,
    isAuthenticated: (state) => state.auth.isAuthenticated,
    isLoading: (state) => state.auth.loading,
    getError: (state) => state.auth.error,
    getRole: (state) => state.auth.user?.role,
    hasRole: (state, role) => state.auth.user?.role === role,
    hasAnyRole: (state, roles) => roles.includes(state.auth.user?.role),
    isEmailVerified: (state) => state.auth.user?.isEmailVerified
  },

  // User selectors
  user: {
    getProfile: (state) => state.user.profile,
    getSettings: (state) => state.user.settings,
    getPreferences: (state) => state.user.preferences,
    getStats: (state) => state.user.stats,
    getActivity: (state) => state.user.activity,
    isLoading: (state) => state.user.loading,
    getError: (state) => state.user.error
  },

  // Affiliate selectors
  affiliate: {
    getDashboard: (state) => state.affiliate.dashboard,
    getLinks: (state) => state.affiliate.links,
    getReferrals: (state) => state.affiliate.referrals,
    getEarnings: (state) => state.affiliate.earnings,
    getCommissions: (state) => state.affiliate.commissions,
    getPayouts: (state) => state.affiliate.payouts,
    getProducts: (state) => state.affiliate.products,
    getAnalytics: (state) => state.affiliate.analytics,
    isLoading: (state) => state.affiliate.loading,
    getError: (state) => state.affiliate.error
  },

  // Payment selectors
  payment: {
    getTransactions: (state) => state.payment.transactions,
    getWithdrawals: (state) => state.payment.withdrawals,
    getBalance: (state) => state.payment.balance,
    getPaymentMethods: (state) => state.payment.paymentMethods,
    getPendingWithdrawals: (state) => state.payment.pendingWithdrawals,
    getCompletedWithdrawals: (state) => state.payment.completedWithdrawals,
    isLoading: (state) => state.payment.loading,
    getError: (state) => state.payment.error
  },

  // Notification selectors
  notification: {
    getAll: (state) => state.notification.notifications,
    getUnread: (state) => state.notification.notifications.filter(n => !n.read),
    getRead: (state) => state.notification.notifications.filter(n => n.read),
    getUnreadCount: (state) => state.notification.notifications.filter(n => !n.read).length,
    getSettings: (state) => state.notification.settings,
    isLoading: (state) => state.notification.loading,
    getError: (state) => state.notification.error
  },

  // UI selectors
  ui: {
    getTheme: (state) => state.ui.theme,
    getSidebar: (state) => state.ui.sidebar,
    getModals: (state) => state.ui.modals,
    getToasts: (state) => state.ui.toasts,
    getLoading: (state) => state.ui.loading,
    getCurrentModal: (state) => state.ui.currentModal,
    isModalOpen: (state, modalId) => state.ui.modals[modalId] || false,
    isSidebarOpen: (state) => state.ui.sidebar.open,
    getSidebarWidth: (state) => state.ui.sidebar.width,
    getLayout: (state) => state.ui.layout
  },

  // Settings selectors
  settings: {
    getTheme: (state) => state.settings.theme,
    getLanguage: (state) => state.settings.language,
    getCurrency: (state) => state.settings.currency,
    getTimezone: (state) => state.settings.timezone,
    getNotifications: (state) => state.settings.notifications,
    getPrivacy: (state) => state.settings.privacy,
    isLoading: (state) => state.settings.loading,
    getError: (state) => state.settings.error
  },

  // Analytics selectors
  analytics: {
    getOverview: (state) => state.analytics.overview,
    getTraffic: (state) => state.analytics.traffic,
    getConversions: (state) => state.analytics.conversions,
    getEarnings: (state) => state.analytics.earnings,
    getReports: (state) => state.analytics.reports,
    getMetrics: (state) => state.analytics.metrics,
    isLoading: (state) => state.analytics.loading,
    getError: (state) => state.analytics.error
  },

  // Support selectors
  support: {
    getTickets: (state) => state.support.tickets,
    getCurrentTicket: (state) => state.support.currentTicket,
    getMessages: (state) => state.support.messages,
    getFaqs: (state) => state.support.faqs,
    getCategories: (state) => state.support.categories,
    isLoading: (state) => state.support.loading,
    getError: (state) => state.support.error,
    getUnreadMessages: (state) => state.support.unreadMessages
  },

  // Admin selectors
  admin: {
    getUsers: (state) => state.admin.users,
    getAffiliates: (state) => state.admin.affiliates,
    getPayments: (state) => state.admin.payments,
    getReports: (state) => state.admin.reports,
    getAnalytics: (state) => state.admin.analytics,
    getLogs: (state) => state.admin.logs,
    getSystem: (state) => state.admin.system,
    getSettings: (state) => state.admin.settings,
    isLoading: (state) => state.admin.loading,
    getError: (state) => state.admin.error,
    getStats: (state) => state.admin.stats
  },

  // Router selectors
  router: {
    getLocation: (state) => state.router.location,
    getPathname: (state) => state.router.location?.pathname,
    getSearch: (state) => state.router.location?.search,
    getHash: (state) => state.router.location?.hash,
    getQueryParams: (state) => {
      const search = state.router.location?.search;
      if (!search) return {};
      return Object.fromEntries(new URLSearchParams(search));
    }
  }
};

// ==================== Store Dispatchers ====================

export const storeDispatchers = {
  // Auth dispatchers
  auth: {
    login: (credentials) => store.dispatch({ type: 'auth/login', payload: credentials }),
    register: (userData) => store.dispatch({ type: 'auth/register', payload: userData }),
    logout: () => store.dispatch({ type: 'auth/logout' }),
    updateProfile: (profile) => store.dispatch({ type: 'auth/updateProfile', payload: profile }),
    changePassword: (passwords) => store.dispatch({ type: 'auth/changePassword', payload: passwords }),
    verifyEmail: (token) => store.dispatch({ type: 'auth/verifyEmail', payload: token }),
    resetPassword: (data) => store.dispatch({ type: 'auth/resetPassword', payload: data }),
    refreshToken: () => store.dispatch({ type: 'auth/refreshToken' })
  },

  // User dispatchers
  user: {
    fetchProfile: () => store.dispatch({ type: 'user/fetchProfile' }),
    updateProfile: (profile) => store.dispatch({ type: 'user/updateProfile', payload: profile }),
    fetchSettings: () => store.dispatch({ type: 'user/fetchSettings' }),
    updateSettings: (settings) => store.dispatch({ type: 'user/updateSettings', payload: settings }),
    fetchPreferences: () => store.dispatch({ type: 'user/fetchPreferences' }),
    updatePreferences: (preferences) => store.dispatch({ type: 'user/updatePreferences', payload: preferences }),
    fetchActivity: () => store.dispatch({ type: 'user/fetchActivity' }),
    fetchStats: () => store.dispatch({ type: 'user/fetchStats' })
  },

  // Affiliate dispatchers
  affiliate: {
    fetchDashboard: () => store.dispatch({ type: 'affiliate/fetchDashboard' }),
    fetchLinks: () => store.dispatch({ type: 'affiliate/fetchLinks' }),
    createLink: (linkData) => store.dispatch({ type: 'affiliate/createLink', payload: linkData }),
    updateLink: (linkData) => store.dispatch({ type: 'affiliate/updateLink', payload: linkData }),
    deleteLink: (linkId) => store.dispatch({ type: 'affiliate/deleteLink', payload: linkId }),
    fetchReferrals: () => store.dispatch({ type: 'affiliate/fetchReferrals' }),
    fetchEarnings: () => store.dispatch({ type: 'affiliate/fetchEarnings' }),
    fetchCommissions: () => store.dispatch({ type: 'affiliate/fetchCommissions' }),
    fetchPayouts: () => store.dispatch({ type: 'affiliate/fetchPayouts' }),
    requestPayout: (amount) => store.dispatch({ type: 'affiliate/requestPayout', payload: amount }),
    fetchProducts: () => store.dispatch({ type: 'affiliate/fetchProducts' }),
    fetchAnalytics: () => store.dispatch({ type: 'affiliate/fetchAnalytics' })
  },

  // Payment dispatchers
  payment: {
    fetchTransactions: () => store.dispatch({ type: 'payment/fetchTransactions' }),
    fetchWithdrawals: () => store.dispatch({ type: 'payment/fetchWithdrawals' }),
    fetchBalance: () => store.dispatch({ type: 'payment/fetchBalance' }),
    fetchPaymentMethods: () => store.dispatch({ type: 'payment/fetchPaymentMethods' }),
    addPaymentMethod: (method) => store.dispatch({ type: 'payment/addPaymentMethod', payload: method }),
    removePaymentMethod: (methodId) => store.dispatch({ type: 'payment/removePaymentMethod', payload: methodId }),
    processPayment: (paymentData) => store.dispatch({ type: 'payment/processPayment', payload: paymentData }),
    requestWithdrawal: (withdrawalData) => store.dispatch({ type: 'payment/requestWithdrawal', payload: withdrawalData })
  },

  // Notification dispatchers
  notification: {
    fetchNotifications: () => store.dispatch({ type: 'notification/fetchNotifications' }),
    markAsRead: (notificationId) => store.dispatch({ type: 'notification/markAsRead', payload: notificationId }),
    markAllAsRead: () => store.dispatch({ type: 'notification/markAllAsRead' }),
    deleteNotification: (notificationId) => store.dispatch({ type: 'notification/deleteNotification', payload: notificationId }),
    clearAll: () => store.dispatch({ type: 'notification/clearAll' }),
    updateSettings: (settings) => store.dispatch({ type: 'notification/updateSettings', payload: settings })
  },

  // UI dispatchers
  ui: {
    setTheme: (theme) => store.dispatch({ type: 'ui/setTheme', payload: theme }),
    toggleSidebar: () => store.dispatch({ type: 'ui/toggleSidebar' }),
    setSidebar: (open) => store.dispatch({ type: 'ui/setSidebar', payload: open }),
    openModal: (modalId, data) => store.dispatch({ type: 'ui/openModal', payload: { id: modalId, data } }),
    closeModal: (modalId) => store.dispatch({ type: 'ui/closeModal', payload: modalId }),
    showToast: (toast) => store.dispatch({ type: 'ui/showToast', payload: toast }),
    hideToast: (toastId) => store.dispatch({ type: 'ui/hideToast', payload: toastId }),
    setLoading: (loading) => store.dispatch({ type: 'ui/setLoading', payload: loading }),
    setLayout: (layout) => store.dispatch({ type: 'ui/setLayout', payload: layout })
  },

  // Settings dispatchers
  settings: {
    fetchSettings: () => store.dispatch({ type: 'settings/fetchSettings' }),
    updateSettings: (settings) => store.dispatch({ type: 'settings/updateSettings', payload: settings }),
    resetSettings: () => store.dispatch({ type: 'settings/resetSettings' }),
    setTheme: (theme) => store.dispatch({ type: 'settings/setTheme', payload: theme }),
    setLanguage: (language) => store.dispatch({ type: 'settings/setLanguage', payload: language }),
    setCurrency: (currency) => store.dispatch({ type: 'settings/setCurrency', payload: currency }),
    setTimezone: (timezone) => store.dispatch({ type: 'settings/setTimezone', payload: timezone })
  },

  // Analytics dispatchers
  analytics: {
    fetchOverview: () => store.dispatch({ type: 'analytics/fetchOverview' }),
    fetchTraffic: () => store.dispatch({ type: 'analytics/fetchTraffic' }),
    fetchConversions: () => store.dispatch({ type: 'analytics/fetchConversions' }),
    fetchEarnings: () => store.dispatch({ type: 'analytics/fetchEarnings' }),
    fetchReports: () => store.dispatch({ type: 'analytics/fetchReports' }),
    generateReport: (params) => store.dispatch({ type: 'analytics/generateReport', payload: params }),
    exportData: (format) => store.dispatch({ type: 'analytics/exportData', payload: format })
  },

  // Support dispatchers
  support: {
    fetchTickets: () => store.dispatch({ type: 'support/fetchTickets' }),
    fetchTicket: (ticketId) => store.dispatch({ type: 'support/fetchTicket', payload: ticketId }),
    createTicket: (ticketData) => store.dispatch({ type: 'support/createTicket', payload: ticketData }),
    updateTicket: (ticketData) => store.dispatch({ type: 'support/updateTicket', payload: ticketData }),
    deleteTicket: (ticketId) => store.dispatch({ type: 'support/deleteTicket', payload: ticketId }),
    sendMessage: (messageData) => store.dispatch({ type: 'support/sendMessage', payload: messageData }),
    fetchFaqs: () => store.dispatch({ type: 'support/fetchFaqs' }),
    fetchCategories: () => store.dispatch({ type: 'support/fetchCategories' })
  },

  // Admin dispatchers
  admin: {
    fetchUsers: () => store.dispatch({ type: 'admin/fetchUsers' }),
    fetchUser: (userId) => store.dispatch({ type: 'admin/fetchUser', payload: userId }),
    createUser: (userData) => store.dispatch({ type: 'admin/createUser', payload: userData }),
    updateUser: (userData) => store.dispatch({ type: 'admin/updateUser', payload: userData }),
    deleteUser: (userId) => store.dispatch({ type: 'admin/deleteUser', payload: userId }),
    fetchAffiliates: () => store.dispatch({ type: 'admin/fetchAffiliates' }),
    fetchAffiliate: (affiliateId) => store.dispatch({ type: 'admin/fetchAffiliate', payload: affiliateId }),
    updateAffiliate: (affiliateData) => store.dispatch({ type: 'admin/updateAffiliate', payload: affiliateData }),
    fetchPayments: () => store.dispatch({ type: 'admin/fetchPayments' }),
    processWithdrawal: (withdrawalId) => store.dispatch({ type: 'admin/processWithdrawal', payload: withdrawalId }),
    fetchReports: () => store.dispatch({ type: 'admin/fetchReports' }),
    fetchAnalytics: () => store.dispatch({ type: 'admin/fetchAnalytics' }),
    fetchLogs: () => store.dispatch({ type: 'admin/fetchLogs' }),
    fetchSystem: () => store.dispatch({ type: 'admin/fetchSystem' }),
    updateSettings: (settings) => store.dispatch({ type: 'admin/updateSettings', payload: settings })
  }
};
// ==================== Custom Hooks ====================

import { useSelector, useDispatch } from 'react-redux';
import { useMemo, useCallback } from 'react';

// Typed useSelector hook
export const useAppSelector = (selector, equalityFn) => {
  return useSelector(selector, equalityFn);
};

// Typed useDispatch hook
export const useAppDispatch = () => {
  const dispatch = useDispatch();
  return useCallback((action) => dispatch(action), [dispatch]);
};

// Hook for auth state
export const useAuthState = () => {
  const user = useAppSelector(storeSelectors.auth.getUser);
  const isAuthenticated = useAppSelector(storeSelectors.auth.isAuthenticated);
  const isLoading = useAppSelector(storeSelectors.auth.isLoading);
  const error = useAppSelector(storeSelectors.auth.getError);
  
  return useMemo(() => ({ user, isAuthenticated, isLoading, error }), [user, isAuthenticated, isLoading, error]);
};

// Hook for user state
export const useUserState = () => {
  const profile = useAppSelector(storeSelectors.user.getProfile);
  const settings = useAppSelector(storeSelectors.user.getSettings);
  const preferences = useAppSelector(storeSelectors.user.getPreferences);
  const stats = useAppSelector(storeSelectors.user.getStats);
  const isLoading = useAppSelector(storeSelectors.user.isLoading);
  
  return useMemo(() => ({ profile, settings, preferences, stats, isLoading }), [profile, settings, preferences, stats, isLoading]);
};

// Hook for affiliate state
export const useAffiliateState = () => {
  const dashboard = useAppSelector(storeSelectors.affiliate.getDashboard);
  const links = useAppSelector(storeSelectors.affiliate.getLinks);
  const referrals = useAppSelector(storeSelectors.affiliate.getReferrals);
  const earnings = useAppSelector(storeSelectors.affiliate.getEarnings);
  const commissions = useAppSelector(storeSelectors.affiliate.getCommissions);
  const payouts = useAppSelector(storeSelectors.affiliate.getPayouts);
  const products = useAppSelector(storeSelectors.affiliate.getProducts);
  const analytics = useAppSelector(storeSelectors.affiliate.getAnalytics);
  const isLoading = useAppSelector(storeSelectors.affiliate.isLoading);
  
  return useMemo(() => ({
    dashboard, links, referrals, earnings, commissions, payouts, products, analytics, isLoading
  }), [dashboard, links, referrals, earnings, commissions, payouts, products, analytics, isLoading]);
};

// Hook for payment state
export const usePaymentState = () => {
  const transactions = useAppSelector(storeSelectors.payment.getTransactions);
  const withdrawals = useAppSelector(storeSelectors.payment.getWithdrawals);
  const balance = useAppSelector(storeSelectors.payment.getBalance);
  const paymentMethods = useAppSelector(storeSelectors.payment.getPaymentMethods);
  const isLoading = useAppSelector(storeSelectors.payment.isLoading);
  
  return useMemo(() => ({ transactions, withdrawals, balance, paymentMethods, isLoading }), [transactions, withdrawals, balance, paymentMethods, isLoading]);
};

// Hook for notification state
export const useNotificationState = () => {
  const notifications = useAppSelector(storeSelectors.notification.getAll);
  const unreadCount = useAppSelector(storeSelectors.notification.getUnreadCount);
  const settings = useAppSelector(storeSelectors.notification.getSettings);
  const isLoading = useAppSelector(storeSelectors.notification.isLoading);
  
  return useMemo(() => ({ notifications, unreadCount, settings, isLoading }), [notifications, unreadCount, settings, isLoading]);
};

// Hook for UI state
export const useUIState = () => {
  const theme = useAppSelector(storeSelectors.ui.getTheme);
  const sidebar = useAppSelector(storeSelectors.ui.getSidebar);
  const modals = useAppSelector(storeSelectors.ui.getModals);
  const toasts = useAppSelector(storeSelectors.ui.getToasts);
  const loading = useAppSelector(storeSelectors.ui.getLoading);
  const layout = useAppSelector(storeSelectors.ui.getLayout);
  
  return useMemo(() => ({ theme, sidebar, modals, toasts, loading, layout }), [theme, sidebar, modals, toasts, loading, layout]);
};

// Hook for settings state
export const useSettingsState = () => {
  const theme = useAppSelector(storeSelectors.settings.getTheme);
  const language = useAppSelector(storeSelectors.settings.getLanguage);
  const currency = useAppSelector(storeSelectors.settings.getCurrency);
  const timezone = useAppSelector(storeSelectors.settings.getTimezone);
  const notifications = useAppSelector(storeSelectors.settings.getNotifications);
  const privacy = useAppSelector(storeSelectors.settings.getPrivacy);
  const isLoading = useAppSelector(storeSelectors.settings.isLoading);
  
  return useMemo(() => ({ theme, language, currency, timezone, notifications, privacy, isLoading }), [theme, language, currency, timezone, notifications, privacy, isLoading]);
};

// Hook for analytics state
export const useAnalyticsState = () => {
  const overview = useAppSelector(storeSelectors.analytics.getOverview);
  const traffic = useAppSelector(storeSelectors.analytics.getTraffic);
  const conversions = useAppSelector(storeSelectors.analytics.getConversions);
  const earnings = useAppSelector(storeSelectors.analytics.getEarnings);
  const reports = useAppSelector(storeSelectors.analytics.getReports);
  const metrics = useAppSelector(storeSelectors.analytics.getMetrics);
  const isLoading = useAppSelector(storeSelectors.analytics.isLoading);
  
  return useMemo(() => ({ overview, traffic, conversions, earnings, reports, metrics, isLoading }), [overview, traffic, conversions, earnings, reports, metrics, isLoading]);
};

// Hook for support state
export const useSupportState = () => {
  const tickets = useAppSelector(storeSelectors.support.getTickets);
  const currentTicket = useAppSelector(storeSelectors.support.getCurrentTicket);
  const messages = useAppSelector(storeSelectors.support.getMessages);
  const faqs = useAppSelector(storeSelectors.support.getFaqs);
  const categories = useAppSelector(storeSelectors.support.getCategories);
  const isLoading = useAppSelector(storeSelectors.support.isLoading);
  const unreadMessages = useAppSelector(storeSelectors.support.getUnreadMessages);
  
  return useMemo(() => ({ tickets, currentTicket, messages, faqs, categories, isLoading, unreadMessages }), [tickets, currentTicket, messages, faqs, categories, isLoading, unreadMessages]);
};

// Hook for admin state
export const useAdminState = () => {
  const users = useAppSelector(storeSelectors.admin.getUsers);
  const affiliates = useAppSelector(storeSelectors.admin.getAffiliates);
  const payments = useAppSelector(storeSelectors.admin.getPayments);
  const reports = useAppSelector(storeSelectors.admin.getReports);
  const analytics = useAppSelector(storeSelectors.admin.getAnalytics);
  const logs = useAppSelector(storeSelectors.admin.getLogs);
  const system = useAppSelector(storeSelectors.admin.getSystem);
  const settings = useAppSelector(storeSelectors.admin.getSettings);
  const stats = useAppSelector(storeSelectors.admin.getStats);
  const isLoading = useAppSelector(storeSelectors.admin.isLoading);
  
  return useMemo(() => ({
    users, affiliates, payments, reports, analytics, logs, system, settings, stats, isLoading
  }), [users, affiliates, payments, reports, analytics, logs, system, settings, stats, isLoading]);
};

// ==================== Store Utilities ====================

export const storeUtils = {
  // Reset entire store
  resetStore: () => {
    store.dispatch({ type: 'RESET_STORE' });
    persistor.purge();
  },

  // Reset specific reducer
  resetReducer: (reducerName) => {
    store.dispatch({ type: `RESET_${reducerName.toUpperCase()}` });
  },

  // Get store state snapshot
  getSnapshot: () => {
    return JSON.parse(JSON.stringify(store.getState()));
  },

  // Load snapshot into store
  loadSnapshot: (snapshot) => {
    store.dispatch({ type: 'LOAD_SNAPSHOT', payload: snapshot });
  },

  // Subscribe to state changes
  subscribeToChanges: (selector, callback) => {
    let previousState = selector(store.getState());
    
    return store.subscribe(() => {
      const currentState = selector(store.getState());
      if (currentState !== previousState) {
        previousState = currentState;
        callback(currentState);
      }
    });
  },

  // Create action creator
  createAction: (type) => (payload) => ({ type, payload }),

  // Create async action creator
  createAsyncAction: (type) => ({
    request: (payload) => ({ type: `${type}_REQUEST`, payload }),
    success: (payload) => ({ type: `${type}_SUCCESS`, payload }),
    failure: (error) => ({ type: `${type}_FAILURE`, payload: error })
  }),

  // Wait for action
  waitForAction: (actionType, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        unsubscribe();
        reject(new Error(`Timeout waiting for action: ${actionType}`));
      }, timeout);
      
      const unsubscribe = store.subscribe(() => {
        const lastAction = store.getState().lastAction;
        if (lastAction && lastAction.type === actionType) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(lastAction.payload);
        }
      });
    });
  },

  // Check if action is pending
  isPending: (state, actionType) => {
    return state.loading?.[actionType] || false;
  },

  // Check if action has error
  hasError: (state, actionType) => {
    return state.errors?.[actionType] || null;
  },

  // Get action error
  getError: (state, actionType) => {
    return state.errors?.[actionType] || null;
  },

  // Create selector with memoization
  createSelector: (selector) => {
    let lastState = null;
    let lastResult = null;
    
    return (state) => {
      if (state !== lastState) {
        lastState = state;
        lastResult = selector(state);
      }
      return lastResult;
    };
  },

  // Combine selectors
  combineSelectors: (selectors) => (state) => {
    const result = {};
    for (const [key, selector] of Object.entries(selectors)) {
      result[key] = selector(state);
    }
    return result;
  }
};

// ==================== Export all ====================

export default {
  store,
  persistor,
  history,
  storeActions,
  storeSelectors,
  storeDispatchers,
  storeUtils,
  useAppSelector,
  useAppDispatch,
  useAuthState,
  useUserState,
  useAffiliateState,
  usePaymentState,
  useNotificationState,
  useUIState,
  useSettingsState,
  useAnalyticsState,
  useSupportState,
  useAdminState
};
