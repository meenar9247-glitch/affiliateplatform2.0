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
  FiLogOut,
  FiLock,
  FiBell,
  FiStar,
  FiAward,
  FiGift,
  FiShoppingCart,
  FiCreditCard,
  FiMessageCircle,
  FiPhone,
  FiMail,
  FiCalendar,
  FiClock,
  FiUpload,
  FiDownload,
  FiShare2,
  FiHeart,
  FiBookmark,
  FiMap,
  FiFlag,
  FiGlobe,
  FiMonitor,
  FiSmartphone,
  FiTablet,
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
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiSliders,
  FiEye,
  FiEyeOff,
  FiPlus,
  FiMinus,
  FiX,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiChevronDown,
  FiMenu,
} from 'react-icons/fi';

// ==================== Menu Constants ====================

export const MENU_TYPES = {
  MAIN: 'main',
  USER: 'user',
  AFFILIATE: 'affiliate',
  ADMIN: 'admin',
  FOOTER: 'footer',
  SIDEBAR: 'sidebar',
  MOBILE: 'mobile',
  DROPDOWN: 'dropdown',
  CONTEXT: 'context',
};

export const MENU_POSITIONS = {
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right',
  CENTER: 'center',
};

export const MENU_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
};

export const MENU_VARIANTS = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  COLLAPSIBLE: 'collapsible',
  MEGA: 'mega',
};

export const MENU_STATES = {
  EXPANDED: 'expanded',
  COLLAPSED: 'collapsed',
  HOVER: 'hover',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  LOADING: 'loading',
};

// ==================== Role-Based Visibility ====================

