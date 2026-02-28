// ==================== Environment Configuration ====================

// Environment types
export const ENV_TYPES = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test',
};

// Current environment
export const CURRENT_ENV = process.env.NODE_ENV || ENV_TYPES.DEVELOPMENT;

// Check environment
export const isDevelopment = CURRENT_ENV === ENV_TYPES.DEVELOPMENT;
export const isStaging = CURRENT_ENV === ENV_TYPES.STAGING;
export const isProduction = CURRENT_ENV === ENV_TYPES.PRODUCTION;
export const isTest = CURRENT_ENV === ENV_TYPES.TEST;

// ==================== API Configuration ====================

export const API_CONFIG = {
  // Base URLs
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
  
  // Timeouts
  TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  UPLOAD_TIMEOUT: parseInt(process.env.REACT_APP_UPLOAD_TIMEOUT) || 60000,
  
  // Retry configuration
  RETRY_ATTEMPTS: parseInt(process.env.REACT_APP_RETRY_ATTEMPTS) || 3,
  RETRY_DELAY: parseInt(process.env.REACT_APP_RETRY_DELAY) || 1000,
  
  // Version
  VERSION: process.env.REACT_APP_API_VERSION || 'v1',
  
  // Endpoints
  ENDPOINTS: {
    AUTH: '/auth',
    USERS: '/users',
    AFFILIATES: '/affiliates',
    PAYMENTS: '/payments',
    SUPPORT: '/support',
    ADMIN: '/admin',
  },
};

// ==================== App Configuration ====================

export const APP_CONFIG = {
  // App info
  NAME: process.env.REACT_APP_NAME || 'Affiliate Platform',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  DESCRIPTION: process.env.REACT_APP_DESCRIPTION || 'Affiliate Marketing Platform',
  
  // URLs
  URL: process.env.REACT_APP_URL || 'http://localhost:3000',
  
  // Features
  ENABLE_REGISTRATION: process.env.REACT_APP_ENABLE_REGISTRATION !== 'false',
  ENABLE_SOCIAL_LOGIN: process.env.REACT_APP_ENABLE_SOCIAL_LOGIN === 'true',
  ENABLE_TWO_FACTOR: process.env.REACT_APP_ENABLE_TWO_FACTOR === 'true',
  ENABLE_NOTIFICATIONS: process.env.REACT_APP_ENABLE_NOTIFICATIONS !== 'false',
  ENABLE_CHAT: process.env.REACT_APP_ENABLE_CHAT === 'true',
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS !== 'false',
  
  // Maintenance
  MAINTENANCE_MODE: process.env.REACT_APP_MAINTENANCE_MODE === 'true',
  MAINTENANCE_MESSAGE: process.env.REACT_APP_MAINTENANCE_MESSAGE || 'Site is under maintenance',
  
  // Demo mode
  DEMO_MODE: process.env.REACT_APP_DEMO_MODE === 'true',
  DEMO_MESSAGE: process.env.REACT_APP_DEMO_MESSAGE || 'This is a demo version',
};

// ==================== Auth Configuration ====================

export const AUTH_CONFIG = {
  // Token keys
  TOKEN_KEY: process.env.REACT_APP_TOKEN_KEY || 'auth_token',
  REFRESH_TOKEN_KEY: process.env.REACT_APP_REFRESH_TOKEN_KEY || 'refresh_token',
  USER_KEY: process.env.REACT_APP_USER_KEY || 'auth_user',
  
  // Session
  SESSION_TIMEOUT: parseInt(process.env.REACT_APP_SESSION_TIMEOUT) || 3600, // 1 hour
  REFRESH_INTERVAL: parseInt(process.env.REACT_APP_REFRESH_INTERVAL) || 900, // 15 minutes
  
  // Login attempts
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.REACT_APP_MAX_LOGIN_ATTEMPTS) || 5,
  LOCKOUT_DURATION: parseInt(process.env.REACT_APP_LOCKOUT_DURATION) || 1800, // 30 minutes
  
  // Password
  PASSWORD_MIN_LENGTH: parseInt(process.env.REACT_APP_PASSWORD_MIN_LENGTH) || 8,
  PASSWORD_MAX_LENGTH: parseInt(process.env.REACT_APP_PASSWORD_MAX_LENGTH) || 128,
  
  // OAuth providers
  GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  FACEBOOK_APP_ID: process.env.REACT_APP_FACEBOOK_APP_ID,
  GITHUB_CLIENT_ID: process.env.REACT_APP_GITHUB_CLIENT_ID,
};

