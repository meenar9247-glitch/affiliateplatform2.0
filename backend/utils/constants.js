/**
 * ============================================
 * CONSTANTS UTILITY
 * Centralized constants for the entire application
 * Organized by domain with comprehensive documentation
 * ============================================
 */

// ============================================
// Application Information
// ============================================

exports.APP = {
  NAME: 'AffiliatePro',
  VERSION: '1.0.0',
  DESCRIPTION: 'Complete Affiliate Marketing Platform with MLM, Commissions, and Real-time Tracking',
  ENVIRONMENTS: {
    DEVELOPMENT: 'development',
    STAGING: 'staging',
    PRODUCTION: 'production',
    TEST: 'test'
  },
  DEFAULT_TIMEZONE: 'UTC',
  DEFAULT_LANGUAGE: 'en',
  SUPPORTED_LANGUAGES: ['en', 'es', 'fr', 'de', 'hi', 'ar', 'zh', 'ja'],
  DATE_FORMATS: {
    DEFAULT: 'YYYY-MM-DD',
    DISPLAY: 'MMM DD, YYYY',
    DATETIME: 'YYYY-MM-DD HH:mm:ss',
    DISPLAY_DATETIME: 'MMM DD, YYYY HH:mm',
    TIME: 'HH:mm:ss',
    ISO: 'YYYY-MM-DDTHH:mm:ss.sssZ'
  }
};

// ============================================
// HTTP Status Codes
// ============================================

exports.HTTP_STATUS = {
  // 1xx Informational
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  PROCESSING: 102,

  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTI_STATUS: 207,
  ALREADY_REPORTED: 208,
  IM_USED: 226,

  // 3xx Redirection
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,

  // 4xx Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  IM_A_TEAPOT: 418,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NOT_EXTENDED: 510,
  NETWORK_AUTHENTICATION_REQUIRED: 511
};

// ============================================
// Error Codes
// ============================================

