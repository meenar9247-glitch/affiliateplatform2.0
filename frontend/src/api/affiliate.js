import api, { get, post, put, del } from './axios';

// ============================================
// Affiliate API Endpoints
// ============================================

/**
 * Get all affiliate links
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number
 * @param {number} [params.limit] - Items per page
 * @param {string} [params.category] - Filter by category
 * @param {string} [params.search] - Search term
 * @param {string} [params.sort] - Sort by (popular, newest, commission)
 * @returns {Promise<Object>} List of affiliate links
 */
export const getAllLinks = async (params = {}) => {
  try {
    const response = await get('/affiliates/links', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch affiliate links',
      status: error.status
    };
  }
};

/**
 * Get affiliate link by ID
 * @param {string} linkId - Affiliate link ID
 * @returns {Promise<Object>} Affiliate link details
 */
export const getLinkById = async (linkId) => {
  try {
    const response = await get(`/affiliates/links/${linkId}`);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch affiliate link',
      status: error.status
    };
  }
};

/**
 * Get all categories
 * @returns {Promise<Object>} List of categories
 */
export const getCategories = async () => {
  try {
    const response = await get('/affiliates/categories');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch categories',
      status: error.status
    };
  }
};

/**
 * Get featured links
 * @param {number} [limit] - Number of featured links
 * @returns {Promise<Object>} Featured links
 */
export const getFeaturedLinks = async (limit = 10) => {
  try {
    const response = await get('/affiliates/featured', { limit });
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch featured links',
      status: error.status
    };
  }
};

/**
 * Get user's affiliate links
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} User's affiliate links
 */
export const getMyLinks = async (params = {}) => {
  try {
    const response = await get('/affiliates/my-links', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch your links',
      status: error.status
    };
  }
};

/**
 * Get user's clicks
 * @param {Object} params - Query parameters
 * @param {string} [params.startDate] - Start date
 * @param {string} [params.endDate] - End date
 * @param {string} [params.linkId] - Filter by link ID
 * @returns {Promise<Object>} Click data
 */
export const getMyClicks = async (params = {}) => {
  try {
    const response = await get('/affiliates/clicks', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch clicks',
      status: error.status
    };
  }
};

/**
 * Get user's conversions
 * @param {Object} params - Query parameters
 * @param {string} [params.startDate] - Start date
 * @param {string} [params.endDate] - End date
 * @param {string} [params.linkId] - Filter by link ID
 * @returns {Promise<Object>} Conversion data
 */
export const getMyConversions = async (params = {}) => {
  try {
    const response = await get('/affiliates/conversions', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch conversions',
      status: error.status
    };
  }
};

/**
 * Get user's affiliate stats
 * @param {Object} params - Query parameters
 * @param {string} [params.period] - Time period (day, week, month, year)
 * @returns {Promise<Object>} Statistics data
 */
export const getMyStats = async (params = {}) => {
  try {
    const response = await get('/affiliates/stats', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch stats',
      status: error.status
    };
  }
};

/**
 * Generate referral link
 * @param {string} linkId - Original link ID
 * @returns {Promise<Object>} Generated referral link
 */
export const generateReferralLink = async (linkId) => {
  try {
    const response = await get(`/affiliates/generate-link/${linkId}`);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Referral link generated'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to generate referral link',
      status: error.status
    };
  }
};

/**
 * Track click
 * @param {Object} clickData - Click tracking data
 * @param {string} clickData.linkId - Affiliate link ID
 * @param {string} [clickData.referrer] - Referrer URL
 * @param {string} [clickData.utm_source] - UTM source
 * @param {string} [clickData.utm_medium] - UTM medium
 * @param {string} [clickData.utm_campaign] - UTM campaign
 * @returns {Promise<Object>} Tracking response
 */
export const trackClick = async (clickData) => {
  try {
    const response = await post('/affiliates/track-click', clickData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Click tracked'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to track click',
      status: error.status
    };
  }
};

/**
 * Create new affiliate link (admin only)
 * @param {Object} linkData - Affiliate link data
 * @param {string} linkData.title - Link title
 * @param {string} linkData.description - Link description
 * @param {string} linkData.originalUrl - Original URL
 * @param {number} linkData.commissionRate - Commission rate
 * @param {string} linkData.category - Category
 * @param {string} [linkData.imageUrl] - Image URL
 * @param {string} [linkData.bannerUrl] - Banner URL
 * @param {boolean} [linkData.featured] - Featured status
 * @returns {Promise<Object>} Created link
 */
export const createLink = async (linkData) => {
  try {
    const response = await post('/affiliates/links', linkData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Affiliate link created'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to create affiliate link',
      status: error.status
    };
  }
};

/**
 * Update affiliate link (admin only)
 * @param {string} linkId - Affiliate link ID
 * @param {Object} linkData - Updated link data
 * @returns {Promise<Object>} Updated link
 */
export const updateLink = async (linkId, linkData) => {
  try {
    const response = await put(`/affiliates/links/${linkId}`, linkData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Affiliate link updated'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to update affiliate link',
      status: error.status
    };
  }
};

/**
 * Delete affiliate link (admin only)
 * @param {string} linkId - Affiliate link ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteLink = async (linkId) => {
  try {
    const response = await del(`/affiliates/links/${linkId}`);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Affiliate link deleted'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to delete affiliate link',
      status: error.status
    };
  }
};

/**
 * Bulk upload links (admin only)
 * @param {FormData} formData - Form data with file
 * @returns {Promise<Object>} Upload response
 */
export const bulkUploadLinks = async (formData) => {
  try {
    const response = await post('/affiliates/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return {
      success: true,
      data: response.data,
      message: response.message || 'Links uploaded successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to upload links',
      status: error.status
    };
  }
};

