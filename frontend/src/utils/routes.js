import React from 'react';
import {
  FiHome,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiSettings,
  FiHelpCircle,
  FiShield,
  FiBarChart2,
  FiGrid,
  FiUser,
  FiLogIn,
  FiUserPlus,
  FiLock,
  FiMail,
  FiBell,
  FiStar,
  FiAward,
  FiGift,
  FiShoppingCart,
  FiCreditCard,
  FiMap,
  FiFlag,
  FiGlobe,
  FiCalendar,
  FiClock,
  FiUpload,
  FiDownload,
  FiShare2,
  FiHeart,
  FiBookmark,
  FiMessageCircle,
  FiPhone,
  FiVideo,
  FiCamera,
  FiMusic,
  FiHeadphones,
  FiMonitor,
  FiTablet,
  FiSmartphone,
  FiWatch,
  FiWifi,
  FiBluetooth,
  FiBattery,
  FiPower,
  FiBox,
  FiPackage,
  FiArchive,
  FiTrash2,
  FiEdit,
  FiCopy,
  FiScissors,
  FiClipboard,
  FiPrinter,
  FiSave,
  FiSend,
  FiInbox,
  FiOutbox,
  FiMessageSquare,
  FiTwitter,
  FiFacebook,
  FiInstagram,
  FiLinkedin,
  FiYoutube,
  FiGithub,
  FiInfo,
  FiBriefcase,
  FiFileText,
  FiAlertCircle,
  FiTool,
  FiLink,
} from 'react-icons/fi';

// ==================== Route Constants ====================

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  VERIFY_EMAIL: '/verify-email/:token',
  
  // Legal pages
  PRIVACY: '/privacy',
  TERMS: '/terms',
  COOKIES: '/cookies',
  GDPR: '/gdpr',
  
  // Public pages
  ABOUT: '/about',
  CONTACT: '/contact',
  FAQ: '/faq',
  BLOG: '/blog',
  CAREERS: '/careers',
  PRESS: '/press',
  
  // User routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
  MESSAGES: '/messages',
  
  // Affiliate routes
  AFFILIATES: '/affiliates',
  AFFILIATE_DASHBOARD: '/affiliates/dashboard',
  AFFILIATE_LINKS: '/affiliates/links',
  AFFILIATE_CREATE_LINK: '/affiliates/links/create',
  AFFILIATE_EDIT_LINK: '/affiliates/links/:id/edit',
  AFFILIATE_REFERRALS: '/affiliates/referrals',
  AFFILIATE_EARNINGS: '/affiliates/earnings',
  AFFILIATE_COMMISSIONS: '/affiliates/commissions',
  AFFILIATE_PAYOUTS: '/affiliates/payouts',
  AFFILIATE_ANALYTICS: '/affiliates/analytics',
  AFFILIATE_PRODUCTS: '/affiliates/products',
  AFFILIATE_LEADERBOARD: '/affiliates/leaderboard',
  
  // Referral routes
  REFERRALS: '/referrals',
  REFERRAL_TREE: '/referrals/tree',
  REFERRAL_STATS: '/referrals/stats',
  
  // Earnings routes
  EARNINGS: '/earnings',
  EARNINGS_HISTORY: '/earnings/history',
  EARNINGS_REPORTS: '/earnings/reports',
  
  // Wallet routes
  WALLET: '/wallet',
  WALLET_BALANCE: '/wallet/balance',
  WALLET_TRANSACTIONS: '/wallet/transactions',
  WALLET_DEPOSIT: '/wallet/deposit',
  
  // Withdrawal routes
  WITHDRAWALS: '/withdrawals',
  WITHDRAWALS_HISTORY: '/withdrawals/history',
  WITHDRAWALS_METHODS: '/withdrawals/methods',
  
  // Analytics routes
  ANALYTICS: '/analytics',
  ANALYTICS_OVERVIEW: '/analytics/overview',
  ANALYTICS_TRAFFIC: '/analytics/traffic',
  ANALYTICS_CONVERSIONS: '/analytics/conversions',
  ANALYTICS_EARNINGS: '/analytics/earnings',
  ANALYTICS_REPORTS: '/analytics/reports',
  
  // Leaderboard routes
  LEADERBOARD: '/leaderboard',
  LEADERBOARD_TOP: '/leaderboard/top',
  LEADERBOARD_CATEGORIES: '/leaderboard/categories',
  
  // Settings routes
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_SECURITY: '/settings/security',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
  SETTINGS_PREFERENCES: '/settings/preferences',
  SETTINGS_PAYMENT: '/settings/payment',
  SETTINGS_API: '/settings/api',
  
  // Support routes
  SUPPORT: '/support',
  SUPPORT_TICKETS: '/support/tickets',
  SUPPORT_NEW_TICKET: '/support/tickets/new',
  SUPPORT_TICKET_DETAILS: '/support/tickets/:id',
  SUPPORT_FAQ: '/support/faq',
  SUPPORT_CHAT: '/support/chat',
  
  // Admin routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAILS: '/admin/users/:id',
  ADMIN_USER_EDIT: '/admin/users/:id/edit',
  ADMIN_USER_CREATE: '/admin/users/create',
  
  ADMIN_AFFILIATES: '/admin/affiliates',
  ADMIN_AFFILIATE_DETAILS: '/admin/affiliates/:id',
  ADMIN_AFFILIATE_EDIT: '/admin/affiliates/:id/edit',
  ADMIN_AFFILIATE_CREATE: '/admin/affiliates/create',
  
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_PAYMENT_DETAILS: '/admin/payments/:id',
  ADMIN_WITHDRAWALS: '/admin/withdrawals',
  ADMIN_WITHDRAWAL_DETAILS: '/admin/withdrawals/:id',
  
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_REPORT_GENERATE: '/admin/reports/generate',
  ADMIN_REPORT_DETAILS: '/admin/reports/:id',
  
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_ANALYTICS_DASHBOARD: '/admin/analytics/dashboard',
  ADMIN_ANALYTICS_CUSTOM: '/admin/analytics/custom',
  
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_SETTINGS_GENERAL: '/admin/settings/general',
  ADMIN_SETTINGS_SECURITY: '/admin/settings/security',
  ADMIN_SETTINGS_PAYMENT: '/admin/settings/payment',
  ADMIN_SETTINGS_EMAIL: '/admin/settings/email',
  ADMIN_SETTINGS_NOTIFICATIONS: '/admin/settings/notifications',
  
  ADMIN_LOGS: '/admin/logs',
  ADMIN_LOG_DETAILS: '/admin/logs/:id',
  
  ADMIN_SYSTEM: '/admin/system',
  ADMIN_SYSTEM_HEALTH: '/admin/system/health',
  ADMIN_SYSTEM_BACKUP: '/admin/system/backup',
  ADMIN_SYSTEM_MAINTENANCE: '/admin/system/maintenance',
  
  // Error routes
  NOT_FOUND: '/404',
  SERVER_ERROR: '/500',
  UNAUTHORIZED: '/unauthorized',
  FORBIDDEN: '/forbidden',
  MAINTENANCE: '/maintenance',
};

