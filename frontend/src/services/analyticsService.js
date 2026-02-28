import axios from 'axios';

import { authApi } from '../hooks/useAuth';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Analytics event categories
export const EVENT_CATEGORIES = {
  USER: 'user',
  AFFILIATE: 'affiliate',
  PAYMENT: 'payment',
  PRODUCT: 'product',
  REFERRAL: 'referral',
  CLICK: 'click',
  CONVERSION: 'conversion',
  PAGE_VIEW: 'page_view',
  SESSION: 'session',
  ENGAGEMENT: 'engagement',
  ERROR: 'error',
  PERFORMANCE: 'performance',
};

// Analytics event actions
export const EVENT_ACTIONS = {
  // User actions
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  PROFILE_UPDATE: 'profile_update',
  PASSWORD_CHANGE: 'password_change',
  
  // Affiliate actions
  CREATE_LINK: 'create_link',
  UPDATE_LINK: 'update_link',
  DELETE_LINK: 'delete_link',
  SHARE_LINK: 'share_link',
  VIEW_DASHBOARD: 'view_dashboard',
  
  // Payment actions
  INITIATE_PAYMENT: 'initiate_payment',
  COMPLETE_PAYMENT: 'complete_payment',
  PAYMENT_FAILED: 'payment_failed',
  REQUEST_WITHDRAWAL: 'request_withdrawal',
  
  // Referral actions
  CLICK_REFERRAL: 'click_referral',
  CONVERT_REFERRAL: 'convert_referral',
  REFERRAL_SIGNUP: 'referral_signup',
  
  // Product actions
  VIEW_PRODUCT: 'view_product',
  ADD_TO_CART: 'add_to_cart',
  PURCHASE: 'purchase',
  REVIEW: 'review',
  
  // Engagement actions
  SCROLL: 'scroll',
  CLICK_BUTTON: 'click_button',
  SUBMIT_FORM: 'submit_form',
  SEARCH: 'search',
  FILTER: 'filter',
  SORT: 'sort',
};

// Time periods for analytics
export const TIME_PERIODS = {
  HOURLY: 'hourly',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
  CUSTOM: 'custom',
};

// Metric types
export const METRIC_TYPES = {
  COUNT: 'count',
  SUM: 'sum',
  AVERAGE: 'average',
  PERCENTAGE: 'percentage',
  RATE: 'rate',
  RATIO: 'ratio',
};

// Chart types
export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  DOUGHNUT: 'doughnut',
  AREA: 'area',
  RADAR: 'radar',
  SCATTER: 'scatter',
  BUBBLE: 'bubble',
  HEATMAP: 'heatmap',
  FUNNEL: 'funnel',
};

// Data aggregation levels
export const AGGREGATION_LEVELS = {
  RAW: 'raw',
  HOURLY: 'hourly',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
};

// Comparison types
export const COMPARISON_TYPES = {
  PREVIOUS_PERIOD: 'previous_period',
  YEAR_OVER_YEAR: 'year_over_year',
  PERIOD_TO_DATE: 'period_to_date',
  CUSTOM: 'custom',
};

// Default metrics
export const DEFAULT_METRICS = {
  // Traffic metrics
  PAGE_VIEWS: 'page_views',
  UNIQUE_VISITORS: 'unique_visitors',
  SESSIONS: 'sessions',
  BOUNCE_RATE: 'bounce_rate',
  AVG_SESSION_DURATION: 'avg_session_duration',
  
  // Affiliate metrics
  CLICKS: 'clicks',
  UNIQUE_CLICKS: 'unique_clicks',
  CONVERSIONS: 'conversions',
  CONVERSION_RATE: 'conversion_rate',
  EARNINGS: 'earnings',
  COMMISSIONS: 'commissions',
  
  // Referral metrics
  REFERRALS: 'referrals',
  ACTIVE_REFERRALS: 'active_referrals',
  REFERRAL_CONVERSION_RATE: 'referral_conversion_rate',
  
  // User metrics
  TOTAL_USERS: 'total_users',
  ACTIVE_USERS: 'active_users',
  NEW_USERS: 'new_users',
  USER_RETENTION: 'user_retention',
  USER_CHURN: 'user_churn',
  
  // Product metrics
  PRODUCT_VIEWS: 'product_views',
  PRODUCT_SALES: 'product_sales',
  REVENUE: 'revenue',
  AVERAGE_ORDER_VALUE: 'average_order_value',
  
  // Performance metrics
  RESPONSE_TIME: 'response_time',
  ERROR_RATE: 'error_rate',
  AVAILABILITY: 'availability',
};

