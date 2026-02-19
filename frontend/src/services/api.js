import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp to prevent caching (optional)
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // You can modify successful responses here if needed
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    // Handle token expiration (401)
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/auth/refresh-token`,
            { token: refreshToken }
          );

          if (response.data.success) {
            const { token } = response.data;
            localStorage.setItem('token', token);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }

      // If refresh fails, logout user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
      return Promise.reject(error);
    }

    // Handle forbidden (403)
    if (error.response.status === 403) {
      toast.error('You do not have permission to perform this action.');
      return Promise.reject(error);
    }

    // Handle not found (404)
    if (error.response.status === 404) {
      toast.error('Resource not found.');
      return Promise.reject(error);
    }

    // Handle validation errors (422)
    if (error.response.status === 422) {
      const errors = error.response.data.errors;
      if (errors) {
        Object.values(errors).forEach(message => {
          toast.error(message);
        });
      } else {
        toast.error('Validation failed.');
      }
      return Promise.reject(error);
    }

    // Handle server errors (500)
    if (error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
      return Promise.reject(error);
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || 'An error occurred';
    toast.error(errorMessage);
    return Promise.reject(error);
  }
);

// ============================================
// AUTHENTICATION API
// ============================================

export const authAPI = {
  // Register new user
  register: (userData) => api.post('/auth/register', userData),

  // Login user
  login: (credentials) => api.post('/auth/login', credentials),

  // Logout user
  logout: () => api.post('/auth/logout'),

  // Verify email
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),

  // Forgot password
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  // Reset password
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),

  // Refresh token
  refreshToken: (token) => api.post('/auth/refresh-token', { token }),

  // Get current user
  getCurrentUser: () => api.get('/auth/me'),

  // Update user details
  updateDetails: (userData) => api.put('/auth/update-details', userData),

  // Update password
  updatePassword: (passwords) => api.put('/auth/update-password', passwords),

  // Google OAuth
  googleAuth: (googleData) => api.post('/auth/google', googleData)
};

// ============================================
// USER API
// ============================================

export const userAPI = {
  // Get all users (admin only)
  getAllUsers: (params) => api.get('/users', { params }),

  // Get user by ID
  getUserById: (id) => api.get(`/users/${id}`),

  // Update user
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),

  // Delete user (admin only)
  deleteUser: (id) => api.delete(`/users/${id}`),

  // Toggle user status (admin only)
  toggleUserStatus: (id) => api.put(`/users/${id}/toggle-status`),

  // Get user referrals
  getUserReferrals: (userId) => api.get(`/users/${userId}/referrals`),

  // Get user earnings
  getUserEarnings: (userId) => api.get(`/users/${userId}/earnings`)
};

// ============================================
// AFFILIATE API
// ============================================

export const affiliateAPI = {
  // Get all affiliate links
  getAllLinks: (params) => api.get('/affiliates/links', { params }),

  // Get link by ID
  getLinkById: (id) => api.get(`/affiliates/links/${id}`),

  // Get categories
  getCategories: () => api.get('/affiliates/categories'),

  // Get featured links
  getFeaturedLinks: () => api.get('/affiliates/featured'),

  // Get user's links
  getMyLinks: () => api.get('/affiliates/my-links'),

  // Get user's clicks
  getMyClicks: (params) => api.get('/affiliates/clicks', { params }),

  // Get user's conversions
  getMyConversions: (params) => api.get('/affiliates/conversions', { params }),

  // Get user's stats
  getStats: (params) => api.get('/affiliates/stats', { params }),

  // Generate referral link
  generateReferralLink: (linkId) => api.get(`/affiliates/generate-link/${linkId}`),

  // Track click
  trackClick: (clickData) => api.post('/affiliates/track-click', clickData),

  // Simulate conversion (for testing)
  simulateConversion: (conversionData) => api.post('/affiliates/simulate-conversion', conversionData),

  // Create link (admin only)
  createLink: (linkData) => api.post('/affiliates/links', linkData),

  // Update link (admin only)
  updateLink: (id, linkData) => api.put(`/affiliates/links/${id}`, linkData),

  // Delete link (admin only)
  deleteLink: (id) => api.delete(`/affiliates/links/${id}`),

  // Bulk upload links (admin only)
  bulkUpload: (formData) => api.post('/affiliates/bulk-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// ============================================
// PAYMENT API
// ============================================

export const paymentAPI = {
  // Get user's withdrawals
  getWithdrawals: (params) => api.get('/payments/withdrawals', { params }),

  // Request withdrawal
  requestWithdrawal: (withdrawalData) => api.post('/payments/withdrawals/request', withdrawalData),

  // Get withdrawal by ID
  getWithdrawal: (id) => api.get(`/payments/withdrawals/${id}`),

  // Cancel withdrawal
  cancelWithdrawal: (id) => api.delete(`/payments/withdrawals/${id}/cancel`),

  // Get wallet info
  getWalletInfo: () => api.get('/payments/wallet'),

  // Get transaction history
  getTransactionHistory: (params) => api.get('/payments/transactions', { params }),

  // Get balance
  getBalance: () => api.get('/payments/balance'),

  // Add payment method
  addPaymentMethod: (methodData) => api.post('/payments/payment-methods', methodData),

  // Get payment methods
  getPaymentMethods: () => api.get('/payments/payment-methods'),

  // Remove payment method
  removePaymentMethod: (id) => api.delete(`/payments/payment-methods/${id}`),

  // Create Stripe account
  createStripeAccount: () => api.post('/payments/create-stripe-account'),

  // Get Stripe dashboard
  getStripeDashboard: () => api.get('/payments/stripe-dashboard'),

  // Create PayPal payout
  createPaypalPayout: (payoutData) => api.post('/payments/create-paypal-payout', payoutData)
};

// ============================================
// ADMIN API
// ============================================

export const adminAPI = {
  // Dashboard stats
  getDashboardStats: () => api.get('/admin/dashboard'),

  // User management
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),

  // Affiliate management
  getAllAffiliates: (params) => api.get('/admin/affiliates', { params }),
  approveAffiliate: (id) => api.put(`/admin/affiliates/${id}/approve`),
  rejectAffiliate: (id) => api.put(`/admin/affiliates/${id}/reject`),

  // Withdrawal management
  getWithdrawals: (params) => api.get('/admin/withdrawals', { params }),
  getPendingWithdrawals: () => api.get('/admin/withdrawals/pending'),
  processWithdrawal: (id) => api.put(`/admin/withdrawals/${id}/process`),
  completeWithdrawal: (id) => api.put(`/admin/withdrawals/${id}/complete`),
  rejectWithdrawal: (id) => api.put(`/admin/withdrawals/${id}/reject`),

  // Commission management
  getCommissions: (params) => api.get('/admin/commissions', { params }),
  updateCommissionSettings: (settings) => api.put('/admin/commissions/settings', settings),
  getPendingCommissions: () => api.get('/admin/commissions/pending'),
  approveCommission: (id) => api.put(`/admin/commissions/${id}/approve`),

  // System settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings) => api.put('/admin/settings', settings),

  // Reports
  getEarningsReport: (params) => api.get('/admin/reports/earnings', { params }),
  getUsersReport: (params) => api.get('/admin/reports/users', { params }),
  getConversionsReport: (params) => api.get('/admin/reports/conversions', { params }),
  exportData: (type, params) => api.get(`/admin/export/${type}`, { 
    params,
    responseType: 'blob' 
  }),

  // Analytics
  getAnalyticsOverview: (params) => api.get('/admin/analytics/overview', { params }),
  getChartData: (params) => api.get('/admin/analytics/chart-data', { params }),

  // Admin management
  createAdmin: (adminData) => api.post('/admin/admins', adminData),
  getAdmins: () => api.get('/admin/admins'),
  removeAdmin: (id) => api.delete(`/admin/admins/${id}`)
};

// ============================================
// ANALYTICS API
// ============================================

export const analyticsAPI = {
  // Get user's analytics
  getUserAnalytics: (params) => api.get('/analytics/user', { params }),

  // Get click analytics
  getClickAnalytics: (params) => api.get('/analytics/clicks', { params }),

  // Get conversion analytics
  getConversionAnalytics: (params) => api.get('/analytics/conversions', { params }),

  // Get earnings analytics
  getEarningsAnalytics: (params) => api.get('/analytics/earnings', { params }),

  // Get traffic sources
  getTrafficSources: (params) => api.get('/analytics/traffic', { params }),

  // Get leaderboard
  getLeaderboard: (params) => api.get('/analytics/leaderboard', { params })
};

// ============================================
// SUPPORT API
// ============================================

export const supportAPI = {
  // Create support ticket
  createTicket: (ticketData) => api.post('/support/tickets', ticketData),

  // Get user's tickets
  getMyTickets: (params) => api.get('/support/tickets', { params }),

  // Get ticket by ID
  getTicket: (id) => api.get(`/support/tickets/${id}`),

  // Reply to ticket
  replyToTicket: (id, message) => api.post(`/support/tickets/${id}/reply`, { message }),

  // Close ticket
  closeTicket: (id) => api.put(`/support/tickets/${id}/close`),

  // Get FAQ
  getFAQ: () => api.get('/support/faq')
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Cancel request token
export const cancelTokenSource = () => axios.CancelToken.source();

// Set auth token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Clear auth token
export const clearAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Get auth token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    return error.response.data?.message || 'Server error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An error occurred';
  }
};

// Export default api instance
export default api;