// ==================== Route Groups ====================

export const ROUTE_GROUPS = {
  PUBLIC: 'public',
  AUTH: 'auth',
  PROTECTED: 'protected',
  AFFILIATE: 'affiliate',
  ADMIN: 'admin',
  ERROR: 'error',
};

// ==================== Route Icons ====================

export const ROUTE_ICONS = {
  [ROUTES.HOME]: FiHome,
  [ROUTES.LOGIN]: FiLogIn,
  [ROUTES.REGISTER]: FiUserPlus,
  [ROUTES.FORGOT_PASSWORD]: FiLock,
  [ROUTES.VERIFY_EMAIL]: FiMail,
  
  [ROUTES.DASHBOARD]: FiGrid,
  [ROUTES.PROFILE]: FiUser,
  [ROUTES.SETTINGS]: FiSettings,
  [ROUTES.NOTIFICATIONS]: FiBell,
  [ROUTES.MESSAGES]: FiMessageCircle,
  
  [ROUTES.AFFILIATES]: FiTrendingUp,
  [ROUTES.AFFILIATE_DASHBOARD]: FiBarChart2,
  [ROUTES.AFFILIATE_LINKS]: FiLink,
  [ROUTES.AFFILIATE_REFERRALS]: FiUsers,
  [ROUTES.AFFILIATE_EARNINGS]: FiDollarSign,
  [ROUTES.AFFILIATE_COMMISSIONS]: FiGift,
  [ROUTES.AFFILIATE_PAYOUTS]: FiCreditCard,
  [ROUTES.AFFILIATE_ANALYTICS]: FiTrendingUp,
  [ROUTES.AFFILIATE_PRODUCTS]: FiShoppingCart,
  [ROUTES.AFFILIATE_LEADERBOARD]: FiAward,
  
  [ROUTES.REFERRALS]: FiUsers,
  [ROUTES.EARNINGS]: FiDollarSign,
  [ROUTES.WALLET]: FiCreditCard,
  [ROUTES.WITHDRAWALS]: FiDownload,
  [ROUTES.ANALYTICS]: FiBarChart2,
  [ROUTES.LEADERBOARD]: FiAward,
  
  [ROUTES.SUPPORT]: FiHelpCircle,
  [ROUTES.SUPPORT_TICKETS]: FiMail,
  [ROUTES.SUPPORT_FAQ]: FiHelpCircle,
  [ROUTES.SUPPORT_CHAT]: FiMessageCircle,
  
  [ROUTES.ADMIN]: FiShield,
  [ROUTES.ADMIN_DASHBOARD]: FiGrid,
  [ROUTES.ADMIN_USERS]: FiUsers,
  [ROUTES.ADMIN_AFFILIATES]: FiTrendingUp,
  [ROUTES.ADMIN_PAYMENTS]: FiDollarSign,
  [ROUTES.ADMIN_REPORTS]: FiBarChart2,
  [ROUTES.ADMIN_ANALYTICS]: FiTrendingUp,
  [ROUTES.ADMIN_SETTINGS]: FiSettings,
  [ROUTES.ADMIN_LOGS]: FiArchive,
  [ROUTES.ADMIN_SYSTEM]: FiMonitor,
  
  [ROUTES.PRIVACY]: FiShield,
  [ROUTES.TERMS]: FiFileText,
  [ROUTES.COOKIES]: FiCookie,
  [ROUTES.GDPR]: FiShield,
  
  [ROUTES.ABOUT]: FiInfo,
  [ROUTES.CONTACT]: FiPhone,
  [ROUTES.FAQ]: FiHelpCircle,
  [ROUTES.BLOG]: FiBookmark,
  [ROUTES.CAREERS]: FiBriefcase,
  
  [ROUTES.NOT_FOUND]: FiAlertCircle,
  [ROUTES.SERVER_ERROR]: FiAlertCircle,
  [ROUTES.UNAUTHORIZED]: FiLock,
  [ROUTES.FORBIDDEN]: FiShield,
  [ROUTES.MAINTENANCE]: FiTool,
};

