import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, Navigate, Outlet } from 'react-router-dom';

import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// ==================== Layout Components ====================

// Main Layout
import AdminLayout from './components/layout/AdminLayout';
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import MainLayout from './components/layout/MainLayout';

// ==================== Route Guards ====================

import { AdminGuard, SuperAdminGuard } from './middleware/adminGuard';
import { AuthGuard, GuestGuard, RoleGuard, PermissionGuard } from './middleware/authGuard';

// ==================== Lazy Load Pages ====================

// Public Pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Features = lazy(() => import('./pages/Features'));

// Auth Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const TwoFactorAuth = lazy(() => import('./pages/auth/TwoFactorAuth'));

// Dashboard Pages
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const DashboardOverview = lazy(() => import('./pages/dashboard/Overview'));
const DashboardAnalytics = lazy(() => import('./pages/dashboard/Analytics'));
const DashboardActivity = lazy(() => import('./pages/dashboard/Activity'));

// User Pages
const Profile = lazy(() => import('./pages/user/Profile'));
const Settings = lazy(() => import('./pages/user/Settings'));
const Notifications = lazy(() => import('./pages/user/Notifications'));
const Messages = lazy(() => import('./pages/user/Messages'));

// Affiliate Pages
const AffiliateDashboard = lazy(() => import('./pages/affiliate/Dashboard'));
const AffiliateLinks = lazy(() => import('./pages/affiliate/Links'));
const AffiliateCreateLink = lazy(() => import('./pages/affiliate/CreateLink'));
const AffiliateEditLink = lazy(() => import('./pages/affiliate/EditLink'));
const AffiliateReferrals = lazy(() => import('./pages/affiliate/Referrals'));
const AffiliateEarnings = lazy(() => import('./pages/affiliate/Earnings'));
const AffiliateCommissions = lazy(() => import('./pages/affiliate/Commissions'));
const AffiliatePayouts = lazy(() => import('./pages/affiliate/Payouts'));
const AffiliateAnalytics = lazy(() => import('./pages/affiliate/Analytics'));
const AffiliateProducts = lazy(() => import('./pages/affiliate/Products'));
const AffiliateLeaderboard = lazy(() => import('./pages/affiliate/Leaderboard'));
const AffiliateSettings = lazy(() => import('./pages/affiliate/Settings'));

// Product Pages
const Products = lazy(() => import('./pages/products/Products'));
const ProductDetails = lazy(() => import('./pages/products/ProductDetails'));
const ProductCategories = lazy(() => import('./pages/products/Categories'));

// Payment Pages
const Wallet = lazy(() => import('./pages/payment/Wallet'));
const Transactions = lazy(() => import('./pages/payment/Transactions'));
const Withdrawals = lazy(() => import('./pages/payment/Withdrawals'));
const PaymentMethods = lazy(() => import('./pages/payment/Methods'));