// ==================== Payment Configuration ====================

export const PAYMENT_CONFIG = {
  // Stripe
  STRIPE_PUBLIC_KEY: process.env.REACT_APP_STRIPE_PUBLIC_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.REACT_APP_STRIPE_WEBHOOK_SECRET,
  
  // PayPal
  PAYPAL_CLIENT_ID: process.env.REACT_APP_PAYPAL_CLIENT_ID,
  PAYPAL_MODE: process.env.REACT_APP_PAYPAL_MODE || 'sandbox',
  
  // Razorpay
  RAZORPAY_KEY_ID: process.env.REACT_APP_RAZORPAY_KEY_ID,
  
  // Currency
  DEFAULT_CURRENCY: process.env.REACT_APP_DEFAULT_CURRENCY || 'USD',
  SUPPORTED_CURRENCIES: (process.env.REACT_APP_SUPPORTED_CURRENCIES || 'USD,EUR,GBP,INR').split(','),
  
  // Minimum amounts
  MINIMUM_DEPOSIT: parseInt(process.env.REACT_APP_MINIMUM_DEPOSIT) || 10,
  MINIMUM_WITHDRAWAL: parseInt(process.env.REACT_APP_MINIMUM_WITHDRAWAL) || 10,
  MAXIMUM_WITHDRAWAL: parseInt(process.env.REACT_APP_MAXIMUM_WITHDRAWAL) || 10000,
  
  // Fees
  TRANSACTION_FEE_PERCENTAGE: parseFloat(process.env.REACT_APP_TRANSACTION_FEE_PERCENTAGE) || 2.9,
  TRANSACTION_FEE_FIXED: parseFloat(process.env.REACT_APP_TRANSACTION_FEE_FIXED) || 0.3,
  WITHDRAWAL_FEE: parseFloat(process.env.REACT_APP_WITHDRAWAL_FEE) || 1.0,
};

// ==================== Affiliate Configuration ====================

export const AFFILIATE_CONFIG = {
  // Commission rates
  DEFAULT_COMMISSION_RATE: parseFloat(process.env.REACT_APP_DEFAULT_COMMISSION_RATE) || 10,
  MIN_COMMISSION_RATE: parseFloat(process.env.REACT_APP_MIN_COMMISSION_RATE) || 1,
  MAX_COMMISSION_RATE: parseFloat(process.env.REACT_APP_MAX_COMMISSION_RATE) || 50,
  
  // Cookie duration
  COOKIE_DURATION: parseInt(process.env.REACT_APP_COOKIE_DURATION) || 30, // days
  
  // Minimum payout
  MINIMUM_PAYOUT: parseInt(process.env.REACT_APP_MINIMUM_PAYOUT) || 10,
  
  // Referral levels
  REFERRAL_LEVELS: parseInt(process.env.REACT_APP_REFERRAL_LEVELS) || 3,
  
  // Commission rates by level
  LEVEL_COMMISSION_RATES: {
    1: parseFloat(process.env.REACT_APP_LEVEL_1_RATE) || 10,
    2: parseFloat(process.env.REACT_APP_LEVEL_2_RATE) || 5,
    3: parseFloat(process.env.REACT_APP_LEVEL_3_RATE) || 2,
  },
};

// ==================== Feature Flags ====================

