/**
 * ============================================
 * AUTHENTICATION TESTS
 * Comprehensive test suite for authentication endpoints
 * Includes unit tests, integration tests, and edge cases
 * ============================================
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const { generateToken } = require('../utils/helpers');
const { HTTP_STATUS, ERROR_CODES } = require('../utils/constants');

// ============================================
// Test Setup
// ============================================

beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/affiliate-test');
});

afterAll(async () => {
  // Clean up and disconnect
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  // Clear users before each test
  await User.deleteMany({});
});

// ============================================
// Test Data
// ============================================

const validUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Test@123',
  confirmPassword: 'Test@123'
};

const invalidUser = {
  name: '',
  email: 'invalid-email',
  password: '123',
  confirmPassword: '456'
};

// ============================================
// Registration Tests
// ============================================

describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(validUser)
      .expect(HTTP_STATUS.CREATED);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Registration successful! Please check your email for verification.');
    expect(response.body.data.user).toHaveProperty('id');
    expect(response.body.data.user.email).toBe(validUser.email);
    expect(response.body.data.user.name).toBe(validUser.name);
    expect(response.body.data.user.role).toBe('user');
    expect(response.body.data.user).not.toHaveProperty('password');
  });

  it('should return validation error for invalid input', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(invalidUser)
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.VALIDATION_FAILED);
    expect(response.body.details).toBeDefined();
  });

  it('should return error when email already exists', async () => {
    // Create user first
    await User.create(validUser);

    const response = await request(app)
      .post('/api/auth/register')
      .send(validUser)
      .expect(HTTP_STATUS.CONFLICT);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.USER_ALREADY_EXISTS);
    expect(response.body.message).toContain('already exists');
  });

  it('should return error when passwords do not match', async () => {
    const user = {
      ...validUser,
      confirmPassword: 'Different@123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(user)
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body.success).toBe(false);
    expect(response.body.details.password).toBeDefined();
  });

  it('should return error when password is too weak', async () => {
    const user = {
      ...validUser,
      password: 'weak',
      confirmPassword: 'weak'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(user)
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body.success).toBe(false);
    expect(response.body.details.password).toBeDefined();
  });

  it('should create user with referral code', async () => {
    // Create referrer first
    const referrer = await User.create({
      ...validUser,
      email: 'referrer@example.com'
    });

    const userWithReferral = {
      ...validUser,
      email: 'referred@example.com',
      referralCode: referrer.referralCode
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userWithReferral)
      .expect(HTTP_STATUS.CREATED);

    expect(response.body.success).toBe(true);

    // Check if referral was created
    const referredUser = await User.findOne({ email: userWithReferral.email }).populate('referredBy');
    expect(referredUser.referredBy).toBeDefined();
    expect(referredUser.referredBy.email).toBe(referrer.email);
  });

  it('should ignore invalid referral code', async () => {
    const userWithInvalidReferral = {
      ...validUser,
      referralCode: 'INVALID123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userWithInvalidReferral)
      .expect(HTTP_STATUS.CREATED);

    expect(response.body.success).toBe(true);

    const user = await User.findOne({ email: userWithInvalidReferral.email });
    expect(user.referredBy).toBeNull();
  });

  it('should create email verification token', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(validUser)
      .expect(HTTP_STATUS.CREATED);

    const user = await User.findOne({ email: validUser.email }).select('+emailVerificationToken');
    expect(user.emailVerificationToken).toBeDefined();
    expect(user.emailVerificationToken.length).toBeGreaterThan(0);
    expect(user.isVerified).toBe(false);
  });
});

// ============================================
// Login Tests
// ============================================

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Create verified user before each login test
    const user = new User(validUser);
    user.isVerified = true;
    await user.save();
  });

  it('should login successfully with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: validUser.email,
        password: validUser.password
      })
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user.email).toBe(validUser.email);
    expect(response.body.data.user).not.toHaveProperty('password');
  });

  it('should return error with invalid password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: validUser.email,
        password: 'wrongpassword'
      })
      .expect(HTTP_STATUS.UNAUTHORIZED);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
  });

  it('should return error with non-existent email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: validUser.password
      })
      .expect(HTTP_STATUS.UNAUTHORIZED);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
  });

  it('should return error when email not verified', async () => {
    // Create unverified user
    await User.deleteMany({});
    const unverifiedUser = new User(validUser);
    unverifiedUser.isVerified = false;
    await unverifiedUser.save();

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: validUser.email,
        password: validUser.password
      })
      .expect(HTTP_STATUS.FORBIDDEN);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED);
  });

  it('should return error when account is locked', async () => {
    const user = await User.findOne({ email: validUser.email });
    user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    user.loginAttempts = 5;
    await user.save();

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: validUser.email,
        password: validUser.password
      })
      .expect(HTTP_STATUS.FORBIDDEN);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AUTH_ACCOUNT_LOCKED);
    expect(response.body.details).toHaveProperty('unlockTime');
  });

  it('should increment login attempts on failed login', async () => {
    // First failed attempt
    await request(app)
      .post('/api/auth/login')
      .send({
        email: validUser.email,
        password: 'wrong1'
      });

    const user = await User.findOne({ email: validUser.email }).select('+loginAttempts');
    expect(user.loginAttempts).toBe(1);

    // Second failed attempt
    await request(app)
      .post('/api/auth/login')
      .send({
        email: validUser.email,
        password: 'wrong2'
      });

    const updatedUser = await User.findOne({ email: validUser.email }).select('+loginAttempts +lockedUntil');
    expect(updatedUser.loginAttempts).toBe(2);
    expect(updatedUser.lockedUntil).toBeNull();

    // Third, fourth, fifth failed attempts
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: 'wrong'
        });
    }

    const lockedUser = await User.findOne({ email: validUser.email }).select('+loginAttempts +lockedUntil');
    expect(lockedUser.loginAttempts).toBe(5);
    expect(lockedUser.lockedUntil).toBeDefined();
  });

  it('should reset login attempts on successful login', async () => {
    // Failed attempt
    await request(app)
      .post('/api/auth/login')
      .send({
        email: validUser.email,
        password: 'wrong'
      });

    // Successful login
    await request(app)
      .post('/api/auth/login')
      .send({
        email: validUser.email,
        password: validUser.password
      });

    const user = await User.findOne({ email: validUser.email }).select('+loginAttempts');
    expect(user.loginAttempts).toBe(0);
  });

  it('should return JWT token with correct payload', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: validUser.email,
        password: validUser.password
      });

    const token = response.body.data.token;
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);

    expect(decoded).toHaveProperty('id');
    expect(decoded).toHaveProperty('email', validUser.email);
    expect(decoded).toHaveProperty('role', 'user');
  });

  it('should set cookie with token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: validUser.email,
        password: validUser.password
      });

    expect(response.headers['set-cookie']).toBeDefined();
    expect(response.headers['set-cookie'][0]).toContain('token');
    expect(response.headers['set-cookie'][0]).toContain('HttpOnly');
  });
});

// ============================================
// Email Verification Tests
// ============================================

describe('GET /api/auth/verify-email/:token', () => {
  let user;

  beforeEach(async () => {
    user = new User(validUser);
    user.emailVerificationToken = 'valid-verification-token';
    await user.save();
  });

  it('should verify email with valid token', async () => {
    const response = await request(app)
      .get(`/api/auth/verify-email/${user.emailVerificationToken}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('verified');

    const verifiedUser = await User.findById(user._id);
    expect(verifiedUser.isVerified).toBe(true);
    expect(verifiedUser.emailVerificationToken).toBeUndefined();
  });

  it('should return error with invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/verify-email/invalid-token')
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AUTH_INVALID_TOKEN);
  });

  it('should return error with expired token', async () => {
    user.emailVerificationToken = 'expired-token';
    user.emailVerificationExpires = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await user.save();

    const response = await request(app)
      .get(`/api/auth/verify-email/${user.emailVerificationToken}`)
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AUTH_TOKEN_EXPIRED);
  });
});

// ============================================
// Password Reset Tests
// ============================================

describe('POST /api/auth/forgot-password', () => {
  beforeEach(async () => {
    await User.create(validUser);
  });

  it('should send password reset email for existing user', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: validUser.email })
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('reset email sent');

    const user = await User.findOne({ email: validUser.email }).select('+passwordResetToken +passwordResetExpires');
    expect(user.passwordResetToken).toBeDefined();
    expect(user.passwordResetExpires).toBeDefined();
  });

  it('should return success even for non-existent email (security)', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' })
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('reset email sent');
  });

  it('should rate limit password reset requests', async () => {
    // Make multiple requests
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: validUser.email });
    }

    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: validUser.email })
      .expect(HTTP_STATUS.TOO_MANY_REQUESTS);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.RATE_LIMIT_EXCEEDED);
  });
});

describe('POST /api/auth/reset-password/:token', () => {
  let user;
  let resetToken;

  beforeEach(async () => {
    user = await User.create(validUser);
    resetToken = 'valid-reset-token';
    user.passwordResetToken = require('crypto')
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await user.save();
  });

  it('should reset password with valid token', async () => {
    const newPassword = 'NewPassword@123';
    
    const response = await request(app)
      .post(`/api/auth/reset-password/${resetToken}`)
      .send({ password: newPassword })
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('reset successful');

    const updatedUser = await User.findById(user._id).select('+password');
    expect(updatedUser.passwordResetToken).toBeUndefined();
    expect(updatedUser.passwordResetExpires).toBeUndefined();
    
    // Verify new password works
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: validUser.email,
        password: newPassword
      })
      .expect(HTTP_STATUS.OK);

    expect(loginResponse.body.success).toBe(true);
  });

  it('should return error with invalid token', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password/invalid-token')
      .send({ password: 'NewPassword@123' })
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AUTH_INVALID_TOKEN);
  });

  it('should return error with expired token', async () => {
    user.passwordResetExpires = Date.now() - 60 * 60 * 1000;
    await user.save();

    const response = await request(app)
      .post(`/api/auth/reset-password/${resetToken}`)
      .send({ password: 'NewPassword@123' })
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AUTH_TOKEN_EXPIRED);
  });

  it('should return error with weak password', async () => {
    const response = await request(app)
      .post(`/api/auth/reset-password/${resetToken}`)
      .send({ password: 'weak' })
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.VALIDATION_FAILED);
  });
});

// ============================================
// Logout Tests
// ============================================

describe('POST /api/auth/logout', () => {
  it('should logout successfully', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.headers['set-cookie']).toBeDefined();
    expect(response.headers['set-cookie'][0]).toContain('token=;');
  });
});

// ============================================
// Protected Route Tests
// ============================================

describe('Protected Routes', () => {
  let token;

  beforeEach(async () => {
    const user = await User.create(validUser);
    token = generateToken(user._id);
  });

  it('should access protected route with valid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user.email).toBe(validUser.email);
  });

  it('should return error without token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .expect(HTTP_STATUS.UNAUTHORIZED);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AUTH_MISSING_TOKEN);
  });

  it('should return error with invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(HTTP_STATUS.UNAUTHORIZED);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AUTH_INVALID_TOKEN);
  });

  it('should return error with expired token', async () => {
    const expiredToken = require('jsonwebtoken').sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '0s' }
    );

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(HTTP_STATUS.UNAUTHORIZED);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AUTH_TOKEN_EXPIRED);
  });
});

// ============================================
// Rate Limiting Tests
// ============================================

describe('Rate Limiting', () => {
  it('should limit login attempts', async () => {
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrong'
          })
      );
    }

    const responses = await Promise.all(requests);
    const tooManyRequests = responses.filter(r => r.statusCode === HTTP_STATUS.TOO_MANY_REQUESTS);
    expect(tooManyRequests.length).toBeGreaterThan(0);
  });

  it('should limit registration attempts', async () => {
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(
        request(app)
          .post('/api/auth/register')
          .send({
            ...validUser,
            email: `test${i}@example.com`
          })
      );
    }

    const responses = await Promise.all(requests);
    const tooManyRequests = responses.filter(r => r.statusCode === HTTP_STATUS.TOO_MANY_REQUESTS);
    expect(tooManyRequests.length).toBeGreaterThan(0);
  });
});

// ============================================
// Edge Cases
// ============================================

describe('Edge Cases', () => {
  it('should handle malformed JSON', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send('{malformed json}')
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body.success).toBe(false);
  });

  it('should handle missing content-type', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(JSON.stringify(validUser))
      .expect(HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE);

    expect(response.body.success).toBe(false);
  });

  it('should handle very long input', async () => {
    const longUser = {
      ...validUser,
      name: 'a'.repeat(1000)
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(longUser)
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body.success).toBe(false);
    expect(response.body.details.name).toBeDefined();
  });

  it('should handle SQL injection attempts', async () => {
    const sqlInjection = {
      ...validUser,
      email: "' OR '1'='1"
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(sqlInjection)
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body.success).toBe(false);
    expect(response.body.details.email).toBeDefined();
  });

  it('should handle XSS attempts', async () => {
    const xssUser = {
      ...validUser,
      name: '<script>alert("xss")</script>'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(xssUser)
      .expect(HTTP_STATUS.CREATED);

    const user = await User.findOne({ email: xssUser.email });
    expect(user.name).not.toContain('<script>');
  });
});
```
