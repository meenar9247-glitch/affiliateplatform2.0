import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Analyticsas as VercelAnalytics } from '@vercel/analytics/react';
import BackToTop from './components/common/BackToTop';
import CookieConsent from './components/common/CookieConsent';
import Maintenance from './components/common/Maintenance';
import OfflineIndicator from './components/common/OfflineIndicator';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { AuthProvider , useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider , useTheme } from './context/ThemeContext';
import { WishlistProvider } from './context/WishlistContext';
import { SpeedInsights } from '@vercel/speed-insights/react'; 

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const AffiliateLinks = lazy(() => import('./pages/affiliates/AffiliateLinks'));
const MyReferrals = lazy(() => import('./pages/referrals/MyReferrals'));
const Earnings = lazy(() => import('./pages/earnings/Earnings'));
const Wallet = lazy(() => import('./pages/wallet/Wallet'));
const Withdrawals = lazy(() => import('./pages/withdrawals/Withdrawals'));
const Leaderboard = lazy(() => import('./pages/leaderboard/Leaderboard'));
const Settings = lazy(() => import('./pages/settings/Settings'));
const Privacy = lazy(() => import('./pages/legal/Privacy'));
const Terms = lazy(() => import('./pages/legal/Terms'));
const Cookies = lazy(() => import('./pages/legal/Cookies'));
const GDPR = lazy(() => import('./pages/legal/GDPR'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminAffiliates = lazy(() => import('./pages/admin/Affiliates'));
const AdminWithdrawals = lazy(() => import('./pages/admin/Withdrawals'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));
const AdminLogs = lazy(() => import('./pages/admin/Logs'));
const AdminSystem = lazy(() => import('./pages/admin/System'));

// Support Pages
const Support = lazy(() => import('./pages/support/Support'));
const Tickets = lazy(() => import('./pages/support/Tickets'));
const TicketDetails = lazy(() => import('./pages/support/TicketDetails'));
const CreateTicket = lazy(() => import('./pages/support/CreateTicket'));
const FAQ = lazy(() => import('./pages/support/FAQ'));

// Error Pages
const NotFound = lazy(() => import('./pages/errors/NotFound'));
const ServerError = lazy(() => import('./pages/errors/ServerError'));
const Unauthorized = lazy(() => import('./pages/errors/Unauthorized'));

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import MobileMenu from './components/layout/MobileMenu';

// Styles
import './App.css';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});

