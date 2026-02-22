// ==================== API Constants ====================

export const API = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  VERSION: 'v1'
};

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    PROFILE: '/auth/profile',
    TWO_FACTOR: '/auth/2fa'
  },
  
  // User endpoints
  USERS: {
    BASE: '/users',
    ME: '/users/me',
    PROFILE: '/users/profile',
    SETTINGS: '/users/settings',
    PREFERENCES: '/users/preferences',
    ACTIVITY: '/users/activity',
    SESSIONS: '/users/sessions'
  },
  
  // Affiliate endpoints
  AFFILIATES: {
    BASE: '/affiliates',
    DASHBOARD: '/affiliates/dashboard',
    LINKS: '/affiliates/links',
    REFERRALS: '/affiliates/referrals',
    COMMISSIONS: '/affiliates/commissions',
    EARNINGS: '/affiliates/earnings',
    PAYOUTS: '/affiliates/payouts',
    STATS: '/affiliates/stats',
    PRODUCTS: '/affiliates/products'
  },
  
  // Payment endpoints
  PAYMENTS: {
    BASE: '/payments',
    PROCESS: '/payments/process',
    VERIFY: '/payments/verify',
    REFUND: '/payments/refund',
    METHODS: '/payments/methods',
    TRANSACTIONS: '/payments/transactions',
    WITHDRAWALS: '/payments/withdrawals'
  },
  
  // Admin endpoints
  ADMIN: {
    BASE: '/admin',
    USERS: '/admin/users',
    AFFILIATES: '/admin/affiliates',
    PAYMENTS: '/admin/payments',
    REPORTS: '/admin/reports',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
    LOGS: '/admin/logs',
    SYSTEM: '/admin/system'
  },
  
  // Support endpoints
  SUPPORT: {
    BASE: '/support',
    TICKETS: '/support/tickets',
    FAQ: '/support/faq',
    CHAT: '/support/chat'
  }
};

// ==================== HTTP Constants ====================

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS'
};

export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,
  
  // Client errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // Server errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
};

export const HTTP_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept',
  CACHE_CONTROL: 'Cache-Control',
  USER_AGENT: 'User-Agent',
  X_REQUESTED_WITH: 'X-Requested-With',
  X_CSRF_TOKEN: 'X-CSRF-Token',
  X_API_KEY: 'X-API-Key'
};

export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  FORM_DATA: 'multipart/form-data',
  TEXT_PLAIN: 'text/plain',
  TEXT_HTML: 'text/html',
  XML: 'application/xml',
  PDF: 'application/pdf',
  CSV: 'text/csv',
  BLOB: 'application/octet-stream'
};

// ==================== User Constants ====================

export const USER_ROLES = {
  USER: 'user',
  AFFILIATE: 'affiliate',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
  PENDING: 'pending',
  DELETED: 'deleted'
};

export const ACCOUNT_TYPES = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise'
};

export const VERIFICATION_LEVELS = {
  UNVERIFIED: 0,
  EMAIL_VERIFIED: 1,
  PHONE_VERIFIED: 2,
  ID_VERIFIED: 3,
  KYC_VERIFIED: 4
};

export const GENDERS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
  PREFER_NOT_TO_SAY: 'prefer_not_to_say'
};

export const MARITAL_STATUS = {
  SINGLE: 'single',
  MARRIED: 'married',
  DIVORCED: 'divorced',
  WIDOWED: 'widowed'
};

// ==================== Affiliate Constants ====================

export const COMMISSION_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  TIERED: 'tiered',
  RECURRING: 'recurring',
  LIFETIME: 'lifetime'
};

export const COMMISSION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  REJECTED: 'rejected'
};

export const REFERRAL_STATUSES = {
  PENDING: 'pending',
  ACTIVE: 'active',
  CONVERTED: 'converted',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

export const LINK_TYPES = {
  DIRECT: 'direct',
  BANNER: 'banner',
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  SOCIAL: 'social',
  QR: 'qr',
  COUPON: 'coupon'
};

export const LINK_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  PAUSED: 'paused',
  DELETED: 'deleted'
};

export const AFFILIATE_LEVELS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
  DIAMOND: 'diamond',
  ELITE: 'elite'
};