// ==================== Route Titles ====================

export const ROUTE_TITLES = {
  [ROUTES.HOME]: 'Home',
  [ROUTES.LOGIN]: 'Login',
  [ROUTES.REGISTER]: 'Register',
  [ROUTES.FORGOT_PASSWORD]: 'Forgot Password',
  [ROUTES.RESET_PASSWORD]: 'Reset Password',
  [ROUTES.VERIFY_EMAIL]: 'Verify Email',
  
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.PROFILE]: 'Profile',
  [ROUTES.SETTINGS]: 'Settings',
  [ROUTES.NOTIFICATIONS]: 'Notifications',
  [ROUTES.MESSAGES]: 'Messages',
  
  [ROUTES.AFFILIATES]: 'Affiliates',
  [ROUTES.AFFILIATE_DASHBOARD]: 'Affiliate Dashboard',
  [ROUTES.AFFILIATE_LINKS]: 'Affiliate Links',
  [ROUTES.AFFILIATE_CREATE_LINK]: 'Create Link',
  [ROUTES.AFFILIATE_EDIT_LINK]: 'Edit Link',
  [ROUTES.AFFILIATE_REFERRALS]: 'Referrals',
  [ROUTES.AFFILIATE_EARNINGS]: 'Earnings',
  [ROUTES.AFFILIATE_COMMISSIONS]: 'Commissions',
  [ROUTES.AFFILIATE_PAYOUTS]: 'Payouts',
  [ROUTES.AFFILIATE_ANALYTICS]: 'Analytics',
  [ROUTES.AFFILIATE_PRODUCTS]: 'Products',
  [ROUTES.AFFILIATE_LEADERBOARD]: 'Leaderboard',
  
  [ROUTES.REFERRALS]: 'My Referrals',
  [ROUTES.REFERRAL_TREE]: 'Referral Tree',
  [ROUTES.REFERRAL_STATS]: 'Referral Stats',
  
  [ROUTES.EARNINGS]: 'My Earnings',
  [ROUTES.EARNINGS_HISTORY]: 'Earnings History',
  [ROUTES.EARNINGS_REPORTS]: 'Earnings Reports',
  
  [ROUTES.WALLET]: 'Wallet',
  [ROUTES.WALLET_BALANCE]: 'Wallet Balance',
  [ROUTES.WALLET_TRANSACTIONS]: 'Transactions',
  [ROUTES.WALLET_DEPOSIT]: 'Deposit',
  
  [ROUTES.WITHDRAWALS]: 'Withdrawals',
  [ROUTES.WITHDRAWALS_HISTORY]: 'Withdrawal History',
  [ROUTES.WITHDRAWALS_METHODS]: 'Withdrawal Methods',
  
  [ROUTES.ANALYTICS]: 'Analytics',
  [ROUTES.ANALYTICS_OVERVIEW]: 'Analytics Overview',
  [ROUTES.ANALYTICS_TRAFFIC]: 'Traffic Analytics',
  [ROUTES.ANALYTICS_CONVERSIONS]: 'Conversion Analytics',
  [ROUTES.ANALYTICS_EARNINGS]: 'Earnings Analytics',
  [ROUTES.ANALYTICS_REPORTS]: 'Analytics Reports',
  
  [ROUTES.LEADERBOARD]: 'Leaderboard',
  [ROUTES.LEADERBOARD_TOP]: 'Top Affiliates',
  [ROUTES.LEADERBOARD_CATEGORIES]: 'Categories',
  
  [ROUTES.SETTINGS_PROFILE]: 'Profile Settings',
  [ROUTES.SETTINGS_SECURITY]: 'Security Settings',
  [ROUTES.SETTINGS_NOTIFICATIONS]: 'Notification Settings',
  [ROUTES.SETTINGS_PREFERENCES]: 'Preferences',
  [ROUTES.SETTINGS_PAYMENT]: 'Payment Settings',
  [ROUTES.SETTINGS_API]: 'API Settings',
  
  [ROUTES.SUPPORT]: 'Support Center',
  [ROUTES.SUPPORT_TICKETS]: 'Support Tickets',
  [ROUTES.SUPPORT_NEW_TICKET]: 'Create Ticket',
  [ROUTES.SUPPORT_TICKET_DETAILS]: 'Ticket Details',
  [ROUTES.SUPPORT_FAQ]: 'FAQ',
  [ROUTES.SUPPORT_CHAT]: 'Live Chat',
  
  [ROUTES.ADMIN]: 'Admin',
  [ROUTES.ADMIN_DASHBOARD]: 'Admin Dashboard',
  [ROUTES.ADMIN_USERS]: 'User Management',
  [ROUTES.ADMIN_USER_DETAILS]: 'User Details',
  [ROUTES.ADMIN_USER_EDIT]: 'Edit User',
  [ROUTES.ADMIN_USER_CREATE]: 'Create User',
  
  [ROUTES.ADMIN_AFFILIATES]: 'Affiliate Management',
  [ROUTES.ADMIN_AFFILIATE_DETAILS]: 'Affiliate Details',
  [ROUTES.ADMIN_AFFILIATE_EDIT]: 'Edit Affiliate',
  [ROUTES.ADMIN_AFFILIATE_CREATE]: 'Create Affiliate',
  
  [ROUTES.ADMIN_PAYMENTS]: 'Payment Management',
  [ROUTES.ADMIN_PAYMENT_DETAILS]: 'Payment Details',
  [ROUTES.ADMIN_WITHDRAWALS]: 'Withdrawal Management',
  [ROUTES.ADMIN_WITHDRAWAL_DETAILS]: 'Withdrawal Details',
  
  [ROUTES.ADMIN_REPORTS]: 'Reports',
  [ROUTES.ADMIN_REPORT_GENERATE]: 'Generate Report',
  [ROUTES.ADMIN_REPORT_DETAILS]: 'Report Details',
  
  [ROUTES.ADMIN_ANALYTICS]: 'Analytics',
  [ROUTES.ADMIN_ANALYTICS_DASHBOARD]: 'Analytics Dashboard',
  [ROUTES.ADMIN_ANALYTICS_CUSTOM]: 'Custom Analytics',
  
  [ROUTES.ADMIN_SETTINGS]: 'Admin Settings',
  [ROUTES.ADMIN_SETTINGS_GENERAL]: 'General Settings',
  [ROUTES.ADMIN_SETTINGS_SECURITY]: 'Security Settings',
  [ROUTES.ADMIN_SETTINGS_PAYMENT]: 'Payment Settings',
  [ROUTES.ADMIN_SETTINGS_EMAIL]: 'Email Settings',
  [ROUTES.ADMIN_SETTINGS_NOTIFICATIONS]: 'Notification Settings',
  
  [ROUTES.ADMIN_LOGS]: 'System Logs',
  [ROUTES.ADMIN_LOG_DETAILS]: 'Log Details',
  
  [ROUTES.ADMIN_SYSTEM]: 'System',
  [ROUTES.ADMIN_SYSTEM_HEALTH]: 'System Health',
  [ROUTES.ADMIN_SYSTEM_BACKUP]: 'Backup',
  [ROUTES.ADMIN_SYSTEM_MAINTENANCE]: 'Maintenance',
  
  [ROUTES.PRIVACY]: 'Privacy Policy',
  [ROUTES.TERMS]: 'Terms of Service',
  [ROUTES.COOKIES]: 'Cookie Policy',
  [ROUTES.GDPR]: 'GDPR Compliance',
  
  [ROUTES.ABOUT]: 'About Us',
  [ROUTES.CONTACT]: 'Contact Us',
  [ROUTES.FAQ]: 'Frequently Asked Questions',
  [ROUTES.BLOG]: 'Blog',
  [ROUTES.CAREERS]: 'Careers',
  [ROUTES.PRESS]: 'Press',
  
  [ROUTES.NOT_FOUND]: '404 - Page Not Found',
  [ROUTES.SERVER_ERROR]: '500 - Server Error',
  [ROUTES.UNAUTHORIZED]: '401 - Unauthorized',
  [ROUTES.FORBIDDEN]: '403 - Forbidden',
  [ROUTES.MAINTENANCE]: 'Maintenance Mode',
};
// ==================== Route Descriptions ====================