exports.ERROR_CODES = {
  // Authentication Errors (1000-1999)
  AUTH_INVALID_CREDENTIALS: 'AUTH_1001',
  AUTH_TOKEN_EXPIRED: 'AUTH_1002',
  AUTH_INVALID_TOKEN: 'AUTH_1003',
  AUTH_MISSING_TOKEN: 'AUTH_1004',
  AUTH_ACCOUNT_LOCKED: 'AUTH_1005',
  AUTH_ACCOUNT_DISABLED: 'AUTH_1006',
  AUTH_EMAIL_NOT_VERIFIED: 'AUTH_1007',
  AUTH_INVALID_REFRESH_TOKEN: 'AUTH_1008',
  AUTH_MAX_ATTEMPTS: 'AUTH_1009',
  AUTH_2FA_REQUIRED: 'AUTH_1010',
  AUTH_2FA_INVALID: 'AUTH_1011',

  // Authorization Errors (2000-2999)
  UNAUTHORIZED_ACCESS: 'AUTHZ_2001',
  INSUFFICIENT_PERMISSIONS: 'AUTHZ_2002',
  ROLE_REQUIRED: 'AUTHZ_2003',
  RESOURCE_ACCESS_DENIED: 'AUTHZ_2004',

  // User Errors (3000-3999)
  USER_NOT_FOUND: 'USER_3001',
  USER_ALREADY_EXISTS: 'USER_3002',
  USER_INVALID_DATA: 'USER_3003',
  USER_EMAIL_IN_USE: 'USER_3004',
  USER_PHONE_IN_USE: 'USER_3005',
  USER_INVALID_REFERRAL: 'USER_3006',

  // Affiliate Errors (4000-4999)
  AFFILIATE_NOT_FOUND: 'AFF_4001',
  AFFILIATE_NOT_ACTIVE: 'AFF_4002',
  AFFILIATE_PENDING: 'AFF_4003',
  AFFILIATE_SUSPENDED: 'AFF_4004',
  AFFILIATE_INVALID_COMMISSION: 'AFF_4005',

  // Referral Errors (5000-5999)
  REFERRAL_NOT_FOUND: 'REF_5001',
  REFERRAL_ALREADY_EXISTS: 'REF_5002',
  REFERRAL_INVALID_CODE: 'REF_5003',
  REFERRAL_SELF: 'REF_5004',
  REFERRAL_MAX_DEPTH: 'REF_5005',

  // Commission Errors (6000-6999)
  COMMISSION_NOT_FOUND: 'COM_6001',
  COMMISSION_INVALID_AMOUNT: 'COM_6002',
  COMMISSION_PROCESSING: 'COM_6003',
  COMMISSION_ALREADY_PAID: 'COM_6004',
  COMMISSION_CANCELLED: 'COM_6005',

  // Payout Errors (7000-7999)
  PAYOUT_NOT_FOUND: 'PAY_7001',
  PAYOUT_INVALID_AMOUNT: 'PAY_7002',
  PAYOUT_INSUFFICIENT_BALANCE: 'PAY_7003',
  PAYOUT_MINIMUM_REQUIRED: 'PAY_7004',
  PAYOUT_MAXIMUM_EXCEEDED: 'PAY_7005',
  PAYOUT_PROCESSING: 'PAY_7006',
  PAYOUT_METHOD_INVALID: 'PAY_7007',

  // Wallet Errors (8000-8999)
  WALLET_NOT_FOUND: 'WAL_8001',
  WALLET_INSUFFICIENT_BALANCE: 'WAL_8002',
  WALLET_FROZEN: 'WAL_8003',
  WALLET_LOCKED: 'WAL_8004',
  WALLET_INVALID_TRANSACTION: 'WAL_8005',
  WALLET_DAILY_LIMIT: 'WAL_8006',
  WALLET_WEEKLY_LIMIT: 'WAL_8007',
  WALLET_MONTHLY_LIMIT: 'WAL_8008',

  // Ticket Errors (9000-9999)
  TICKET_NOT_FOUND: 'TIC_9001',
  TICKET_CLOSED: 'TIC_9002',
  TICKET_INVALID_MESSAGE: 'TIC_9003',
  TICKET_UNAUTHORIZED: 'TIC_9004',
  TICKET_ALREADY_RESOLVED: 'TIC_9005',

  // Validation Errors (10000-10999)
  VALIDATION_FAILED: 'VAL_10001',
  VALIDATION_INVALID_INPUT: 'VAL_10002',
  VALIDATION_MISSING_FIELD: 'VAL_10003',
  VALIDATION_INVALID_FORMAT: 'VAL_10004',
  VALIDATION_MAX_LENGTH: 'VAL_10005',
  VALIDATION_MIN_LENGTH: 'VAL_10006',

  // Database Errors (11000-11999)
  DB_CONNECTION_ERROR: 'DB_11001',
  DB_QUERY_ERROR: 'DB_11002',
  DB_DUPLICATE_KEY: 'DB_11003',
  DB_CAST_ERROR: 'DB_11004',
  DB_VALIDATION_ERROR: 'DB_11005',

  // File Errors (12000-12999)
  FILE_NOT_FOUND: 'FILE_12001',
  FILE_TOO_LARGE: 'FILE_12002',
  FILE_INVALID_TYPE: 'FILE_12003',
  FILE_UPLOAD_ERROR: 'FILE_12004',
  FILE_DELETE_ERROR: 'FILE_12005',
  FILE_VIRUS_DETECTED: 'FILE_12006',

  // System Errors (13000-13999)
  SYSTEM_ERROR: 'SYS_13001',
  SERVICE_UNAVAILABLE: 'SYS_13002',
  TIMEOUT_ERROR: 'SYS_13003',
  RATE_LIMIT_EXCEEDED: 'SYS_13004',
  MAINTENANCE_MODE: 'SYS_13005',

  // Third-party Errors (14000-14999)
  PAYMENT_GATEWAY_ERROR: 'EXT_14001',
  EMAIL_SERVICE_ERROR: 'EXT_14002',
  SMS_SERVICE_ERROR: 'EXT_14003',
  CLOUD_STORAGE_ERROR: 'EXT_14004'
};
// ============================================
// User Roles & Permissions
// ============================================

exports.USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  SUPPORT: 'support',
  AFFILIATE: 'affiliate',
  USER: 'user',
  GUEST: 'guest'
};

exports.USER_ROLE_HIERARCHY = {
  super_admin: 100,
  admin: 90,
  moderator: 80,
  support: 70,
  affiliate: 60,
  user: 50,
  guest: 10
};

