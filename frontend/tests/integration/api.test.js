import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { configureStore } from '@reduxjs/toolkit';
import { authService } from '../../src/services/authService';
import { userService } from '../../src/services/userService';
import { affiliateService } from '../../src/services/affiliateService';
import { paymentService } from '../../src/services/paymentService';
import { supportService } from '../../src/services/supportService';
import { notificationService } from '../../src/services/notificationService';
import { analyticsService } from '../../src/services/analyticsService';
import { adminService } from '../../src/services/adminService';

// Mock axios
const mockAxios = new MockAdapter(axios);

// ==================== Test Data ====================

const mockUser = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  role: 'user',
  isEmailVerified: true,
  isPhoneVerified: false,
  twoFactorEnabled: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T10:30:00.000Z'
};

const mockAdmin = {
  ...mockUser,
  id: '456',
  email: 'admin@example.com',
  role: 'admin'
};

const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';
const mockRefreshToken = 'refresh-token-123';

const mockProduct = {
  id: 'prod1',
  name: 'Test Product',
  description: 'Test Description',
  price: 99.99,
  commission: 10,
  category: 'electronics',
  image: 'https://example.com/image.jpg',
  stock: 100,
  isActive: true
};

const mockTransaction = {
  id: 'txn1',
  userId: '123',
  amount: 99.99,
  currency: 'USD',
  status: 'completed',
  type: 'payment',
  createdAt: '2024-01-15T10:30:00.000Z'
};

const mockWithdrawal = {
  id: 'wd1',
  userId: '123',
  amount: 50.00,
  method: 'paypal',
  status: 'pending',
  createdAt: '2024-01-15T10:30:00.000Z'
};

const mockReferral = {
  id: 'ref1',
  userId: '123',
  referralCode: 'ABC123',
  clicks: 150,
  conversions: 12,
  earnings: 45.50,
  createdAt: '2024-01-15T10:30:00.000Z'
};

const mockTicket = {
  id: 'ticket1',
  userId: '123',
  subject: 'Test Ticket',
  message: 'Test message',
  status: 'open',
  priority: 'medium',
  createdAt: '2024-01-15T10:30:00.000Z'
};

const mockNotification = {
  id: 'notif1',
  userId: '123',
  type: 'info',
  title: 'Test Notification',
  message: 'Test message',
  read: false,
  createdAt: '2024-01-15T10:30:00.000Z'
};

// ==================== Test Setup ====================

beforeEach(() => {
  mockAxios.reset();
  localStorage.clear();
  sessionStorage.clear();
  jest.clearAllMocks();
});

afterEach(() => {
  mockAxios.reset();
});

// ==================== Auth API Tests ====================