export const DEFAULT_COMMISSION_RATES = {
  [AFFILIATE_LEVELS.BRONZE]: 5,
  [AFFILIATE_LEVELS.SILVER]: 10,
  [AFFILIATE_LEVELS.GOLD]: 15,
  [AFFILIATE_LEVELS.PLATINUM]: 20,
  [AFFILIATE_LEVELS.DIAMOND]: 25,
  [AFFILIATE_LEVELS.ELITE]: 30
};

// ==================== Payment Constants ====================

export const PAYMENT_GATEWAYS = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  RAZORPAY: 'razorpay',
  CASHFREE: 'cashfree',
  PAYU: 'payu',
  INSTAMOJO: 'instamojo',
  CCAVENUE: 'ccavenue',
  BILLDESK: 'billdesk',
  PHONEPE: 'phonepe'
};

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  NET_BANKING: 'net_banking',
  UPI: 'upi',
  WALLET: 'wallet',
  PAYPAL: 'paypal',
  CRYPTO: 'crypto',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash'
};

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
  CHARGEBACK: 'chargeback'
};

export const TRANSACTION_TYPES = {
  PAYMENT: 'payment',
  REFUND: 'refund',
  WITHDRAWAL: 'withdrawal',
  DEPOSIT: 'deposit',
  COMMISSION: 'commission',
  BONUS: 'bonus',
  ADJUSTMENT: 'adjustment'
};

export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  INR: 'INR',
  JPY: 'JPY',
  CNY: 'CNY',
  AUD: 'AUD',
  CAD: 'CAD',
  SGD: 'SGD',
  AED: 'AED'
};

export const WITHDRAWAL_METHODS = {
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  UPI: 'upi',
  PAYONEER: 'payoneer',
  WISE: 'wise',
  CRYPTO: 'crypto'
};

export const WITHDRAWAL_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected'
};

export const MINIMUM_WITHDRAWAL = {
  [WITHDRAWAL_METHODS.PAYPAL]: 10,
  [WITHDRAWAL_METHODS.BANK_TRANSFER]: 25,
  [WITHDRAWAL_METHODS.UPI]: 10,
  [WITHDRAWAL_METHODS.PAYONEER]: 20,
  [WITHDRAWAL_METHODS.WISE]: 20,
  [WITHDRAWAL_METHODS.CRYPTO]: 50
};

// ==================== Notification Constants ====================

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  EARNING: 'earning',
  REFERRAL: 'referral',
  COMMISSION: 'commission',
  WITHDRAWAL: 'withdrawal',
  ACHIEVEMENT: 'achievement',
  REMINDER: 'reminder',
  PROMOTION: 'promotion',
  SECURITY: 'security',
  SYSTEM: 'system'
};

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

export const NOTIFICATION_CHANNELS = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  WHATSAPP: 'whatsapp',
  TELEGRAM: 'telegram'
};

// ==================== Analytics Constants ====================

export const TIME_PERIODS = {
  HOURLY: 'hourly',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
  CUSTOM: 'custom'
};

export const METRIC_TYPES = {
  COUNT: 'count',
  SUM: 'sum',
  AVERAGE: 'average',
  PERCENTAGE: 'percentage',
  RATE: 'rate',
  RATIO: 'ratio'
};

export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  DOUGHNUT: 'doughnut',
  AREA: 'area',
  RADAR: 'radar',
  SCATTER: 'scatter',
  HEATMAP: 'heatmap'
};

// ==================== Storage Constants ====================

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'auth_user',
  THEME: 'theme',
  LANGUAGE: 'language',
  CURRENCY: 'currency',
  SETTINGS: 'app_settings',
  PREFERENCES: 'user_preferences',
  CART: 'shopping_cart',
  WISHLIST: 'wishlist',
  RECENT_VIEWS: 'recent_views'
};

export const STORAGE_TYPES = {
  LOCAL: 'local',
  SESSION: 'session',
  MEMORY: 'memory',
  INDEXED_DB: 'indexed_db',
  COOKIE: 'cookie'
};