export const FEATURES = {
  // User features
  USER_REGISTRATION: process.env.REACT_APP_FEATURE_USER_REGISTRATION !== 'false',
  USER_PROFILE: process.env.REACT_APP_FEATURE_USER_PROFILE !== 'false',
  USER_SETTINGS: process.env.REACT_APP_FEATURE_USER_SETTINGS !== 'false',
  
  // Affiliate features
  AFFILIATE_DASHBOARD: process.env.REACT_APP_FEATURE_AFFILIATE_DASHBOARD !== 'false',
  AFFILIATE_LINKS: process.env.REACT_APP_FEATURE_AFFILIATE_LINKS !== 'false',
  AFFILIATE_REFERRALS: process.env.REACT_APP_FEATURE_AFFILIATE_REFERRALS !== 'false',
  AFFILIATE_EARNINGS: process.env.REACT_APP_FEATURE_AFFILIATE_EARNINGS !== 'false',
  AFFILIATE_WITHDRAWALS: process.env.REACT_APP_FEATURE_AFFILIATE_WITHDRAWALS !== 'false',
  
  // Payment features
  PAYMENT_STRIPE: process.env.REACT_APP_FEATURE_PAYMENT_STRIPE === 'true',
  PAYMENT_PAYPAL: process.env.REACT_APP_FEATURE_PAYMENT_PAYPAL === 'true',
  PAYMENT_RAZORPAY: process.env.REACT_APP_FEATURE_PAYMENT_RAZORPAY === 'true',
  
  // Social features
  SOCIAL_LOGIN: process.env.REACT_APP_FEATURE_SOCIAL_LOGIN === 'true',
  SOCIAL_SHARE: process.env.REACT_APP_FEATURE_SOCIAL_SHARE !== 'false',
  
  // Communication features
  CHAT: process.env.REACT_APP_FEATURE_CHAT === 'true',
  NOTIFICATIONS: process.env.REACT_APP_FEATURE_NOTIFICATIONS !== 'false',
  EMAIL_NOTIFICATIONS: process.env.REACT_APP_FEATURE_EMAIL_NOTIFICATIONS !== 'false',
  SMS_NOTIFICATIONS: process.env.REACT_APP_FEATURE_SMS_NOTIFICATIONS === 'true',
  
  // Analytics features
  ANALYTICS: process.env.REACT_APP_FEATURE_ANALYTICS !== 'false',
  REPORTS: process.env.REACT_APP_FEATURE_REPORTS !== 'false',
  
  // Admin features
  ADMIN_DASHBOARD: process.env.REACT_APP_FEATURE_ADMIN_DASHBOARD !== 'false',
  ADMIN_USERS: process.env.REACT_APP_FEATURE_ADMIN_USERS !== 'false',
  ADMIN_AFFILIATES: process.env.REACT_APP_FEATURE_ADMIN_AFFILIATES !== 'false',
  ADMIN_PAYMENTS: process.env.REACT_APP_FEATURE_ADMIN_PAYMENTS !== 'false',
  ADMIN_REPORTS: process.env.REACT_APP_FEATURE_ADMIN_REPORTS !== 'false',
  ADMIN_LOGS: process.env.REACT_APP_FEATURE_ADMIN_LOGS !== 'false',
  ADMIN_SYSTEM: process.env.REACT_APP_FEATURE_ADMIN_SYSTEM !== 'false',
};

// ==================== UI Configuration ====================

export const UI_CONFIG = {
  // Theme
  DEFAULT_THEME: process.env.REACT_APP_DEFAULT_THEME || 'light',
  THEMES: (process.env.REACT_APP_THEMES || 'light,dark,system').split(','),
  
  // Language
  DEFAULT_LANGUAGE: process.env.REACT_APP_DEFAULT_LANGUAGE || 'en',
  LANGUAGES: (process.env.REACT_APP_LANGUAGES || 'en,hi,bn,te,mr,ta').split(','),
  
  // Pagination
  DEFAULT_PAGE_SIZE: parseInt(process.env.REACT_APP_DEFAULT_PAGE_SIZE) || 10,
  PAGE_SIZE_OPTIONS: (process.env.REACT_APP_PAGE_SIZE_OPTIONS || '10,25,50,100').split(',').map(Number),
  
  // Date format
  DEFAULT_DATE_FORMAT: process.env.REACT_APP_DEFAULT_DATE_FORMAT || 'MM/DD/YYYY',
  DEFAULT_TIME_FORMAT: process.env.REACT_APP_DEFAULT_TIME_FORMAT || '12h',
  
  // Currency
  DEFAULT_CURRENCY: process.env.REACT_APP_DEFAULT_CURRENCY || 'USD',
  
  // Toast
  TOAST_DURATION: parseInt(process.env.REACT_APP_TOAST_DURATION) || 5000,
  TOAST_POSITION: process.env.REACT_APP_TOAST_POSITION || 'top-right',
};