export const ROUTE_DESCRIPTIONS = {
  [ROUTES.HOME]: 'Welcome to our affiliate platform',
  [ROUTES.LOGIN]: 'Login to your account',
  [ROUTES.REGISTER]: 'Create a new account',
  
  [ROUTES.DASHBOARD]: 'View your dashboard and statistics',
  [ROUTES.PROFILE]: 'Manage your profile information',
  [ROUTES.SETTINGS]: 'Configure your account settings',
  
  [ROUTES.AFFILIATE_DASHBOARD]: 'Monitor your affiliate performance',
  [ROUTES.AFFILIATE_LINKS]: 'Create and manage your affiliate links',
  [ROUTES.AFFILIATE_REFERRALS]: 'Track your referrals',
  [ROUTES.AFFILIATE_EARNINGS]: 'View your earnings',
  [ROUTES.AFFILIATE_COMMISSIONS]: 'Track your commissions',
  [ROUTES.AFFILIATE_PAYOUTS]: 'Manage your payouts',
  
  [ROUTES.SUPPORT]: 'Get help and support',
  [ROUTES.SUPPORT_FAQ]: 'Find answers to common questions',
  
  [ROUTES.ADMIN_DASHBOARD]: 'Admin control panel',
  [ROUTES.ADMIN_USERS]: 'Manage system users',
  [ROUTES.ADMIN_AFFILIATES]: 'Manage affiliates',
  [ROUTES.ADMIN_PAYMENTS]: 'Manage payments and withdrawals',
  [ROUTES.ADMIN_REPORTS]: 'View system reports',
  [ROUTES.ADMIN_SETTINGS]: 'Configure system settings',
  [ROUTES.ADMIN_LOGS]: 'View system logs',
  
  [ROUTES.PRIVACY]: 'Our privacy policy',
  [ROUTES.TERMS]: 'Terms and conditions',
  
  [ROUTES.ABOUT]: 'Learn more about us',
  [ROUTES.CONTACT]: 'Get in touch with us',
};