export const MENU_VISIBILITY = {
  PUBLIC: 'public',
  AUTHENTICATED: 'authenticated',
  GUEST: 'guest',
  USER: 'user',
  AFFILIATE: 'affiliate',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

// ==================== Main Navigation Menu ====================

export const MAIN_MENU = [
  {
    id: 'home',
    title: 'Home',
    path: '/',
    icon: FiHome,
    visibility: MENU_VISIBILITY.PUBLIC,
    order: 1,
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/dashboard',
    icon: FiGrid,
    visibility: MENU_VISIBILITY.AUTHENTICATED,
    order: 2,
  },
  {
    id: 'affiliates',
    title: 'Affiliates',
    path: '/affiliates',
    icon: FiTrendingUp,
    visibility: MENU_VISIBILITY.AFFILIATE,
    children: [
      {
        id: 'affiliate-dashboard',
        title: 'Dashboard',
        path: '/affiliates/dashboard',
        icon: FiGrid,
        visibility: MENU_VISIBILITY.AFFILIATE,
      },
      {
        id: 'affiliate-links',
        title: 'Links',
        path: '/affiliates/links',
        icon: FiLink,
        visibility: MENU_VISIBILITY.AFFILIATE,
      },
      {
        id: 'affiliate-referrals',
        title: 'Referrals',
        path: '/affiliates/referrals',
        icon: FiUsers,
        visibility: MENU_VISIBILITY.AFFILIATE,
      },
      {
        id: 'affiliate-earnings',
        title: 'Earnings',
        path: '/affiliates/earnings',
        icon: FiDollarSign,
        visibility: MENU_VISIBILITY.AFFILIATE,
      },
      {
        id: 'affiliate-commissions',
        title: 'Commissions',
        path: '/affiliates/commissions',
        icon: FiGift,
        visibility: MENU_VISIBILITY.AFFILIATE,
      },
      {
        id: 'affiliate-payouts',
        title: 'Payouts',
        path: '/affiliates/payouts',
        icon: FiCreditCard,
        visibility: MENU_VISIBILITY.AFFILIATE,
      },
      {
        id: 'affiliate-analytics',
        title: 'Analytics',
        path: '/affiliates/analytics',
        icon: FiBarChart2,
        visibility: MENU_VISIBILITY.AFFILIATE,
      },
      {
        id: 'affiliate-products',
        title: 'Products',
        path: '/affiliates/products',
        icon: FiShoppingCart,
        visibility: MENU_VISIBILITY.AFFILIATE,
      },
      {
        id: 'affiliate-leaderboard',
        title: 'Leaderboard',
        path: '/affiliates/leaderboard',
        icon: FiAward,
        visibility: MENU_VISIBILITY.AFFILIATE,
      },
    ],
  },
  {
    id: 'leaderboard',
    title: 'Leaderboard',
    path: '/leaderboard',
    icon: FiAward,
    visibility: MENU_VISIBILITY.AUTHENTICATED,
    order: 3,
  },
  {
    id: 'support',
    title: 'Support',
    path: '/support',
    icon: FiHelpCircle,
    visibility: MENU_VISIBILITY.PUBLIC,
    children: [
      {
        id: 'support-tickets',
        title: 'Tickets',
        path: '/support/tickets',
        icon: FiMessageCircle,
        visibility: MENU_VISIBILITY.AUTHENTICATED,
      },
      {
        id: 'support-faq',
        title: 'FAQ',
        path: '/support/faq',
        icon: FiHelpCircle,
        visibility: MENU_VISIBILITY.PUBLIC,
      },
      {
        id: 'support-contact',
        title: 'Contact',
        path: '/contact',
        icon: FiPhone,
        visibility: MENU_VISIBILITY.PUBLIC,
      },
    ],
  },
  {
    id: 'about',
    title: 'About',
    path: '/about',
    icon: FiInfo,
    visibility: MENU_VISIBILITY.PUBLIC,
    order: 4,
  },
  {
    id: 'contact',
    title: 'Contact',
    path: '/contact',
    icon: FiPhone,
    visibility: MENU_VISIBILITY.PUBLIC,
    order: 5,
  },
];

// ==================== User Menu ====================

export const USER_MENU = [
  {
    id: 'profile',
    title: 'Profile',
    path: '/profile',
    icon: FiUser,
    visibility: MENU_VISIBILITY.AUTHENTICATED,
    order: 1,
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/dashboard',
    icon: FiGrid,
    visibility: MENU_VISIBILITY.AUTHENTICATED,
    order: 2,
  },
  {
    id: 'settings',
    title: 'Settings',
    path: '/settings',
    icon: FiSettings,
    visibility: MENU_VISIBILITY.AUTHENTICATED,
    children: [
      {
        id: 'settings-profile',
        title: 'Profile',
        path: '/settings/profile',
        icon: FiUser,
        visibility: MENU_VISIBILITY.AUTHENTICATED,
      },
      {
        id: 'settings-security',
        title: 'Security',
        path: '/settings/security',
        icon: FiLock,
        visibility: MENU_VISIBILITY.AUTHENTICATED,
      },
      {
        id: 'settings-notifications',
        title: 'Notifications',
        path: '/settings/notifications',
        icon: FiBell,
        visibility: MENU_VISIBILITY.AUTHENTICATED,
      },
      {
        id: 'settings-preferences',
        title: 'Preferences',
        path: '/settings/preferences',
        icon: FiSliders,
        visibility: MENU_VISIBILITY.AUTHENTICATED,
      },
      {
        id: 'settings-payment',
        title: 'Payment',
        path: '/settings/payment',
        icon: FiCreditCard,
        visibility: MENU_VISIBILITY.AFFILIATE,
      },
      {
        id: 'settings-api',
        title: 'API',
        path: '/settings/api',
        icon: FiTool,
        visibility: MENU_VISIBILITY.AFFILIATE,
      },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    path: '/notifications',
    icon: FiBell,
    visibility: MENU_VISIBILITY.AUTHENTICATED,
    badge: 'count',
    order: 3,
  },
  {
    id: 'messages',
    title: 'Messages',
    path: '/messages',
    icon: FiMessageCircle,
    visibility: MENU_VISIBILITY.AUTHENTICATED,
    badge: 'count',
    order: 4,
  },
  {
    id: 'logout',
    title: 'Logout',
    path: '/logout',
    icon: FiLogOut,
    visibility: MENU_VISIBILITY.AUTHENTICATED,
    divider: true,
    order: 999,
  },
];
// ==================== Affiliate Menu ====================

export const AFFILIATE_MENU = [
  {
    id: 'affiliate-dashboard',
    title: 'Dashboard',
    path: '/affiliates/dashboard',
    icon: FiGrid,
    visibility: MENU_VISIBILITY.AFFILIATE,
    order: 1,
  },
  {
    id: 'affiliate-links',
    title: 'Links',
    path: '/affiliates/links',
    icon: FiLink,
    visibility: MENU_VISIBILITY.AFFILIATE,
    children: [
      {
        id: 'affiliate-links-all',
        title: 'All Links',
        path: '/affiliates/links',
        icon: FiLink,
      },
      {
        id: 'affiliate-links-create',
        title: 'Create Link',
        path: '/affiliates/links/create',
        icon: FiPlus,
      },
      {
        id: 'affiliate-links-categories',
        title: 'Categories',
        path: '/affiliates/links/categories',
        icon: FiFilter,
      },
    ],
  },
  {
    id: 'affiliate-referrals',
    title: 'Referrals',
    path: '/affiliates/referrals',
    icon: FiUsers,
    visibility: MENU_VISIBILITY.AFFILIATE,
    children: [
      {
        id: 'affiliate-referrals-all',
        title: 'All Referrals',
        path: '/affiliates/referrals',
        icon: FiUsers,
      },
      {
        id: 'affiliate-referrals-tree',
        title: 'Referral Tree',
        path: '/affiliates/referrals/tree',
        icon: FiShare2,
      },
      {
        id: 'affiliate-referrals-stats',
        title: 'Statistics',
        path: '/affiliates/referrals/stats',
        icon: FiBarChart2,
      },
    ],
  },
  {
    id: 'affiliate-earnings',
    title: 'Earnings',
    path: '/affiliates/earnings',
    icon: FiDollarSign,
    visibility: MENU_VISIBILITY.AFFILIATE,
    children: [
      {
        id: 'affiliate-earnings-overview',
        title: 'Overview',
        path: '/affiliates/earnings',
        icon: FiEye,
      },
      {
        id: 'affiliate-earnings-history',
        title: 'History',
        path: '/affiliates/earnings/history',
        icon: FiClock,
      },
      {
        id: 'affiliate-earnings-reports',
        title: 'Reports',
        path: '/affiliates/earnings/reports',
        icon: FiFileText,
      },
    ],
  },
  {
    id: 'affiliate-commissions',
    title: 'Commissions',
    path: '/affiliates/commissions',
    icon: FiGift,
    visibility: MENU_VISIBILITY.AFFILIATE,
    badge: 'pending',
  },
  {
    id: 'affiliate-payouts',
    title: 'Payouts',
    path: '/affiliates/payouts',
    icon: FiCreditCard,
    visibility: MENU_VISIBILITY.AFFILIATE,
    children: [
      {
        id: 'affiliate-payouts-history',
        title: 'History',
        path: '/affiliates/payouts',
        icon: FiClock,
      },
      {
        id: 'affiliate-payouts-methods',
        title: 'Methods',
        path: '/affiliates/payouts/methods',
        icon: FiSettings,
      },
      {
        id: 'affiliate-payouts-request',
        title: 'Request',
        path: '/affiliates/payouts/request',
        icon: FiUpload,
      },
    ],
  },
  {
    id: 'affiliate-analytics',
    title: 'Analytics',
    path: '/affiliates/analytics',
    icon: FiBarChart2,
    visibility: MENU_VISIBILITY.AFFILIATE,
    children: [
      {
        id: 'affiliate-analytics-overview',
        title: 'Overview',
        path: '/affiliates/analytics',
        icon: FiEye,
      },
      {
        id: 'affiliate-analytics-traffic',
        title: 'Traffic',
        path: '/affiliates/analytics/traffic',
        icon: FiTrendingUp,
      },
      {
        id: 'affiliate-analytics-conversions',
        title: 'Conversions',
        path: '/affiliates/analytics/conversions',
        icon: FiRefreshCw,
      },
      {
        id: 'affiliate-analytics-reports',
        title: 'Reports',
        path: '/affiliates/analytics/reports',
        icon: FiFileText,
      },
    ],
  },
  {
    id: 'affiliate-products',
    title: 'Products',
    path: '/affiliates/products',
    icon: FiShoppingCart,
    visibility: MENU_VISIBILITY.AFFILIATE,
    children: [
      {
        id: 'affiliate-products-all',
        title: 'All Products',
        path: '/affiliates/products',
        icon: FiPackage,
      },
      {
        id: 'affiliate-products-categories',
        title: 'Categories',
        path: '/affiliates/products/categories',
        icon: FiFilter,
      },
      {
        id: 'affiliate-products-search',
        title: 'Search',
        path: '/affiliates/products/search',
        icon: FiSearch,
      },
    ],
  },
  {
    id: 'affiliate-leaderboard',
    title: 'Leaderboard',
    path: '/affiliates/leaderboard',
    icon: FiAward,
    visibility: MENU_VISIBILITY.AFFILIATE,
  },
  {
    id: 'affiliate-settings',
    title: 'Settings',
    path: '/affiliates/settings',
    icon: FiSettings,
    visibility: MENU_VISIBILITY.AFFILIATE,
    divider: true,
    children: [
      {
        id: 'affiliate-settings-profile',
        title: 'Profile',
        path: '/affiliates/settings/profile',
        icon: FiUser,
      },
      {
        id: 'affiliate-settings-payment',
        title: 'Payment',
        path: '/affiliates/settings/payment',
        icon: FiCreditCard,
      },
      {
        id: 'affiliate-settings-notifications',
        title: 'Notifications',
        path: '/affiliates/settings/notifications',
        icon: FiBell,
      },
    ],
  },
];

// ==================== Admin Menu ====================

export const ADMIN_MENU = [
  {
    id: 'admin-dashboard',
    title: 'Dashboard',
    path: '/admin/dashboard',
    icon: FiGrid,
    visibility: MENU_VISIBILITY.ADMIN,
    order: 1,
  },
  {
    id: 'admin-users',
    title: 'Users',
    path: '/admin/users',
    icon: FiUsers,
    visibility: MENU_VISIBILITY.ADMIN,
    order: 2,
    children: [
      {
        id: 'admin-users-all',
        title: 'All Users',
        path: '/admin/users',
        icon: FiUsers,
      },
      {
        id: 'admin-users-create',
        title: 'Create User',
        path: '/admin/users/create',
        icon: FiPlus,
      },
      {
        id: 'admin-users-roles',
        title: 'Roles',
        path: '/admin/users/roles',
        icon: FiShield,
      },
      {
        id: 'admin-users-permissions',
        title: 'Permissions',
        path: '/admin/users/permissions',
        icon: FiLock,
      },
    ],
  },
  {
    id: 'admin-affiliates',
    title: 'Affiliates',
    path: '/admin/affiliates',
    icon: FiTrendingUp,
    visibility: MENU_VISIBILITY.ADMIN,
    order: 3,
    children: [
      {
        id: 'admin-affiliates-all',
        title: 'All Affiliates',
        path: '/admin/affiliates',
        icon: FiUsers,
      },
      {
        id: 'admin-affiliates-create',
        title: 'Create Affiliate',
        path: '/admin/affiliates/create',
        icon: FiPlus,
      },
      {
        id: 'admin-affiliates-levels',
        title: 'Levels',
        path: '/admin/affiliates/levels',
        icon: FiAward,
      },
      {
        id: 'admin-affiliates-commissions',
        title: 'Commissions',
        path: '/admin/affiliates/commissions',
        icon: FiGift,
      },
    ],
  },
  {
    id: 'admin-payments',
    title: 'Payments',
    path: '/admin/payments',
    icon: FiDollarSign,
    visibility: MENU_VISIBILITY.ADMIN,
    order: 4,
    badge: 'pending',
    children: [
      {
        id: 'admin-payments-transactions',
        title: 'Transactions',
        path: '/admin/payments',
        icon: FiCreditCard,
      },
      {
        id: 'admin-payments-withdrawals',
        title: 'Withdrawals',
        path: '/admin/withdrawals',
        icon: FiDownload,
      },
      {
        id: 'admin-payments-pending',
        title: 'Pending',
        path: '/admin/payments/pending',
        icon: FiClock,
      },
      {
        id: 'admin-payments-refunds',
        title: 'Refunds',
        path: '/admin/payments/refunds',
        icon: FiRefreshCw,
      },
    ],
  },
  {
    id: 'admin-reports',
    title: 'Reports',
    path: '/admin/reports',
    icon: FiBarChart2,
    visibility: MENU_VISIBILITY.ADMIN,
    order: 5,
    children: [
      {
        id: 'admin-reports-users',
        title: 'User Reports',
        path: '/admin/reports/users',
        icon: FiUsers,
      },
      {
        id: 'admin-reports-affiliates',
        title: 'Affiliate Reports',
        path: '/admin/reports/affiliates',
        icon: FiTrendingUp,
      },
      {
        id: 'admin-reports-payments',
        title: 'Payment Reports',
        path: '/admin/reports/payments',
        icon: FiDollarSign,
      },
      {
        id: 'admin-reports-earnings',
        title: 'Earnings Reports',
        path: '/admin/reports/earnings',
        icon: FiGift,
      },
      {
        id: 'admin-reports-custom',
        title: 'Custom Reports',
        path: '/admin/reports/custom',
        icon: FiSliders,
      },
    ],
  },
  {
    id: 'admin-analytics',
    title: 'Analytics',
    path: '/admin/analytics',
    icon: FiBarChart2,
    visibility: MENU_VISIBILITY.ADMIN,
    order: 6,
    children: [
      {
        id: 'admin-analytics-overview',
        title: 'Overview',
        path: '/admin/analytics',
        icon: FiEye,
      },
      {
        id: 'admin-analytics-users',
        title: 'User Analytics',
        path: '/admin/analytics/users',
        icon: FiUsers,
      },
      {
        id: 'admin-analytics-affiliates',
        title: 'Affiliate Analytics',
        path: '/admin/analytics/affiliates',
        icon: FiTrendingUp,
      },
      {
        id: 'admin-analytics-traffic',
        title: 'Traffic',
        path: '/admin/analytics/traffic',
        icon: FiGlobe,
      },
      {
        id: 'admin-analytics-conversions',
        title: 'Conversions',
        path: '/admin/analytics/conversions',
        icon: FiRefreshCw,
      },
    ],
  },
  {
    id: 'admin-settings',
    title: 'Settings',
    path: '/admin/settings',
    icon: FiSettings,
    visibility: MENU_VISIBILITY.ADMIN,
    order: 7,
    children: [
      {
        id: 'admin-settings-general',
        title: 'General',
        path: '/admin/settings/general',
        icon: FiSliders,
      },
      {
        id: 'admin-settings-security',
        title: 'Security',
        path: '/admin/settings/security',
        icon: FiLock,
      },
      {
        id: 'admin-settings-payment',
        title: 'Payment',
        path: '/admin/settings/payment',
        icon: FiCreditCard,
      },
      {
        id: 'admin-settings-email',
        title: 'Email',
        path: '/admin/settings/email',
        icon: FiMail,
      },
      {
        id: 'admin-settings-notifications',
        title: 'Notifications',
        path: '/admin/settings/notifications',
        icon: FiBell,
      },
      {
        id: 'admin-settings-api',
        title: 'API',
        path: '/admin/settings/api',
        icon: FiTool,
      },
    ],
  },
  {
    id: 'admin-logs',
    title: 'Logs',
    path: '/admin/logs',
    icon: FiArchive,
    visibility: MENU_VISIBILITY.ADMIN,
    order: 8,
  },
  {
    id: 'admin-system',
    title: 'System',
    path: '/admin/system',
    icon: FiMonitor,
    visibility: MENU_VISIBILITY.ADMIN,
    order: 9,
    children: [
      {
        id: 'admin-system-health',
        title: 'Health',
        path: '/admin/system/health',
        icon: FiHeart,
      },
      {
        id: 'admin-system-backup',
        title: 'Backup',
        path: '/admin/system/backup',
        icon: FiSave,
      },
      {
        id: 'admin-system-maintenance',
        title: 'Maintenance',
        path: '/admin/system/maintenance',
        icon: FiTool,
      },
    ],
  },
];
// ==================== Footer Menu ====================

export const FOOTER_MENU = [
  {
    id: 'company',
    title: 'Company',
    items: [
      {
        id: 'about',
        title: 'About Us',
        path: '/about',
        icon: FiInfo,
      },
      {
        id: 'careers',
        title: 'Careers',
        path: '/careers',
        icon: FiBriefcase,
      },
      {
        id: 'press',
        title: 'Press',
        path: '/press',
        icon: FiFileText,
      },
      {
        id: 'blog',
        title: 'Blog',
        path: '/blog',
        icon: FiBookmark,
      },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    items: [
      {
        id: 'help-center',
        title: 'Help Center',
        path: '/support',
        icon: FiHelpCircle,
      },
      {
        id: 'faq',
        title: 'FAQ',
        path: '/support/faq',
        icon: FiHelpCircle,
      },
      {
        id: 'contact',
        title: 'Contact Us',
        path: '/contact',
        icon: FiPhone,
      },
      {
        id: 'feedback',
        title: 'Feedback',
        path: '/feedback',
        icon: FiMessageSquare,
      },
    ],
  },
  {
    id: 'legal',
    title: 'Legal',
    items: [
      {
        id: 'privacy',
        title: 'Privacy Policy',
        path: '/privacy',
        icon: FiShield,
      },
      {
        id: 'terms',
        title: 'Terms of Service',
        path: '/terms',
        icon: FiFileText,
      },
      {
        id: 'cookies',
        title: 'Cookie Policy',
        path: '/cookies',
        icon: FiInfo,
      },
      {
        id: 'gdpr',
        title: 'GDPR',
        path: '/gdpr',
        icon: FiShield,
      },
    ],
  },
  {
    id: 'social',
    title: 'Social',
    items: [
      {
        id: 'facebook',
        title: 'Facebook',
        href: 'https://facebook.com',
        icon: FiFacebook,
        external: true,
      },
      {
        id: 'twitter',
        title: 'Twitter',
        href: 'https://twitter.com',
        icon: FiTwitter,
        external: true,
      },
      {
        id: 'instagram',
        title: 'Instagram',
        href: 'https://instagram.com',
        icon: FiInstagram,
        external: true,
      },
      {
        id: 'linkedin',
        title: 'LinkedIn',
        href: 'https://linkedin.com',
        icon: FiLinkedin,
        external: true,
      },
      {
        id: 'youtube',
        title: 'YouTube',
        href: 'https://youtube.com',
        icon: FiYoutube,
        external: true,
      },
      {
        id: 'github',
        title: 'GitHub',
        href: 'https://github.com',
        icon: FiGithub,
        external: true,
      },
    ],
  },
];

// ==================== Menu Helpers ====================

export const menuHelpers = {
  // Get menu by type
  getMenu: (type) => {
    switch (type) {
      case MENU_TYPES.MAIN:
        return MAIN_MENU;
      case MENU_TYPES.USER:
        return USER_MENU;
      case MENU_TYPES.AFFILIATE:
        return AFFILIATE_MENU;
      case MENU_TYPES.ADMIN:
        return ADMIN_MENU;
      case MENU_TYPES.FOOTER:
        return FOOTER_MENU;
      default:
        return [];
    }
  },

  // Filter menu by visibility
  filterByVisibility: (menu, userRole = null, isAuthenticated = false) => {
    const filterItems = (items) => {
      return items.filter(item => {
        // Check visibility
        if (item.visibility === MENU_VISIBILITY.PUBLIC) return true;
        if (item.visibility === MENU_VISIBILITY.GUEST && !isAuthenticated) return true;
        if (item.visibility === MENU_VISIBILITY.AUTHENTICATED && isAuthenticated) return true;
        if (item.visibility === MENU_VISIBILITY.USER && userRole === 'user') return true;
        if (item.visibility === MENU_VISIBILITY.AFFILIATE && userRole === 'affiliate') return true;
        if (item.visibility === MENU_VISIBILITY.ADMIN && userRole === 'admin') return true;
        if (item.visibility === MENU_VISIBILITY.SUPER_ADMIN && userRole === 'super_admin') return true;
        
        // Filter children
        if (item.children) {
          item.children = filterItems(item.children);
          return item.children.length > 0;
        }
        
        return false;
      });
    };
    
    return filterItems(menu);
  },

  // Sort menu by order
  sortByOrder: (menu) => {
    const sortItems = (items) => {
      const sorted = [...items].sort((a, b) => (a.order || 999) - (b.order || 999));
      
      sorted.forEach(item => {
        if (item.children) {
          item.children = sortItems(item.children);
        }
      });
      
      return sorted;
    };
    
    return sortItems(menu);
  },

  // Find menu item by path
  findItemByPath: (menu, path) => {
    for (const item of menu) {
      if (item.path === path) return item;
      if (item.children) {
        const found = menuHelpers.findItemByPath(item.children, path);
        if (found) return found;
      }
    }
    return null;
  },

  // Get breadcrumbs from path
  getBreadcrumbs: (menu, path) => {
    const breadcrumbs = [];
    
    const findPath = (items, currentPath) => {
      for (const item of items) {
        if (item.path === currentPath) {
          breadcrumbs.push(item);
          return true;
        }
        if (item.children) {
          if (findPath(item.children, currentPath)) {
            breadcrumbs.unshift(item);
            return true;
          }
        }
      }
      return false;
    };
    
    findPath(menu, path);
    return breadcrumbs;
  },

  // Get active menu items
  getActiveItems: (menu, currentPath) => {
    const active = [];
    
    const checkActive = (items) => {
      for (const item of items) {
        if (item.path === currentPath) {
          active.push(item.id);
          return true;
        }
        if (item.children) {
          if (checkActive(item.children)) {
            active.push(item.id);
            return true;
          }
        }
      }
      return false;
    };
    
    checkActive(menu);
    return active;
  },

  // Build menu tree
  buildTree: (items, parentId = null) => {
    return items
      .filter(item => item.parentId === parentId)
      .map(item => ({
        ...item,
        children: menuHelpers.buildTree(items, item.id),
      }));
  },

  // Flatten menu
  flattenMenu: (items) => {
    let flat = [];
    
    items.forEach(item => {
      flat.push(item);
      if (item.children) {
        flat = [...flat, ...menuHelpers.flattenMenu(item.children)];
      }
    });
    
    return flat;
  },

  // Get all paths
  getAllPaths: (menu) => {
    const paths = [];
    
    const collectPaths = (items) => {
      items.forEach(item => {
        if (item.path) paths.push(item.path);
        if (item.children) collectPaths(item.children);
      });
    };
    
    collectPaths(menu);
    return paths;
  },

  // Check if menu item has children
  hasChildren: (item) => {
    return !!(item.children && item.children.length > 0);
  },

  // Get menu item depth
  getDepth: (item, menu, depth = 0) => {
    if (!item.parentId) return depth;
    
    const parent = menuHelpers.findItemByPath(menu, item.parentId);
    if (parent) {
      return menuHelpers.getDepth(parent, menu, depth + 1);
    }
    
    return depth;
  },

  // Generate menu item ID
  generateId: (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  },

  // Validate menu item
  validateItem: (item) => {
    const errors = [];
    
    if (!item.id) errors.push('Missing id');
    if (!item.title) errors.push('Missing title');
    if (!item.path && !item.children && !item.href) errors.push('Missing path or href');
    
    return {
      valid: errors.length === 0,
      errors,
    };
  },

  // Validate entire menu
  validateMenu: (menu) => {
    const errors = [];
    const ids = new Set();
    
    const validate = (items, parentId = null) => {
      items.forEach((item, index) => {
        // Check for duplicate IDs
        if (ids.has(item.id)) {
          errors.push(`Duplicate ID: ${item.id}`);
        } else {
          ids.add(item.id);
        }
        
        // Validate item
        const validation = menuHelpers.validateItem(item);
        if (!validation.valid) {
          errors.push(`Item ${item.id}: ${validation.errors.join(', ')}`);
        }
        
        // Validate children
        if (item.children) {
          validate(item.children, item.id);
        }
      });
    };
    
    validate(menu);
    
    return {
      valid: errors.length === 0,
      errors,
    };
  },

  // Get menu statistics
  getStats: (menu) => {
    const flat = menuHelpers.flattenMenu(menu);
    
    return {
      totalItems: flat.length,
      totalDepth: Math.max(...flat.map(item => menuHelpers.getDepth(item, menu))),
      totalParents: flat.filter(item => menuHelpers.hasChildren(item)).length,
      totalLeaves: flat.filter(item => !menuHelpers.hasChildren(item)).length,
      totalPaths: menuHelpers.getAllPaths(menu).length,
    };
  },
};

// ==================== Export all ====================

export const menuConfig = {
  // Types
  MENU_TYPES,
  MENU_POSITIONS,
  MENU_SIZES,
  MENU_VARIANTS,
  MENU_STATES,
  MENU_VISIBILITY,
  
  // Menus
  MAIN_MENU,
  USER_MENU,
  AFFILIATE_MENU,
  ADMIN_MENU,
  FOOTER_MENU,
  
  // Helpers
  menuHelpers,
};

export default menuConfig;
