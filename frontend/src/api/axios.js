import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// ============================================
// Request Interceptor
// ============================================
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add timestamp to prevent caching (optional, for GET requests)
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 [API] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, config);
    }

    return config;
  },
  (error) => {
    // Handle request errors
    console.error('❌ [API] Request Error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// Response Interceptor
// ============================================
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [API] ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      console.error('❌ [API] Network Error:', error);
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    // Log error responses in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ [API] Error ${error.response.status} ${error.config.method.toUpperCase()} ${error.config.url}`, error.response.data);
    }

    const { status, data } = error.response;

    // ============================================
    // Handle 401 Unauthorized
    // ============================================
    if (status === 401) {
      // Check if this is a login request
      if (originalRequest.url.includes('/auth/login')) {
        toast.error('Invalid email or password');
        return Promise.reject(error);
      }

      // For other requests, try to refresh token
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (!refreshToken) {
            // No refresh token, redirect to login
            clearAuthData();
            window.location.href = '/login';
            toast.error('Session expired. Please login again.');
            return Promise.reject(error);
          }

          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/auth/refresh-token`,
            { token: refreshToken }
          );

          if (response.data.success) {
            // Save new token
            localStorage.setItem('token', response.data.token);
            
            // Update original request with new token
            originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
            
            // Retry original request
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          clearAuthData();
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          return Promise.reject(refreshError);
        }
      }
    }

    // ============================================
    // Handle 403 Forbidden
    // ============================================
    if (status === 403) {
      toast.error('You do not have permission to perform this action');
      
      // Redirect to dashboard if trying to access admin area
      if (originalRequest.url.includes('/admin')) {
        window.location.href = '/dashboard';
      }
    }

    // ============================================
    // Handle 404 Not Found
    // ============================================
    if (status === 404) {
      toast.error('Resource not found');
    }

    // ============================================
    // Handle 422 Validation Error
    // ============================================
    if (status === 422) {
      // Show all validation errors
      if (data.errors) {
        Object.values(data.errors).forEach(message => {
          toast.error(message);
        });
      } else {
        toast.error(data.message || 'Validation failed');
      }
    }

    // ============================================
    // Handle 429 Too Many Requests
    // ============================================
    if (status === 429) {
      toast.error('Too many requests. Please try again later.');
    }

    // ============================================
    // Handle 500 Internal Server Error
    // ============================================
    if (status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    // ============================================
    // Handle 503 Service Unavailable
    // ============================================
    if (status === 503) {
      toast.error('Service temporarily unavailable. Please try again later.');
    }

    return Promise.reject(error);
  }
);

// ============================================
// Helper Functions
// ============================================

// Clear authentication data
const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('wallet');
};

// Check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiry;
  } catch (error) {
    console.error('❌ [API] Token decode error:', error);
    return true;
  }
};

// Get token expiry time
export const getTokenExpiry = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000;
  } catch (error) {
    console.error('❌ [API] Token decode error:', error);
    return null;
  }
};

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
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token && !isTokenExpired(token);
};

// Get auth token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Cancel request token source
export const cancelTokenSource = () => {
  return axios.CancelToken.source();
};

// Create FormData for file uploads
export const createFormData = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      if (Array.isArray(data[key])) {
        data[key].forEach(item => {
          formData.append(`${key}[]`, item);
        });
      } else {
        formData.append(key, data[key]);
      }
    }
  });
  
  return formData;
};

// ============================================
// API Response Types
// ============================================

export const handleApiResponse = (response) => {
  if (response.data?.success) {
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  }
  
  return {
    success: false,
    error: response.data?.message || 'An error occurred'
  };
};

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    return {
      success: false,
      status: error.response.status,
      message: error.response.data?.message || 'Server error occurred',
      errors: error.response.data?.errors || {}
    };
  } else if (error.request) {
    // Request made but no response
    return {
      success: false,
      status: 0,
      message: 'Network error. Please check your connection.',
      errors: {}
    };
  } else {
    // Something else happened
    return {
      success: false,
      status: 500,
      message: error.message || 'An error occurred',
      errors: {}
    };
  }
};

// ============================================
// Request Methods with Error Handling
// ============================================

export const get = async (url, params = {}, config = {}) => {
  try {
    const response = await api.get(url, { params, ...config });
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

export const post = async (url, data = {}, config = {}) => {
  try {
    const response = await api.post(url, data, config);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

export const put = async (url, data = {}, config = {}) => {
  try {
    const response = await api.put(url, data, config);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

export const patch = async (url, data = {}, config = {}) => {
  try {
    const response = await api.patch(url, data, config);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

export const del = async (url, config = {}) => {
  try {
    const response = await api.delete(url, config);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

export default api;