// ==================== Route Constants ====================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  VERIFY_EMAIL: '/verify-email/:token',
  
  DASHBOARD: '/dashboard',
  AFFILIATES: '/affiliates',
  REFERRALS: '/referrals',
  EARNINGS: '/earnings',
  WALLET: '/wallet',
  WITHDRAWALS: '/withdrawals',
  ANALYTICS: '/analytics',
  LEADERBOARD: '/leaderboard',
  SETTINGS: '/settings',
  
  SUPPORT: '/support',
  FAQ: '/faq',
  TICKETS: '/tickets',
  
  PRIVACY: '/privacy',
  TERMS: '/terms',
  COOKIES: '/cookies',
  GDPR: '/gdpr',
  
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_AFFILIATES: '/admin/affiliates',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_LOGS: '/admin/logs',
  
  NOT_FOUND: '/404',
  SERVER_ERROR: '/500',
  UNAUTHORIZED: '/unauthorized'
};

// ==================== Validation Constants ====================

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  BIO_MAX_LENGTH: 500,
  MESSAGE_MAX_LENGTH: 5000,
  TITLE_MAX_LENGTH: 200,
  
  PHONE_MIN_DIGITS: 10,
  PHONE_MAX_DIGITS: 15,
  
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
  MAX_FILES_COUNT: 5,
  
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  
  RATE_LIMIT: {
    LOGIN: 5, // attempts per 15 minutes
    REGISTER: 3,
    PASSWORD_RESET: 3,
    API: 100 // requests per minute
  }
};

// ==================== UI Constants ====================

export const BREAKPOINTS = {
  XS: 0,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1400
};

export const DEVICE_SIZES = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
  LARGE_DESKTOP: 'large_desktop'
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
  HIGH_CONTRAST: 'high_contrast'
};

export const LANGUAGES = {
  EN: 'en',
  HI: 'hi',
  BN: 'bn',
  TE: 'te',
  MR: 'mr',
  TA: 'ta',
  UR: 'ur',
  GU: 'gu',
  KN: 'kn',
  ML: 'ml'
};

export const DATE_FORMATS = {
  US: 'MM/DD/YYYY',
  UK: 'DD/MM/YYYY',
  ISO: 'YYYY-MM-DD',
  LONG: 'MMMM D, YYYY',
  SHORT: 'MMM D, YYYY'
};

export const TIME_FORMATS = {
  H12: '12h',
  H24: '24h'
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMITS: [10, 25, 50, 100],
  MAX_LIMIT: 100
};

export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc'
};

export const TOAST_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  TOP_CENTER: 'top-center',
  BOTTOM_CENTER: 'bottom-center'
};

export const MODAL_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  FULL: 'full'
};

export const ALERT_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// ==================== Social Media Constants ====================

export const SOCIAL_PLATFORMS = {
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  INSTAGRAM: 'instagram',
  LINKEDIN: 'linkedin',
  YOUTUBE: 'youtube',
  PINTEREST: 'pinterest',
  REDDIT: 'reddit',
  TELEGRAM: 'telegram',
  WHATSAPP: 'whatsapp',
  DISCORD: 'discord'
};

export const SOCIAL_SHARE_MESSAGES = {
  FACEBOOK: 'Check this out!',
  TWITTER: 'Check this out!',
  WHATSAPP: 'Check this out!',
  TELEGRAM: 'Check this out!'
};

// ==================== Regex Patterns ====================

export const REGEX = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  NUMERIC: /^[0-9]+$/,
  ALPHABETIC: /^[a-zA-Z]+$/,
  HEX_COLOR: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,
  IP_V4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  CREDIT_CARD: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
  CVV: /^[0-9]{3,4}$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
};

// ==================== App Constants ====================

export const APP_NAME = 'Affiliate Platform';
export const APP_VERSION = '1.0.0';
export const COMPANY_NAME = 'Affiliate Platform Inc.';
export const COMPANY_EMAIL = 'support@affiliateplatform.com';
export const COMPANY_PHONE = '+1 (800) 123-4567';
export const COMPANY_ADDRESS = '123 Business Street, New York, NY 10001';

export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/affiliateplatform',
  TWITTER: 'https://twitter.com/affiliateplatform',
  INSTAGRAM: 'https://instagram.com/affiliateplatform',
  LINKEDIN: 'https://linkedin.com/company/affiliateplatform',
  YOUTUBE: 'https://youtube.com/affiliateplatform',
  GITHUB: 'https://github.com/affiliateplatform'
};

