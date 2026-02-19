// ============================================
// DATE & TIME HELPERS
// ============================================

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type (short, long, full)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  };
  
  return d.toLocaleDateString('en-US', options[format] || options.short);
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 */
export const timeAgo = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const seconds = Math.floor((now - d) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  return `${years} year${years > 1 ? 's' : ''} ago`;
};

/**
 * Get start and end of day
 * @param {Date} date - Date
 * @returns {Object} Start and end of day
 */
export const getDayRange = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

/**
 * Get date range for period
 * @param {string} period - Period type (today, week, month, year)
 * @returns {Object} Start and end dates
 */
export const getDateRange = (period) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return null;
  }

  return { start, end };
};

// ============================================
// NUMBER & CURRENCY HELPERS
// ============================================

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (USD, INR, EUR)
 * @param {string} locale - Locale string
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount === null || amount === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return '';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

/**
 * Format percentage
 * @param {number} value - Percentage value
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return '';
  
  return `${formatNumber(value, decimals)}%`;
};

/**
 * Convert to Indian Rupees format (with lakhs/crores)
 * @param {number} amount - Amount to format
 * @returns {string} Indian currency format
 */
export const formatIndianCurrency = (amount) => {
  if (amount === null || amount === undefined) return '';
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

/**
 * Abbreviate large numbers (1K, 1M, 1B)
 * @param {number} num - Number to abbreviate
 * @param {number} decimals - Decimal places
 * @returns {string} Abbreviated number
 */
export const abbreviateNumber = (num, decimals = 1) => {
  if (num === null || num === undefined) return '';
  
  if (num < 1000) return num.toString();
  
  const units = ['', 'K', 'M', 'B', 'T'];
  const unitIndex = Math.floor(Math.log10(num) / 3);
  const unitValue = unitIndex > 0 ? Math.pow(1000, unitIndex) : 1;
  const abbreviated = num / unitValue;
  
  return `${abbreviated.toFixed(decimals)}${units[unitIndex]}`;
};

// ============================================
// STRING HELPERS
// ============================================

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add
 * @returns {string} Truncated string
 */
export const truncateString = (str, length = 50, suffix = '...') => {
  if (!str) return '';
  if (str.length <= length) return str;
  
  return str.substring(0, length) + suffix;
};

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  
  return str.replace(/\b\w/g, char => char.toUpperCase());
};

/**
 * Convert string to slug (URL friendly)
 * @param {string} str - String to convert
 * @returns {string} Slug
 */
export const slugify = (str) => {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * Generate random string
 * @param {number} length - Length of string
 * @returns {string} Random string
 */
export const randomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Extract initials from name
 * @param {string} name - Full name
 * @param {number} count - Number of initials
 * @returns {string} Initials
 */
export const getInitials = (name, count = 2) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(word => word[0])
    .filter(char => char)
    .join('')
    .toUpperCase()
    .substring(0, count);
};

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @param {string} country - Country code
 * @returns {boolean} Is valid phone
 */
export const isValidPhone = (phone, country = 'IN') => {
  if (!phone) return false;
  
  const patterns = {
    'IN': /^[6-9]\d{9}$/,
    'US': /^\d{10}$/,
    'UK': /^\d{10,11}$/
  };
  
  const cleanPhone = phone.replace(/\D/g, '');
  return patterns[country]?.test(cleanPhone) || false;
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid URL
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      message: 'Password is required',
      strength: 0
    };
  }

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password)
  };

  const strength = Object.values(checks).filter(Boolean).length;
  
  let message = '';
  if (strength < 3) {
    message = 'Password is weak';
  } else if (strength < 5) {
    message = 'Password is medium';
  } else {
    message = 'Password is strong';
  }

  return {
    isValid: strength >= 3,
    message,
    strength,
    checks
  };
};

// ============================================
// STORAGE HELPERS
// ============================================

/**
 * Set item in localStorage with expiry
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {number} expiryHours - Expiry in hours
 */
export const setStorageWithExpiry = (key, value, expiryHours = 24) => {
  const item = {
    value,
    expiry: Date.now() + (expiryHours * 60 * 60 * 1000)
  };
  
  localStorage.setItem(key, JSON.stringify(item));
};

/**
 * Get item from localStorage with expiry check
 * @param {string} key - Storage key
 * @returns {any} Stored value or null if expired
 */
export const getStorageWithExpiry = (key) => {
  const itemStr = localStorage.getItem(key);
  
  if (!itemStr) return null;
  
  try {
    const item = JSON.parse(itemStr);
    
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    
    return item.value;
  } catch {
    return null;
  }
};

/**
 * Clear all storage items matching pattern
 * @param {string} pattern - Pattern to match
 */
export const clearStorageByPattern = (pattern) => {
  const regex = new RegExp(pattern);
  
  Object.keys(localStorage).forEach(key => {
    if (regex.test(key)) {
      localStorage.removeItem(key);
    }
  });
};

