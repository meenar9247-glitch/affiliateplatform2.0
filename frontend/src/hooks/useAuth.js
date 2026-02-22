import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

// Constants
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour

// Create axios instance with interceptors
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/api/auth/refresh`,
            { refreshToken }
          );
          
          if (response.data.success) {
            localStorage.setItem(TOKEN_KEY, response.data.token);
            originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear storage and redirect to login
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  const refreshTimerRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const activityTimerRef = useRef(null);

  // Load user from storage on mount
  useEffect(() => {
    loadUserFromStorage();
    startActivityMonitoring();
    
    return () => {
      stopAllTimers();
    };
  }, []);

  // Monitor user activity
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const updateActivity = () => {
      setLastActivity(Date.now());
    };
    
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  // Check session timeout
  useEffect(() => {
    if (isAuthenticated && sessionExpiry) {
      sessionTimerRef.current = setInterval(() => {
        const now = Date.now();
        if (now >= sessionExpiry) {
          handleSessionTimeout();
        }
      }, 1000);
    }
    
    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [isAuthenticated, sessionExpiry]);

  // Activity monitoring
  const startActivityMonitoring = () => {
    activityTimerRef.current = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;
      if (inactiveTime > SESSION_TIMEOUT && isAuthenticated) {
        handleInactivityTimeout();
      }
    }, 60000); // Check every minute
  };

  const stopAllTimers = () => {
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    if (activityTimerRef.current) clearInterval(activityTimerRef.current);
  };

  const handleSessionTimeout = () => {
    toast.error('Session expired. Please login again.');
    logout();
  };

  const handleInactivityTimeout = () => {
    toast.error('Logged out due to inactivity');
    logout();
  };

  const loadUserFromStorage = () => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setSessionExpiry(Date.now() + SESSION_TIMEOUT);
        startTokenRefresh();
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
      clearStorage();
    } finally {
      setLoading(false);
    }
  };

  const startTokenRefresh = () => {
    refreshTimerRef.current = setInterval(async () => {
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await api.post('/api/auth/refresh', { refreshToken });
          if (response.data.success) {
            localStorage.setItem(TOKEN_KEY, response.data.token);
          }
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }, REFRESH_INTERVAL);
  };

  const clearStorage = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('session_start');
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const handleApiError = (error) => {
    if (error.response) {
      // Server responded with error
      const message = error.response.data.message || 'An error occurred';
      setError(message);
      toast.error(message);
      
      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear session
          logout();
          break;
        case 403:
          // Forbidden
          navigate('/unauthorized');
          break;
        case 429:
          // Too many requests
          toast.error('Too many attempts. Please try again later.');
          break;
        default:
          break;
      }
    } else if (error.request) {
      // Request made but no response
      setError('Network error. Please check your connection.');
      toast.error('Network error');
    } else {
      // Something else happened
      setError('An unexpected error occurred');
      toast.error('Unexpected error');
    }
    throw error;
  };
  const login = async (email, password, rememberMe = false) => {
  setLoading(true);
  setError(null);
  
  try {
    // Input validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    const response = await api.post('/api/auth/login', {
      email,
      password,
      rememberMe
    });
    
    if (response.data.success) {
      const { user, token, refreshToken } = response.data;
      
      // Store auth data
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem('session_start', Date.now().toString());
      
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true');
      }
      
      setUser(user);
      setIsAuthenticated(true);
      setSessionExpiry(Date.now() + SESSION_TIMEOUT);
      setLoginAttempts(0);
      
      startTokenRefresh();
      toast.success(`Welcome back, ${user.name || user.email}!`);
      
      return user;
    }
  } catch (error) {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    
    if (newAttempts >= 5) {
      toast.error('Too many failed attempts. Account temporarily locked.');
      // Implement lockout logic here
    }
    
    return handleApiError(error);
  } finally {
    setLoading(false);
  }
};

const register = async (userData) => {
  setLoading(true);
  setError(null);
  
  try {
    // Input validation
    const { name, email, password, confirmPassword } = userData;
    
    if (!name || !email || !password || !confirmPassword) {
      throw new Error('All fields are required');
    }
    
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    const passwordStrength = validatePassword(password);
    if (!passwordStrength.length || !passwordStrength.uppercase || 
        !passwordStrength.lowercase || !passwordStrength.number) {
      throw new Error('Password must be at least 8 characters and contain uppercase, lowercase, and number');
    }
    
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    const response = await api.post('/api/auth/register', userData);
    
    if (response.data.success) {
      toast.success('Registration successful! Please check your email to verify your account.');
      return response.data;
    }
  } catch (error) {
    return handleApiError(error);
  } finally {
    setLoading(false);
  }
};

const logout = async (redirect = true) => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      await api.post('/api/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    stopAllTimers();
    clearStorage();
    
    setUser(null);
    setIsAuthenticated(false);
    setSessionExpiry(null);
    
    if (redirect) {
      navigate('/login');
    }
    
    toast.success('Logged out successfully');
  }
};

const verifyEmail = async (token) => {
  setLoading(true);
  
  try {
    const response = await api.post('/api/auth/verify-email', { token });
    
    if (response.data.success) {
      toast.success('Email verified successfully! You can now login.');
      return true;
    }
  } catch (error) {
    handleApiError(error);
    return false;
  } finally {
    setLoading(false);
  }
};

const forgotPassword = async (email) => {
  setLoading(true);
  
  try {
    if (!email || !validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    const response = await api.post('/api/auth/forgot-password', { email });
    
    if (response.data.success) {
      toast.success('Password reset email sent. Please check your inbox.');
      return true;
    }
  } catch (error) {
    handleApiError(error);
    return false;
  } finally {
    setLoading(false);
  }
};

const resetPassword = async (token, newPassword, confirmPassword) => {
  setLoading(true);
  
  try {
    if (!newPassword || !confirmPassword) {
      throw new Error('All fields are required');
    }
    
    const passwordStrength = validatePassword(newPassword);
    if (!passwordStrength.length || !passwordStrength.uppercase || 
        !passwordStrength.lowercase || !passwordStrength.number) {
      throw new Error('Password must be at least 8 characters and contain uppercase, lowercase, and number');
    }
    
    if (newPassword !== confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    const response = await api.post('/api/auth/reset-password', {
      token,
      password: newPassword
    });
    
    if (response.data.success) {
      toast.success('Password reset successful! You can now login with your new password.');
      return true;
    }
  } catch (error) {
    handleApiError(error);
    return false;
  } finally {
    setLoading(false);
  }
};

const updateProfile = async (profileData) => {
  setLoading(true);
  
  try {
    const response = await api.put('/api/auth/profile', profileData);
    
    if (response.data.success) {
      const updatedUser = { ...user, ...response.data.user };
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      toast.success('Profile updated successfully');
      return updatedUser;
    }
  } catch (error) {
    handleApiError(error);
  } finally {
    setLoading(false);
  }
};

const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  setLoading(true);
  
  try {
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new Error('All fields are required');
    }
    
    const passwordStrength = validatePassword(newPassword);
    if (!passwordStrength.length || !passwordStrength.uppercase || 
        !passwordStrength.lowercase || !passwordStrength.number) {
      throw new Error('New password must be at least 8 characters and contain uppercase, lowercase, and number');
    }
    
    if (newPassword !== confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    const response = await api.post('/api/auth/change-password', {
      currentPassword,
      newPassword
    });
    
    if (response.data.success) {
      toast.success('Password changed successfully');
      return true;
    }
  } catch (error) {
    handleApiError(error);
    return false;
  } finally {
    setLoading(false);
  }
};

const socialLogin = async (provider, code) => {
  setLoading(true);
  
  try {
    const response = await api.post(`/api/auth/${provider}`, { code });
    
    if (response.data.success) {
      const { user, token, refreshToken } = response.data;
      
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      
      setUser(user);
      setIsAuthenticated(true);
      setSessionExpiry(Date.now() + SESSION_TIMEOUT);
      
      startTokenRefresh();
      toast.success(`Welcome, ${user.name || user.email}!`);
      
      return user;
    }
  } catch (error) {
    handleApiError(error);
  } finally {
    setLoading(false);
  }
};

const twoFactorLogin = async (email, password, twoFactorCode) => {
  setLoading(true);
  
  try {
    const response = await api.post('/api/auth/2fa/verify', {
      email,
      password,
      code: twoFactorCode
    });
    
    if (response.data.success) {
      const { user, token, refreshToken } = response.data;
      
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      
      setUser(user);
      setIsAuthenticated(true);
      setSessionExpiry(Date.now() + SESSION_TIMEOUT);
      
      startTokenRefresh();
      toast.success(`Welcome back, ${user.name || user.email}!`);
      
      return user;
    }
  } catch (error) {
    handleApiError(error);
  } finally {
    setLoading(false);
  }
};
    const refreshUserData = async () => {
    try {
      const response = await api.get('/api/auth/me');
      
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const hasRole = (role) => {
    return user?.role === role || user?.role === 'admin';
  };

  const hasAnyRole = (roles) => {
    return roles.some(role => user?.role === role || user?.role === 'admin');
  };

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || user?.role === 'admin';
  };

  const hasAnyPermission = (permissions) => {
    return permissions.some(p => user?.permissions?.includes(p) || user?.role === 'admin');
  };

  const isEmailVerified = () => {
    return user?.emailVerified || false;
  };

  const isTwoFactorEnabled = () => {
    return user?.twoFactorEnabled || false;
  };

  const getSessionTimeRemaining = () => {
    if (!sessionExpiry) return 0;
    return Math.max(0, sessionExpiry - Date.now());
  };

  const formatSessionTime = () => {
    const remaining = getSessionTimeRemaining();
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const extendSession = async () => {
    try {
      const response = await api.post('/api/auth/extend-session');
      
      if (response.data.success) {
        setSessionExpiry(Date.now() + SESSION_TIMEOUT);
        toast.success('Session extended');
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
    }
  };

  const deleteAccount = async (password) => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return false;
    }
    
    setLoading(true);
    
    try {
      const response = await api.delete('/api/auth/account', {
        data: { password }
      });
      
      if (response.data.success) {
        toast.success('Account deleted successfully');
        await logout(false);
        navigate('/register');
        return true;
      }
    } catch (error) {
      handleApiError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getLoginHistory = async () => {
    try {
      const response = await api.get('/api/auth/login-history');
      if (response.data.success) {
        return response.data.history;
      }
    } catch (error) {
      console.error('Failed to fetch login history:', error);
      return [];
    }
  };

  const getActiveSessions = async () => {
    try {
      const response = await api.get('/api/auth/sessions');
      if (response.data.success) {
        return response.data.sessions;
      }
    } catch (error) {
      console.error('Failed to fetch active sessions:', error);
      return [];
    }
  };

  const terminateSession = async (sessionId) => {
    try {
      const response = await api.delete(`/api/auth/sessions/${sessionId}`);
      if (response.data.success) {
        toast.success('Session terminated');
        return true;
      }
    } catch (error) {
      handleApiError(error);
      return false;
    }
  };

  const terminateAllSessions = async () => {
    try {
      const response = await api.delete('/api/auth/sessions');
      if (response.data.success) {
        toast.success('All other sessions terminated');
        return true;
      }
    } catch (error) {
      handleApiError(error);
      return false;
    }
  };

  const sendVerificationEmail = async () => {
    try {
      const response = await api.post('/api/auth/send-verification');
      if (response.data.success) {
        toast.success('Verification email sent');
        return true;
      }
    } catch (error) {
      handleApiError(error);
      return false;
    }
  };

  const enableTwoFactor = async () => {
    try {
      const response = await api.post('/api/auth/2fa/enable');
      if (response.data.success) {
        setUser({ ...user, twoFactorEnabled: true });
        toast.success('Two-factor authentication enabled');
        return response.data;
      }
    } catch (error) {
      handleApiError(error);
      return false;
    }
  };

  const disableTwoFactor = async (code) => {
    try {
      const response = await api.post('/api/auth/2fa/disable', { code });
      if (response.data.success) {
        setUser({ ...user, twoFactorEnabled: false });
        toast.success('Two-factor authentication disabled');
        return true;
      }
    } catch (error) {
      handleApiError(error);
      return false;
    }
  };

  const verifyTwoFactor = async (code) => {
    try {
      const response = await api.post('/api/auth/2fa/verify', { code });
      if (response.data.success) {
        return true;
      }
    } catch (error) {
      handleApiError(error);
      return false;
    }
  };

  return {
    // State
    user,
    loading,
    error,
    isAuthenticated,
    loginAttempts,
    sessionExpiry,
    
    // Core auth methods
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    
    // Profile management
    updateProfile,
    changePassword,
    deleteAccount,
    refreshUserData,
    
    // Social auth
    socialLogin,
    
    // 2FA
    twoFactorLogin,
    enableTwoFactor,
    disableTwoFactor,
    verifyTwoFactor,
    isTwoFactorEnabled,
    
    // Session management
    getSessionTimeRemaining,
    formatSessionTime,
    extendSession,
    getActiveSessions,
    terminateSession,
    terminateAllSessions,
    getLoginHistory,
    
    // Permissions
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    
    // Email verification
    isEmailVerified,
    sendVerificationEmail,
    
    // Utilities
    validatePassword,
    api, // Expose the configured axios instance
  };
};

// Export the configured axios instance for use in other hooks
export { api as authApi };