// Support Pages
const Support = lazy(() => import('./pages/support/Support'));
const Tickets = lazy(() => import('./pages/support/Tickets'));
const TicketDetails = lazy(() => import('./pages/support/TicketDetails'));
const CreateTicket = lazy(() => import('./pages/support/CreateTicket'));
const FAQ = lazy(() => import('./pages/support/FAQ'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminUserDetails = lazy(() => import('./pages/admin/UserDetails'));
const AdminUserCreate = lazy(() => import('./pages/admin/UserCreate'));
const AdminUserEdit = lazy(() => import('./pages/admin/UserEdit'));

const AdminAffiliates = lazy(() => import('./pages/admin/Affiliates'));
const AdminAffiliateDetails = lazy(() => import('./pages/admin/AffiliateDetails'));
const AdminAffiliateCreate = lazy(() => import('./pages/admin/AffiliateCreate'));
const AdminAffiliateEdit = lazy(() => import('./pages/admin/AffiliateEdit'));

const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const AdminWithdrawals = lazy(() => import('./pages/admin/Withdrawals'));
const AdminWithdrawalDetails = lazy(() => import('./pages/admin/WithdrawalDetails'));

const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminLogs = lazy(() => import('./pages/admin/Logs'));
const AdminSystem = lazy(() => import('./pages/admin/System'));

// Error Pages
const NotFound = lazy(() => import('./pages/errors/NotFound'));
const ServerError = lazy(() => import('./pages/errors/ServerError'));
const Unauthorized = lazy(() => import('./pages/errors/Unauthorized'));
const Forbidden = lazy(() => import('./pages/errors/Forbidden'));
const Maintenance = lazy(() => import('./pages/errors/Maintenance'));

// Legal Pages
const Privacy = lazy(() => import('./pages/legal/Privacy'));
const Terms = lazy(() => import('./pages/legal/Terms'));
const Cookies = lazy(() => import('./pages/legal/Cookies'));
const GDPR = lazy(() => import('./pages/legal/GDPR'));

// ==================== Loading Fallback ====================

const PageLoader = () => (
  <div className="page-loader">
    <LoadingSpinner size="large" />
  </div>
);

// ==================== Route Error Element ====================

const RouteError = () => {
  return (
    <ErrorBoundary>
      <div>Error loading page</div>
    </ErrorBoundary>
  );
};
// ==================== Route Definitions ====================

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* ===== Public Routes ===== */}
      <Route
        path="/"
        element={
          <Suspense fallback={<PageLoader />}>
            <MainLayout />
          </Suspense>
        }
        errorElement={<RouteError />}
      >
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="features" element={<Features />} />
        
        {/* Legal Pages */}
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="cookies" element={<Cookies />} />
        <Route path="gdpr" element={<GDPR />} />
        
        {/* Public Products */}
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="products/categories" element={<ProductCategories />} />
        
        {/* Public FAQ */}
        <Route path="faq" element={<FAQ />} />
      </Route>

      {/* ===== Auth Routes ===== */}
      <Route
        path="/auth"
        element={
          <GuestGuard>
            <Suspense fallback={<PageLoader />}>
              <AuthLayout />
            </Suspense>
          </GuestGuard>
        }
        errorElement={<RouteError />}
      >
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="verify-email/:token" element={<VerifyEmail />} />
        <Route path="2fa" element={<TwoFactorAuth />} />
      </Route>

      {/* ===== Dashboard Routes ===== */}
      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <Suspense fallback={<PageLoader />}>
              <DashboardLayout />
            </Suspense>
          </AuthGuard>
        }
        errorElement={<RouteError />}
      >
        <Route index element={<Dashboard />} />
        <Route path="overview" element={<DashboardOverview />} />
        <Route path="analytics" element={<DashboardAnalytics />} />
        <Route path="activity" element={<DashboardActivity />} />
      </Route>

      {/* ===== User Routes ===== */}
      <Route
        path="/user"
        element={
          <AuthGuard>
            <Suspense fallback={<PageLoader />}>
              <DashboardLayout />
            </Suspense>
          </AuthGuard>
        }
        errorElement={<RouteError />}
      >
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="messages" element={<Messages />} />
      </Route>

      {/* ===== Affiliate Routes ===== */}
      <Route
        path="/affiliate"
        element={
          <RoleGuard roles={['affiliate', 'admin']}>
            <Suspense fallback={<PageLoader />}>
              <DashboardLayout />
            </Suspense>
          </RoleGuard>
        }
        errorElement={<RouteError />}
      >
        <Route index element={<AffiliateDashboard />} />
        <Route path="dashboard" element={<AffiliateDashboard />} />
        
        {/* Links */}
        <Route path="links" element={<AffiliateLinks />} />
        <Route path="links/create" element={<AffiliateCreateLink />} />
        <Route path="links/:id/edit" element={<AffiliateEditLink />} />
        
        {/* Referrals */}
        <Route path="referrals" element={<AffiliateReferrals />} />
        
        {/* Earnings */}
        <Route path="earnings" element={<AffiliateEarnings />} />
        
        {/* Commissions */}
        <Route path="commissions" element={<AffiliateCommissions />} />
        
        {/* Payouts */}
        <Route path="payouts" element={<AffiliatePayouts />} />
        
        {/* Analytics */}
        <Route path="analytics" element={<AffiliateAnalytics />} />
        
        {/* Products */}
        <Route path="products" element={<AffiliateProducts />} />
        
        {/* Leaderboard */}
        <Route path="leaderboard" element={<AffiliateLeaderboard />} />
        
        {/* Settings */}
        <Route path="settings" element={<AffiliateSettings />} />
      </Route>

      {/* ===== Payment Routes ===== */}
      <Route
        path="/payment"
        element={
          <AuthGuard>
            <Suspense fallback={<PageLoader />}>
              <DashboardLayout />
            </Suspense>
          </AuthGuard>
        }
        errorElement={<RouteError />}
      >
        <Route path="wallet" element={<Wallet />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="withdrawals" element={<Withdrawals />} />
        <Route path="methods" element={<PaymentMethods />} />
      </Route>

      {/* ===== Support Routes ===== */}
      <Route
        path="/support"
        element={
          <AuthGuard>
            <Suspense fallback={<PageLoader />}>
              <MainLayout />
            </Suspense>
          </AuthGuard>
        }
        errorElement={<RouteError />}
      >
        <Route index element={<Support />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="tickets/new" element={<CreateTicket />} />
        <Route path="tickets/:id" element={<TicketDetails />} />
        <Route path="faq" element={<FAQ />} />
      </Route>

      {/* ===== Admin Routes ===== */}
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <Suspense fallback={<PageLoader />}>
              <AdminLayout />
            </Suspense>
          </AdminGuard>
        }
        errorElement={<RouteError />}
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        
        {/* User Management */}
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/create" element={<AdminUserCreate />} />
        <Route path="users/:id" element={<AdminUserDetails />} />
        <Route path="users/:id/edit" element={<AdminUserEdit />} />
        
        {/* Affiliate Management */}
        <Route path="affiliates" element={<AdminAffiliates />} />
        <Route path="affiliates/create" element={<AdminAffiliateCreate />} />
        <Route path="affiliates/:id" element={<AdminAffiliateDetails />} />
        <Route path="affiliates/:id/edit" element={<AdminAffiliateEdit />} />
        
        {/* Payment Management */}
        <Route path="payments" element={<AdminPayments />} />
        <Route path="withdrawals" element={<AdminWithdrawals />} />
        <Route path="withdrawals/:id" element={<AdminWithdrawalDetails />} />
        
        {/* Reports & Analytics */}
        <Route path="reports" element={<AdminReports />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        
        {/* System */}
        <Route path="settings" element={<AdminSettings />} />
        <Route path="logs" element={<AdminLogs />} />
        <Route path="system" element={<AdminSystem />} />
      </Route>
    </>,
  ),
);
// ==================== Super Admin Routes (Nested within Admin) =====
// These need to be added inside the admin route definition
// Add this after the regular admin routes:

{
  /* Super Admin Routes */
}
<Route
  path="super"
  element={
    <SuperAdminGuard>
      <Outlet />
    </SuperAdminGuard>
  }
>
  <Route path="users" element={<AdminUsers />} />
  <Route path="settings" element={<AdminSettings />} />
  <Route path="system" element={<AdminSystem />} />
</Route>;

// ==================== Router Utilities ====================

export const routerUtils = {
  // Get current route
  getCurrentRoute: () => {
    return window.location.pathname;
  },

  // Check if route is active
  isActive: (path, currentPath = window.location.pathname) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  },

  // Get route params
  getParams: (path, routePattern) => {
    const pathParts = path.split('/').filter(Boolean);
    const patternParts = routePattern.split('/').filter(Boolean);
    const params = {};

    patternParts.forEach((part, index) => {
      if (part.startsWith(':')) {
        const paramName = part.slice(1);
        params[paramName] = pathParts[index];
      }
    });

    return params;
  },

  // Build route with params
  buildRoute: (route, params = {}) => {
    let builtRoute = route;
    Object.entries(params).forEach(([key, value]) => {
      builtRoute = builtRoute.replace(`:${key}`, value);
    });
    return builtRoute;
  },

  // Get query params
  getQueryParams: (search = window.location.search) => {
    const params = new URLSearchParams(search);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  },

  // Build query string
  buildQueryString: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  },

  // Navigate with state
  navigateWithState: (navigate, to, state = {}) => {
    navigate(to, { state });
  },

  // Get navigation state
  getNavigationState: (location) => {
    return location.state || {};
  },

  // Check if route has params
  hasParams: (route) => {
    return route.includes(':');
  },

  // Get route name from path
  getRouteName: (path) => {
    const parts = path.split('/').filter(Boolean);
    return parts[parts.length - 1] || 'home';
  },

  // Get parent route
  getParentRoute: (path) => {
    const parts = path.split('/').filter(Boolean);
    parts.pop();
    return '/' + parts.join('/');
  },

  // Get route depth
  getRouteDepth: (path) => {
    return path.split('/').filter(Boolean).length;
  },

  // Check if route is child of parent
  isChildRoute: (childPath, parentPath) => {
    return childPath.startsWith(parentPath) && childPath !== parentPath;
  },

  // Get all possible matches for a path
  getPossibleMatches: (path) => {
    const parts = path.split('/').filter(Boolean);
    const matches = [];

    for (let i = 0; i < parts.length; i++) {
      matches.push('/' + parts.slice(0, i + 1).join('/'));
    }

    return matches;
  },

  // Generate breadcrumbs from path
  generateBreadcrumbs: (path) => {
    const parts = path.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/' }];

    let currentPath = '';
    parts.forEach((part, index) => {
      currentPath += `/${part}`;
      breadcrumbs.push({
        label: part.charAt(0).toUpperCase() + part.slice(1),
        path: currentPath,
      });
    });

    return breadcrumbs;
  },

  // Get route title
  getRouteTitle: (path) => {
    const titles = {
      '/': 'Home',
      '/about': 'About Us',
      '/contact': 'Contact',
      '/pricing': 'Pricing',
      '/features': 'Features',
      '/auth/login': 'Login',
      '/auth/register': 'Register',
      '/auth/forgot-password': 'Forgot Password',
      '/dashboard': 'Dashboard',
      '/user/profile': 'Profile',
      '/user/settings': 'Settings',
      '/affiliate/dashboard': 'Affiliate Dashboard',
      '/affiliate/links': 'Affiliate Links',
      '/affiliate/earnings': 'Earnings',
      '/affiliate/commissions': 'Commissions',
      '/affiliate/payouts': 'Payouts',
      '/payment/wallet': 'Wallet',
      '/payment/transactions': 'Transactions',
      '/payment/withdrawals': 'Withdrawals',
      '/support': 'Support',
      '/support/tickets': 'Support Tickets',
      '/admin': 'Admin Dashboard',
      '/admin/users': 'User Management',
      '/admin/affiliates': 'Affiliate Management',
      '/admin/payments': 'Payment Management',
      '/admin/reports': 'Reports',
      '/admin/settings': 'Admin Settings',
      '/admin/logs': 'System Logs',
      '/404': 'Page Not Found',
      '/500': 'Server Error',
      '/unauthorized': 'Unauthorized',
      '/forbidden': 'Forbidden',
      '/maintenance': 'Maintenance',
    };

    return titles[path] || 'Affiliate Platform';
  },

  // Get route description for SEO
  getRouteDescription: (path) => {
    const descriptions = {
      '/': 'Welcome to our affiliate marketing platform',
      '/about': 'Learn about our company and mission',
      '/contact': 'Get in touch with our team',
      '/features': 'Explore our platform features',
      '/pricing': 'View our pricing plans',
      '/auth/login': 'Login to your account',
      '/auth/register': 'Create a new account',
      '/dashboard': 'Your personal dashboard',
      '/affiliate/dashboard': 'Your affiliate marketing dashboard',
      '/affiliate/links': 'Manage your affiliate links',
      '/affiliate/earnings': 'Track your earnings',
      '/support': 'Get help and support',
      '/admin': 'Administration panel',
      '/privacy': 'Our privacy policy',
      '/terms': 'Terms of service',
    };

    return descriptions[path] || 'Affiliate Marketing Platform';
  },

  // Check if route requires auth
  requiresAuth: (path) => {
    const authRoutes = [
      '/dashboard',
      '/user',
      '/affiliate',
      '/payment',
      '/support/tickets',
    ];
    return authRoutes.some(route => path.startsWith(route));
  },

  // Check if route is admin only
  isAdminRoute: (path) => {
    return path.startsWith('/admin');
  },

  // Check if route is public
  isPublicRoute: (path) => {
    const publicRoutes = [
      '/',
      '/about',
      '/contact',
      '/pricing',
      '/features',
      '/auth',
      '/privacy',
      '/terms',
      '/cookies',
      '/gdpr',
      '/faq',
      '/products',
    ];
    return publicRoutes.some(route => path.startsWith(route));
  },

  // Get route icon
  getRouteIcon: (path) => {
    const icons = {
      '/': '🏠',
      '/dashboard': '📊',
      '/user/profile': '👤',
      '/user/settings': '⚙️',
      '/affiliate': '💰',
      '/affiliate/links': '🔗',
      '/affiliate/earnings': '💵',
      '/payment/wallet': '👛',
      '/payment/transactions': '📝',
      '/support': '❓',
      '/admin': '🛡️',
      '/admin/users': '👥',
      '/admin/reports': '📈',
      '/admin/settings': '🔧',
      '/404': '🚫',
      '/500': '⚠️',
    };

    return icons[path] || '📄';
  },

  // Get route color
  getRouteColor: (path) => {
    const colors = {
      '/': '#667eea',
      '/dashboard': '#48bb78',
      '/user': '#4299e1',
      '/affiliate': '#ed8936',
      '/payment': '#9f7aea',
      '/support': '#f56565',
      '/admin': '#fc8181',
    };

    for (const [key, color] of Object.entries(colors)) {
      if (path.startsWith(key)) return color;
    }

    return '#a0aec0';
  },
};