exports.USER_PERMISSIONS = {
  // User management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_LIST: 'user:list',
  USER_EXPORT: 'user:export',
  USER_IMPERSONATE: 'user:impersonate',

  // Affiliate management
  AFFILIATE_CREATE: 'affiliate:create',
  AFFILIATE_READ: 'affiliate:read',
  AFFILIATE_UPDATE: 'affiliate:update',
  AFFILIATE_DELETE: 'affiliate:delete',
  AFFILIATE_LIST: 'affiliate:list',
  AFFILIATE_APPROVE: 'affiliate:approve',
  AFFILIATE_SUSPEND: 'affiliate:suspend',

  // Commission management
  COMMISSION_READ: 'commission:read',
  COMMISSION_UPDATE: 'commission:update',
  COMMISSION_DELETE: 'commission:delete',
  COMMISSION_APPROVE: 'commission:approve',
  COMMISSION_PAY: 'commission:pay',

  // Payout management
  PAYOUT_READ: 'payout:read',
  PAYOUT_UPDATE: 'payout:update',
  PAYOUT_DELETE: 'payout:delete',
  PAYOUT_APPROVE: 'payout:approve',
  PAYOUT_PROCESS: 'payout:process',

  // Referral management
  REFERRAL_READ: 'referral:read',
  REFERRAL_UPDATE: 'referral:update',
  REFERRAL_DELETE: 'referral:delete',

  // Wallet management
  WALLET_READ: 'wallet:read',
  WALLET_UPDATE: 'wallet:update',
  WALLET_ADJUST: 'wallet:adjust',
  WALLET_FREEZE: 'wallet:freeze',

  // Ticket management
  TICKET_CREATE: 'ticket:create',
  TICKET_READ: 'ticket:read',
  TICKET_UPDATE: 'ticket:update',
  TICKET_DELETE: 'ticket:delete',
  TICKET_ASSIGN: 'ticket:assign',
  TICKET_ESCALATE: 'ticket:escalate',

  // System management
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_LOGS: 'system:logs',
  SYSTEM_BACKUP: 'system:backup',
  SYSTEM_RESTORE: 'system:restore',
  SYSTEM_CLEANUP: 'system:cleanup',

  // Settings management
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',

  // Analytics
  ANALYTICS_READ: 'analytics:read',
  ANALYTICS_EXPORT: 'analytics:export',

  // Reports
  REPORTS_READ: 'reports:read',
  REPORTS_GENERATE: 'reports:generate',
  REPORTS_EXPORT: 'reports:export'
};

// ============================================
// Affiliate Status & Types
// ============================================

exports.AFFILIATE_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BLOCKED: 'blocked',
  CLOSED: 'closed'
};

exports.AFFILIATE_TIERS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
  DIAMOND: 'diamond'
};

exports.AFFILIATE_TIER_REQUIREMENTS = {
  bronze: { referrals: 0, earnings: 0 },
  silver: { referrals: 10, earnings: 1000 },
  gold: { referrals: 50, earnings: 5000 },
  platinum: { referrals: 100, earnings: 10000 },
  diamond: { referrals: 500, earnings: 50000 }
};

exports.AFFILIATE_COMMISSION_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  TIERED: 'tiered',
  PERFORMANCE: 'performance'
};

// ============================================
// Referral Status & Types
// ============================================

exports.REFERRAL_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  CONVERTED: 'converted',
  EXPIRED: 'expired',
  BLOCKED: 'blocked'
};

exports.REFERRAL_TYPES = {
  DIRECT: 'direct',
  INDIRECT: 'indirect',
  MLM: 'mlm',
  BONUS: 'bonus'
};

exports.REFERRAL_LEVELS = {
  MAX_DEPTH: 5,
  LEVEL_1: 1,
  LEVEL_2: 2,
  LEVEL_3: 3,
  LEVEL_4: 4,
  LEVEL_5: 5
};

// ============================================
// Commission Status & Types
// ============================================

exports.COMMISSION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PROCESSING: 'processing',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  HELD: 'held',
  REJECTED: 'rejected'
};

exports.COMMISSION_TYPES = {
  DIRECT: 'direct',
  INDIRECT: 'indirect',
  BONUS: 'bonus',
  PERFORMANCE: 'performance',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  ANNUAL: 'annual',
  SIGNUP: 'signup',
  SALE: 'sale',
  SUBSCRIPTION: 'subscription',
  RECURRING: 'recurring'
};

// ============================================
// Payout Status & Methods
// ============================================

exports.PAYOUT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  ON_HOLD: 'on_hold',
  REFUNDED: 'refunded'
};

exports.PAYOUT_METHODS = {
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  STRIPE: 'stripe',
  PAYONEER: 'payoneer',
  WISE: 'wise',
  CRYPTO: 'crypto',
  WALLET: 'wallet',
  CHECK: 'check',
  CASH: 'cash'
};