// ==================== Storage Configuration ====================

export const STORAGE_CONFIG = {
  // Prefix
  PREFIX: process.env.REACT_APP_STORAGE_PREFIX || 'app_',
  
  // Default storage
  DEFAULT_STORAGE: process.env.REACT_APP_DEFAULT_STORAGE || 'local',
  
  // Expiry
  DEFAULT_EXPIRY: parseInt(process.env.REACT_APP_STORAGE_EXPIRY) || 86400, // 24 hours
  
  // Encryption
  ENABLE_ENCRYPTION: process.env.REACT_APP_STORAGE_ENCRYPTION === 'true',
  ENCRYPTION_KEY: process.env.REACT_APP_STORAGE_ENCRYPTION_KEY,
};

// ==================== Monitoring Configuration ====================

export const MONITORING_CONFIG = {
  // Sentry
  SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN,
  SENTRY_ENVIRONMENT: CURRENT_ENV,
  
  // Google Analytics
  GA_TRACKING_ID: process.env.REACT_APP_GA_TRACKING_ID,
  
  // LogRocket
  LOGROCKET_APP_ID: process.env.REACT_APP_LOGROCKET_APP_ID,
  
  // Hotjar
  HOTJAR_ID: process.env.REACT_APP_HOTJAR_ID,
  HOTJAR_SV: process.env.REACT_APP_HOTJAR_SV,
  
  // FullStory
  FULLSTORY_ORG_ID: process.env.REACT_APP_FULLSTORY_ORG_ID,
  
  // Mixpanel
  MIXPANEL_TOKEN: process.env.REACT_APP_MIXPANEL_TOKEN,
};

// ==================== Social Media Configuration ====================

export const SOCIAL_CONFIG = {
  // Share messages
  SHARE_TITLE: process.env.REACT_APP_SHARE_TITLE || APP_CONFIG.NAME,
  SHARE_DESCRIPTION: process.env.REACT_APP_SHARE_DESCRIPTION || APP_CONFIG.DESCRIPTION,
  SHARE_IMAGE: process.env.REACT_APP_SHARE_IMAGE || '/logo512.png',
  
  // Social links
  FACEBOOK_PAGE: process.env.REACT_APP_FACEBOOK_PAGE,
  TWITTER_HANDLE: process.env.REACT_APP_TWITTER_HANDLE,
  INSTAGRAM_HANDLE: process.env.REACT_APP_INSTAGRAM_HANDLE,
  LINKEDIN_COMPANY: process.env.REACT_APP_LINKEDIN_COMPANY,
  YOUTUBE_CHANNEL: process.env.REACT_APP_YOUTUBE_CHANNEL,
  GITHUB_REPO: process.env.REACT_APP_GITHUB_REPO,
};

// ==================== SEO Configuration ====================