// Create axios instance for analytics service
const analyticsApi = axios.create({
  baseURL: `${API_URL}/analytics`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
analyticsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
analyticsApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        if (response.data.success) {
          localStorage.setItem('auth_token', response.data.token);
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return analyticsApi(originalRequest);
        }
      } catch (refreshError) {
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Helper function to handle API errors
const handleError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    const message = data.message || data.error || 'Analytics error occurred';
    
    switch (status) {
      case 400:
        throw new Error(`Invalid Request: ${message}`);
      case 401:
        throw new Error('Unauthorized: Please login again');
      case 403:
        throw new Error('Forbidden: You don\'t have permission');
      case 404:
        throw new Error('Not Found: Analytics data not found');
      case 422:
        throw new Error(`Validation Error: ${message}`);
      case 429:
        throw new Error('Too Many Requests: Please try again later');
      case 500:
        throw new Error('Server Error: Please try again later');
      default:
        throw new Error(message);
    }
  } else if (error.request) {
    throw new Error('Network Error: Please check your internet connection');
  } else {
    throw new Error(error.message || 'An unexpected error occurred');
  }
};

// Helper function to format analytics data
const formatAnalyticsData = (data) => {
  return {
    id: data._id || data.id,
    timestamp: data.timestamp || new Date().toISOString(),
    
    // Event data
    category: data.category,
    action: data.action,
    label: data.label,
    value: data.value,
    
    // User data
    userId: data.userId,
    userRole: data.userRole,
    userSession: data.userSession,
    
    // Page data
    page: data.page,
    referrer: data.referrer,
    url: data.url,
    
    // Device data
    device: data.device,
    browser: data.browser,
    os: data.os,
    screenSize: data.screenSize,
    
    // Location data
    country: data.country,
    city: data.city,
    ip: data.ip,
    
    // Performance data
    loadTime: data.loadTime,
    responseTime: data.responseTime,
    
    // Metadata
    metadata: data.metadata || {},
    tags: data.tags || [],
    
    createdAt: data.createdAt || new Date().toISOString(),
  };
};
// Analytics Service Class
class AnalyticsService {
  // ==================== Event Tracking ====================