exports.PAYOUT_METHOD_DETAILS = {
  paypal: { fields: ['email'], min: 10, max: 10000 },
  bank_transfer: { fields: ['accountName', 'accountNumber', 'routingNumber', 'bankName', 'swiftCode'], min: 50, max: 50000 },
  stripe: { fields: ['accountId'], min: 10, max: 10000 },
  payoneer: { fields: ['email'], min: 20, max: 20000 },
  wise: { fields: ['email'], min: 20, max: 20000 },
  crypto: { fields: ['walletAddress', 'cryptoCurrency'], min: 10, max: 50000 },
  wallet: { fields: [], min: 1, max: 10000 },
  check: { fields: ['name', 'address'], min: 50, max: 5000 },
  cash: { fields: ['location'], min: 1, max: 1000 }
};

// ============================================
// Wallet Status & Limits
// ============================================

exports.WALLET_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BLOCKED: 'blocked',
  CLOSED: 'closed'
};

exports.WALLET_TYPES = {
  MAIN: 'main',
  COMMISSION: 'commission',
  BONUS: 'bonus',
  REFERRAL: 'referral',
  WITHDRAWAL: 'withdrawal',
  HOLD: 'hold',
  ESCROW: 'escrow'
};

exports.WALLET_LIMITS = {
  MIN_WITHDRAWAL: 10,
  MAX_WITHDRAWAL: 10000,
  DAILY_LIMIT: 5000,
  WEEKLY_LIMIT: 15000,
  MONTHLY_LIMIT: 50000,
  MIN_BALANCE_ALERT: 10
};

// ============================================
// Transaction Types & Status
// ============================================

exports.TRANSACTION_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit',
  COMMISSION: 'commission',
  REFERRAL_BONUS: 'referral_bonus',
  WITHDRAWAL: 'withdrawal',
  PAYOUT: 'payout',
  REFUND: 'refund',
  FEE: 'fee',
  TRANSFER: 'transfer',
  EXCHANGE: 'exchange',
  BONUS: 'bonus',
  PENALTY: 'penalty',
  ADJUSTMENT: 'adjustment',
  REVERSAL: 'reversal'
};

exports.TRANSACTION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REVERSED: 'reversed',
  REFUNDED: 'refunded',
  EXPIRED: 'expired'
};

exports.TRANSACTION_DIRECTIONS = {
  IN: 'in',
  OUT: 'out',
  INTERNAL: 'internal'
};

// ============================================
// Ticket Status & Categories
// ============================================

exports.TICKET_STATUS = {
  OPEN: 'open',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REOPENED: 'reopened',
  ESCALATED: 'escalated',
  ON_HOLD: 'on_hold',
  SPAM: 'spam',
  DUPLICATE: 'duplicate'
};

exports.TICKET_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical'
};

exports.TICKET_CATEGORIES = {
  GENERAL: 'general',
  TECHNICAL: 'technical',
  BILLING: 'billing',
  ACCOUNT: 'account',
  AFFILIATE: 'affiliate',
  COMMISSION: 'commission',
  WITHDRAWAL: 'withdrawal',
  REFERRAL: 'referral',
  BUG_REPORT: 'bug_report',
  FEATURE_REQUEST: 'feature_request',
  SECURITY: 'security',
  COMPLIANCE: 'compliance',
  OTHER: 'other'
};
// ============================================
// Notification Types & Channels
// ============================================

exports.NOTIFICATION_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app'
};

exports.NOTIFICATION_CATEGORIES = {
  SYSTEM: 'system',
  USER: 'user',
  AFFILIATE: 'affiliate',
  COMMISSION: 'commission',
  PAYOUT: 'payout',
  REFERRAL: 'referral',
  TICKET: 'ticket',
  SECURITY: 'security',
  PROMOTIONAL: 'promotional'
};

exports.NOTIFICATION_EVENTS = {
  // User events
  USER_REGISTERED: 'user.registered',
  USER_VERIFIED: 'user.verified',
  USER_LOGIN: 'user.login',
  USER_PASSWORD_CHANGED: 'user.password_changed',
  
  // Affiliate events
  AFFILIATE_APPROVED: 'affiliate.approved',
  AFFILIATE_SUSPENDED: 'affiliate.suspended',
  AFFILIATE_EARNINGS: 'affiliate.earnings',
  
  // Commission events
  COMMISSION_EARNED: 'commission.earned',
  COMMISSION_APPROVED: 'commission.approved',
  COMMISSION_PAID: 'commission.paid',
  
  // Payout events
  PAYOUT_REQUESTED: 'payout.requested',
  PAYOUT_APPROVED: 'payout.approved',
  PAYOUT_COMPLETED: 'payout.completed',
  PAYOUT_FAILED: 'payout.failed',
  
  // Referral events
  REFERRAL_REGISTERED: 'referral.registered',
  REFERRAL_CONVERTED: 'referral.converted',
  
  // Wallet events
  WALLET_CREDITED: 'wallet.credited',
  WALLET_DEBITED: 'wallet.debited',
  WALLET_LOW_BALANCE: 'wallet.low_balance',
  
  // Ticket events
  TICKET_CREATED: 'ticket.created',
  TICKET_UPDATED: 'ticket.updated',
  TICKET_MESSAGE: 'ticket.message',
  TICKET_RESOLVED: 'ticket.resolved'
};

