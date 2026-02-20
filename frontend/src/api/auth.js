import api, { get, post, put, del } from './axios';

// ============================================
// Authentication API Endpoints
// ============================================

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password
 * @param {string} [userData.referralCode] - Optional referral code
 * @returns {Promise<Object>} Registration response
 */
export const register = async (userData) => {
  try {
    const response = await post('/auth/register', userData);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Registration failed',
      status: error.status
    };
  }
};

/**
 * Login user
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @param {boolean} [rememberMe] - Remember me option
 * @returns {Promise<Object>} Login response with token and user data
 */
export const login = async (credentials, rememberMe = false) => {
  try {
    const response = await post('/auth/login', credentials);
    
    if (response.success && response.data.token) {
      // Store token in localStorage (or sessionStorage if remember me is false)
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', response.data.token);
      
      if (response.data.refreshToken) {
        storage.setItem('refreshToken', response.data.refreshToken);
      }
      
      if (response.data.user) {
        storage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Login failed',
      status: error.status
    };
  }
};

/**
 * Logout user
 * @param {boolean} [allDevices] - Logout from all devices
 * @returns {Promise<Object>} Logout response
 */
export const logout = async (allDevices = false) => {
  try {
    const response = await post('/auth/logout', { allDevices });
    
    // Clear all storage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('wallet');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    
    return {
      success: true,
      data: response.data,
      message: response.message || 'Logged out successfully'
    };
  } catch (error) {
    // Even if API fails, clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    
    return {
      success: false,
      error: error.message || 'Logout failed',
      status: error.status
    };
  }
};

/**
 * Verify email with token
 * @param {string} token - Email verification token
 * @returns {Promise<Object>} Verification response
 */
export const verifyEmail = async (token) => {
  try {
    const response = await get(`/auth/verify-email/${token}`);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Email verified successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Email verification failed',
      status: error.status
    };
  }
};

/**
 * Resend verification email
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Resend response
 */
export const resendVerification = async (email) => {
  try {
    const response = await post('/auth/resend-verification', { email });
    return {
      success: true,
      data: response.data,
      message: response.message || 'Verification email resent'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to resend verification email',
      status: error.status
    };
  }
};

/**
 * Request password reset
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Password reset request response
 */
export const forgotPassword = async (email) => {
  try {
    const response = await post('/auth/forgot-password', { email });
    return {
      success: true,
      data: response.data,
      message: response.message || 'Password reset email sent'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to send reset email',
      status: error.status
    };
  }
};

/**
 * Reset password with token
 * @param {string} token - Password reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Password reset response
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await post(`/auth/reset-password/${token}`, { password: newPassword });
    return {
      success: true,
      data: response.data,
      message: response.message || 'Password reset successful'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Password reset failed',
      status: error.status
    };
  }
};

/**
 * Change password (authenticated)
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise<Object>} Password change response
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await put('/auth/change-password', passwordData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Password changed successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Password change failed',
      status: error.status
    };
  }
};

/**
 * Refresh access token
 * @returns {Promise<Object>} New token response
 */
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }
    
    const response = await post('/auth/refresh-token', { token: refreshToken });
    
    if (response.success && response.data.token) {
      // Determine which storage to use
      const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
      storage.setItem('token', response.data.token);
      
      if (response.data.refreshToken) {
        storage.setItem('refreshToken', response.data.refreshToken);
      }
    }
    
    return {
      success: true,
      data: response.data,
      message: response.message || 'Token refreshed'
    };
  } catch (error) {
    // Clear tokens on refresh failure
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    
    return {
      success: false,
      error: error.message || 'Token refresh failed',
      status: error.status
    };
  }
};

/**
 * Get current authenticated user
 * @returns {Promise<Object>} Current user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await get('/auth/me');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to get user',
      status: error.status
    };
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile update data
 * @param {string} [profileData.name] - User's name
 * @param {string} [profileData.email] - User's email
 * @param {string} [profileData.phone] - User's phone number
 * @param {Object} [profileData.address] - User's address
 * @returns {Promise<Object>} Update response
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await put('/auth/update-profile', profileData);
    
    if (response.success && response.data.user) {
      // Update stored user data
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
 * Google OAuth login
 * @param {string} token - Google OAuth token
 * @returns {Promise<Object>} Login response
 */
export const googleLogin = async (token) => {
  try {
    const response = await post('/auth/google', { token });
    
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return {
      success: true,
      data: response.data,
      message: response.message || 'Google login successful'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Google login failed',
      status: error.status
    };
  }
};

/**
 * Facebook OAuth login
 * @param {string} token - Facebook OAuth token
 * @returns {Promise<Object>} Login response
 */
export const facebookLogin = async (token) => {
  try {
    const response = await post('/auth/facebook', { token });
    
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return {
      success: true,
      data: response.data,
      message: response.message || 'Facebook login successful'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Facebook login failed',
      status: error.status
    };
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return !!token;
};

/**
 * Get current user from storage
 * @returns {Object|null} User object or null
 */
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Check if user is admin
 * @returns {boolean} Admin status
 */
export const isAdmin = () => {
  const user = getStoredUser();
  return user?.role === 'admin';
};

/**
 * Get user role
 * @returns {string} User role
 */
export const getUserRole = () => {
  const user = getStoredUser();
  return user?.role || 'guest';
};

/**
 * Check if email is verified
 * @returns {boolean} Verification status
 */
export const isEmailVerified = () => {
  const user = getStoredUser();
  return user?.isVerified || false;
};

// ============================================
// Export all auth functions
// ============================================

const authAPI = {
  register,
  login,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  getCurrentUser,
  updateProfile,
  googleLogin,
  facebookLogin,
  isAuthenticated,
  getStoredUser,
  isAdmin,
  getUserRole,
  isEmailVerified
};

export default authAPI;
