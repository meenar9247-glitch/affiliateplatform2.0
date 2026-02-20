import api, { get, post, put, del } from './axios';

// ============================================
// Admin API Endpoints
// ============================================

/**
 * Get dashboard statistics
 * @param {Object} params - Query parameters
 * @param {string} [params.period] - Time period (day, week, month, year)
 * @returns {Promise<Object>} Dashboard statistics
 */
export const getDashboardStats = async (params = {}) => {
  try {
    const response = await get('/admin/dashboard', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch dashboard stats',
      status: error.status
    };
  }
};

// ============================================
// User Management
// ============================================

/**
 * Get all users
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number
 * @param {number} [params.limit] - Items per page
 * @param {string} [params.search] - Search term
 * @param {string} [params.role] - Filter by role
 * @param {string} [params.status] - Filter by status
 * @param {string} [params.sort] - Sort field
 * @param {string} [params.order] - Sort order
 * @returns {Promise<Object>} List of users
 */
export const getUsers = async (params = {}) => {
  try {
    const response = await get('/admin/users', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch users',
      status: error.status
    };
  }
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User details
 */
export const getUser = async (userId) => {
  try {
    const response = await get(`/admin/users/${userId}`);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch user',
      status: error.status
    };
  }
};

/**
 * Update user
 * @param {string} userId - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await put(`/admin/users/${userId}`, userData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'User updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to update user',
      status: error.status
    };
  }
};

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteUser = async (userId) => {
  try {
    const response = await del(`/admin/users/${userId}`);
    return {
      success: true,
      data: response.data,
      message: response.message || 'User deleted successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to delete user',
      status: error.status
    };
  }
};

/**
 * Toggle user status (activate/deactivate)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Status update response
 */
export const toggleUserStatus = async (userId) => {
  try {
    const response = await put(`/admin/users/${userId}/toggle-status`);
    return {
      success: true,
      data: response.data,
      message: response.message || 'User status updated'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to toggle user status',
      status: error.status
    };
  }
};

/**
 * Bulk user operations
 * @param {string} action - Action to perform (activate, deactivate, delete)
 * @param {Array<string>} userIds - Array of user IDs
 * @returns {Promise<Object>} Bulk operation response
 */
export const bulkUserOperation = async (action, userIds) => {
  try {
    const response = await post('/admin/users/bulk', { action, userIds });
    return {
      success: true,
      data: response.data,
      message: response.message || `${userIds.length} users ${action}d`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || `Failed to ${action} users`,
      status: error.status
    };
  }
};

/**
 * Get user statistics
 * @returns {Promise<Object>} User statistics
 */
export const getUserStats = async () => {
  try {
    const response = await get('/admin/users/stats');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch user stats',
      status: error.status
    };
  }
};

/**
 * Export users data
 * @param {string} format - Export format (csv, excel, pdf)
 * @returns {Promise<Object>} Export file
 */
export const exportUsers = async (format = 'csv') => {
  try {
    const response = await get('/admin/users/export', { format }, { responseType: 'blob' });
    return {
      success: true,
      data: response.data,
      message: response.message || 'Users exported successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to export users',
      status: error.status
    };
  }
};

// ============================================
// Affiliate Management
// ============================================

/**
 * Get all affiliates
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} List of affiliates
 */
export const getAffiliates = async (params = {}) => {
  try {
    const response = await get('/admin/affiliates', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch affiliates',
      status: error.status
    };
  }
};

/**
 * Get affiliate by ID
 * @param {string} affiliateId - Affiliate ID
 * @returns {Promise<Object>} Affiliate details
 */
export const getAffiliate = async (affiliateId) => {
  try {
    const response = await get(`/admin/affiliates/${affiliateId}`);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch affiliate',
      status: error.status
    };
  }
};

/**
 * Approve affiliate
 * @param {string} affiliateId - Affiliate ID
 * @returns {Promise<Object>} Approval response
 */
export const approveAffiliate = async (affiliateId) => {
  try {
    const response = await put(`/admin/affiliates/${affiliateId}/approve`);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Affiliate approved'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to approve affiliate',
      status: error.status
    };
  }
};

/**
 * Reject affiliate
 * @param {string} affiliateId - Affiliate ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Rejection response
 */
export const rejectAffiliate = async (affiliateId, reason) => {
  try {
    const response = await put(`/admin/affiliates/${affiliateId}/reject`, { reason });
    return {
      success: true,
      data: response.data,
      message: response.message || 'Affiliate rejected'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to reject affiliate',
      status: error.status
    };
  }
};