// ============================================
// Cache Keys & TTL
// ============================================

exports.CACHE_KEYS = {
  USER: 'user:',
  AFFILIATE: 'affiliate:',
  COMMISSION: 'commission:',
  PAYOUT: 'payout:',
  WALLET: 'wallet:',
  SETTINGS: 'settings:',
  STATS: 'stats:',
  DASHBOARD: 'dashboard:',
  SESSION: 'session:',
  RATE_LIMIT: 'rl:'
};

exports.CACHE_TTL = {
  USER: 3600, // 1 hour
  AFFILIATE: 1800, // 30 minutes
  COMMISSION: 600, // 10 minutes
  PAYOUT: 600, // 10 minutes
  WALLET: 300, // 5 minutes
  SETTINGS: 86400, // 24 hours
  STATS: 3600, // 1 hour
  DASHBOARD: 300, // 5 minutes
  SESSION: 86400 // 24 hours
};

// ============================================
// Rate Limits
// ============================================

exports.RATE_LIMITS = {
  PUBLIC: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
  },
  AUTHENTICATED: {
    windowMs: 15 * 60 * 1000,
    max: 200
  },
  LOGIN: {
    windowMs: 15 * 60 * 1000,
    max: 5
  },
  REGISTER: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3
  },
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000,
    max: 3
  },
  API: {
    windowMs: 60 * 1000, // 1 minute
    max: 60
  },
  SEARCH: {
    windowMs: 60 * 1000,
    max: 30
  },
  EXPORT: {
    windowMs: 60 * 60 * 1000,
    max: 5
  }
};

// ============================================
// File Upload Limits
// ============================================

exports.FILE_LIMITS = {
  IMAGE: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  },
  DOCUMENT: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },
  VIDEO: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/mpeg', 'video/quicktime']
  },
  ARCHIVE: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['application/zip', 'application/x-zip-compressed']
  }
};

// ============================================
// Pagination Defaults
// ============================================

exports.PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  SORT_ORDER: {
    ASC: 1,
    DESC: -1
  }
};

// ============================================
// Date Ranges
// ============================================

exports.DATE_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_QUARTER: 'this_quarter',
  LAST_QUARTER: 'last_quarter',
  THIS_YEAR: 'this_year',
  LAST_YEAR: 'last_year',
  CUSTOM: 'custom'
};

// ============================================
// Analytics Metrics
// ============================================

exports.ANALYTICS_METRICS = {
  CLICKS: 'clicks',
  CONVERSIONS: 'conversions',
  COMMISSIONS: 'commissions',
  REVENUE: 'revenue',
  REFERRALS: 'referrals',
  EARNINGS: 'earnings',
  PAYOUTS: 'payouts',
  TRAFFIC: 'traffic'
};

exports.ANALYTICS_GROUP_BY = {
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year'
};

// ============================================
// System Constants
// ============================================

exports.SYSTEM = {
  MAINTENANCE_MODE: false,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 50,
  REFERRAL_CODE_LENGTH: 8,
  OTP_LENGTH: 6,
  OTP_EXPIRY: 10 * 60 * 1000, // 10 minutes
  SESSION_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
  JWT_EXPIRY: '30d',
  REFRESH_TOKEN_EXPIRY: '90d'
};

// ============================================
// Regular Expressions
// ============================================

exports.REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-]{10,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  IP_ADDRESS: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  REFERRAL_CODE: /^[A-Z0-9]{6,10}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHABETIC: /^[a-zA-Z]+$/,
  NUMERIC: /^\d+$/
};

// ============================================
// Currency & Payment
// ============================================

exports.CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' }
};

exports.DEFAULT_CURRENCY = 'USD';

// ============================================
// Export all constants
// ============================================

module.exports = exports;
