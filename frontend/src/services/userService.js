import axios from 'axios';
import { authApi } from '../hooks/useAuth';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// User roles
export const USER_ROLES = {
  USER: 'user',
  AFFILIATE: 'affiliate',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

// User statuses
export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
  BANNED: 'banned',
  DELETED: 'deleted'
};

// Account types
export const ACCOUNT_TYPES = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise'
};

// Verification levels
export const VERIFICATION_LEVELS = {
  UNVERIFIED: 0,
  EMAIL_VERIFIED: 1,
  PHONE_VERIFIED: 2,
  ID_VERIFIED: 3,
  KYC_VERIFIED: 4
};

// Gender options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
];

// Marital status
export const MARITAL_STATUS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' }
];

// Education levels
export const EDUCATION_LEVELS = [
  { value: 'high_school', label: 'High School' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'doctorate', label: 'Doctorate' },
  { value: 'other', label: 'Other' }
];

// Employment types
export const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' }
];

// Default avatar
export const DEFAULT_AVATAR = '/assets/images/default-avatar.png';

// Create axios instance for user service
const userApi = axios.create({
  baseURL: `${API_URL}/users`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
userApi.interceptors.request.use(
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
userApi.interceptors.response.use(
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
          return userApi(originalRequest);
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
    // Server responded with error
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
        throw new Error('Not Found: User not found');
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
    // Request made but no response
    throw new Error('Network Error: Please check your internet connection');
  } else {
    // Something else happened
    throw new Error(error.message || 'An unexpected error occurred');
  }
};

// Helper function to format user data
const formatUserData = (user) => {
  return {
    id: user._id || user.id,
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    avatar: user.avatar || DEFAULT_AVATAR,
    coverPhoto: user.coverPhoto || null,
    bio: user.bio || '',
    dateOfBirth: user.dateOfBirth || null,
    gender: user.gender || '',
    nationality: user.nationality || '',
    language: user.language || 'en',
    timezone: user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    
    // Account info
    username: user.username || '',
    role: user.role || USER_ROLES.USER,
    status: user.status || USER_STATUSES.ACTIVE,
    accountType: user.accountType || ACCOUNT_TYPES.FREE,
    verificationLevel: user.verificationLevel || VERIFICATION_LEVELS.UNVERIFIED,
    
    // Professional info
    profession: user.profession || '',
    company: user.company || '',
    website: user.website || '',
    skills: user.skills || [],
    experience: user.experience || 0,
    education: user.education || [],
    certifications: user.certifications || [],
    
    // Contact info
    address: user.address || {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      coordinates: null
    },
    socialLinks: user.socialLinks || {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      youtube: '',
      github: '',
      portfolio: ''
    },
    
    // Preferences
    preferences: user.preferences || {
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      privacy: {
        showEmail: false,
        showPhone: false,
        showProfile: true
      }
    },
    
    // Stats
    stats: user.stats || {
      totalEarnings: 0,
      totalReferrals: 0,
      totalClicks: 0,
      totalConversions: 0,
      conversionRate: 0,
      rank: 0,
      level: 1,
      experience: 0,
      nextLevelExp: 1000
    },
    
    // Wallet
    wallet: user.wallet || {
      balance: 0,
      pending: 0,
      totalWithdrawn: 0,
      currency: 'USD'
    },
    
    // Metadata
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || new Date().toISOString(),
    lastLogin: user.lastLogin || null,
    lastActive: user.lastActive || null,
    ipAddress: user.ipAddress || '',
    userAgent: user.userAgent || '',
    
    // Flags
    isEmailVerified: user.isEmailVerified || false,
    isPhoneVerified: user.isPhoneVerified || false,
    isTwoFactorEnabled: user.isTwoFactorEnabled || false,
    isProfileComplete: user.isProfileComplete || false,
    isOnboardingComplete: user.isOnboardingComplete || false
  };
};

// User Service Class
class UserService {
  // ==================== User CRUD Operations ====================

  // Get current user
  async getCurrentUser() {
    try {
      const response = await userApi.get('/me');
      
      if (response.data.success) {
        return {
          success: true,
          data: formatUserData(response.data.user)
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get user'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await userApi.get(`/${userId}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: formatUserData(response.data.user)
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get user'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get users by role
  async getUsersByRole(role, page = 1, limit = 20) {
    try {
      const response = await userApi.get('/role/' + role, {
        params: { page, limit }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.users.map(formatUserData),
          pagination: response.data.pagination
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get users'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get all users (admin only)
  async getAllUsers(params = {}) {
    try {
      const response = await userApi.get('/', { params });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.users.map(formatUserData),
          pagination: response.data.pagination,
          filters: response.data.filters,
          sort: response.data.sort
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get users'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Search users
  async searchUsers(query, filters = {}, page = 1, limit = 20) {
    try {
      const response = await userApi.get('/search', {
        params: { q: query, ...filters, page, limit }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.users.map(formatUserData),
          pagination: response.data.pagination,
          total: response.data.total
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to search users'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Profile Management ====================

  // Update profile
  async updateProfile(profileData) {
    try {
      const response = await userApi.put('/profile', profileData);
      
      if (response.data.success) {
        return {
          success: true,
          data: formatUserData(response.data.user),
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

  // Upload avatar
  async uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await userApi.post('/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: {
            url: response.data.url,
            user: formatUserData(response.data.user)
          },
          message: response.data.message || 'Avatar uploaded successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to upload avatar'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Remove avatar
  async removeAvatar() {
    try {
      const response = await userApi.delete('/avatar');
      
      if (response.data.success) {
        return {
          success: true,
          data: formatUserData(response.data.user),
          message: response.data.message || 'Avatar removed successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to remove avatar'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Upload cover photo
  async uploadCoverPhoto(file) {
    try {
      const formData = new FormData();
      formData.append('cover', file);

      const response = await userApi.post('/cover', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: {
            url: response.data.url,
            user: formatUserData(response.data.user)
          },
          message: response.data.message || 'Cover photo uploaded successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to upload cover photo'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Update preferences
  async updatePreferences(preferences) {
    try {
      const response = await userApi.put('/preferences', preferences);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.preferences,
          message: response.data.message || 'Preferences updated successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to update preferences'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Update privacy settings
  async updatePrivacy(privacy) {
    try {
      const response = await userApi.put('/privacy', privacy);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.privacy,
          message: response.data.message || 'Privacy settings updated successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to update privacy settings'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Account Management ====================

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await userApi.put('/change-password', {
        currentPassword,
        newPassword
      });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Password changed successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to change password'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Update email
  async updateEmail(email, password) {
    try {
      const response = await userApi.put('/email', { email, password });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Email updated successfully',
          verificationSent: response.data.verificationSent
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to update email'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Update phone
  async updatePhone(phone, password) {
    try {
      const response = await userApi.put('/phone', { phone, password });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Phone updated successfully',
          verificationCode: response.data.verificationCode
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to update phone'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Verify phone
  async verifyPhone(code) {
    try {
      const response = await userApi.post('/verify-phone', { code });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Phone verified successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to verify phone'
      };
    } catch (error) {
      throw handleError(error);
    }
  }
  // ==================== Two-Factor Authentication ====================

  // Enable 2FA
  async enable2FA() {
    try {
      const response = await userApi.post('/2fa/enable');
      
      if (response.data.success) {
        return {
          success: true,
          data: {
            secret: response.data.secret,
            qrCode: response.data.qrCode,
            backupCodes: response.data.backupCodes
          },
          message: response.data.message || '2FA enabled successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to enable 2FA'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Verify 2FA
  async verify2FA(code) {
    try {
      const response = await userApi.post('/2fa/verify', { code });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || '2FA verified successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to verify 2FA'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Disable 2FA
  async disable2FA(code) {
    try {
      const response = await userApi.post('/2fa/disable', { code });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || '2FA disabled successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to disable 2FA'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get backup codes
  async getBackupCodes() {
    try {
      const response = await userApi.get('/2fa/backup-codes');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.codes
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get backup codes'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Regenerate backup codes
  async regenerateBackupCodes() {
    try {
      const response = await userApi.post('/2fa/regenerate-codes');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.codes,
          message: response.data.message || 'Backup codes regenerated'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to regenerate backup codes'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Account Status ====================

  // Deactivate account
  async deactivateAccount(password) {
    try {
      const response = await userApi.post('/deactivate', { password });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Account deactivated successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to deactivate account'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Reactivate account
  async reactivateAccount(email, password) {
    try {
      const response = await userApi.post('/reactivate', { email, password });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Account reactivated successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to reactivate account'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Delete account
  async deleteAccount(password) {
    try {
      const response = await userApi.delete('/account', {
        data: { password }
      });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Account deleted successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to delete account'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Activity and History ====================

  // Get login history
  async getLoginHistory(page = 1, limit = 20) {
    try {
      const response = await userApi.get('/login-history', {
        params: { page, limit }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.history,
          pagination: response.data.pagination
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get login history'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get activity log
  async getActivityLog(page = 1, limit = 20) {
    try {
      const response = await userApi.get('/activity', {
        params: { page, limit }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.activities,
          pagination: response.data.pagination
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get activity log'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get active sessions
  async getActiveSessions() {
    try {
      const response = await userApi.get('/sessions');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.sessions
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get active sessions'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Terminate session
  async terminateSession(sessionId) {
    try {
      const response = await userApi.delete(`/sessions/${sessionId}`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Session terminated successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to terminate session'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Terminate all sessions
  async terminateAllSessions() {
    try {
      const response = await userApi.delete('/sessions');
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'All sessions terminated successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to terminate sessions'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Admin Functions ====================

  // Update user role (admin only)
  async updateUserRole(userId, role) {
    try {
      const response = await userApi.put(`/${userId}/role`, { role });
      
      if (response.data.success) {
        return {
          success: true,
          data: formatUserData(response.data.user),
          message: response.data.message || 'User role updated successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to update user role'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Update user status (admin only)
  async updateUserStatus(userId, status, reason = '') {
    try {
      const response = await userApi.put(`/${userId}/status`, { status, reason });
      
      if (response.data.success) {
        return {
          success: true,
          data: formatUserData(response.data.user),
          message: response.data.message || 'User status updated successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to update user status'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Verify user (admin only)
  async verifyUser(userId, level) {
    try {
      const response = await userApi.post(`/${userId}/verify`, { level });
      
      if (response.data.success) {
        return {
          success: true,
          data: formatUserData(response.data.user),
          message: response.data.message || 'User verified successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to verify user'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Impersonate user (admin only)
  async impersonateUser(userId) {
    try {
      const response = await userApi.post(`/${userId}/impersonate`);
      
      if (response.data.success) {
        return {
          success: true,
          token: response.data.token,
          user: formatUserData(response.data.user)
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to impersonate user'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Stop impersonation
  async stopImpersonation() {
    try {
      const response = await userApi.post('/stop-impersonation');
      
      if (response.data.success) {
        return {
          success: true,
          token: response.data.token
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to stop impersonation'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Export users (admin only)
  async exportUsers(format = 'csv', filters = {}) {
    try {
      const response = await userApi.get('/export', {
        params: { format, ...filters },
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        filename: response.headers['content-disposition']?.split('filename=')[1] || `users.${format}`
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Import users (admin only)
  async importUsers(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await userApi.post('/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.results,
          message: response.data.message || 'Users imported successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to import users'
      };
    } catch (error) {
      throw handleError(error);
    }
  }
}

// Export singleton instance
export const userService = new UserService();

// Export API instance for custom requests
export { userApi };

// Export helper functions
export const userHelpers = {
  // Get user display name
  getDisplayName: (user) => {
    return user.name || user.username || user.email?.split('@')[0] || 'User';
  },

  // Get user initials
  getInitials: (user) => {
    const name = user.name || user.username || user.email;
    if (!name) return 'U';
    
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  },

  // Format user join date
  getJoinDate: (user) => {
    if (!user.createdAt) return 'Recently';
    
    const date = new Date(user.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  },

  // Get user level based on experience
  getUserLevel: (experience) => {
    const levels = [
      { level: 1, exp: 0 },
      { level: 2, exp: 100 },
      { level: 3, exp: 300 },
      { level: 4, exp: 600 },
      { level: 5, exp: 1000 },
      { level: 6, exp: 1500 },
      { level: 7, exp: 2100 },
      { level: 8, exp: 2800 },
      { level: 9, exp: 3600 },
      { level: 10, exp: 4500 }
    ];
    
    for (let i = levels.length - 1; i >= 0; i--) {
      if (experience >= levels[i].exp) {
        return levels[i];
      }
    }
    return levels[0];
  },

  // Check if user is online
  isOnline: (lastActive, threshold = 5 * 60 * 1000) => {
    if (!lastActive) return false;
    const now = Date.now();
    const lastActiveTime = new Date(lastActive).getTime();
    return now - lastActiveTime < threshold;
  },

  // Format user status
  formatStatus: (status) => {
    const statusMap = {
      [USER_STATUSES.ACTIVE]: 'Active',
      [USER_STATUSES.INACTIVE]: 'Inactive',
      [USER_STATUSES.SUSPENDED]: 'Suspended',
      [USER_STATUSES.PENDING]: 'Pending',
      [USER_STATUSES.BANNED]: 'Banned',
      [USER_STATUSES.DELETED]: 'Deleted'
    };
    return statusMap[status] || status;
  },

  // Get status color
  getStatusColor: (status) => {
    const colorMap = {
      [USER_STATUSES.ACTIVE]: '#28a745',
      [USER_STATUSES.INACTIVE]: '#6c757d',
      [USER_STATUSES.SUSPENDED]: '#dc3545',
      [USER_STATUSES.PENDING]: '#ffc107',
      [USER_STATUSES.BANNED]: '#343a40',
      [USER_STATUSES.DELETED]: '#dc3545'
    };
    return colorMap[status] || '#6c757d';
  }
};

// Export constants
export const USER_CONSTANTS = {
  ROLES: USER_ROLES,
  STATUSES: USER_STATUSES,
  ACCOUNT_TYPES,
  VERIFICATION_LEVELS,
  GENDER_OPTIONS,
  MARITAL_STATUS,
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  DEFAULT_AVATAR
};

export default userService;
