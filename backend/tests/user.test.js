/**
 * ============================================
 * USER TESTS - PART 1
 * Comprehensive test suite for user management
 * Includes profile, settings, activity, and basic operations
 * ============================================
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Referral = require('../models/Referral');
const { generateToken } = require('../utils/helpers');
const { HTTP_STATUS, ERROR_CODES } = require('../utils/constants');

// ============================================
// Test Setup
// ============================================

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/affiliate-test');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  // Clear all collections
  await User.deleteMany({});
  await Wallet.deleteMany({});
  await Transaction.deleteMany({});
  await Referral.deleteMany({});
});

// ============================================
// Test Data
// ============================================

const createTestUser = async (role = 'user', overrides = {}) => {
  const userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Test@123',
    role,
    isVerified: true,
    isActive: true,
    ...overrides
  };

  const user = await User.create(userData);
  
  // Create wallet for user
  await Wallet.create({
    user: user._id,
    balance: 1000,
    currency: 'USD',
    status: 'active'
  });

  return user;
};

const createTestUsers = async (count = 5) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push(await createTestUser('user', {
      name: `Test User ${i}`,
      email: `test${i}@example.com`
    }));
  }
  return users;
};

const getAuthToken = (userId) => {
  return generateToken(userId);
};

// ============================================
// User Profile Tests
// ============================================

describe('GET /api/users/profile', () => {
  let user;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    token = getAuthToken(user._id);
  });

  it('should get user profile successfully', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toBeDefined();
    expect(response.body.data.user.email).toBe(user.email);
    expect(response.body.data.user.name).toBe(user.name);
    expect(response.body.data.user).not.toHaveProperty('password');
  });

  it('should include wallet information', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.data.user.wallet).toBeDefined();
    expect(response.body.data.user.wallet.balance).toBe(1000);
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .expect(HTTP_STATUS.UNAUTHORIZED);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AUTH_MISSING_TOKEN);
  });

  it('should return 401 with invalid token', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer invalid-token')
      .expect(HTTP_STATUS.UNAUTHORIZED);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AUTH_INVALID_TOKEN);
  });
});

describe('PUT /api/users/profile', () => {
  let user;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    token = getAuthToken(user._id);
  });

  it('should update user profile successfully', async () => {
    const updates = {
      name: 'Updated Name',
      phone: '+1234567890',
      address: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country',
      postalCode: '12345',
      bio: 'This is my bio',
      website: 'https://example.com'
    };

    const response = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(updates)
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user.name).toBe(updates.name);
    expect(response.body.data.user.phone).toBe(updates.phone);
    expect(response.body.data.user.address).toBe(updates.address);
    expect(response.body.data.user.bio).toBe(updates.bio);

    const updatedUser = await User.findById(user._id);
    expect(updatedUser.name).toBe(updates.name);
    expect(updatedUser.phone).toBe(updates.phone);
  });

  it('should validate input data', async () => {
    const response = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'invalid-email',
        phone: 'invalid'
      })
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.VALIDATION_FAILED);
  });

  it('should handle partial updates', async () => {
    const response = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Name Only'
      })
      .expect(HTTP_STATUS.OK);

    expect(response.body.data.user.name).toBe('New Name Only');
    expect(response.body.data.user.email).toBe(user.email);
  });
});

describe('POST /api/users/change-password', () => {
  let user;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    token = getAuthToken(user._id);
  });

  it('should change password successfully', async () => {
    const response = await request(app)
      .post('/api/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'Test@123',
        newPassword: 'NewPass@123',
        confirmPassword: 'NewPass@123'
      })
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('Password changed');

    // Verify new password works
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: 'NewPass@123'
      })
      .expect(HTTP_STATUS.OK);

    expect(loginResponse.body.success).toBe(true);
  });

  it('should return error with incorrect current password', async () => {
    const response = await request(app)
      .post('/api/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'WrongPass@123',
        newPassword: 'NewPass@123',
        confirmPassword: 'NewPass@123'
      })
      .expect(HTTP_STATUS.UNAUTHORIZED);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
  });

  it('should return error when passwords do not match', async () => {
    const response = await request(app)
      .post('/api/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'Test@123',
        newPassword: 'NewPass@123',
        confirmPassword: 'Different@123'
      })
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body.success).toBe(false);
    expect(response.body.details.confirmPassword).toBeDefined();
  });

  it('should validate password strength', async () => {
    const response = await request(app)
      .post('/api/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'Test@123',
        newPassword: 'weak',
        confirmPassword: 'weak'
      })
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body.success).toBe(false);
    expect(response.body.details.newPassword).toBeDefined();
  });
});

// ============================================
// Email Update Tests
// ============================================

describe('POST /api/users/update-email', () => {
  let user;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    token = getAuthToken(user._id);
  });

  it('should request email update successfully', async () => {
    const response = await request(app)
      .post('/api/users/update-email')
      .set('Authorization', `Bearer ${token}`)
      .send({
        newEmail: 'newemail@example.com',
        password: 'Test@123'
      })
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('verification email sent');

    const updatedUser = await User.findById(user._id).select('+emailVerificationToken');
    expect(updatedUser.emailVerificationToken).toBeDefined();
    expect(updatedUser.email).toBe(user.email); // Not changed yet
  });

  it('should return error if email already exists', async () => {
    await createTestUser('user', { email: 'existing@example.com' });

    const response = await request(app)
      .post('/api/users/update-email')
      .set('Authorization', `Bearer ${token}`)
      .send({
        newEmail: 'existing@example.com',
        password: 'Test@123'
      })
      .expect(HTTP_STATUS.CONFLICT);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.USER_ALREADY_EXISTS);
  });

  it('should return error with incorrect password', async () => {
    const response = await request(app)
      .post('/api/users/update-email')
      .set('Authorization', `Bearer ${token}`)
      .send({
        newEmail: 'newemail@example.com',
        password: 'wrongpassword'
      })
      .expect(HTTP_STATUS.UNAUTHORIZED);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
  });
});

// ============================================
// User Settings Tests
// ============================================

describe('GET /api/users/settings', () => {
  let user;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    token = getAuthToken(user._id);
  });

  it('should get user settings', async () => {
    const response = await request(app)
      .get('/api/users/settings')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.data.settings).toBeDefined();
  });
});

describe('PUT /api/users/settings', () => {
  let user;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    token = getAuthToken(user._id);
  });

  it('should update notification settings', async () => {
    const updates = {
      notifications: {
        email: false,
        push: true,
        sms: false
      }
    };

    const response = await request(app)
      .put('/api/users/settings')
      .set('Authorization', `Bearer ${token}`)
      .send(updates)
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.data.settings.notifications.email).toBe(false);
    expect(response.body.data.settings.notifications.push).toBe(true);
  });

  it('should update privacy settings', async () => {
    const updates = {
      privacy: {
        profilePublic: false,
        showEarnings: false
      }
    };

    const response = await request(app)
      .put('/api/users/settings')
      .set('Authorization', `Bearer ${token}`)
      .send(updates)
      .expect(HTTP_STATUS.OK);

    expect(response.body.data.settings.privacy.profilePublic).toBe(false);
  });

  it('should handle partial updates', async () => {
    const response = await request(app)
      .put('/api/users/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        preferences: {
          language: 'es'
        }
      })
      .expect(HTTP_STATUS.OK);

    expect(response.body.data.settings.preferences.language).toBe('es');
  });
});
/**
 * ============================================
 * USER TESTS - PART 2
 * Statistics, activity, account management, admin operations
 * ============================================
 */

