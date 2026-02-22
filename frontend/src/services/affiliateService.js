import axios from 'axios';
import { authApi } from '../hooks/useAuth';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Commission types
export const COMMISSION_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  TIERED: 'tiered',
  RECURRING: 'recurring',
  LIFETIME: 'lifetime'
};

// Commission statuses
export const COMMISSION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  REJECTED: 'rejected'
};

// Referral statuses
export const REFERRAL_STATUSES = {
  PENDING: 'pending',
  ACTIVE: 'active',
  CONVERTED: 'converted',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

// Link types
export const LINK_TYPES = {
  DIRECT: 'direct',
  BANNER: 'banner',
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  SOCIAL: 'social',
  QR: 'qr',
  COUPON: 'coupon'
};

// Link statuses
export const LINK_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  PAUSED: 'paused',
  DELETED: 'deleted'
};

// Product categories
export const PRODUCT_CATEGORIES = {
  ELECTRONICS: 'electronics',
  FASHION: 'fashion',
  HOME: 'home',
  BEAUTY: 'beauty',
  SPORTS: 'sports',
  BOOKS: 'books',
  TOYS: 'toys',
  FOOD: 'food',
  HEALTH: 'health',
  AUTOMOTIVE: 'automotive',
  PET: 'pet',
  OFFICE: 'office',
  GARDEN: 'garden',
  MUSIC: 'music',
  GAMES: 'games',
  SOFTWARE: 'software',
  COURSES: 'courses',
  SERVICES: 'services'
};

// Affiliate levels
export const AFFILIATE_LEVELS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
  DIAMOND: 'diamond',
  ELITE: 'elite'
};

// Payout methods
export const PAYOUT_METHODS = {
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  UPI: 'upi',
  PAYONEER: 'payoneer',
  WISE: 'wise',
  CRYPTO: 'crypto',
  GIFT_CARD: 'gift_card'
};

// Payout statuses
export const PAYOUT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected'
};

// Default commission rates by level
export const DEFAULT_COMMISSION_RATES = {
  [AFFILIATE_LEVELS.BRONZE]: 5,
  [AFFILIATE_LEVELS.SILVER]: 10,
  [AFFILIATE_LEVELS.GOLD]: 15,
  [AFFILIATE_LEVELS.PLATINUM]: 20,
  [AFFILIATE_LEVELS.DIAMOND]: 25,
  [AFFILIATE_LEVELS.ELITE]: 30
};

// Minimum payout amounts
export const MINIMUM_PAYOUTS = {
  [PAYOUT_METHODS.PAYPAL]: 10,
  [PAYOUT_METHODS.BANK_TRANSFER]: 25,
  [PAYOUT_METHODS.UPI]: 10,
  [PAYOUT_METHODS.PAYONEER]: 20,
  [PAYOUT_METHODS.WISE]: 20,
  [PAYOUT_METHODS.CRYPTO]: 50,
  [PAYOUT_METHODS.GIFT_CARD]: 5
};