// ==================== Route Permissions ====================

export const ROUTE_PERMISSIONS = {
  // Public routes (no authentication required)
  [ROUTES.HOME]: [],
  [ROUTES.LOGIN]: [],
  [ROUTES.REGISTER]: [],
  [ROUTES.FORGOT_PASSWORD]: [],
  [ROUTES.RESET_PASSWORD]: [],
  [ROUTES.VERIFY_EMAIL]: [],
  [ROUTES.PRIVACY]: [],
  [ROUTES.TERMS]: [],
  [ROUTES.COOKIES]: [],
  [ROUTES.GDPR]: [],
  [ROUTES.ABOUT]: [],
  [ROUTES.CONTACT]: [],
  [ROUTES.FAQ]: [],
  [ROUTES.BLOG]: [],
  
  // Protected routes (authentication required)
  [ROUTES.DASHBOARD]: ['user'],
  [ROUTES.PROFILE]: ['user'],
  [ROUTES.SETTINGS]: ['user'],
  [ROUTES.NOTIFICATIONS]: ['user'],
  [ROUTES.MESSAGES]: ['user'],
  
  // Affiliate routes (affiliate or admin role)
  [ROUTES.AFFILIATES]: ['affiliate', 'admin'],
  [ROUTES.AFFILIATE_DASHBOARD]: ['affiliate', 'admin'],
  [ROUTES.AFFILIATE_LINKS]: ['affiliate', 'admin'],
  [ROUTES.AFFILIATE_REFERRALS]: ['affiliate', 'admin'],
  [ROUTES.AFFILIATE_EARNINGS]: ['affiliate', 'admin'],
  [ROUTES.AFFILIATE_COMMISSIONS]: ['affiliate', 'admin'],
  [ROUTES.AFFILIATE_PAYOUTS]: ['affiliate', 'admin'],
  [ROUTES.AFFILIATE_ANALYTICS]: ['affiliate', 'admin'],
  
  [ROUTES.REFERRALS]: ['affiliate', 'admin'],
  [ROUTES.EARNINGS]: ['affiliate', 'admin'],
  [ROUTES.WALLET]: ['affiliate', 'admin'],
  [ROUTES.WITHDRAWALS]: ['affiliate', 'admin'],
  [ROUTES.ANALYTICS]: ['affiliate', 'admin'],
  [ROUTES.LEADERBOARD]: ['affiliate', 'admin'],
  
  // Admin routes (admin only)
  [ROUTES.ADMIN]: ['admin'],
  [ROUTES.ADMIN_DASHBOARD]: ['admin'],
  [ROUTES.ADMIN_USERS]: ['admin'],
  [ROUTES.ADMIN_AFFILIATES]: ['admin'],
  [ROUTES.ADMIN_PAYMENTS]: ['admin'],
  [ROUTES.ADMIN_REPORTS]: ['admin'],
  [ROUTES.ADMIN_ANALYTICS]: ['admin'],
  [ROUTES.ADMIN_SETTINGS]: ['admin'],
  [ROUTES.ADMIN_LOGS]: ['admin'],
  [ROUTES.ADMIN_SYSTEM]: ['admin'],
  
  // Support routes (authenticated)
  [ROUTES.SUPPORT]: ['user'],
  [ROUTES.SUPPORT_TICKETS]: ['user'],
  [ROUTES.SUPPORT_FAQ]: ['user'],
  
  // Error routes (public)
  [ROUTES.NOT_FOUND]: [],
  [ROUTES.SERVER_ERROR]: [],
  [ROUTES.UNAUTHORIZED]: [],
  [ROUTES.FORBIDDEN]: [],
  [ROUTES.MAINTENANCE]: [],
};