  // Track event
  async trackEvent(category, action, data = {}) {
    try {
      const eventData = {
        category,
        action,
        timestamp: new Date().toISOString(),
        ...data,
        // Auto-collect context data
        page: window.location.pathname,
        url: window.location.href,
        referrer: document.referrer,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        userAgent: navigator.userAgent,
      };

      // Send to server (fire and forget)
      analyticsApi.post('/events/track', eventData).catch(() => {});

      // Also store in localStorage for offline capability
      this.storeOfflineEvent(eventData);

      return { success: true };
    } catch (error) {
      console.error('Event tracking failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Track page view
  async trackPageView(page, metadata = {}) {
    return this.trackEvent(EVENT_CATEGORIES.PAGE_VIEW, 'view', {
      page,
      ...metadata,
    });
  }

  // Track user action
  async trackUserAction(action, metadata = {}) {
    return this.trackEvent(EVENT_CATEGORIES.USER, action, metadata);
  }

  // Track affiliate action
  async trackAffiliateAction(action, metadata = {}) {
    return this.trackEvent(EVENT_CATEGORIES.AFFILIATE, action, metadata);
  }

  // Track payment event
  async trackPaymentEvent(action, metadata = {}) {
    return this.trackEvent(EVENT_CATEGORIES.PAYMENT, action, metadata);
  }

  // Track referral
  async trackReferral(action, metadata = {}) {
    return this.trackEvent(EVENT_CATEGORIES.REFERRAL, action, metadata);
  }

  // Track conversion
  async trackConversion(metadata = {}) {
    return this.trackEvent(EVENT_CATEGORIES.CONVERSION, 'converted', metadata);
  }

  // Track error
  async trackError(error, metadata = {}) {
    return this.trackEvent(EVENT_CATEGORIES.ERROR, 'error', {
      error: error.message,
      stack: error.stack,
      ...metadata,
    });
  }

  // Track performance metric
  async trackPerformance(metric, value, metadata = {}) {
    return this.trackEvent(EVENT_CATEGORIES.PERFORMANCE, metric, {
      value,
      ...metadata,
    });
  }

  // ==================== Offline Event Storage ====================

  // Store event offline
  storeOfflineEvent(eventData) {
    try {
      const offlineEvents = JSON.parse(localStorage.getItem('offline_analytics') || '[]');
      offlineEvents.push({
        ...eventData,
        offlineId: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        storedAt: new Date().toISOString(),
      });
      
      // Keep only last 1000 events
      if (offlineEvents.length > 1000) {
        offlineEvents.splice(0, offlineEvents.length - 1000);
      }
      
      localStorage.setItem('offline_analytics', JSON.stringify(offlineEvents));
    } catch (error) {
      console.error('Failed to store offline event:', error);
    }
  }

  // Sync offline events
  async syncOfflineEvents() {
    try {
      const offlineEvents = JSON.parse(localStorage.getItem('offline_analytics') || '[]');
      
      if (offlineEvents.length === 0) {
        return { success: true, synced: 0 };
      }

      const response = await analyticsApi.post('/events/sync', { events: offlineEvents });
      
      if (response.data.success) {
        localStorage.removeItem('offline_analytics');
        return {
          success: true,
          synced: offlineEvents.length,
          failed: response.data.failed || 0,
        };
      }
      
      return {
        success: false,
        error: response.data.message,
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Dashboard Analytics ====================

  // Get dashboard analytics
  async getDashboardAnalytics(period = TIME_PERIODS.DAILY, filters = {}) {
    try {
      const response = await analyticsApi.get('/dashboard', {
        params: { period, ...filters },
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.analytics,
          summary: response.data.summary,
          charts: response.data.charts,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get dashboard analytics',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get real-time analytics
  async getRealtimeAnalytics() {
    try {
      const response = await analyticsApi.get('/realtime');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.analytics,
          activeUsers: response.data.activeUsers,
          events: response.data.events,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get realtime analytics',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get traffic analytics
  async getTrafficAnalytics(period = TIME_PERIODS.DAILY, filters = {}) {
    try {
      const response = await analyticsApi.get('/traffic', {
        params: { period, ...filters },
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.analytics,
          sources: response.data.sources,
          devices: response.data.devices,
          locations: response.data.locations,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get traffic analytics',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get user analytics
  async getUserAnalytics(period = TIME_PERIODS.DAILY, filters = {}) {
    try {
      const response = await analyticsApi.get('/users', {
        params: { period, ...filters },
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.analytics,
          metrics: response.data.metrics,
          segments: response.data.segments,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get user analytics',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get affiliate analytics
  async getAffiliateAnalytics(period = TIME_PERIODS.DAILY, filters = {}) {
    try {
      const response = await analyticsApi.get('/affiliates', {
        params: { period, ...filters },
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.analytics,
          performance: response.data.performance,
          topAffiliates: response.data.topAffiliates,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get affiliate analytics',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get earnings analytics
  async getEarningsAnalytics(period = TIME_PERIODS.DAILY, filters = {}) {
    try {
      const response = await analyticsApi.get('/earnings', {
        params: { period, ...filters },
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.analytics,
          breakdown: response.data.breakdown,
          projections: response.data.projections,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get earnings analytics',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get conversion analytics
  async getConversionAnalytics(period = TIME_PERIODS.DAILY, filters = {}) {
    try {
      const response = await analyticsApi.get('/conversions', {
        params: { period, ...filters },
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.analytics,
          funnel: response.data.funnel,
          rates: response.data.rates,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get conversion analytics',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get product analytics
  async getProductAnalytics(period = TIME_PERIODS.DAILY, filters = {}) {
    try {
      const response = await analyticsApi.get('/products', {
        params: { period, ...filters },
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.analytics,
          topProducts: response.data.topProducts,
          categories: response.data.categories,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get product analytics',
      };
    } catch (error) {
      throw handleError(error);
    }
  }
  // ==================== Custom Reports ====================

  // Generate custom report
  async generateReport(reportConfig) {
    try {
      const response = await analyticsApi.post('/reports/generate', reportConfig);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.report,
          url: response.data.url,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to generate report',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get saved reports
  async getSavedReports() {
    try {
      const response = await analyticsApi.get('/reports');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.reports,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get saved reports',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Save report
  async saveReport(name, config) {
    try {
      const response = await analyticsApi.post('/reports/save', { name, config });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.report,
          message: response.data.message || 'Report saved successfully',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to save report',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Update saved report
  async updateReport(reportId, updates) {
    try {
      const response = await analyticsApi.put(`/reports/${reportId}`, updates);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.report,
          message: response.data.message || 'Report updated successfully',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to update report',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Delete saved report
  async deleteReport(reportId) {
    try {
      const response = await analyticsApi.delete(`/reports/${reportId}`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Report deleted successfully',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to delete report',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Export report
  async exportReport(reportId, format = 'pdf', options = {}) {
    try {
      const response = await analyticsApi.get(`/reports/${reportId}/export`, {
        params: { format, ...options },
        responseType: 'blob',
      });
      
      return {
        success: true,
        data: response.data,
        filename: response.headers['content-disposition']?.split('filename=')[1] || `report-${reportId}.${format}`,
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Schedule report
  async scheduleReport(reportId, schedule) {
    try {
      const response = await analyticsApi.post(`/reports/${reportId}/schedule`, schedule);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.schedule,
          message: response.data.message || 'Report scheduled successfully',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to schedule report',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Funnel Analysis ====================

  // Create funnel
  async createFunnel(funnelData) {
    try {
      const response = await analyticsApi.post('/funnels', funnelData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.funnel,
          message: response.data.message || 'Funnel created successfully',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to create funnel',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get funnel analysis
  async getFunnelAnalysis(funnelId, period = TIME_PERIODS.DAILY) {
    try {
      const response = await analyticsApi.get(`/funnels/${funnelId}/analysis`, {
        params: { period },
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.analysis,
          steps: response.data.steps,
          conversionRates: response.data.conversionRates,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get funnel analysis',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get funnels
  async getFunnels() {
    try {
      const response = await analyticsApi.get('/funnels');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.funnels,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get funnels',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Cohort Analysis ====================

  // Get cohort analysis
  async getCohortAnalysis(cohortType = 'weekly', period = 12) {
    try {
      const response = await analyticsApi.get('/cohorts', {
        params: { type: cohortType, period },
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.cohorts,
          matrix: response.data.matrix,
          retention: response.data.retention,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get cohort analysis',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Create cohort
  async createCohort(cohortData) {
    try {
      const response = await analyticsApi.post('/cohorts', cohortData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.cohort,
          message: response.data.message || 'Cohort created successfully',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to create cohort',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Retention Analysis ====================

  // Get retention analysis
  async getRetentionAnalysis(period = '30days') {
    try {
      const response = await analyticsApi.get('/retention', {
        params: { period },
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.retention,
          rates: response.data.rates,
          chart: response.data.chart,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get retention analysis',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get churn analysis
  async getChurnAnalysis(period = '30days') {
    try {
      const response = await analyticsApi.get('/churn', {
        params: { period },
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.churn,
          rates: response.data.rates,
          reasons: response.data.reasons,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get churn analysis',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Forecasting ====================

  // Get forecast
  async getForecast(metric, period = '30days', model = 'arima') {
    try {
      const response = await analyticsApi.get('/forecast', {
        params: { metric, period, model },
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.forecast,
          predictions: response.data.predictions,
          confidence: response.data.confidence,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get forecast',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get predictions
  async getPredictions(metric, horizon = 30) {
    try {
      const response = await analyticsApi.get('/predictions', {
        params: { metric, horizon },
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.predictions,
          intervals: response.data.intervals,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get predictions',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Segmentation ====================

  // Get user segments
  async getUserSegments() {
    try {
      const response = await analyticsApi.get('/segments');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.segments,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get segments',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Create segment
  async createSegment(segmentData) {
    try {
      const response = await analyticsApi.post('/segments', segmentData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.segment,
          message: response.data.message || 'Segment created successfully',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to create segment',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get segment analysis
  async getSegmentAnalysis(segmentId, period = '30days') {
    try {
      const response = await analyticsApi.get(`/segments/${segmentId}/analysis`, {
        params: { period },
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.analysis,
          metrics: response.data.metrics,
          comparison: response.data.comparison,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get segment analysis',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== A/B Testing ====================

  // Create A/B test
  async createABTest(testData) {
    try {
      const response = await analyticsApi.post('/ab-tests', testData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.test,
          message: response.data.message || 'A/B test created successfully',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to create A/B test',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get A/B tests
  async getABTests() {
    try {
      const response = await analyticsApi.get('/ab-tests');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.tests,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get A/B tests',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get A/B test results
  async getABTestResults(testId) {
    try {
      const response = await analyticsApi.get(`/ab-tests/${testId}/results`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.results,
          winner: response.data.winner,
          confidence: response.data.confidence,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get test results',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Custom Queries ====================

  // Run custom query
  async runCustomQuery(query) {
    try {
      const response = await analyticsApi.post('/query', query);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.results,
          executionTime: response.data.executionTime,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to run query',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get query history
  async getQueryHistory() {
    try {
      const response = await analyticsApi.get('/query/history');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.queries,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get query history',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Save query
  async saveQuery(name, query) {
    try {
      const response = await analyticsApi.post('/query/save', { name, query });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.saved,
          message: response.data.message || 'Query saved successfully',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to save query',
      };
    } catch (error) {
      throw handleError(error);
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export API instance for custom requests
export { analyticsApi };

// Helper functions for analytics
export const analyticsHelpers = {
  // Calculate percentage change
  calculateChange: (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },

  // Format percentage
  formatPercentage: (value, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
  },

  // Format currency
  formatCurrency: (value, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value);
  },

  // Format number with K/M/B suffixes
  formatNumber: (value) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  },

  // Calculate conversion rate
  calculateConversionRate: (conversions, total) => {
    if (total === 0) return 0;
    return (conversions / total) * 100;
  },

  // Calculate average
  calculateAverage: (values) => {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  },

  // Calculate growth rate
  calculateGrowthRate: (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },

  // Calculate retention rate
  calculateRetentionRate: (returning, total) => {
    if (total === 0) return 0;
    return (returning / total) * 100;
  },

  // Calculate churn rate
  calculateChurnRate: (lost, total) => {
    if (total === 0) return 0;
    return (lost / total) * 100;
  },

  // Generate color palette for charts
  generateChartColors: (count) => {
    const colors = [
      '#667eea', '#764ba2', '#ff6b6b', '#4ecdc4', '#45b7d1',
      '#96ceb4', '#ffcc5c', '#ff6f69', '#a8e6cf', '#d4a5a5',
      '#9b59b6', '#3498db', '#e74c3c', '#2ecc71', '#f1c40f',
    ];
    
    if (count <= colors.length) return colors.slice(0, count);
    
    // Generate more colors if needed
    const generated = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 137) % 360; // Golden angle approximation
      generated.push(`hsl(${hue}, 70%, 60%)`);
    }
    return generated;
  },

  // Aggregate data by time period
  aggregateByPeriod: (data, period = TIME_PERIODS.DAILY) => {
    const aggregated = {};
    
    data.forEach(item => {
      const date = new Date(item.timestamp);
      let key;
      
      switch (period) {
        case TIME_PERIODS.HOURLY:
          key = `${date.toISOString().split('T')[0]} ${date.getHours()}:00`;
          break;
        case TIME_PERIODS.DAILY:
          key = date.toISOString().split('T')[0];
          break;
        case TIME_PERIODS.WEEKLY:
          const week = Math.floor(date.getDate() / 7);
          key = `${date.getFullYear()}-W${week}`;
          break;
        case TIME_PERIODS.MONTHLY:
          key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          break;
        default:
          key = item.timestamp;
      }
      
      if (!aggregated[key]) {
        aggregated[key] = { ...item, count: 1 };
      } else {
        aggregated[key].value += item.value;
        aggregated[key].count++;
      }
    });
    
    return Object.values(aggregated);
  },

  // Calculate moving average
  movingAverage: (data, window = 7) => {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - window + 1);
      const end = i + 1;
      const windowData = data.slice(start, end);
      const avg = windowData.reduce((sum, val) => sum + val, 0) / windowData.length;
      result.push(avg);
    }
    return result;
  },

  // Detect outliers
  detectOutliers: (data, threshold = 2) => {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const stdDev = Math.sqrt(
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length,
    );
    
    return data.map((val, index) => ({
      value: val,
      index,
      isOutlier: Math.abs(val - mean) > threshold * stdDev,
      zScore: (val - mean) / stdDev,
    }));
  },

  // Get trend direction
  getTrend: (data) => {
    if (data.length < 2) return 'stable';
    
    const first = data[0];
    const last = data[data.length - 1];
    const change = last - first;
    
    if (change > 0.05 * first) return 'up';
    if (change < -0.05 * first) return 'down';
    return 'stable';
  },

  // Calculate confidence interval
  confidenceInterval: (data, confidence = 0.95) => {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const stdDev = Math.sqrt(
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length,
    );
    
    const z = confidence === 0.99 ? 2.576 : confidence === 0.95 ? 1.96 : 1.645;
    const margin = z * (stdDev / Math.sqrt(data.length));
    
    return {
      mean,
      lower: mean - margin,
      upper: mean + margin,
      margin,
    };
  },
};

// Export constants
export const ANALYTICS_CONSTANTS = {
  EVENT_CATEGORIES,
  EVENT_ACTIONS,
  TIME_PERIODS,
  METRIC_TYPES,
  CHART_TYPES,
  AGGREGATION_LEVELS,
  COMPARISON_TYPES,
  DEFAULT_METRICS,
};

export default analyticsService;