/**
 * Get affiliate statistics
 * @returns {Promise<Object>} Affiliate statistics
 */
export const getAffiliateStats = async () => {
  try {
    const response = await get('/admin/affiliates/stats');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch affiliate stats',
      status: error.status
    };
  }
};

/**
 * Export affiliates data
 * @param {string} format - Export format (csv, excel, pdf)
 * @returns {Promise<Object>} Export file
 */
export const exportAffiliates = async (format = 'csv') => {
  try {
    const response = await get('/admin/affiliates/export', { format }, { responseType: 'blob' });
    return {
      success: true,
      data: response.data,
      message: response.message || 'Affiliates exported successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to export affiliates',
      status: error.status
    };
  }
};

// ============================================
// Withdrawal Management
// ============================================

/**
 * Get all withdrawals
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} List of withdrawals
 */
export const getWithdrawals = async (params = {}) => {
  try {
    const response = await get('/admin/withdrawals', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch withdrawals',
      status: error.status
    };
  }
};

/**
 * Get pending withdrawals
 * @returns {Promise<Object>} Pending withdrawals
 */
export const getPendingWithdrawals = async () => {
  try {
    const response = await get('/admin/withdrawals/pending');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch pending withdrawals',
      status: error.status
    };
  }
};

/**
 * Get withdrawal by ID
 * @param {string} withdrawalId - Withdrawal ID
 * @returns {Promise<Object>} Withdrawal details
 */
export const getWithdrawal = async (withdrawalId) => {
  try {
    const response = await get(`/admin/withdrawals/${withdrawalId}`);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch withdrawal',
      status: error.status
    };
  }
};

/**
 * Process withdrawal
 * @param {string} withdrawalId - Withdrawal ID
 * @param {Object} processData - Processing data
 * @returns {Promise<Object>} Process response
 */
export const processWithdrawal = async (withdrawalId, processData) => {
  try {
    const response = await put(`/admin/withdrawals/${withdrawalId}/process`, processData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Withdrawal processed'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to process withdrawal',
      status: error.status
    };
  }
};

/**
 * Complete withdrawal
 * @param {string} withdrawalId - Withdrawal ID
 * @param {Object} completeData - Completion data
 * @returns {Promise<Object>} Completion response
 */
export const completeWithdrawal = async (withdrawalId, completeData) => {
  try {
    const response = await put(`/admin/withdrawals/${withdrawalId}/complete`, completeData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Withdrawal completed'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to complete withdrawal',
      status: error.status
    };
  }
};

/**
 * Reject withdrawal
 * @param {string} withdrawalId - Withdrawal ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Rejection response
 */
export const rejectWithdrawal = async (withdrawalId, reason) => {
  try {
    const response = await put(`/admin/withdrawals/${withdrawalId}/reject`, { reason });
    return {
      success: true,
      data: response.data,
      message: response.message || 'Withdrawal rejected'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to reject withdrawal',
      status: error.status
    };
  }
};

/**
 * Bulk withdrawal operations
 * @param {string} action - Action to perform (process, complete, reject)
 * @param {Array<string>} withdrawalIds - Array of withdrawal IDs
 * @returns {Promise<Object>} Bulk operation response
 */
export const bulkWithdrawalOperation = async (action, withdrawalIds) => {
  try {
    const response = await post('/admin/withdrawals/bulk', { action, withdrawalIds });
    return {
      success: true,
      data: response.data,
      message: response.message || `${withdrawalIds.length} withdrawals ${action}d`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || `Failed to ${action} withdrawals`,
      status: error.status
    };
  }
};

/**
 * Get withdrawal statistics
 * @returns {Promise<Object>} Withdrawal statistics
 */
export const getWithdrawalStats = async () => {
  try {
    const response = await get('/admin/withdrawals/stats');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch withdrawal stats',
      status: error.status
    };
  }
};

/**
 * Export withdrawals data
 * @param {string} format - Export format (csv, excel, pdf)
 * @returns {Promise<Object>} Export file
 */
export const exportWithdrawals = async (format = 'csv') => {
  try {
    const response = await get('/admin/withdrawals/export', { format }, { responseType: 'blob' });
    return {
      success: true,
      data: response.data,
      message: response.message || 'Withdrawals exported successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to export withdrawals',
      status: error.status
    };
  }
};