// ==================== Route Groups Mapping ====================

export const ROUTE_GROUP_MAP = {
  [ROUTE_GROUPS.PUBLIC]: [
    ROUTES.HOME,
    ROUTES.PRIVACY,
    ROUTES.TERMS,
    ROUTES.COOKIES,
    ROUTES.GDPR,
    ROUTES.ABOUT,
    ROUTES.CONTACT,
    ROUTES.FAQ,
    ROUTES.BLOG,
    ROUTES.CAREERS,
    ROUTES.PRESS,
  ],
  
  [ROUTE_GROUPS.AUTH]: [
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.RESET_PASSWORD,
    ROUTES.VERIFY_EMAIL,
  ],
  
  [ROUTE_GROUPS.PROTECTED]: [
    ROUTES.DASHBOARD,
    ROUTES.PROFILE,
    ROUTES.SETTINGS,
    ROUTES.NOTIFICATIONS,
    ROUTES.MESSAGES,
  ],
  
  [ROUTE_GROUPS.AFFILIATE]: [
    ROUTES.AFFILIATES,
    ROUTES.AFFILIATE_DASHBOARD,
    ROUTES.AFFILIATE_LINKS,
    ROUTES.AFFILIATE_REFERRALS,
    ROUTES.AFFILIATE_EARNINGS,
    ROUTES.AFFILIATE_COMMISSIONS,
    ROUTES.AFFILIATE_PAYOUTS,
    ROUTES.AFFILIATE_ANALYTICS,
    ROUTES.AFFILIATE_PRODUCTS,
    ROUTES.REFERRALS,
    ROUTES.EARNINGS,
    ROUTES.WALLET,
    ROUTES.WITHDRAWALS,
    ROUTES.ANALYTICS,
    ROUTES.LEADERBOARD,
  ],
  
  [ROUTE_GROUPS.ADMIN]: [
    ROUTES.ADMIN,
    ROUTES.ADMIN_DASHBOARD,
    ROUTES.ADMIN_USERS,
    ROUTES.ADMIN_AFFILIATES,
    ROUTES.ADMIN_PAYMENTS,
    ROUTES.ADMIN_REPORTS,
    ROUTES.ADMIN_ANALYTICS,
    ROUTES.ADMIN_SETTINGS,
    ROUTES.ADMIN_LOGS,
    ROUTES.ADMIN_SYSTEM,
  ],
  
  [ROUTE_GROUPS.ERROR]: [
    ROUTES.NOT_FOUND,
    ROUTES.SERVER_ERROR,
    ROUTES.UNAUTHORIZED,
    ROUTES.FORBIDDEN,
    ROUTES.MAINTENANCE,
  ],
};

// ==================== Route Breadcrumbs ====================

export const ROUTE_BREADCRUMBS = {
  [ROUTES.HOME]: [],
  [ROUTES.DASHBOARD]: [{ path: ROUTES.HOME, title: 'Home' }],
  [ROUTES.PROFILE]: [
    { path: ROUTES.HOME, title: 'Home' },
    { path: ROUTES.DASHBOARD, title: 'Dashboard' },
  ],
  [ROUTES.SETTINGS]: [
    { path: ROUTES.HOME, title: 'Home' },
    { path: ROUTES.DASHBOARD, title: 'Dashboard' },
  ],
  [ROUTES.AFFILIATE_DASHBOARD]: [
    { path: ROUTES.HOME, title: 'Home' },
    { path: ROUTES.AFFILIATES, title: 'Affiliates' },
  ],
  [ROUTES.AFFILIATE_LINKS]: [
    { path: ROUTES.HOME, title: 'Home' },
    { path: ROUTES.AFFILIATES, title: 'Affiliates' },
    { path: ROUTES.AFFILIATE_DASHBOARD, title: 'Dashboard' },
  ],
  [ROUTES.ADMIN_DASHBOARD]: [
    { path: ROUTES.HOME, title: 'Home' },
    { path: ROUTES.ADMIN, title: 'Admin' },
  ],
  [ROUTES.ADMIN_USERS]: [
    { path: ROUTES.HOME, title: 'Home' },
    { path: ROUTES.ADMIN, title: 'Admin' },
    { path: ROUTES.ADMIN_DASHBOARD, title: 'Dashboard' },
  ],
};

// ==================== Route Navigation Items ====================