// ============================================
// User Statistics Tests
// ============================================

describe('GET /api/users/stats', () => {
  let user;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    token = getAuthToken(user._id);

    // Create test referrals
    for (let i = 0; i < 5; i++) {
      const referredUser = await createTestUser('user', {
        email: `referred${i}@example.com`
      });
      await Referral.create({
        referrer: user._id,
        referredUser: referredUser._id,
        status: i % 2 === 0 ? 'active' : 'pending',
        commission: { amount: 10 * i }
      });
    }

    // Create test transactions
    for (let i = 0; i < 10; i++) {
      await Transaction.create({
        user: user._id,
        type: i % 2 === 0 ? 'commission' : 'referral_bonus',
        direction: 'in',
        amount: 50,
        status: 'completed'
      });
    }
  });

  it('should get user statistics', async () => {
    const response = await request(app)
      .get('/api/users/stats')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.data.stats).toBeDefined();
    expect(response.body.data.stats.referrals.total).toBe(5);
    expect(response.body.data.stats.referrals.active).toBe(3);
    expect(response.body.data.stats.transactions.total).toBe(10);
    expect(response.body.data.stats.earnings.total).toBe(500);
  });
});

// ============================================
// User Activity Tests
// ============================================

describe('GET /api/users/activity', () => {
  let user;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    token = getAuthToken(user._id);
  });

  it('should get user activity logs', async () => {
    const response = await request(app)
      .get('/api/users/activity')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.data.activities).toBeDefined();
    expect(response.body.data.pagination).toBeDefined();
  });

  it('should paginate results', async () => {
    const response = await request(app)
      .get('/api/users/activity?page=1&limit=5')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.data.activities).toHaveLength(5);
    expect(response.body.data.pagination.page).toBe(1);
    expect(response.body.data.pagination.limit).toBe(5);
  });
});

