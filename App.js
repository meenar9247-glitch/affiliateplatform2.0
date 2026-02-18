import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HelmetProvider } from 'react-helmet-async';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import Dashboard from './pages/dashboard/Dashboard';
import AffiliateLinks from './pages/affiliates/AffiliateLinks';
import MyReferrals from './pages/referrals/MyReferrals';
import Earnings from './pages/earnings/Earnings';
import Wallet from './pages/wallet/Wallet';
import Withdrawals from './pages/withdrawals/Withdrawals';
import Analytics from './pages/analytics/Analytics';
import Leaderboard from './pages/leaderboard/Leaderboard';
import Settings from './pages/settings/Settings';
import Support from './pages/support/Support';
import Privacy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminAffiliates from './pages/admin/Affiliates';
import AdminWithdrawals from './pages/admin/Withdrawals';
import AdminSettings from './pages/admin/Settings';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Context
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Styles
import './index.css';

const queryClient = new QueryClient();
const paypalOptions = {
  clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || 'test',
  currency: 'USD',
};

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <PayPalScriptProvider options={paypalOptions}>
          <Router>
            <AuthProvider>
              <ThemeProvider>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                  <Navbar />
                  <main className="pt-16">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password/:token" element={<ResetPassword />} />
                      <Route path="/verify-email/:token" element={<VerifyEmail />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
                      
                      {/* Protected User Routes */}
                      <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/affiliates" element={<AffiliateLinks />} />
                        <Route path="/referrals" element={<MyReferrals />} />
                        <Route path="/earnings" element={<Earnings />} />
                        <Route path="/wallet" element={<Wallet />} />
                        <Route path="/withdrawals" element={<Withdrawals />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/support" element={<Support />} />
                      </Route>
                      
                      {/* Protected Admin Routes */}
                      <Route element={<AdminRoute />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/users" element={<AdminUsers />} />
                        <Route path="/admin/affiliates" element={<AdminAffiliates />} />
                        <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
                        <Route path="/admin/settings" element={<AdminSettings />} />
                      </Route>
                    </Routes>
                  </main>
                  <Footer />
                  <Toaster 
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                    }}
                  />
                </div>
              </ThemeProvider>
            </AuthProvider>
          </Router>
        </PayPalScriptProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;