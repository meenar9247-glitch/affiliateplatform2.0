import api from './api';

// ============================================
// AUTHENTICATION SERVICE
// ============================================

class AuthService {
  constructor() {
    this.tokenKey = 'token';
    this.userKey = 'user';
    this.refreshTokenKey = 'refreshToken';
  }

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================

  // Set token in localStorage
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
    this.setAuthHeader(token);
  }

  // Get token from localStorage
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  // Remove token from localStorage
  removeToken() {
    localStorage.removeItem(this.tokenKey);
    this.removeAuthHeader();
  }

  // Set refresh token
  setRefreshToken(token) {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  // Remove refresh token
  removeRefreshToken() {
    localStorage.removeItem(this.refreshTokenKey);
  }

  // Set auth header for all requests
  setAuthHeader(token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Remove auth header
  removeAuthHeader() {
    delete api.defaults.headers.common['Authorization'];
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  // Set user in localStorage
  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Get user from localStorage
  getUser() {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  // Remove user from localStorage
  removeUser() {
    localStorage.removeItem(this.userKey);
  }

  // Update user in localStorage
  updateUser(userData) {
    const currentUser = this.getUser();
    const updatedUser = { ...currentUser, ...userData };
    this.setUser(updatedUser);
    return updatedUser;
  }

  // ============================================
  // AUTHENTICATION STATUS
  // ============================================

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Check if token is expired
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiry;
    } catch (error) {
      console.error('Token expiry check failed:', error);
      return true;
    }
  }

  // Get token expiry time
  getTokenExpiry(token) {
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000;
    } catch (error) {
      console.error('Failed to get token expiry:', error);
      return null;
    }
  }

  // ============================================
  // USER ROLES & PERMISSIONS
  // ============================================

  // Check if user is admin
  isAdmin() {
    const user = this.getUser();
    return user?.role === 'admin';
  }

  // Check if user has specific role
  hasRole(role) {
    const user = this.getUser();
    return user?.role === role;
  }

  // Check if user has any of the given roles
  hasAnyRole(roles) {
    const user = this.getUser();
    return roles.includes(user?.role);
  }

  // Get user role
  getUserRole() {
    const user = this.getUser();
    return user?.role || 'guest';
  }

  // Get user permissions (if any)
  getUserPermissions() {
    const user = this.getUser();
    return user?.permissions || [];
  }

  // Check if user has specific permission
  hasPermission(permission) {
    const user = this.getUser();
    return user?.permissions?.includes(permission) || false;
  }

  // ============================================
  // AUTHENTICATION API CALLS
  // ============================================

  // Register new user
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Registration failed'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        this.setToken(token);
        this.setUser(user);
        
        return {
          success: true,
          data: { token, user }
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Login failed'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Logout user
  async logout() {
    try {
      const token = this.getToken();
      
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      this.removeToken();
      this.removeRefreshToken();
      this.removeUser();
      this.removeAuthHeader();
    }
    
    return { success: true };
  }

  // Verify email
  async verifyEmail(token) {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Email verification failed'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Failed to send reset email'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Reset password
  async resetPassword(token, password) {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Password reset failed'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        return {
          success: false,
          message: 'No refresh token available'
        };
      }
      
      const response = await api.post('/auth/refresh-token', { token: refreshToken });
      
      if (response.data.success) {
        const { token } = response.data;
        this.setToken(token);
        
        return {
          success: true,
          data: { token }
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Token refresh failed'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      
      if (response.data.success) {
        const user = response.data.user;
        this.setUser(user);
        
        return {
          success: true,
          data: user
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Failed to get user'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Update user details
  async updateDetails(userData) {
    try {
      const response = await api.put('/auth/update-details', userData);
      
      if (response.data.success) {
        const user = response.data.user;
        this.updateUser(user);
        
        return {
          success: true,
          data: user
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Failed to update details'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Update password
  async updatePassword(currentPassword, newPassword) {
    try {
      const response = await api.put('/auth/update-password', {
        currentPassword,
        newPassword
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Failed to update password'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Google OAuth
  async googleAuth(googleData) {
    try {
      const response = await api.post('/auth/google', googleData);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        this.setToken(token);
        this.setUser(user);
        
        return {
          success: true,
          data: { token, user }
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Google authentication failed'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ============================================
  // SESSION MANAGEMENT
  // ============================================

  // Initialize session from localStorage
  initSession() {
    const token = this.getToken();
    const user = this.getUser();
    
    if (token && user) {
      this.setAuthHeader(token);
      return { token, user };
    }
    
    return null;
  }

  // Clear session
  clearSession() {
    this.removeToken();
    this.removeRefreshToken();
    this.removeUser();
    this.removeAuthHeader();
  }

  // Check and refresh token if needed
  async checkAndRefreshToken() {
    const token = this.getToken();
    
    if (!token) {
      return { success: false, message: 'No token available' };
    }
    
    if (this.isTokenExpired(token)) {
      return await this.refreshToken();
    }
    
    return { success: true };
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  // Handle API errors
  handleError(error) {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || 'Server error occurred';
      const status = error.response.status;
      
      // Handle unauthorized
      if (status === 401) {
        this.clearSession();
      }
      
      return {
        success: false,
        message,
        status,
        data: error.response.data
      };
    } else if (error.request) {
      // Request made but no response
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        status: 0
      };
    } else {
      // Something else happened
      return {
        success: false,
        message: error.message || 'An error occurred',
        status: 500
      };
    }
  }

  // Get auth headers
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  isStrongPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  // Get password strength score (0-4)
  getPasswordStrength(password) {
    let score = 0;
    
    if (!password) return score;
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character variety
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    return Math.min(4, Math.floor(score / 2));
  }
}

// Create singleton instance
const authService = new AuthService();

// Initialize session on service creation
authService.initSession();

export default authService;