export const SEO_CONFIG = {
  // Default meta tags
  DEFAULT_TITLE: process.env.REACT_APP_SEO_TITLE || APP_CONFIG.NAME,
  DEFAULT_DESCRIPTION: process.env.REACT_APP_SEO_DESCRIPTION || APP_CONFIG.DESCRIPTION,
  DEFAULT_KEYWORDS: process.env.REACT_APP_SEO_KEYWORDS || 'affiliate, marketing, earn money',
  DEFAULT_IMAGE: process.env.REACT_APP_SEO_IMAGE || '/logo512.png',
  
  // Open Graph
  OG_SITE_NAME: process.env.REACT_APP_OG_SITE_NAME || APP_CONFIG.NAME,
  OG_TYPE: process.env.REACT_APP_OG_TYPE || 'website',
  
  // Twitter
  TWITTER_CARD: process.env.REACT_APP_TWITTER_CARD || 'summary_large_image',
  TWITTER_SITE: process.env.REACT_APP_TWITTER_SITE,
  TWITTER_CREATOR: process.env.REACT_APP_TWITTER_CREATOR,
};

// ==================== Performance Configuration ====================

export const PERFORMANCE_CONFIG = {
  // Lazy loading
  ENABLE_LAZY_LOADING: process.env.REACT_APP_ENABLE_LAZY_LOADING !== 'false',
  ENABLE_IMAGE_LAZY_LOADING: process.env.REACT_APP_ENABLE_IMAGE_LAZY_LOADING !== 'false',
  
  // Caching
  ENABLE_CACHING: process.env.REACT_APP_ENABLE_CACHING !== 'false',
  CACHE_DURATION: parseInt(process.env.REACT_APP_CACHE_DURATION) || 300, // 5 minutes
  
  // Compression
  ENABLE_COMPRESSION: process.env.REACT_APP_ENABLE_COMPRESSION !== 'false',
  
  // PWA
  ENABLE_PWA: process.env.REACT_APP_ENABLE_PWA === 'true',
  
  // Service worker
  SERVICE_WORKER_URL: process.env.REACT_APP_SERVICE_WORKER_URL || '/service-worker.js',
};

// ==================== Security Configuration ====================

export const SECURITY_CONFIG = {
  // CSP
  CSP_ENABLED: process.env.REACT_APP_CSP_ENABLED === 'true',
  
  // Rate limiting
  RATE_LIMIT_ENABLED: process.env.REACT_APP_RATE_LIMIT_ENABLED !== 'false',
  RATE_LIMIT_MAX: parseInt(process.env.REACT_APP_RATE_LIMIT_MAX) || 100,
  RATE_LIMIT_WINDOW: parseInt(process.env.REACT_APP_RATE_LIMIT_WINDOW) || 60, // seconds
  
  // XSS protection
  XSS_PROTECTION_ENABLED: process.env.REACT_APP_XSS_PROTECTION_ENABLED !== 'false',
  
  // CSRF protection
  CSRF_PROTECTION_ENABLED: process.env.REACT_APP_CSRF_PROTECTION_ENABLED !== 'false',
  
  // CORS
  CORS_ENABLED: process.env.REACT_APP_CORS_ENABLED !== 'false',
  
  // HTTPS
  HTTPS_ONLY: process.env.REACT_APP_HTTPS_ONLY === 'true',
  
  // HSTS
  HSTS_ENABLED: process.env.REACT_APP_HSTS_ENABLED === 'true',
  HSTS_MAX_AGE: parseInt(process.env.REACT_APP_HSTS_MAX_AGE) || 31536000,
};

// ==================== Export all configs ====================

export const ENV_CONFIG = {
  // Environment
  CURRENT_ENV,
  isDevelopment,
  isStaging,
  isProduction,
  isTest,
  
  // Configs
  API: API_CONFIG,
  APP: APP_CONFIG,
  AUTH: AUTH_CONFIG,
  PAYMENT: PAYMENT_CONFIG,
  AFFILIATE: AFFILIATE_CONFIG,
  FEATURES,
  UI: UI_CONFIG,
  STORAGE: STORAGE_CONFIG,
  MONITORING: MONITORING_CONFIG,
  SOCIAL: SOCIAL_CONFIG,
  SEO: SEO_CONFIG,
  PERFORMANCE: PERFORMANCE_CONFIG,
  SECURITY: SECURITY_CONFIG,
  
  // Environment types
  ENV_TYPES,
};

export default ENV_CONFIG;