// ============================================
// Commission Management
// ============================================

/**
 * Get commission settings
 * @returns {Promise<Object>} Commission settings
 */
export const getCommissionSettings = async () => {
  try {
    const response = await get('/admin/commissions/settings');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch commission settings',
      status: error.status
    };
  }
};

/**
 * Update commission settings
 * @param {Object} settingsData - Commission settings
 * @returns {Promise<Object>} Updated settings
 */
export const updateCommissionSettings = async (settingsData) => {
  try {
    const response = await put('/admin/commissions/settings', settingsData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Commission settings updated'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to update commission settings',
      status: error.status
    };
  }
};

/**
 * Get all commissions
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} List of commissions
 */
export const getCommissions = async (params = {}) => {
  try {
    const response = await get('/admin/commissions', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch commissions',
      status: error.status
    };
  }
};

/**
 * Get pending commissions
 * @returns {Promise<Object>} Pending commissions
 */
export const getPendingCommissions = async () => {
  try {
    const response = await get('/admin/commissions/pending');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch pending commissions',
      status: error.status
    };
  }
};

/**
 * Approve commission
 * @param {string} commissionId - Commission ID
 * @returns {Promise<Object>} Approval response
 */
export const approveCommission = async (commissionId) => {
  try {
    const response = await put(`/admin/commissions/${commissionId}/approve`);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Commission approved'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to approve commission',
      status: error.status
    };
  }
};

/**
 * Reject commission
 * @param {string} commissionId - Commission ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Rejection response
 */
export const rejectCommission = async (commissionId, reason) => {
  try {
    const response = await put(`/admin/commissions/${commissionId}/reject`, { reason });
    return {
      success: true,
      data: response.data,
      message: response.message || 'Commission rejected'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to reject commission',
      status: error.status
    };
  }
};

/**
 * Get commission statistics
 * @returns {Promise<Object>} Commission statistics
 */
export const getCommissionStats = async () => {
  try {
    const response = await get('/admin/commissions/stats');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch commission stats',
      status: error.status
    };
  }
};

// ============================================
// System Settings
// ============================================

/**
 * Get system settings
 * @returns {Promise<Object>} System settings
 */
export const getSettings = async () => {
  try {
    const response = await get('/admin/settings');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch settings',
      status: error.status
    };
  }
};

/**
 * Update system settings
 * @param {Object} settingsData - System settings
 * @returns {Promise<Object>} Updated settings
 */
export const updateSettings = async (settingsData) => {
  try {
    const response = await put('/admin/settings', settingsData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Settings updated'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to update settings',
      status: error.status
    };
  }
};

/**
 * Reset system settings to default
 * @returns {Promise<Object>} Reset response
 */
export const resetSettings = async () => {
  try {
    const response = await post('/admin/settings/reset');
    return {
      success: true,
      data: response.data,
      message: response.message || 'Settings reset to default'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to reset settings',
      status: error.status
    };
  }
};

/**
 * Export settings
 * @returns {Promise<Object>} Export file
 */
export const exportSettings = async () => {
  try {
    const response = await get('/admin/settings/export', {}, { responseType: 'blob' });
    return {
      success: true,
      data: response.data,
      message: response.message || 'Settings exported'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to export settings',
      status: error.status
    };
  }
};


 * Import settings
 * @param {File} file - Settings file
 * @returns {Promise<Object>} Import response
 */
export const importSettings = async (file) => {
  try {
    const formData = new FormData();
    formData.append('settings', file);
    
    const response = await post('/admin/settings/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return {
      success: true,
      data: response.data,
      message: response.message || 'Settings imported'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to import settings',
      status: error.status
    };
  }
};

// ============================================
// Reports
// ============================================

/**
 * Get earnings report
 * @param {Object} params - Query parameters
 * @param {string} [params.startDate] - Start date
 * @param {string} [params.endDate] - End date
 * @param {string} [params.groupBy] - Group by (day, week, month)
 * @returns {Promise<Object>} Earnings report
 */
export const getEarningsReport = async (params = {}) => {
  try {
    const response = await get('/admin/reports/earnings', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch earnings report',
      status: error.status
    };
  }
};

/**
 * Get users report
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Users report
 */
export const getUsersReport = async (params = {}) => {
  try {
    const response = await get('/admin/reports/users', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch users report',
      status: error.status
    };
  }
};

/**
 * Get conversions report
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Conversions report
 */