// ============================================
// Account Deactivation Tests
// ============================================

describe('POST /api/users/deactivate', () => {
  let user;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    token = getAuthToken(user._id);
  });

  it('should deactivate account successfully', async () => {
    const response = await request(app)
      .post('/api/users/deactivate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        password: 'Test@123'
      })
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('deactivated');

    const deactivatedUser = await User.findById(user._id);
    expect(deactivatedUser.isActive).toBe(false);
    expect(deactivatedUser.deactivatedAt).toBeDefined();

    // Verify cannot login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: 'Test@123'
      })
      .expect(HTTP_STATUS.FORBIDDEN);

    expect(loginResponse.body.errorCode).toBe(ERROR_CODES.AUTH_ACCOUNT_DISABLED);
  });

  it('should return error with incorrect password', async () => {
    const response = await request(app)
      .post('/api/users/deactivate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        password: 'wrongpassword'
      })
      .expect(HTTP_STATUS.UNAUTHORIZED);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
  });
});

describe('POST /api/users/request-deletion', () => {
  let user;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    token = getAuthToken(user._id);
  });

  it('should request account deletion', async () => {
    const response = await request(app)
      .post('/api/users/request-deletion')
      .set('Authorization', `Bearer ${token}`)
      .send({
        password: 'Test@123'
      })
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('deletion email sent');

    const updatedUser = await User.findById(user._id).select('+deletionToken');
    expect(updatedUser.deletionToken).toBeDefined();
    expect(updatedUser.deletionRequestedAt).toBeDefined();
  });
});

// ============================================
// Admin User Management Tests
// ============================================