// PayPal Configuration
const paypalOptions = {
  clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || 'test',
  currency: 'USD',
  intent: 'capture',
};

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = 'user' }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }
  
  if (requiredRole === 'admin' && user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  if (requiredRole === 'affiliate' && !['affiliate', 'admin'].includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Layout Component
const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme } = useTheme();
  
  return (
    <div className={`app ${theme}`}>
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <MobileMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="main-content">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </main>
      
      <Footer />
      <BackToTop />
      <OfflineIndicator />
      <CookieConsent />
    </div>
  );
};      
// Main App Component
function App() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [appVersion] = useState('1.0.0');

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const response = await fetch('/api/maintenance');
        const data = await response.json();
        setIsMaintenance(data.maintenance);
      } catch (error) {
        console.error('Failed to check maintenance mode:', error);
      }
    };
    
    checkMaintenance();
    
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(error => {
          console.error('Service worker registration failed:', error);
        });
      });
    }
  }, []);

  if (isMaintenance) {
    return <Maintenance />;
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <PayPalScriptProvider options={paypalOptions}>
          <BrowserRouter>
            <AuthProvider>
              <ThemeProvider>
                <NotificationProvider>
                  <SocketProvider>
                    <CartProvider>
                      <WishlistProvider>
                        <CurrencyProvider>
                          <LanguageProvider>
                            <Layout>
                              <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={
                                  <PublicRoute>
                                    <Login />
                                  </PublicRoute>
                                } />
                                <Route path="/register" element={
                                  <PublicRoute>
                                    <Register />
                                  </PublicRoute>
                                } />
                                <Route path="/forgot-password" element={
                                  <PublicRoute>
                                    <ForgotPassword />
                                  </PublicRoute>
                                } />
                                <Route path="/reset-password/:token" element={
                                  <PublicRoute>
                                    <ResetPassword />
                                  </PublicRoute>
                                } />
                                <Route path="/verify-email/:token" element={
                                  <PublicRoute>
                                    <VerifyEmail />
                                  </PublicRoute>
                                } />
                                
                                {/* Legal Pages */}
                                <Route path="/privacy" element={<Privacy />} />
                                <Route path="/terms" element={<Terms />} />
                                <Route path="/cookies" element={<Cookies />} />
                                <Route path="/gdpr" element={<GDPR />} />
                                
                                {/* Protected User Routes */}
                                <Route path="/dashboard" element={
                                  <ProtectedRoute>
                                    <Dashboard />
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="/affiliates" element={
                                  <ProtectedRoute requiredRole="affiliate">
                                    <AffiliateLinks />
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="/referrals" element={
                                  <ProtectedRoute>
                                    <MyReferrals />
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="/earnings" element={
                                  <ProtectedRoute>
                                    <Earnings />
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="/wallet" element={
                                  <ProtectedRoute>
                                    <Wallet />
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="/withdrawals" element={
                                  <ProtectedRoute>
                                    <Withdrawals />
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="/analytics" element={
                                  <ProtectedRoute requiredRole="affiliate">
                                    <Analytics />
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="/leaderboard" element={<Leaderboard />} />
                                
                                <Route path="/settings" element={
                                  <ProtectedRoute>
                                    <Settings />
                                  </ProtectedRoute>
                                } />
                                
                                {/* Support Routes */}
                                <Route path="/support" element={
                                  <ProtectedRoute>
                                    <Support />
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="/support/tickets" element={
                                  <ProtectedRoute>
                                    <Tickets />
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="/support/tickets/new" element={
                                  <ProtectedRoute>
                                    <CreateTicket />
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="/support/tickets/:id" element={
                                  <ProtectedRoute>
                                    <TicketDetails />
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="/support/faq" element={<FAQ />} />
                                
                                {/* Admin Routes */}
                                <Route path="/admin" element={
                                  <AdminRoute>
                                    <AdminDashboard />
                                  </AdminRoute>
                                } />
                                
                                <Route path="/admin/users" element={
                                  <AdminRoute>
                                    <AdminUsers />
                                  </AdminRoute>
                                } />
                                
                                <Route path="/admin/affiliates" element={
                                  <AdminRoute>
                                    <AdminAffiliates />
                                  </AdminRoute>
                                } />
                                
                                <Route path="/admin/withdrawals" element={
                                  <AdminRoute>
                                    <AdminWithdrawals />
                                  </AdminRoute>
                                } />
                                
                                <Route path="/admin/settings" element={
                                  <AdminRoute>
                                    <AdminSettings />
                                  </AdminRoute>
                                } />
                                
                                <Route path="/admin/reports" element={
                                  <AdminRoute>
                                    <AdminReports />
                                  </AdminRoute>
                                } />
                                
                                <Route path="/admin/analytics" element={
                                  <AdminRoute>
                                    <AdminAnalytics />
                                  </AdminRoute>
                                } />
                                
                                <Route path="/admin/logs" element={
                                  <AdminRoute>
                                    <AdminLogs />
                                  </AdminRoute>
                                } />
                                
                                <Route path="/admin/system" element={
                                  <AdminRoute>
                                    <AdminSystem />
                                  </AdminRoute>
                                } />
                                
                                {/* Error Routes */}
                                <Route path="/404" element={<NotFound />} />
                                <Route path="/500" element={<ServerError />} />
                                <Route path="/unauthorized" element={<Unauthorized />} />
                                
                                {/* Catch all route - 404 */}
                                <Route path="*" element={<NotFound />} />
                              </Routes>
                            </Layout>
                          </LanguageProvider>
                        </CurrencyProvider>
                      </WishlistProvider>
                    </CartProvider>
                  </SocketProvider>
                </NotificationProvider>
              </ThemeProvider>
            </AuthProvider>
          </BrowserRouter>
        </PayPalScriptProvider>
      </QueryClientProvider>
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '14px',
          },
          success: {
            icon: '✅',
            style: {
              background: '#28a745',
            },
          },
          error: {
            icon: '❌',
            style: {
              background: '#dc3545',
            },
          },
          loading: {
            icon: '⏳',
            style: {
              background: '#ffc107',
            },
          },
        }}
      />
      
      {/* Analytics */}
      <vercelAnalytics />
      <SpeedInsights />
      
      {/* App Version Indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          zIndex: 9999,
        }}>
          v{appVersion} - {process.env.NODE_ENV}
        </div>
      )}
    </HelmetProvider>
  );
}
// Styles for App component
const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  .app.light {
    background-color: #f8f9fa;
    color: #333;
  }

  .app.dark {
    background-color: #1a1a2e;
    color: #f8f9fa;
  }

  .main-content {
    flex: 1;
    padding-top: 70px;
    min-height: calc(100vh - 70px);
  }

  .loading-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }

  .loading-spinner.full-screen {
    min-height: 100vh;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: #667eea;
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #764ba2;
  }

  .dark ::-webkit-scrollbar-track {
    background: #2d3748;
  }

  .dark ::-webkit-scrollbar-thumb {
    background: #667eea;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .text-center {
    text-align: center;
  }

  .mt-1 { margin-top: 0.25rem; }
  .mt-2 { margin-top: 0.5rem; }
  .mt-3 { margin-top: 1rem; }
  .mt-4 { margin-top: 1.5rem; }
  .mt-5 { margin-top: 2rem; }

  .mb-1 { margin-bottom: 0.25rem; }
  .mb-2 { margin-bottom: 0.5rem; }
  .mb-3 { margin-bottom: 1rem; }
  .mb-4 { margin-bottom: 1.5rem; }
  .mb-5 { margin-bottom: 2rem; }

  .p-1 { padding: 0.25rem; }
  .p-2 { padding: 0.5rem; }
  .p-3 { padding: 1rem; }
  .p-4 { padding: 1.5rem; }
  .p-5 { padding: 2rem; }

  .fade-enter {
    opacity: 0;
  }

  .fade-enter-active {
    opacity: 1;
    transition: opacity 300ms ease-in;
  }

  .fade-exit {
    opacity: 1;
  }

  .fade-exit-active {
    opacity: 0;
    transition: opacity 300ms ease-in;
  }

  .slide-enter {
    transform: translateX(100%);
  }

  .slide-enter-active {
    transform: translateX(0);
    transition: transform 300ms ease-in-out;
  }

  .slide-exit {
    transform: translateX(0);
  }

  .slide-exit-active {
    transform: translateX(-100%);
    transition: transform 300ms ease-in-out;
  }

  @media (max-width: 768px) {
    .main-content {
      padding-top: 60px;
    }

    .container {
      padding: 0 15px;
    }

    ::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }
  }

  @media (max-width: 480px) {
    .main-content {
      padding-top: 55px;
    }

    .container {
      padding: 0 10px;
    }
  }

  @media print {
    .no-print {
      display: none !important;
    }

    .main-content {
      padding-top: 0;
    }
  }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default App;