/**
 * Get top performing links
 * @param {Object} params - Query parameters
 * @param {number} [params.limit] - Number of top links
 * @param {string} [params.period] - Time period
 * @returns {Promise<Object>} Top performing links
 */
export const getTopLinks = async (params = {}) => {
  try {
    const response = await get('/affiliates/top', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch top links',
      status: error.status
    };
  }
};

/**
 * Get link performance report
 * @param {string} linkId - Affiliate link ID
 * @param {Object} params - Query parameters
 * @param {string} [params.startDate] - Start date
 * @param {string} [params.endDate] - End date
 * @returns {Promise<Object>} Performance report
 */
export const getLinkPerformance = async (linkId, params = {}) => {
  try {
    const response = await get(`/affiliates/links/${linkId}/performance`, params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch performance data',
      status: error.status
    };
  }
};

/**
 * Get link QR code
 * @param {string} linkId - Affiliate link ID
 * @param {Object} options - QR code options
 * @param {number} [options.size] - QR code size
 * @returns {Promise<Object>} QR code data
 */
export const getLinkQRCode = async (linkId, options = {}) => {
  try {
    const response = await get(`/affiliates/links/${linkId}/qrcode`, options);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to generate QR code',
      status: error.status
    };
  }
};

/**
 * Get commission rates
 * @returns {Promise<Object>} Commission rates
 */
export const getCommissionRates = async () => {
  try {
    const response = await get('/affiliates/commission-rates');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch commission rates',
      status: error.status
    };
  }
};

/**
 * Get payout history
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Payout history
 */
export const getPayoutHistory = async (params = {}) => {
  try {
    const response = await get('/affiliates/payouts', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch payout history',
      status: error.status
    };
  }
};

/**
 * Get referral tree
 * @param {number} [depth] - Tree depth
 * @returns {Promise<Object>} Referral tree data
 */
export const getReferralTree = async (depth = 5) => {
  try {
    const response = await get('/affiliates/referral-tree', { depth });
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch referral tree',
      status: error.status
    };
  }
};

/**
 * Get affiliate leaderboard
 * @param {Object} params - Query parameters
 * @param {string} [params.period] - Time period
 * @param {number} [params.limit] - Number of affiliates
 * @returns {Promise<Object>} Leaderboard data
 */
export const getLeaderboard = async (params = {}) => {
  try {
    const response = await get('/affiliates/leaderboard', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch leaderboard',
      status: error.status
    };
  }
};

/**
 * Get affiliate achievements
 * @returns {Promise<Object>} Achievements data
 */
export const getAchievements = async () => {
  try {
    const response = await get('/affiliates/achievements');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch achievements',
      status: error.status
    };
  }
};

/**
 * Claim achievement reward
 * @param {string} achievementId - Achievement ID
 * @returns {Promise<Object>} Claim response
 */
export const claimAchievement = async (achievementId) => {
  try {
    const response = await post(`/affiliates/achievements/${achievementId}/claim`);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Reward claimed successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to claim reward',
      status: error.status
    };
  }
};

/**
 * Get affiliate settings
 * @returns {Promise<Object>} Affiliate settings
 */
export const getAffiliateSettings = async () => {
  try {
    const response = await get('/affiliates/settings');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch affiliate settings',
      status: error.status
    };
  }
};

/**
 * Update affiliate settings
 * @param {Object} settingsData - Affiliate settings
 * @returns {Promise<Object>} Updated settings
 */
export const updateAffiliateSettings = async (settingsData) => {
  try {
    const response = await put('/affiliates/settings', settingsData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Settings updated successfully'
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
 * Export affiliate data
 * @param {string} format - Export format (csv, json, pdf)
 * @returns {Promise<Object>} Export response with file
 */
export const exportAffiliateData = async (format = 'csv') => {
  try {
    const response = await get('/affiliates/export', { format }, { responseType: 'blob' });
    return {
      success: true,
      data: response.data,
      message: response.message || 'Data exported successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to export data',
      status: error.status
    };
  }
};

// ============================================
// Admin specific endpoints
// ============================================

/**
 * Approve affiliate link (admin only)
 * @param {string} linkId - Affiliate link ID
 * @returns {Promise<Object>} Approval response
 */
export const approveLink = async (linkId) => {
  try {
    const response = await put(`/admin/affiliates/${linkId}/approve`);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Link approved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to approve link',
      status: error.status
    };
  }
};

/**
 * Reject affiliate link (admin only)
 * @param {string} linkId - Affiliate link ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Rejection response
 */
export const rejectLink = async (linkId, reason) => {
  try {
    const response = await put(`/admin/affiliates/${linkId}/reject`, { reason });
    return {
      success: true,
      data: response.data,
      message: response.message || 'Link rejected successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to reject link',
      status: error.status
    };
  }
};

/**
 * Get pending approvals (admin only)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Pending approvals
 */
export const getPendingApprovals = async (params = {}) => {
  try {
    const response = await get('/admin/affiliates/pending', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch pending approvals',
      status: error.status
    };
  }
};

// ============================================
// Export all affiliate functions
// ============================================

const affiliateAPI = {
  getAllLinks,
  getLinkById,
  getCategories,
  getFeaturedLinks,
  getMyLinks,
  getMyClicks,
  getMyConversions,
  getMyStats,
  generateReferralLink,
  trackClick,
  createLink,
  updateLink,
  deleteLink,
  bulkUploadLinks,
  getTopLinks,
  getLinkPerformance,
  getLinkQRCode,
  getCommissionRates,
  getPayoutHistory,
  getReferralTree,
  getLeaderboard,
  getAchievements,
  claimAchievement,
  getAffiliateSettings,
  updateAffiliateSettings,
  exportAffiliateData,
  approveLink,
  rejectLink,
  getPendingApprovals
};

export default affiliateAPI;