// ==================== Route Constants ====================

export const ROUTE_PATHS = {
  // Public
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRICING: '/pricing',
  FEATURES: '/features',

  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password/:token',
  VERIFY_EMAIL: '/auth/verify-email/:token',
  TWO_FACTOR: '/auth/2fa',

  // Dashboard
  DASHBOARD: '/dashboard',
  DASHBOARD_OVERVIEW: '/dashboard/overview',
  DASHBOARD_ANALYTICS: '/dashboard/analytics',
  DASHBOARD_ACTIVITY: '/dashboard/activity',

  // User
  USER_PROFILE: '/user/profile',
  USER_SETTINGS: '/user/settings',
  USER_NOTIFICATIONS: '/user/notifications',
  USER_MESSAGES: '/user/messages',

  // Affiliate
  AFFILIATE: '/affiliate',
  AFFILIATE_DASHBOARD: '/affiliate/dashboard',
  AFFILIATE_LINKS: '/affiliate/links',
  AFFILIATE_CREATE_LINK: '/affiliate/links/create',
  AFFILIATE_EDIT_LINK: '/affiliate/links/:id/edit',
  AFFILIATE_REFERRALS: '/affiliate/referrals',
  AFFILIATE_EARNINGS: '/affiliate/earnings',
  AFFILIATE_COMMISSIONS: '/affiliate/commissions',
  AFFILIATE_PAYOUTS: '/affiliate/payouts',
  AFFILIATE_ANALYTICS: '/affiliate/analytics',
  AFFILIATE_PRODUCTS: '/affiliate/products',
  AFFILIATE_LEADERBOARD: '/affiliate/leaderboard',
  AFFILIATE_SETTINGS: '/affiliate/settings',

  // Products
  PRODUCTS: '/products',
  PRODUCT_DETAILS: '/products/:id',
  PRODUCT_CATEGORIES: '/products/categories',

  // Payment
  WALLET: '/payment/wallet',
  TRANSACTIONS: '/payment/transactions',
  WITHDRAWALS: '/payment/withdrawals',
  PAYMENT_METHODS: '/payment/methods',

  // Support
  SUPPORT: '/support',
  SUPPORT_TICKETS: '/support/tickets',
  SUPPORT_CREATE_TICKET: '/support/tickets/new',
  SUPPORT_TICKET_DETAILS: '/support/tickets/:id',
  SUPPORT_FAQ: '/support/faq',

  // Admin
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_CREATE: '/admin/users/create',
  ADMIN_USER_DETAILS: '/admin/users/:id',
  ADMIN_USER_EDIT: '/admin/users/:id/edit',
  ADMIN_AFFILIATES: '/admin/affiliates',
  ADMIN_AFFILIATE_CREATE: '/admin/affiliates/create',
  ADMIN_AFFILIATE_DETAILS: '/admin/affiliates/:id',
  ADMIN_AFFILIATE_EDIT: '/admin/affiliates/:id/edit',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_WITHDRAWALS: '/admin/withdrawals',
  ADMIN_WITHDRAWAL_DETAILS: '/admin/withdrawals/:id',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_LOGS: '/admin/logs',
  ADMIN_SYSTEM: '/admin/system',

  // Legal
  PRIVACY: '/privacy',
  TERMS: '/terms',
  COOKIES: '/cookies',
  GDPR: '/gdpr',

  // Error
  NOT_FOUND: '/404',
  SERVER_ERROR: '/500',
  UNAUTHORIZED: '/unauthorized',
  FORBIDDEN: '/forbidden',
  MAINTENANCE: '/maintenance',
};

// ==================== Export Router ====================

export default router;