export const COOKIE_CONSENT = {
  NECESSARY: 'necessary',
  FUNCTIONAL: 'functional',
  ANALYTICS: 'analytics',
  MARKETING: 'marketing'
};

export const MAINTENANCE_MODES = {
  OFF: 'off',
  ON: 'on',
  SCHEDULED: 'scheduled'
};

// ==================== Error Messages ====================

export const ERROR_MESSAGES = {
  // Auth errors
  AUTH_REQUIRED: 'Authentication required',
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account temporarily locked',
  EMAIL_NOT_VERIFIED: 'Please verify your email first',
  PHONE_NOT_VERIFIED: 'Please verify your phone number first',
  TWO_FACTOR_REQUIRED: 'Two-factor authentication required',
  INVALID_TOKEN: 'Invalid or expired token',
  
  // Validation errors
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_URL: 'Please enter a valid URL',
  PASSWORD_MISMATCH: 'Passwords do not match',
  WEAK_PASSWORD: 'Password is too weak',
  
  // Payment errors
  PAYMENT_FAILED: 'Payment processing failed',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  INVALID_PAYMENT_METHOD: 'Invalid payment method',
  WITHDRAWAL_FAILED: 'Withdrawal failed',
  
  // Permission errors
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORBIDDEN: 'Access forbidden',
  
  // Resource errors
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',
  
  // Server errors
  SERVER_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  NETWORK_ERROR: 'Network error occurred'
};

// ==================== Success Messages ====================

export const SUCCESS_MESSAGES = {
  // Auth success
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  
  // Payment success
  PAYMENT_SUCCESS: 'Payment processed successfully',
  WITHDRAWAL_SUCCESS: 'Withdrawal requested successfully',
  REFUND_SUCCESS: 'Refund processed successfully',
  
  // Affiliate success
  LINK_CREATED: 'Affiliate link created successfully',
  LINK_UPDATED: 'Affiliate link updated successfully',
  LINK_DELETED: 'Affiliate link deleted successfully',
  
  // Settings success
  SETTINGS_SAVED: 'Settings saved successfully',
  PREFERENCES_UPDATED: 'Preferences updated successfully'
};

// ==================== Export all constants ====================

export default {
  API,
  API_ENDPOINTS,
  HTTP_METHODS,
  HTTP_STATUS,
  HTTP_HEADERS,
  CONTENT_TYPES,
  USER_ROLES,
  USER_STATUSES,
  ACCOUNT_TYPES,
  VERIFICATION_LEVELS,
  GENDERS,
  MARITAL_STATUS,
  COMMISSION_TYPES,
  COMMISSION_STATUSES,
  REFERRAL_STATUSES,
  LINK_TYPES,
  LINK_STATUSES,
  AFFILIATE_LEVELS,
  DEFAULT_COMMISSION_RATES,
  PAYMENT_GATEWAYS,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  TRANSACTION_TYPES,
  CURRENCIES,
  WITHDRAWAL_METHODS,
  WITHDRAWAL_STATUSES,
  MINIMUM_WITHDRAWAL,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_CHANNELS,
  TIME_PERIODS,
  METRIC_TYPES,
  CHART_TYPES,
  STORAGE_KEYS,
  STORAGE_TYPES,
  ROUTES,
  VALIDATION_RULES,
  BREAKPOINTS,
  DEVICE_SIZES,
  THEMES,
  LANGUAGES,
  DATE_FORMATS,
  TIME_FORMATS,
  PAGINATION,
  SORT_ORDERS,
  TOAST_POSITIONS,
  MODAL_SIZES,
  ALERT_TYPES,
  SOCIAL_PLATFORMS,
  SOCIAL_SHARE_MESSAGES,
  REGEX,
  APP_NAME,
  APP_VERSION,
  COMPANY_NAME,
  COMPANY_EMAIL,
  COMPANY_PHONE,
  COMPANY_ADDRESS,
  SOCIAL_LINKS,
  COOKIE_CONSENT,
  MAINTENANCE_MODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