export const MAIN_NAVIGATION = [
  { path: ROUTES.HOME, title: 'Home', icon: FiHome },
  { path: ROUTES.DASHBOARD, title: 'Dashboard', icon: FiGrid, requiresAuth: true },
  { path: ROUTES.AFFILIATES, title: 'Affiliates', icon: FiTrendingUp, requiresAuth: true },
  { path: ROUTES.LEADERBOARD, title: 'Leaderboard', icon: FiAward, requiresAuth: true },
  { path: ROUTES.SUPPORT, title: 'Support', icon: FiHelpCircle },
];

export const USER_NAVIGATION = [
  { path: ROUTES.DASHBOARD, title: 'Dashboard', icon: FiGrid },
  { path: ROUTES.PROFILE, title: 'Profile', icon: FiUser },
  { path: ROUTES.SETTINGS, title: 'Settings', icon: FiSettings },
  { path: ROUTES.NOTIFICATIONS, title: 'Notifications', icon: FiBell },
  { path: ROUTES.MESSAGES, title: 'Messages', icon: FiMessageCircle },
];

export const AFFILIATE_NAVIGATION = [
  { path: ROUTES.AFFILIATE_DASHBOARD, title: 'Dashboard', icon: FiGrid },
  { path: ROUTES.AFFILIATE_LINKS, title: 'Links', icon: FiLink },
  { path: ROUTES.AFFILIATE_REFERRALS, title: 'Referrals', icon: FiUsers },
  { path: ROUTES.AFFILIATE_EARNINGS, title: 'Earnings', icon: FiDollarSign },
  { path: ROUTES.AFFILIATE_COMMISSIONS, title: 'Commissions', icon: FiGift },
  { path: ROUTES.AFFILIATE_PAYOUTS, title: 'Payouts', icon: FiCreditCard },
  { path: ROUTES.AFFILIATE_ANALYTICS, title: 'Analytics', icon: FiBarChart2 },
  { path: ROUTES.AFFILIATE_PRODUCTS, title: 'Products', icon: FiShoppingCart },
];

export const ADMIN_NAVIGATION = [
  { path: ROUTES.ADMIN_DASHBOARD, title: 'Dashboard', icon: FiGrid },
  { path: ROUTES.ADMIN_USERS, title: 'Users', icon: FiUsers },
  { path: ROUTES.ADMIN_AFFILIATES, title: 'Affiliates', icon: FiTrendingUp },
  { path: ROUTES.ADMIN_PAYMENTS, title: 'Payments', icon: FiDollarSign },
  { path: ROUTES.ADMIN_REPORTS, title: 'Reports', icon: FiBarChart2 },
  { path: ROUTES.ADMIN_ANALYTICS, title: 'Analytics', icon: FiTrendingUp },
  { path: ROUTES.ADMIN_SETTINGS, title: 'Settings', icon: FiSettings },
  { path: ROUTES.ADMIN_LOGS, title: 'Logs', icon: FiArchive },
  { path: ROUTES.ADMIN_SYSTEM, title: 'System', icon: FiMonitor },
];

export const FOOTER_NAVIGATION = [
  { path: ROUTES.ABOUT, title: 'About' },
  { path: ROUTES.CONTACT, title: 'Contact' },
  { path: ROUTES.FAQ, title: 'FAQ' },
  { path: ROUTES.BLOG, title: 'Blog' },
  { path: ROUTES.CAREERS, title: 'Careers' },
  { path: ROUTES.PRESS, title: 'Press' },
  { path: ROUTES.PRIVACY, title: 'Privacy' },
  { path: ROUTES.TERMS, title: 'Terms' },
  { path: ROUTES.COOKIES, title: 'Cookies' },
];
// ==================== Route Helper Functions ====================