export const getConversionsReport = async (params = {}) => {
  try {
    const response = await get('/admin/reports/conversions', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch conversions report',
      status: error.status
    };
  }
};

/**
 * Export report data
 * @param {string} type - Report type
 * @param {string} format - Export format
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Export file
 */
export const exportReport = async (type, format = 'csv', params = {}) => {
  try {
    const response = await get(`/admin/export/${type}`, { ...params, format }, { responseType: 'blob' });
    return {
      success: true,
      data: response.data,
      message: response.message || 'Report exported'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to export report',
      status: error.status
    };
  }
};

// ============================================
// Analytics
// ============================================

/**
 * Get analytics overview
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Analytics overview
 */
export const getAnalyticsOverview = async (params = {}) => {
  try {
    const response = await get('/admin/analytics/overview', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch analytics overview',
      status: error.status
    };
  }
};

/**
 * Get chart data
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Chart data
 */
export const getChartData = async (params = {}) => {
  try {
    const response = await get('/admin/analytics/chart-data', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch chart data',
      status: error.status
    };
  }
};

/**
 * Get traffic analytics
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Traffic analytics
 */
export const getTrafficAnalytics = async (params = {}) => {
  try {
    const response = await get('/admin/analytics/traffic', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch traffic analytics',
      status: error.status
    };
  }
};

/**
 * Get performance metrics
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Performance metrics
 */
export const getPerformanceMetrics = async (params = {}) => {
  try {
    const response = await get('/admin/analytics/performance', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch performance metrics',
      status: error.status
    };
  }
};

// ============================================
// Admin Management
// ============================================

/**
 * Create admin user
 * @param {Object} adminData - Admin user data
 * @returns {Promise<Object>} Created admin
 */
export const createAdmin = async (adminData) => {
  try {
    const response = await post('/admin/admins', adminData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Admin created successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to create admin',
      status: error.status
    };
  }
};

/**
 * Get all admins
 * @returns {Promise<Object>} List of admins
 */
export const getAdmins = async () => {
  try {
    const response = await get('/admin/admins');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch admins',
      status: error.status
    };
  }
};

/**
 * Remove admin
 * @param {string} adminId - Admin ID
 * @returns {Promise<Object>} Removal response
 */
export const removeAdmin = async (adminId) => {
  try {
    const response = await del(`/admin/admins/${adminId}`);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Admin removed successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to remove admin',
      status: error.status
    };
  }
};

// ============================================
// System Health
// ============================================

/**
 * Get system health status
 * @returns {Promise<Object>} System health
 */
export const getSystemHealth = async () => {
  try {
    const response = await get('/admin/system/health');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch system health',
      status: error.status
    };
  }
};

/**
 * Get system logs
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} System logs
 */
export const getSystemLogs = async (params = {}) => {
  try {
    const response = await get('/admin/system/logs', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch system logs',
      status: error.status
    };
  }
};

/**
 * Clear system cache
 * @returns {Promise<Object>} Cache clear response
 */
export const clearSystemCache = async () => {
  try {
    const response = await post('/admin/system/clear-cache');
    return {
      success: true,
      data: response.data,
      message: response.message || 'System cache cleared'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to clear system cache',
      status: error.status
    };
  }
};

// ============================================
// Export all admin functions
// ============================================

const adminAPI = {
  getDashboardStats,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  bulkUserOperation,
  getUserStats,
  exportUsers,
  getAffiliates,
  getAffiliate,
  approveAffiliate,
  rejectAffiliate,
  getAffiliateStats,
  exportAffiliates,
  getWithdrawals,
  getPendingWithdrawals,
  getWithdrawal,
  processWithdrawal,
  completeWithdrawal,
  rejectWithdrawal,
  bulkWithdrawalOperation,
  getWithdrawalStats,
  exportWithdrawals,
  getCommissionSettings,
  updateCommissionSettings,
  getCommissions,
  getPendingCommissions,
  approveCommission,
  rejectCommission,
  getCommissionStats,
  getSettings,
  updateSettings,
  resetSettings,
  exportSettings,
  importSettings,
  getEarningsReport,
  getUsersReport,
  getConversionsReport,
  exportReport,
  getAnalyticsOverview,
  getChartData,
  getTrafficAnalytics,
  getPerformanceMetrics,
  createAdmin,
  getAdmins,
  removeAdmin,
  getSystemHealth,
  getSystemLogs,
  clearSystemCache
};

export default adminAPI;