// Create axios instance for affiliate service
const affiliateApi = axios.create({
  baseURL: `${API_URL}/affiliates`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
affiliateApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
affiliateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        });

        if (response.data.success) {
          localStorage.setItem('auth_token', response.data.token);
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return affiliateApi(originalRequest);
        }
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to handle API errors
const handleError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    const message = data.message || data.error || 'An error occurred';
    
    switch (status) {
      case 400:
        throw new Error(`Bad Request: ${message}`);
      case 401:
        throw new Error('Unauthorized: Please login again');
      case 403:
        throw new Error('Forbidden: You don\'t have permission');
      case 404:
        throw new Error('Not Found: Affiliate data not found');
      case 409:
        throw new Error(`Conflict: ${message}`);
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

// Helper function to format affiliate data
const formatAffiliateData = (affiliate) => {
  return {
    id: affiliate._id || affiliate.id,
    userId: affiliate.userId,
    
    // Profile
    name: affiliate.name || '',
    email: affiliate.email || '',
    phone: affiliate.phone || '',
    avatar: affiliate.avatar || null,
    
    // Affiliate info
    affiliateCode: affiliate.affiliateCode || '',
    referralCode: affiliate.referralCode || '',
    level: affiliate.level || AFFILIATE_LEVELS.BRONZE,
    status: affiliate.status || 'active',
    
    // Performance metrics
    metrics: affiliate.metrics || {
      clicks: 0,
      uniqueClicks: 0,
      conversions: 0,
      conversionRate: 0,
      earnings: 0,
      pendingEarnings: 0,
      paidEarnings: 0,
      refunds: 0,
      chargebacks: 0
    },
    
    // Referrals
    referrals: affiliate.referrals || {
      total: 0,
      active: 0,
      pending: 0,
      converted: 0,
      topReferrals: []
    },
    
    // Links
    links: affiliate.links || {
      total: 0,
      active: 0,
      clicks: 0,
      topPerforming: []
    },
    
    // Products
    products: affiliate.products || {
      promoted: 0,
      categories: [],
      topProducts: []
    },
    
    // Commissions
    commissions: affiliate.commissions || {
      total: 0,
      pending: 0,
      paid: 0,
      averageRate: 0,
      byType: {}
    },
    
    // Payouts
    payouts: affiliate.payouts || {
      total: 0,
      pending: 0,
      completed: 0,
      methods: {}
    },
    
    // Payment info
    paymentInfo: affiliate.paymentInfo || {
      paypal: '',
      bankAccount: '',
      upiId: '',
      payoneerId: '',
      cryptoAddress: ''
    },
    
    // Settings
    settings: affiliate.settings || {
      autoApprove: false,
      notificationPreferences: {
        email: true,
        push: true,
        sms: false
      },
      commissionRate: DEFAULT_COMMISSION_RATES[affiliate.level] || 5
    },
    
    // Dates
    joinedAt: affiliate.joinedAt || new Date().toISOString(),
    lastActive: affiliate.lastActive || null,
    updatedAt: affiliate.updatedAt || new Date().toISOString()
  };
};
// Affiliate Service Class
class AffiliateService {
  // ==================== Affiliate Profile ====================

  // Get affiliate dashboard data
  async getDashboard() {
    try {
      const response = await affiliateApi.get('/dashboard');
      
      if (response.data.success) {
        return {
          success: true,
          data: {
            metrics: response.data.metrics,
            recentActivity: response.data.recentActivity,
            topLinks: response.data.topLinks,
            notifications: response.data.notifications,
            chartData: response.data.chartData
          }
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get dashboard'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get affiliate stats
  async getStats(period = '30days', filters = {}) {
    try {
      const response = await affiliateApi.get('/stats', {
        params: { period, ...filters }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.stats
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get stats'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get affiliate profile
  async getProfile() {
    try {
      const response = await affiliateApi.get('/profile');
      
      if (response.data.success) {
        return {
          success: true,
          data: formatAffiliateData(response.data.affiliate)
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get profile'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Update affiliate profile
  async updateProfile(profileData) {
    try {
      const response = await affiliateApi.put('/profile', profileData);
      
      if (response.data.success) {
        return {
          success: true,
          data: formatAffiliateData(response.data.affiliate),
          message: response.data.message || 'Profile updated successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to update profile'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Update payment info
  async updatePaymentInfo(paymentInfo) {
    try {
      const response = await affiliateApi.put('/payment-info', paymentInfo);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.paymentInfo,
          message: response.data.message || 'Payment info updated successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to update payment info'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Update settings
  async updateSettings(settings) {
    try {
      const response = await affiliateApi.put('/settings', settings);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.settings,
          message: response.data.message || 'Settings updated successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to update settings'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Referral Links ====================

  // Create referral link
  async createLink(linkData) {
    try {
      const response = await affiliateApi.post('/links', linkData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.link,
          message: response.data.message || 'Link created successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to create link'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get all referral links
  async getLinks(filters = {}, page = 1, limit = 20) {
    try {
      const response = await affiliateApi.get('/links', {
        params: { ...filters, page, limit }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.links,
          pagination: response.data.pagination,
          total: response.data.total
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get links'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get link by ID
  async getLinkById(linkId) {
    try {
      const response = await affiliateApi.get(`/links/${linkId}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.link
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get link'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Update link
  async updateLink(linkId, linkData) {
    try {
      const response = await affiliateApi.put(`/links/${linkId}`, linkData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.link,
          message: response.data.message || 'Link updated successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to update link'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Delete link
  async deleteLink(linkId) {
    try {
      const response = await affiliateApi.delete(`/links/${linkId}`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Link deleted successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to delete link'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Bulk create links
  async bulkCreateLinks(linksData) {
    try {
      const response = await affiliateApi.post('/links/bulk', { links: linksData });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.links,
          message: response.data.message || 'Links created successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to create links'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Bulk delete links
  async bulkDeleteLinks(linkIds) {
    try {
      const response = await affiliateApi.delete('/links/bulk', {
        data: { linkIds }
      });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Links deleted successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to delete links'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get link analytics
  async getLinkAnalytics(linkId, period = '30days') {
    try {
      const response = await affiliateApi.get(`/links/${linkId}/analytics`, {
        params: { period }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.analytics
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get link analytics'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Generate QR code for link
  async generateQRCode(linkId, options = {}) {
    try {
      const response = await affiliateApi.post(`/links/${linkId}/qrcode`, options);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.qrCode,
          url: response.data.url
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to generate QR code'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Referrals Management ====================

  // Get referrals
  async getReferrals(filters = {}, page = 1, limit = 20) {
    try {
      const response = await affiliateApi.get('/referrals', {
        params: { ...filters, page, limit }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.referrals,
          pagination: response.data.pagination,
          total: response.data.total
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get referrals'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get referral by ID
  async getReferralById(referralId) {
    try {
      const response = await affiliateApi.get(`/referrals/${referralId}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.referral
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get referral'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get referral tree
  async getReferralTree(depth = 3) {
    try {
      const response = await affiliateApi.get('/referrals/tree', {
        params: { depth }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.tree
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get referral tree'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get referral stats
  async getReferralStats(period = '30days') {
    try {
      const response = await affiliateApi.get('/referrals/stats', {
        params: { period }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.stats
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get referral stats'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Send referral invitation
  async sendInvitation(email, message = '') {
    try {
      const response = await affiliateApi.post('/referrals/invite', {
        email,
        message
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.invitation,
          message: response.data.message || 'Invitation sent successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to send invitation'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Bulk send invitations
  async bulkSendInvitations(emails, message = '') {
    try {
      const response = await affiliateApi.post('/referrals/invite/bulk', {
        emails,
        message
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.results,
          message: response.data.message || 'Invitations sent successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to send invitations'
      };
    } catch (error) {
      throw handleError(error);
    }
  }
  // ==================== Commissions Management ====================

  // Get commissions
  async getCommissions(filters = {}, page = 1, limit = 20) {
    try {
      const response = await affiliateApi.get('/commissions', {
        params: { ...filters, page, limit }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.commissions,
          pagination: response.data.pagination,
          total: response.data.total,
          summary: response.data.summary
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get commissions'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get commission by ID
  async getCommissionById(commissionId) {
    try {
      const response = await affiliateApi.get(`/commissions/${commissionId}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.commission
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get commission'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get commission summary
  async getCommissionSummary(period = 'all') {
    try {
      const response = await affiliateApi.get('/commissions/summary', {
        params: { period }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.summary
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get commission summary'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get commission forecast
  async getCommissionForecast(months = 3) {
    try {
      const response = await affiliateApi.get('/commissions/forecast', {
        params: { months }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.forecast
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get commission forecast'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Payouts Management ====================

  // Request payout
  async requestPayout(amount, method, details = {}) {
    try {
      const response = await affiliateApi.post('/payouts/request', {
        amount,
        method,
        ...details
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.payout,
          message: response.data.message || 'Payout requested successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to request payout'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get payouts
  async getPayouts(filters = {}, page = 1, limit = 20) {
    try {
      const response = await affiliateApi.get('/payouts', {
        params: { ...filters, page, limit }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.payouts,
          pagination: response.data.pagination,
          total: response.data.total
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get payouts'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get payout by ID
  async getPayoutById(payoutId) {
    try {
      const response = await affiliateApi.get(`/payouts/${payoutId}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.payout
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get payout'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Cancel payout request
  async cancelPayout(payoutId) {
    try {
      const response = await affiliateApi.post(`/payouts/${payoutId}/cancel`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Payout cancelled successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to cancel payout'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get payout methods
  async getPayoutMethods() {
    try {
      const response = await affiliateApi.get('/payouts/methods');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.methods,
          minimums: response.data.minimums
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get payout methods'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Products Management ====================

  // Get available products
  async getProducts(filters = {}, page = 1, limit = 20) {
    try {
      const response = await affiliateApi.get('/products', {
        params: { ...filters, page, limit }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.products,
          pagination: response.data.pagination,
          total: response.data.total,
          categories: response.data.categories
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get products'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get product by ID
  async getProductById(productId) {
    try {
      const response = await affiliateApi.get(`/products/${productId}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.product
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get product'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get promoted products
  async getPromotedProducts() {
    try {
      const response = await affiliateApi.get('/products/promoted');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.products
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get promoted products'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get top products
  async getTopProducts(limit = 10) {
    try {
      const response = await affiliateApi.get('/products/top', {
        params: { limit }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.products
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get top products'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Search products
  async searchProducts(query, filters = {}, page = 1, limit = 20) {
    try {
      const response = await affiliateApi.get('/products/search', {
        params: { q: query, ...filters, page, limit }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.products,
          pagination: response.data.pagination,
          total: response.data.total
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to search products'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Analytics and Reports ====================

  // Get performance analytics
  async getPerformanceAnalytics(period = '30days', filters = {}) {
    try {
      const response = await affiliateApi.get('/analytics/performance', {
        params: { period, ...filters }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.analytics
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get analytics'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get conversion analytics
  async getConversionAnalytics(period = '30days') {
    try {
      const response = await affiliateApi.get('/analytics/conversions', {
        params: { period }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.analytics
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get conversion analytics'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get traffic analytics
  async getTrafficAnalytics(period = '30days') {
    try {
      const response = await affiliateApi.get('/analytics/traffic', {
        params: { period }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.analytics
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get traffic analytics'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get geographic analytics
  async getGeoAnalytics(period = '30days') {
    try {
      const response = await affiliateApi.get('/analytics/geo', {
        params: { period }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.analytics
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get geographic analytics'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get device analytics
  async getDeviceAnalytics(period = '30days') {
    try {
      const response = await affiliateApi.get('/analytics/device', {
        params: { period }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.analytics
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get device analytics'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get timeline analytics
  async getTimelineAnalytics(startDate, endDate, interval = 'day') {
    try {
      const response = await affiliateApi.get('/analytics/timeline', {
        params: { startDate, endDate, interval }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.analytics
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get timeline analytics'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Generate report
  async generateReport(type, format = 'pdf', filters = {}) {
    try {
      const response = await affiliateApi.get('/reports/generate', {
        params: { type, format, ...filters },
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        filename: response.headers['content-disposition']?.split('filename=')[1] || `report.${format}`
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get saved reports
  async getSavedReports() {
    try {
      const response = await affiliateApi.get('/reports/saved');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.reports
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get saved reports'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Save report
  async saveReport(name, type, filters = {}) {
    try {
      const response = await affiliateApi.post('/reports/save', {
        name,
        type,
        filters
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.report,
          message: response.data.message || 'Report saved successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to save report'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Leaderboard ====================

  // Get leaderboard
  async getLeaderboard(period = 'month', limit = 100) {
    try {
      const response = await affiliateApi.get('/leaderboard', {
        params: { period, limit }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.leaderboard,
          userRank: response.data.userRank
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get leaderboard'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get top affiliates by category
  async getTopAffiliates(category, limit = 10) {
    try {
      const response = await affiliateApi.get('/leaderboard/top', {
        params: { category, limit }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.affiliates
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get top affiliates'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get achievements
  async getAchievements() {
    try {
      const response = await affiliateApi.get('/achievements');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.achievements,
          unlocked: response.data.unlocked
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get achievements'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Admin Functions ====================

  // Get all affiliates (admin only)
  async getAllAffiliates(filters = {}, page = 1, limit = 20) {
    try {
      const response = await affiliateApi.get('/admin/all', {
        params: { ...filters, page, limit }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.affiliates.map(formatAffiliateData),
          pagination: response.data.pagination,
          total: response.data.total
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get affiliates'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Update affiliate level (admin only)
  async updateAffiliateLevel(affiliateId, level) {
    try {
      const response = await affiliateApi.put(`/admin/${affiliateId}/level`, { level });
      
      if (response.data.success) {
        return {
          success: true,
          data: formatAffiliateData(response.data.affiliate),
          message: response.data.message || 'Affiliate level updated'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to update affiliate level'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Update affiliate status (admin only)
  async updateAffiliateStatus(affiliateId, status, reason = '') {
    try {
      const response = await affiliateApi.put(`/admin/${affiliateId}/status`, {
        status,
        reason
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: formatAffiliateData(response.data.affiliate),
          message: response.data.message || 'Affiliate status updated'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to update affiliate status'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Approve commission (admin only)
  async approveCommission(commissionId) {
    try {
      const response = await affiliateApi.post(`/admin/commissions/${commissionId}/approve`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Commission approved'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to approve commission'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Process payout (admin only)
  async processPayout(payoutId, transactionData = {}) {
    try {
      const response = await affiliateApi.post(`/admin/payouts/${payoutId}/process`, transactionData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.payout,
          message: response.data.message || 'Payout processed'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to process payout'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Bulk process payouts (admin only)
  async bulkProcessPayouts(payoutIds) {
    try {
      const response = await affiliateApi.post('/admin/payouts/bulk-process', { payoutIds });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.results,
          message: response.data.message || 'Payouts processed'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to process payouts'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Export affiliate data (admin only)
  async exportAffiliates(format = 'csv', filters = {}) {
    try {
      const response = await affiliateApi.get('/admin/export', {
        params: { format, ...filters },
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        filename: response.headers['content-disposition']?.split('filename=')[1] || `affiliates.${format}`
      };
    } catch (error) {
      throw handleError(error);
    }
  }
}

// Export singleton instance
export const affiliateService = new AffiliateService();

// Export API instance for custom requests
export { affiliateApi };

// Export helper functions
export const affiliateHelpers = {
  // Calculate commission
  calculateCommission: (amount, rate, type = COMMISSION_TYPES.PERCENTAGE) => {
    if (type === COMMISSION_TYPES.PERCENTAGE) {
      return amount * (rate / 100);
    }
    return rate; // Fixed amount
  },

  // Get affiliate level based on earnings
  getAffiliateLevel: (earnings) => {
    if (earnings >= 100000) return AFFILIATE_LEVELS.ELITE;
    if (earnings >= 50000) return AFFILIATE_LEVELS.DIAMOND;
    if (earnings >= 25000) return AFFILIATE_LEVELS.PLATINUM;
    if (earnings >= 10000) return AFFILIATE_LEVELS.GOLD;
    if (earnings >= 5000) return AFFILIATE_LEVELS.SILVER;
    return AFFILIATE_LEVELS.BRONZE;
  },

  // Get next level requirements
  getNextLevelRequirements: (currentLevel, earnings) => {
    const requirements = {
      [AFFILIATE_LEVELS.BRONZE]: 5000,
      [AFFILIATE_LEVELS.SILVER]: 10000,
      [AFFILIATE_LEVELS.GOLD]: 25000,
      [AFFILIATE_LEVELS.PLATINUM]: 50000,
      [AFFILIATE_LEVELS.DIAMOND]: 100000,
      [AFFILIATE_LEVELS.ELITE]: null
    };

    const nextLevel = {
      [AFFILIATE_LEVELS.BRONZE]: AFFILIATE_LEVELS.