export const routeHelpers = {
  // Get route title
  getTitle: (path) => ROUTE_TITLES[path] || 'Affiliate Platform',
  
  // Get route icon
  getIcon: (path) => ROUTE_ICONS[path] || FiHelpCircle,
  
  // Get route description
  getDescription: (path) => ROUTE_DESCRIPTIONS[path] || '',
  
  // Check if route requires authentication
  requiresAuth: (path) => {
    const permissions = ROUTE_PERMISSIONS[path];
    return permissions && permissions.length > 0;
  },
  
  // Check if user has permission for route
  hasPermission: (path, userRole) => {
    const allowedRoles = ROUTE_PERMISSIONS[path];
    if (!allowedRoles) return false;
    if (allowedRoles.length === 0) return true;
    return allowedRoles.includes(userRole) || allowedRoles.includes('admin');
  },
  
  // Get route group
  getGroup: (path) => {
    for (const [group, routes] of Object.entries(ROUTE_GROUP_MAP)) {
      if (routes.includes(path)) return group;
    }
    return ROUTE_GROUPS.PUBLIC;
  },
  
  // Get breadcrumbs for route
  getBreadcrumbs: (path) => {
    return ROUTE_BREADCRUMBS[path] || [{ path: ROUTES.HOME, title: 'Home' }];
  },
  
  // Generate dynamic route
  generatePath: (path, params = {}) => {
    let generatedPath = path;
    Object.entries(params).forEach(([key, value]) => {
      generatedPath = generatedPath.replace(`:${key}`, value);
    });
    return generatedPath;
  },
  
  // Check if route is active
  isActive: (currentPath, routePath, exact = true) => {
    if (exact) return currentPath === routePath;
    return currentPath.startsWith(routePath);
  },
  
  // Get navigation items based on user role
  getNavigation: (userRole) => {
    if (userRole === 'admin') {
      return [...MAIN_NAVIGATION, ...ADMIN_NAVIGATION];
    }
    if (userRole === 'affiliate') {
      return [...MAIN_NAVIGATION, ...AFFILIATE_NAVIGATION];
    }
    return MAIN_NAVIGATION;
  },
  
  // Get user navigation
  getUserNavigation: () => USER_NAVIGATION,
  
  // Get footer navigation
  getFooterNavigation: () => FOOTER_NAVIGATION,
  
  // Get all routes
  getAllRoutes: () => Object.values(ROUTES),
  
  // Get routes by group
  getRoutesByGroup: (group) => ROUTE_GROUP_MAP[group] || [],
  
  // Get public routes
  getPublicRoutes: () => ROUTE_GROUP_MAP[ROUTE_GROUPS.PUBLIC],
  
  // Get auth routes
  getAuthRoutes: () => ROUTE_GROUP_MAP[ROUTE_GROUPS.AUTH],
  
  // Get protected routes
  getProtectedRoutes: () => ROUTE_GROUP_MAP[ROUTE_GROUPS.PROTECTED],
  
  // Get affiliate routes
  getAffiliateRoutes: () => ROUTE_GROUP_MAP[ROUTE_GROUPS.AFFILIATE],
  
  // Get admin routes
  getAdminRoutes: () => ROUTE_GROUP_MAP[ROUTE_GROUPS.ADMIN],
  
  // Get error routes
  getErrorRoutes: () => ROUTE_GROUP_MAP[ROUTE_GROUPS.ERROR],
  
  // Check if route is public
  isPublic: (path) => {
    return ROUTE_GROUP_MAP[ROUTE_GROUPS.PUBLIC].includes(path);
  },
  
  // Check if route is auth
  isAuth: (path) => {
    return ROUTE_GROUP_MAP[ROUTE_GROUPS.AUTH].includes(path);
  },
  
  // Check if route is protected
  isProtected: (path) => {
    return ROUTE_GROUP_MAP[ROUTE_GROUPS.PROTECTED].includes(path);
  },
  
  // Check if route is affiliate
  isAffiliate: (path) => {
    return ROUTE_GROUP_MAP[ROUTE_GROUPS.AFFILIATE].includes(path);
  },
  
  // Check if route is admin
  isAdmin: (path) => {
    return ROUTE_GROUP_MAP[ROUTE_GROUPS.ADMIN].includes(path);
  },
  
  // Check if route is error
  isError: (path) => {
    return ROUTE_GROUP_MAP[ROUTE_GROUPS.ERROR].includes(path);
  },
  
  // Get route from path with params
  getRouteFromPath: (path) => {
    const pathParts = path.split('/').filter(Boolean);
    const routeParts = [];
    
    for (const route of Object.values(ROUTES)) {
      const routeParts = route.split('/').filter(Boolean);
      if (routeParts.length === pathParts.length) {
        let matches = true;
        const params = {};
        
        for (let i = 0; i < routeParts.length; i++) {
          if (routeParts[i].startsWith(':')) {
            params[routeParts[i].slice(1)] = pathParts[i];
          } else if (routeParts[i] !== pathParts[i]) {
            matches = false;
            break;
          }
        }
        
        if (matches) {
          return { route, params };
        }
      }
    }
    
    return { route: ROUTES.NOT_FOUND, params: {} };
  },
  
  // Get route pattern for matching
  getRoutePattern: (route) => {
    return route.replace(/:[^/]+/g, '([^/]+)');
  },
  
  // Match path to route
  matchPath: (path, route) => {
    const pattern = routeHelpers.getRoutePattern(route);
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(path);
  },
  
  // Extract params from path
  extractParams: (path, route) => {
    const params = {};
    const pathParts = path.split('/').filter(Boolean);
    const routeParts = route.split('/').filter(Boolean);
    
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].slice(1)] = pathParts[i];
      }
    }
    
    return params;
  },
};

// ==================== Export all ====================

export default {
  ROUTES,
  ROUTE_GROUPS,
  ROUTE_ICONS,
  ROUTE_TITLES,
  ROUTE_DESCRIPTIONS,
  ROUTE_PERMISSIONS,
  ROUTE_GROUP_MAP,
  ROUTE_BREADCRUMBS,
  MAIN_NAVIGATION,
  USER_NAVIGATION,
  AFFILIATE_NAVIGATION,
  ADMIN_NAVIGATION,
  FOOTER_NAVIGATION,
  routeHelpers,
};