// ============================================
// ARRAY HELPERS
// ============================================

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
export const groupBy = (array, key) => {
  if (!array || !Array.isArray(array)) return {};
  
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Sort array by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - Sort order (asc/desc)
 * @returns {Array} Sorted array
 */
export const sortBy = (array, key, order = 'asc') => {
  if (!array || !Array.isArray(array)) return [];
  
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Paginate array
 * @param {Array} array - Array to paginate
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Paginated result
 */
export const paginate = (array, page = 1, limit = 10) => {
  if (!array || !Array.isArray(array)) {
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }
  
  const start = (page - 1) * limit;
  const end = start + limit;
  const data = array.slice(start, end);
  
  return {
    data,
    total: array.length,
    page,
    limit,
    totalPages: Math.ceil(array.length / limit)
  };
};

/**
 * Remove duplicates from array
 * @param {Array} array - Array to process
 * @param {string} key - Key to check uniqueness
 * @returns {Array} Unique array
 */
export const uniqueBy = (array, key) => {
  if (!array || !Array.isArray(array)) return [];
  
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

// ============================================
// OBJECT HELPERS
// ============================================

/**
 * Pick specific keys from object
 * @param {Object} obj - Source object
 * @param {Array} keys - Keys to pick
 * @returns {Object} New object with picked keys
 */
export const pick = (obj, keys) => {
  if (!obj || !keys) return {};
  
  return keys.reduce((result, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

/**
 * Omit specific keys from object
 * @param {Object} obj - Source object
 * @param {Array} keys - Keys to omit
 * @returns {Object} New object without omitted keys
 */
export const omit = (obj, keys) => {
  if (!obj || !keys) return { ...obj };
  
  return Object.keys(obj).reduce((result, key) => {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return { ...obj };
  }
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} Is empty
 */
export const isEmpty = (obj) => {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

// ============================================
// COLOR HELPERS
// ============================================

/**
 * Generate random color
 * @returns {string} Random hex color
 */
export const randomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  
  return color;
};

/**
 * Lighten or darken color
 * @param {string} color - Hex color
 * @param {number} percent - Percentage to lighten (+ve) or darken (-ve)
 * @returns {string} Modified color
 */
export const adjustColor = (color, percent) => {
  if (!color || typeof color !== 'string') return color;
  
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const adjust = (value) => {
    return Math.min(255, Math.max(0, value + (value * percent / 100)));
  };
  
  const newR = Math.round(adjust(r));
  const newG = Math.round(adjust(g));
  const newB = Math.round(adjust(b));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

// ============================================
// BROWSER HELPERS
// ============================================

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  if (!text) return false;
  
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Copy failed:', err);
    return false;
  }
};

/**
 * Download file
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} type - File type
 */
export const downloadFile = (content, filename, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Get query parameters from URL
 * @returns {Object} Query parameters object
 */
export const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  
  for (const [key, value] of params) {
    result[key] = value;
  }
  
  return result;
};

/**
 * Build URL with query parameters
 * @param {string} url - Base URL
 * @param {Object} params - Query parameters
 * @returns {string} Full URL
 */
export const buildUrl = (url, params) => {
  if (!params || Object.keys(params).length === 0) return url;
  
  const urlObj = new URL(url, window.location.origin);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      urlObj.searchParams.append(key, value);
    }
  });
  
  return urlObj.toString();
};

/**
 * Detect browser language
 * @returns {string} Browser language
 */
export const getBrowserLanguage = () => {
  return navigator.language || navigator.userLanguage || 'en';
};

/**
 * Check if device is mobile
 * @returns {boolean} Is mobile device
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Check if device is iOS
 * @returns {boolean} Is iOS device
 */
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

/**
 * Check if device is Android
 * @returns {boolean} Is Android device
 */
export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

// ============================================
// MATH HELPERS
// ============================================

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage
 */
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return (value / total) * 100;
};

/**
 * Calculate average
 * @param {Array} numbers - Array of numbers
 * @returns {number} Average
 */
export const calculateAverage = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  
  const sum = numbers.reduce((acc, num) => acc + (Number(num) || 0), 0);
  return sum / numbers.length;
};

/**
 * Calculate compound interest
 * @param {number} principal - Principal amount
 * @param {number} rate - Interest rate (per period)
 * @param {number} time - Number of periods
 * @returns {number} Compound amount
 */
export const compoundInterest = (principal, rate, time) => {
  return principal * Math.pow(1 + rate / 100, time);
};

/**
 * Calculate discount
 * @param {number} price - Original price
 * @param {number} discount - Discount percentage
 * @returns {number} Discounted price
 */
export const calculateDiscount = (price, discount) => {
  return price - (price * discount / 100);
};

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate PAN card (India)
 * @param {string} pan - PAN number
 * @returns {boolean} Is valid PAN
 */
export const isValidPAN = (pan) => {
  if (!pan) return false;
  
  const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
  return panRegex.test(pan);
};

/**
 * Validate GST number (India)
 * @param {string} gst - GST number
 * @returns {boolean} Is valid GST
 */
export const isValidGST = (gst) => {
  if (!gst) return false;
  
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
};

/**
 * Validate Aadhaar number
 * @param {string} aadhaar - Aadhaar number
 * @returns {boolean} Is valid Aadhaar
 */
export const isValidAadhaar = (aadhaar) => {
  if (!aadhaar) return false;
  
  const aadhaar