describe('Auth API Integration Tests', () => {
  describe('POST /api/auth/login', () => {
    test('should successfully login with valid credentials', async () => {
      mockAxios.onPost('/api/auth/login').reply(200, {
        success: true,
        user: mockUser,
        token: mockToken,
        refreshToken: mockRefreshToken
      });

      const response = await authService.login('john@example.com', 'password123');

      expect(response.success).toBe(true);
      expect(response.user).toEqual(mockUser);
      expect(response.token).toBe(mockToken);
      expect(response.refreshToken).toBe(mockRefreshToken);
    });

    test('should handle invalid credentials', async () => {
      mockAxios.onPost('/api/auth/login').reply(401, {
        success: false,
        message: 'Invalid email or password'
      });

      await expect(
        authService.login('wrong@example.com', 'wrongpass')
      ).rejects.toThrow('Invalid email or password');
    });

    test('should handle account lockout after multiple attempts', async () => {
      mockAxios.onPost('/api/auth/login').reply(429, {
        success: false,
        message: 'Too many login attempts. Account locked for 30 minutes.'
      });

      await expect(
        authService.login('john@example.com', 'password123')
      ).rejects.toThrow('Too many login attempts. Account locked for 30 minutes.');
    });

    test('should handle server error', async () => {
      mockAxios.onPost('/api/auth/login').reply(500, {
        success: false,
        message: 'Internal server error'
      });

      await expect(
        authService.login('john@example.com', 'password123')
      ).rejects.toThrow('Internal server error');
    });
  });

  describe('POST /api/auth/register', () => {
    test('should successfully register new user', async () => {
      const newUser = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123!'
      };

      mockAxios.onPost('/api/auth/register').reply(201, {
        success: true,
        user: { ...mockUser, ...newUser },
        token: mockToken,
        refreshToken: mockRefreshToken
      });

      const response = await authService.register(newUser);

      expect(response.success).toBe(true);
      expect(response.user.name).toBe(newUser.name);
      expect(response.user.email).toBe(newUser.email);
    });

    test('should handle duplicate email', async () => {
      mockAxios.onPost('/api/auth/register').reply(409, {
        success: false,
        message: 'Email already exists'
      });

      await expect(
        authService.register({
          name: 'John Doe',
          email: 'existing@example.com',
          password: 'Password123!'
        })
      ).rejects.toThrow('Email already exists');
    });

    test('should handle validation errors', async () => {
      mockAxios.onPost('/api/auth/register').reply(422, {
        success: false,
        message: 'Validation failed',
        errors: {
          email: ['Email is invalid'],
          password: ['Password must be at least 8 characters']
        }
      });

      await expect(
        authService.register({
          name: 'John Doe',
          email: 'invalid-email',
          password: 'short'
        })
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should successfully logout', async () => {
      mockAxios.onPost('/api/auth/logout').reply(200, {
        success: true,
        message: 'Logged out successfully'
      });

      const response = await authService.logout();

      expect(response.success).toBe(true);
      expect(response.message).toBe('Logged out successfully');
    });

    test('should handle logout error', async () => {
      mockAxios.onPost('/api/auth/logout').reply(500, {
        success: false,
        message: 'Logout failed'
      });

      await expect(authService.logout()).rejects.toThrow('Logout failed');
    });
  });

  describe('POST /api/auth/refresh', () => {
    test('should successfully refresh token', async () => {
      mockAxios.onPost('/api/auth/refresh').reply(200, {
        success: true,
        token: 'new-token',
        refreshToken: 'new-refresh-token'
      });

      const response = await authService.refreshToken(mockRefreshToken);

      expect(response.success).toBe(true);
      expect(response.token).toBe('new-token');
      expect(response.refreshToken).toBe('new-refresh-token');
    });

    test('should handle invalid refresh token', async () => {
      mockAxios.onPost('/api/auth/refresh').reply(401, {
        success: false,
        message: 'Invalid refresh token'
      });

      await expect(
        authService.refreshToken('invalid-token')
      ).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('POST /api/auth/verify-email', () => {
    test('should successfully verify email', async () => {
      const token = 'verify-token-123';
      mockAxios.onPost('/api/auth/verify-email').reply(200, {
        success: true,
        message: 'Email verified successfully'
      });

      const response = await authService.verifyEmail(token);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Email verified successfully');
    });

    test('should handle invalid verification token', async () => {
      mockAxios.onPost('/api/auth/verify-email').reply(400, {
        success: false,
        message: 'Invalid or expired token'
      });

      await expect(
        authService.verifyEmail('invalid-token')
      ).rejects.toThrow('Invalid or expired token');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    test('should successfully send password reset email', async () => {
      mockAxios.onPost('/api/auth/forgot-password').reply(200, {
        success: true,
        message: 'Password reset email sent'
      });

      const response = await authService.forgotPassword('john@example.com');

      expect(response.success).toBe(true);
      expect(response.message).toBe('Password reset email sent');
    });

    test('should handle non-existent email', async () => {
      mockAxios.onPost('/api/auth/forgot-password').reply(404, {
        success: false,
        message: 'Email not found'
      });

      await expect(
        authService.forgotPassword('nonexistent@example.com')
      ).rejects.toThrow('Email not found');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    test('should successfully reset password', async () => {
      const token = 'reset-token-123';
      const newPassword = 'NewPassword123!';

      mockAxios.onPost('/api/auth/reset-password').reply(200, {
        success: true,
        message: 'Password reset successfully'
      });

      const response = await authService.resetPassword(token, newPassword);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Password reset successfully');
    });

    test('should handle invalid reset token', async () => {
      mockAxios.onPost('/api/auth/reset-password').reply(400, {
        success: false,
        message: 'Invalid or expired token'
      });

      await expect(
        authService.resetPassword('invalid-token', 'newpass')
      ).rejects.toThrow('Invalid or expired token');
    });
  });
});
// ==================== User API Tests ====================

describe('User API Integration Tests', () => {
  describe('GET /api/user/profile', () => {
    test('should fetch user profile successfully', async () => {
      mockAxios.onGet('/api/user/profile').reply(200, {
        success: true,
        user: mockUser
      });

      const response = await userService.getProfile();

      expect(response.success).toBe(true);
      expect(response.user).toEqual(mockUser);
    });

    test('should handle unauthorized access', async () => {
      mockAxios.onGet('/api/user/profile').reply(401, {
        success: false,
        message: 'Unauthorized'
      });

      await expect(userService.getProfile()).rejects.toThrow('Unauthorized');
    });
  });

  describe('PUT /api/user/profile', () => {
    test('should update user profile successfully', async () => {
      const updatedData = {
        name: 'John Updated',
        phone: '+1987654321'
      };

      mockAxios.onPut('/api/user/profile').reply(200, {
        success: true,
        user: { ...mockUser, ...updatedData }
      });

      const response = await userService.updateProfile(updatedData);

      expect(response.success).toBe(true);
      expect(response.user.name).toBe(updatedData.name);
      expect(response.user.phone).toBe(updatedData.phone);
    });

    test('should handle validation errors', async () => {
      mockAxios.onPut('/api/user/profile').reply(422, {
        success: false,
        message: 'Validation failed',
        errors: {
          phone: ['Invalid phone number']
        }
      });

      await expect(
        userService.updateProfile({ phone: 'invalid' })
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('POST /api/user/avatar', () => {
    test('should upload avatar successfully', async () => {
      const formData = new FormData();
      formData.append('avatar', new File(['test'], 'avatar.jpg'));

      mockAxios.onPost('/api/user/avatar').reply(200, {
        success: true,
        avatarUrl: 'https://example.com/avatar.jpg'
      });

      const response = await userService.uploadAvatar(formData);

      expect(response.success).toBe(true);
      expect(response.avatarUrl).toBeDefined();
    });

    test('should handle file too large', async () => {
      mockAxios.onPost('/api/user/avatar').reply(413, {
        success: false,
        message: 'File too large'
      });

      await expect(
        userService.uploadAvatar(new FormData())
      ).rejects.toThrow('File too large');
    });
  });

  describe('GET /api/user/settings', () => {
    test('should fetch user settings successfully', async () => {
      const mockSettings = {
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          push: false
        }
      };

      mockAxios.onGet('/api/user/settings').reply(200, {
        success: true,
        settings: mockSettings
      });

      const response = await userService.getSettings();

      expect(response.success).toBe(true);
      expect(response.settings).toEqual(mockSettings);
    });
  });

  describe('PUT /api/user/settings', () => {
    test('should update user settings successfully', async () => {
      const updatedSettings = {
        theme: 'light',
        language: 'es'
      };

      mockAxios.onPut('/api/user/settings').reply(200, {
        success: true,
        settings: updatedSettings
      });

      const response = await userService.updateSettings(updatedSettings);

      expect(response.success).toBe(true);
      expect(response.settings).toEqual(updatedSettings);
    });
  });

  describe('GET /api/user/activity', () => {
    test('should fetch user activity successfully', async () => {
      const mockActivity = [
        { id: 1, action: 'login', timestamp: '2024-01-15T10:30:00Z' },
        { id: 2, action: 'profile_update', timestamp: '2024-01-14T15:45:00Z' }
      ];

      mockAxios.onGet('/api/user/activity').reply(200, {
        success: true,
        activity: mockActivity,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          hasMore: false
        }
      });

      const response = await userService.getActivity();

      expect(response.success).toBe(true);
      expect(response.activity).toEqual(mockActivity);
      expect(response.pagination).toBeDefined();
    });
  });
});

// ==================== Affiliate API Tests ====================

describe('Affiliate API Integration Tests', () => {
  describe('GET /api/affiliate/dashboard', () => {
    test('should fetch affiliate dashboard successfully', async () => {
      const mockDashboard = {
        stats: {
          clicks: 1250,
          conversions: 98,
          earnings: 450.50,
          conversionRate: 7.84
        },
        recentActivity: [],
        topLinks: []
      };

      mockAxios.onGet('/api/affiliate/dashboard').reply(200, {
        success: true,
        dashboard: mockDashboard
      });

      const response = await affiliateService.getDashboard();

      expect(response.success).toBe(true);
      expect(response.dashboard).toEqual(mockDashboard);
    });
  });

  describe('GET /api/affiliate/links', () => {
    test('should fetch affiliate links successfully', async () => {
      const mockLinks = [
        {
          id: 'link1',
          url: 'https://example.com/ref/123',
          clicks: 150,
          conversions: 12,
          earnings: 45.50
        }
      ];

      mockAxios.onGet('/api/affiliate/links').reply(200, {
        success: true,
        links: mockLinks,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          hasMore: false
        }
      });

      const response = await affiliateService.getLinks();

      expect(response.success).toBe(true);
      expect(response.links).toEqual(mockLinks);
    });
  });

  describe('POST /api/affiliate/links', () => {
    test('should create affiliate link successfully', async () => {
      const newLink = {
        productId: 'prod1',
        customUrl: 'my-custom-link'
      };

      mockAxios.onPost('/api/affiliate/links').reply(201, {
        success: true,
        link: {
          id: 'new-link',
          url: 'https://example.com/ref/new-link',
          ...newLink
        }
      });

      const response = await affiliateService.createLink(newLink);

      expect(response.success).toBe(true);
      expect(response.link.id).toBeDefined();
    });
  });

  describe('GET /api/affiliate/earnings', () => {
    test('should fetch earnings successfully', async () => {
      const mockEarnings = {
        total: 1250.75,
        pending: 350.25,
        paid: 900.50,
        history: [
          { date: '2024-01-15', amount: 45.50 },
          { date: '2024-01-14', amount: 32.25 }
        ]
      };

      mockAxios.onGet('/api/affiliate/earnings').reply(200, {
        success: true,
        earnings: mockEarnings
      });

      const response = await affiliateService.getEarnings();

      expect(response.success).toBe(true);
      expect(response.earnings.total).toBe(1250.75);
    });
  });

  describe('POST /api/affiliate/payouts/request', () => {
    test('should request payout successfully', async () => {
      const payoutRequest = {
        amount: 100,
        method: 'paypal'
      };

      mockAxios.onPost('/api/affiliate/payouts/request').reply(201, {
        success: true,
        payout: {
          id: 'payout1',
          ...payoutRequest,
          status: 'pending',
          createdAt: '2024-01-15T10:30:00Z'
        }
      });

      const response = await affiliateService.requestPayout(payoutRequest);

      expect(response.success).toBe(true);
      expect(response.payout.status).toBe('pending');
    });

    test('should handle insufficient balance', async () => {
      mockAxios.onPost('/api/affiliate/payouts/request').reply(400, {
        success: false,
        message: 'Insufficient balance'
      });

      await expect(
        affiliateService.requestPayout({ amount: 10000, method: 'paypal' })
      ).rejects.toThrow('Insufficient balance');
    });
  });

  describe('GET /api/affiliate/referrals', () => {
    test('should fetch referrals successfully', async () => {
      const mockReferrals = [
        {
          id: 'ref1',
          name: 'Jane Doe',
          email: 'jane@example.com',
          joinedAt: '2024-01-10T00:00:00Z',
          earnings: 25.50
        }
      ];

      mockAxios.onGet('/api/affiliate/referrals').reply(200, {
        success: true,
        referrals: mockReferrals,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          hasMore: false
        }
      });

      const response = await affiliateService.getReferrals();

      expect(response.success).toBe(true);
      expect(response.referrals).toEqual(mockReferrals);
    });
  });

  describe('GET /api/affiliate/analytics', () => {
    test('should fetch analytics successfully', async () => {
      const mockAnalytics = {
        clicks: [100, 150, 200, 175, 225],
        conversions: [8, 12, 15, 14, 18],
        earnings: [25, 35, 45, 42, 55],
        periods: ['Jan', 'Feb', 'Mar', 'Apr', 'May']
      };

      mockAxios.onGet('/api/affiliate/analytics').reply(200, {
        success: true,
        analytics: mockAnalytics
      });

      const response = await affiliateService.getAnalytics();

      expect(response.success).toBe(true);
      expect(response.analytics.clicks).toHaveLength(5);
    });
  });
});
// ==================== Payment API Tests ====================

describe('Payment API Integration Tests', () => {
  describe('GET /api/payment/transactions', () => {
    test('should fetch transactions successfully', async () => {
      const mockTransactions = [
        mockTransaction,
        { ...mockTransaction, id: 'txn2', amount: 49.99 }
      ];

      mockAxios.onGet('/api/payment/transactions').reply(200, {
        success: true,
        transactions: mockTransactions,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          hasMore: false
        }
      });

      const response = await paymentService.getTransactions();

      expect(response.success).toBe(true);
      expect(response.transactions).toHaveLength(2);
    });
  });

  describe('GET /api/payment/balance', () => {
    test('should fetch balance successfully', async () => {
      const mockBalance = {
        available: 1250.75,
        pending: 350.25,
        total: 1601.00,
        currency: 'USD'
      };

      mockAxios.onGet('/api/payment/balance').reply(200, {
        success: true,
        balance: mockBalance
      });

      const response = await paymentService.getBalance();

      expect(response.success).toBe(true);
      expect(response.balance.available).toBe(1250.75);
    });
  });

  describe('POST /api/payment/process', () => {
    test('should process payment successfully', async () => {
      const paymentData = {
        amount: 99.99,
        method: 'stripe',
        token: 'tok_visa'
      };

      mockAxios.onPost('/api/payment/process').reply(200, {
        success: true,
        transaction: {
          id: 'txn_new',
          ...paymentData,
          status: 'completed'
        }
      });

      const response = await paymentService.processPayment(paymentData);

      expect(response.success).toBe(true);
      expect(response.transaction.status).toBe('completed');
    });

    test('should handle payment failure', async () => {
      mockAxios.onPost('/api/payment/process').reply(402, {
        success: false,
        message: 'Payment failed'
      });

      await expect(
        paymentService.processPayment({ amount: 99.99 })
      ).rejects.toThrow('Payment failed');
    });
  });

  describe('GET /api/payment/withdrawals', () => {
    test('should fetch withdrawals successfully', async () => {
      const mockWithdrawals = [mockWithdrawal];

      mockAxios.onGet('/api/payment/withdrawals').reply(200, {
        success: true,
        withdrawals: mockWithdrawals,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          hasMore: false
        }
      });

      const response = await paymentService.getWithdrawals();

      expect(response.success).toBe(true);
      expect(response.withdrawals).toHaveLength(1);
    });
  });

  describe('GET /api/payment/methods', () => {
    test('should fetch payment methods successfully', async () => {
      const mockMethods = [
        {
          id: 'pm1',
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expiryMonth: 12,
          expiryYear: 2025
        }
      ];

      mockAxios.onGet('/api/payment/methods').reply(200, {
        success: true,
        methods: mockMethods
      });

      const response = await paymentService.getPaymentMethods();

      expect(response.success).toBe(true);
      expect(response.methods).toHaveLength(1);
    });
  });
});

// ==================== Support API Tests ====================

describe('Support API Integration Tests', () => {
  describe('GET /api/support/tickets', () => {
    test('should fetch tickets successfully', async () => {
      const mockTickets = [mockTicket];

      mockAxios.onGet('/api/support/tickets').reply(200, {
        success: true,
        tickets: mockTickets,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          hasMore: false
        }
      });

      const response = await supportService.getTickets();

      expect(response.success).toBe(true);
      expect(response.tickets).toHaveLength(1);
    });
  });

  describe('POST /api/support/tickets', () => {
    test('should create ticket successfully', async () => {
      const newTicket = {
        subject: 'New Issue',
        message: 'Need help with something',
        priority: 'high'
      };

      mockAxios.onPost('/api/support/tickets').reply(201, {
        success: true,
        ticket: {
          id: 'ticket_new',
          ...newTicket,
          status: 'open',
          createdAt: '2024-01-15T10:30:00Z'
        }
      });

      const response = await supportService.createTicket(newTicket);

      expect(response.success).toBe(true);
      expect(response.ticket.status).toBe('open');
    });
  });

  describe('POST /api/support/tickets/:id/reply', () => {
    test('should reply to ticket successfully', async () => {
      const reply = {
        message: 'Thank you for your help'
      };

      mockAxios.onPost('/api/support/tickets/ticket1/reply').reply(200, {
        success: true,
        reply: {
          id: 'reply1',
          ...reply,
          createdAt: '2024-01-15T10:30:00Z'
        }
      });

      const response = await supportService.replyToTicket('ticket1', reply);

      expect(response.success).toBe(true);
      expect(response.reply.message).toBe(reply.message);
    });
  });

  describe('GET /api/support/faq', () => {
    test('should fetch FAQs successfully', async () => {
      const mockFaqs = [
        {
          id: 'faq1',
          question: 'How do I earn commissions?',
          answer: 'You earn commissions by sharing referral links'
        }
      ];

      mockAxios.onGet('/api/support/faq').reply(200, {
        success: true,
        faqs: mockFaqs
      });

      const response = await supportService.getFAQs();

      expect(response.success).toBe(true);
      expect(response.faqs).toHaveLength(1);
    });
  });
});

// ==================== Notification API Tests ====================

describe('Notification API Integration Tests', () => {
  describe('GET /api/notifications', () => {
    test('should fetch notifications successfully', async () => {
      const mockNotifications = [mockNotification];

      mockAxios.onGet('/api/notifications').reply(200, {
        success: true,
        notifications: mockNotifications,
        unreadCount: 1
      });

      const response = await notificationService.getNotifications();

      expect(response.success).toBe(true);
      expect(response.notifications).toHaveLength(1);
      expect(response.unreadCount).toBe(1);
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    test('should mark notification as read', async () => {
      mockAxios.onPut('/api/notifications/notif1/read').reply(200, {
        success: true
      });

      const response = await notificationService.markAsRead('notif1');

      expect(response.success).toBe(true);
    });
  });

  describe('PUT /api/notifications/read-all', () => {
    test('should mark all notifications as read', async () => {
      mockAxios.onPut('/api/notifications/read-all').reply(200, {
        success: true,
        count: 5
      });

      const response = await notificationService.markAllAsRead();

      expect(response.success).toBe(true);
      expect(response.count).toBe(5);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    test('should delete notification', async () => {
      mockAxios.onDelete('/api/notifications/notif1').reply(200, {
        success: true
      });

      const response = await notificationService.deleteNotification('notif1');

      expect(response.success).toBe(true);
    });
  });
});

// ==================== Analytics API Tests ====================

describe('Analytics API Integration Tests', () => {
  describe('GET /api/analytics/dashboard', () => {
    test('should fetch dashboard analytics', async () => {
      const mockAnalytics = {
        visitors: 1250,
        pageViews: 3500,
        bounceRate: 45.5,
        avgSessionDuration: 185
      };

      mockAxios.onGet('/api/analytics/dashboard').reply(200, {
        success: true,
        analytics: mockAnalytics
      });

      const response = await analyticsService.getDashboardAnalytics();

      expect(response.success).toBe(true);
      expect(response.analytics.visitors).toBe(1250);
    });
  });

  describe('GET /api/analytics/traffic', () => {
    test('should fetch traffic analytics', async () => {
      const mockTraffic = {
        sources: [
          { source: 'google', visits: 500 },
          { source: 'direct', visits: 300 },
          { source: 'social', visits: 200 }
        ],
        devices: [
          { device: 'mobile', percentage: 60 },
          { device: 'desktop', percentage: 35 },
          { device: 'tablet', percentage: 5 }
        ]
      };

      mockAxios.onGet('/api/analytics/traffic').reply(200, {
        success: true,
        traffic: mockTraffic
      });

      const response = await analyticsService.getTrafficAnalytics();

      expect(response.success).toBe(true);
      expect(response.traffic.sources).toHaveLength(3);
    });
  });

  describe('GET /api/analytics/conversions', () => {
    test('should fetch conversion analytics', async () => {
      const mockConversions = {
        total: 125,
        rate: 3.5,
        byProduct: [
          { product: 'Product A', conversions: 50 },
          { product: 'Product B', conversions: 75 }
        ]
      };

      mockAxios.onGet('/api/analytics/conversions').reply(200, {
        success: true,
        conversions: mockConversions
      });

      const response = await analyticsService.getConversionAnalytics();

      expect(response.success).toBe(true);
      expect(response.conversions.total).toBe(125);
    });
  });
});

// ==================== Admin API Tests ====================

describe('Admin API Integration Tests', () => {
  describe('GET /api/admin/users', () => {
    test('should fetch users successfully', async () => {
      const mockUsers = [mockUser, mockAdmin];

      mockAxios.onGet('/api/admin/users').reply(200, {
        success: true,
        users: mockUsers,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          hasMore: false
        }
      });

      const response = await adminService.getUsers();

      expect(response.success).toBe(true);
      expect(response.users).toHaveLength(2);
    });
  });

  describe('PUT /api/admin/users/:id/role', () => {
    test('should update user role successfully', async () => {
      mockAxios.onPut('/api/admin/users/123/role').reply(200, {
        success: true,
        user: { ...mockUser, role: 'admin' }
      });

      const response = await adminService.updateUserRole('123', 'admin');

      expect(response.success).toBe(true);
      expect(response.user.role).toBe('admin');
    });
  });

  describe('PUT /api/admin/users/:id/status', () => {
    test('should update user status successfully', async () => {
      mockAxios.onPut('/api/admin/users/123/status').reply(200, {
        success: true,
        user: { ...mockUser, status: 'suspended' }
      });

      const response = await adminService.updateUserStatus('123', 'suspended');

      expect(response.success).toBe(true);
      expect(response.user.status).toBe('suspended');
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    test('should delete user successfully', async () => {
      mockAxios.onDelete('/api/admin/users/123').reply(200, {
        success: true,
        message: 'User deleted successfully'
      });

      const response = await adminService.deleteUser('123');

      expect(response.success).toBe(true);
      expect(response.message).toBeDefined();
    });
  });

  describe('GET /api/admin/analytics', () => {
    test('should fetch admin analytics successfully', async () => {
      const mockAnalytics = {
        totalUsers: 1500,
        activeUsers: 850,
        totalAffiliates: 450,
        totalEarnings: 125000,
        pendingWithdrawals: 25000
      };

      mockAxios.onGet('/api/admin/analytics').reply(200, {
        success: true,
        analytics: mockAnalytics
      });

      const response = await adminService.getAnalytics();

      expect(response.success).toBe(true);
      expect(response.analytics.totalUsers).toBe(1500);
    });
  });

  describe('GET /api/admin/logs', () => {
    test('should fetch system logs successfully', async () => {
      const mockLogs = [
        {
          id: 'log1',
          level: 'info',
          message: 'Server started',
          timestamp: '2024-01-15T10:30:00Z'
        }
      ];

      mockAxios.onGet('/api/admin/logs').reply(200, {
        success: true,
        logs: mockLogs,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          hasMore: false
        }
      });

      const response = await adminService.getLogs();

      expect(response.success).toBe(true);
      expect(response.logs).toHaveLength(1);
    });
  });

  describe('GET /api/admin/system/health', () => {
    test('should fetch system health successfully', async () => {
      const mockHealth = {
        status: 'healthy',
        uptime: 3600,
        cpu: 45,
        memory: 60,
        disk: 75,
        database: 'connected',
        cache: 'connected'
      };

      mockAxios.onGet('/api/admin/system/health').reply(200, {
        success: true,
        health: mockHealth
      });

      const response = await adminService.getSystemHealth();

      expect(response.success).toBe(true);
      expect(response.health.status).toBe('healthy');
    });
  });
});

// ==================== Error Handling Tests ====================

describe('API Error Handling', () => {
  test('should handle network errors', async () => {
    mockAxios.onGet('/api/user/profile').networkError();

    await expect(userService.getProfile()).rejects.toThrow('Network Error');
  });

  test('should handle timeout errors', async () => {
    mockAxios.onGet('/api/user/profile').timeout();

    await expect(userService.getProfile()).rejects.toThrow('timeout');
  });

  test('should handle 404 errors', async () => {
    mockAxios.onGet('/api/nonexistent').reply(404, {
      success: false,
      message: 'Not found'
    });

    await expect(
      axios.get('/api/nonexistent')
    ).rejects.toThrow('Request failed with status code 404');
  });

  test('should handle 500 errors with custom message', async () => {
    mockAxios.onGet('/api/user/profile').reply(500, {
      success: false,
      message: 'Database connection failed'
    });

    await expect(userService.getProfile()).rejects.toThrow('Database connection failed');
  });

  test('should handle 429 rate limit errors', async () => {
    mockAxios.onGet('/api/user/profile').reply(429, {
      success: false,
      message: 'Too many requests'
    });

    await expect(userService.getProfile()).rejects.toThrow('Too many requests');
  });

  test('should handle 403 forbidden errors', async () => {
    mockAxios.onGet('/api/admin/users').reply(403, {
      success: false,
      message: 'Forbidden'
    });

    await expect(adminService.getUsers()).rejects.toThrow('Forbidden');
  });

  test('should handle malformed JSON responses', async () => {
    mockAxios.onGet('/api/user/profile').reply(200, 'Not JSON');

    await expect(userService.getProfile()).rejects.toThrow();
  });
});