describe('Admin User Management', () => {
  let admin;
  let adminToken;
  let users;

  beforeEach(async () => {
    admin = await createTestUser('admin');
    adminToken = getAuthToken(admin._id);
    users = await createTestUsers(5);
  });

  describe('GET /api/admin/users', () => {
    it('should get all users', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HTTP_STATUS.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(6);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter by role', async () => {
      const response = await request(app)
        .get('/api/admin/users?role=user')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HTTP_STATUS.OK);

      expect(response.body.data.users).toHaveLength(5);
      response.body.data.users.forEach(u => {
        expect(u.role).toBe('user');
      });
    });

    it('should filter by status', async () => {
      await User.findByIdAndUpdate(users[0]._id, { isActive: false });

      const response = await request(app)
        .get('/api/admin/users?status=inactive')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HTTP_STATUS.OK);

      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.users[0].isActive).toBe(false);
    });

    it('should search by name/email', async () => {
      const response = await request(app)
        .get('/api/admin/users?search=Test User 1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HTTP_STATUS.OK);

      expect(response.body.data.users.length).toBeGreaterThan(0);
      expect(response.body.data.users[0].name).toContain('Test User 1');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/admin/users?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HTTP_STATUS.OK);

      expect(response.body.data.users).toHaveLength(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
    });
  });

  describe('GET /api/admin/users/:id', () => {
    it('should get user details', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${users[0]._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HTTP_STATUS.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(users[0].email);
      expect(response.body.data.user.wallet).toBeDefined();
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/admin/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HTTP_STATUS.NOT_FOUND);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe(ERROR_CODES.USER_NOT_FOUND);
    });
  });

  describe('PUT /api/admin/users/:id', () => {
    it('should update user details', async () => {
      const updates = {
        name: 'Admin Updated Name',
        role: 'affiliate',
        isActive: false,
        isVerified: true
      };

      const response = await request(app)
        .put(`/api/admin/users/${users[0]._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect(HTTP_STATUS.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe(updates.name);
      expect(response.body.data.user.role).toBe(updates.role);
      expect(response.body.data.user.isActive).toBe(updates.isActive);
      expect(response.body.data.user.isVerified).toBe(updates.isVerified);
    });

    it('should validate email uniqueness', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${users[0]._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: users[1].email
        })
        .expect(HTTP_STATUS.CONFLICT);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe(ERROR_CODES.USER_ALREADY_EXISTS);
    });
  });

  describe('POST /api/admin/users/:id/reset-password', () => {
    it('should reset user password', async () => {
      const response = await request(app)
        .post(`/api/admin/users/${users[0]._id}/reset-password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newPassword: 'AdminReset@123'
        })
        .expect(HTTP_STATUS.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('reset');

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: users[0].email,
          password: 'AdminReset@123'
        })
        .expect(HTTP_STATUS.OK);

      expect(loginResponse.body.success).toBe(true);
    });

    it('should validate password strength', async () => {
      const response = await request(app)
        .post(`/api/admin/users/${users[0]._id}/reset-password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newPassword: 'weak'
        })
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe(ERROR_CODES.VALIDATION_FAILED);
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    it('should soft delete user', async () => {
      const response = await request(app)
        .delete(`/api/admin/users/${users[0]._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HTTP_STATUS.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      const deletedUser = await User.findById(users[0]._id);
      expect(deletedUser.isDeleted).toBe(true);
      expect(deletedUser.deletedAt).toBeDefined();
    });
  });

  describe('POST /api/admin/users', () => {
    it('should create new user', async () => {
      const newUser = {
        name: 'New Admin User',
        email: 'newadmin@example.com',
        password: 'AdminCreate@123',
        role: 'affiliate',
        isActive: true,
        isVerified: true
      };

      const response = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser)
        .expect(HTTP_STATUS.CREATED);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(newUser.email);
      expect(response.body.data.user.role).toBe(newUser.role);

      const user = await User.findOne({ email: newUser.email });
      expect(user).toBeDefined();
    });

    it('should return error if email exists', async () => {
      const response = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Duplicate User',
          email: users[0].email,
          password: 'Test@123'
        })
        .expect(HTTP_STATUS.CONFLICT);

      expect(response.body.success).toBe(false);
    });
  });
});

// ============================================
// GDPR Data Export Tests
// ============================================

describe('GET /api/users/export-data', () => {
  let user;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    token = getAuthToken(user._id);
  });

  it('should export user data', async () => {
    const response = await request(app)
      .get('/api/users/export-data')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.user).toBeDefined();
    expect(response.body.data.wallet).toBeDefined();
  });
});

// ============================================
// Edge Cases
// ============================================

describe('Edge Cases', () => {
  let user;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    token = getAuthToken(user._id);
  });

  it('should handle very long input strings', async () => {
    const longString = 'a'.repeat(1000);
    const response = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bio: longString
      })
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body.success).toBe(false);
  });

  it('should handle XSS attempts', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    const response = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: xssPayload
      })
      .expect(HTTP_STATUS.OK);

    const updatedUser = await User.findById(user._id);
    expect(updatedUser.name).not.toContain('<script>');
  });
});

// ============================================
// Authorization Tests
// ============================================

describe('Authorization', () => {
  let user1;
  let user2;
  let token1;
  let token2;

  beforeEach(async () => {
    user1 = await createTestUser();
    user2 = await createTestUser();
    token1 = getAuthToken(user1._id);
    token2 = getAuthToken(user2._id);
  });

  it('should prevent user from accessing admin routes', async () => {
    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token1}`)
      .expect(HTTP_STATUS.FORBIDDEN);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.UNAUTHORIZED_ACCESS);
  });

  it('should allow users to access their own data', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token1}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.data.user._id).toBe(user1._id.toString());
  });
});
