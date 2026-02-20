import api, { get, post, put, del } from './axios';

// ============================================
// User API Endpoints
// ============================================

/**
 * Get all users (admin only)
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number
 * @param {number} [params.limit] - Items per page
 * @param {string} [params.search] - Search term
 * @param {string} [params.role] - Filter by role
 * @param {string} [params.status] - Filter by status
 * @returns {Promise<Object>} List of users
 */
export const getAllUsers = async (params = {}) => {
  try {
    const response = await get('/users', params);
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
 * @returns {Promise<Object>} User data
 */
export const getUserById = async (userId) => {
  try {
    const response = await get(`/users/${userId}`);
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
 * Get current user profile
 * @returns {Promise<Object>} User profile
 */
export const getMyProfile = async () => {
  try {
    const response = await get('/users/profile/me');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch profile',
      status: error.status
    };
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @param {string} [profileData.name] - User's name
 * @param {string} [profileData.email] - User's email
 * @param {string} [profileData.phone] - User's phone
 * @param {string} [profileData.bio] - User's bio
 * @param {Object} [profileData.address] - User's address
 * @param {string} [profileData.avatar] - Avatar URL
 * @returns {Promise<Object>} Updated profile
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await put('/users/profile', profileData);
    
    // Update stored user data
    if (response.success && response.data.user) {
      const storage = localStorage.getItem('user') ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return {
      success: true,
      data: response.data,
      message: response.message || 'Profile updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Profile update failed',
      status: error.status
    };
  }
};

/**
 * Upload profile avatar
 * @param {File} file - Image file
 * @returns {Promise<Object>} Upload response with avatar URL
 */
export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await post('/users/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return {
      success: true,
      data: response.data,
      message: response.message || 'Avatar uploaded successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Avatar upload failed',
      status: error.status
    };
  }
};

/**
 * Delete profile avatar
 * @returns {Promise<Object>} Deletion response
 */
export const deleteAvatar = async () => {
  try {
    const response = await del('/users/profile/avatar');
    return {
      success: true,
      data: response.data,
      message: response.message || 'Avatar deleted successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Avatar deletion failed',
      status: error.status
    };
  }
};

/**
 * Get user statistics
 * @param {string} [userId] - User ID (optional, defaults to current user)
 * @returns {Promise<Object>} User statistics
 */
export const getUserStats = async (userId = null) => {
  try {
    const url = userId ? `/users/${userId}/stats` : '/users/stats';
    const response = await get(url);
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
 * Get user activity log
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number
 * @param {number} [params.limit] - Items per page
 * @param {string} [params.type] - Activity type filter
 * @returns {Promise<Object>} Activity log
 */
export const getUserActivity = async (params = {}) => {
  try {
    const response = await get('/users/activity', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch activity',
      status: error.status
    };
  }
};

/**
 * Get user referrals
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number
 * @param {number} [params.limit] - Items per page
 * @param {string} [params.status] - Referral status filter
 * @returns {Promise<Object>} User referrals
 */
export const getUserReferrals = async (params = {}) => {
  try {
    const response = await get('/users/referrals', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch referrals',
      status: error.status
    };
  }
};

/**
 * Get referral statistics
 * @returns {Promise<Object>} Referral statistics
 */
export const getReferralStats = async () => {
  try {
    const response = await get('/users/referrals/stats');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch referral stats',
      status: error.status
    };
  }
};

/**
 * Get referral code
 * @returns {Promise<Object>} Referral code
 */
export const getReferralCode = async () => {
  try {
    const response = await get('/users/referral-code');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch referral code',
      status: error.status
    };
  }
};

/**
 * Generate new referral code
 * @returns {Promise<Object>} New referral code
 */
export const generateReferralCode = async () => {
  try {
    const response = await post('/users/referral-code/generate');
    return {
      success: true,
      data: response.data,
      message: response.message || 'New referral code generated'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to generate referral code',
      status: error.status
    };
  }
};

/**
 * Get user notifications
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number
 * @param {number} [params.limit] - Items per page
 * @param {boolean} [params.unreadOnly] - Only unread notifications
 * @returns {Promise<Object>} User notifications
 */
export const getUserNotifications = async (params = {}) => {
  try {
    const response = await get('/users/notifications', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch notifications',
      status: error.status
    };
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Update response
 */
export const markNotificationRead = async (notificationId) => {
  try {
    const response = await put(`/users/notifications/${notificationId}/read`);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Notification marked as read'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to mark notification',
      status: error.status
    };
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Update response
 */
export const markAllNotificationsRead = async () => {
  try {
    const response = await put('/users/notifications/read-all');
    return {
      success: true,
      data: response.data,
      message: response.message || 'All notifications marked as read'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to mark notifications',
      status: error.status
    };
  }
};

/**
 * Delete notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await del(`/users/notifications/${notificationId}`);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Notification deleted'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to delete notification',
      status: error.status
    };
  }
};

/**
 * Get user settings
 * @returns {Promise<Object>} User settings
 */
export const getUserSettings = async () => {
  try {
    const response = await get('/users/settings');
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
 * Update user settings
 * @param {Object} settingsData - Settings data
 * @returns {Promise<Object>} Updated settings
 */
export const updateUserSettings = async (settingsData) => {
  try {
    const response = await put('/users/settings', settingsData);
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
 * Update notification preferences
 * @param {Object} preferences - Notification preferences
 * @returns {Promise<Object>} Updated preferences
 */
export const updateNotificationPreferences = async (preferences) => {
  try {
    const response = await put('/users/settings/notifications', preferences);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Notification preferences updated'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to update preferences',
      status: error.status
    };
  }
};

/**
 * Update privacy settings
 * @param {Object} privacyData - Privacy settings
 * @returns {Promise<Object>} Updated privacy settings
 */
export const updatePrivacySettings = async (privacyData) => {
  try {
    const response = await put('/users/settings/privacy', privacyData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Privacy settings updated'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to update privacy settings',
      status: error.status
    };
  }
};

/**
 * Enable two-factor authentication
 * @returns {Promise<Object>} 2FA setup data
 */
export const enable2FA = async () => {
  try {
    const response = await post('/users/security/2fa/enable');
    return {
      success: true,
      data: response.data,
      message: response.message || '2FA enabled successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to enable 2FA',
      status: error.status
    };
  }
};

/**
 * Disable two-factor authentication
 * @param {string} code - 2FA verification code
 * @returns {Promise<Object>} Disable response
 */
export const disable2FA = async (code) => {
  try {
    const response = await post('/users/security/2fa/disable', { code });
    return {
      success: true,
      data: response.data,
      message: response.message || '2FA disabled successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to disable 2FA',
      status: error.status
    };
  }
};

/**
 * Verify 2FA code
 * @param {string} code - 2FA verification code
 * @returns {Promise<Object>} Verification response
 */
export const verify2FA = async (code) => {
  try {
    const response = await post('/users/security/2fa/verify', { code });
    return {
      success: true,
      data: response.data,
      message: response.message || '2FA verified successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Invalid 2FA code',
      status: error.status
    };
  }
};

/**
 * Get login history
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number
 * @param {number} [params.limit] - Items per page
 * @returns {Promise<Object>} Login history
 */
export const getLoginHistory = async (params = {}) => {
  try {
    const response = await get('/users/security/login-history', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch login history',
      status: error.status
    };
  }
};

/**
 * Revoke session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Revocation response
 */
export const revokeSession = async (sessionId) => {
  try {
    const response = await del(`/users/security/sessions/${sessionId}`);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Session revoked successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to revoke session',
      status: error.status
    };
  }
};

/**
 * Revoke all sessions
 * @returns {Promise<Object>} Revocation response
 */
export const revokeAllSessions = async () => {
  try {
    const response = await del('/users/security/sessions');
    return {
      success: true,
      data: response.data,
      message: response.message || 'All sessions revoked successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to revoke sessions',
      status: error.status
    };
  }
};

/**
 * Request account deletion
 * @returns {Promise<Object>} Deletion request response
 */
export const requestAccountDeletion = async () => {
  try {
    const response = await post('/users/account/delete-request');
    return {
      success: true,
      data: response.data,
      message: response.message || 'Account deletion requested'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to request account deletion',
      status: error.status
    };
  }
};

/**
 * Cancel account deletion request
 * @returns {Promise<Object>} Cancellation response
 */
export const cancelAccountDeletion = async () => {
  try {
    const response = await post('/users/account/delete-cancel');
    return {
      success: true,
      data: response.data,
      message: response.message || 'Account deletion cancelled'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to cancel account deletion',
      status: error.status
    };
  }
};

/**
 * Export user data (GDPR)
 * @returns {Promise<Object>} Export response with download URL
 */
export const exportUserData = async () => {
  try {
    const response = await get('/users/data/export', {}, { responseType: 'blob' });
    return {
      success: true,
      data: response.data,
      message: response.message || 'Data export initiated'
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
// Export all user functions
// ============================================

const userAPI = {
  getAllUsers,
  getUserById,
  getMyProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  getUserStats,
  getUserActivity,
  getUserReferrals,
  getReferralStats,
  getReferralCode,
  generateReferralCode,
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getUserSettings,
  updateUserSettings,
  updateNotificationPreferences,
  updatePrivacySettings,
  enable2FA,
  disable2FA,
  verify2FA,
  getLoginHistory,
  revokeSession,
  revokeAllSessions,
  requestAccountDeletion,
  cancelAccountDeletion,
  exportUserData
};

export default userAPI;
