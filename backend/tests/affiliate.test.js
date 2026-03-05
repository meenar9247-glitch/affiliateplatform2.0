/**
 * ============================================
 * AFFILIATE TESTS
 * Comprehensive test suite for affiliate management
 * Includes affiliate registration, links, commissions, payouts
 * ============================================
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Affiliate = require('../models/Affiliate');
const AffiliateLink = require('../models/AffiliateLink');
const Commission = require('../models/Commission');
const Click = require('../models/Click');
const Conversion = require('../models/Conversion');
const Payout = require('../models/Payout');
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
  await Affiliate.deleteMany({});
  await AffiliateLink.deleteMany({});
  await Commission.deleteMany({});
  await Click.deleteMany({});
  await Conversion.deleteMany({});
  await Payout.deleteMany({});
});

// ============================================
// Test Data
// ============================================

const createTestUser = async (role = 'user') => {
  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'Test@123',
    role
  });
  return user;
};

const createTestAffiliate = async (userId, status = 'active') => {
  const affiliate = await Affiliate.create({
    user: userId,
    commissionRate: 10,
    totalEarnings: 0,
    pendingEarnings: 0,
    withdrawnAmount: 0,
    referralCount: 0,
    clickCount: 0,
    status,
    paymentMethod: {
      type: 'paypal',
      details: { email: 'affiliate@example.com' }
    }
  });
  return affiliate;
};

const createTestLink = async (userId, affiliateId) => {
  const link = await AffiliateLink.create({
    user: userId,
    affiliate: affiliateId,
    name: 'Test Link',
    url: 'https://example.com/product',
    trackingId: 'TRACK123',
    commissionRate: 10,
    status: 'active'
  });
  return link;
};

const createTestClick = async (linkId, affiliateId) => {
  const click = await Click.create({
    link: linkId,
    affiliate: affiliateId,
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    referrer: 'https://google.com',
    country: 'US',
    device: 'desktop',
    browser: 'Chrome',
    os: 'Windows'
  });
  return click;
};

const createTestConversion = async (linkId, affiliateId, clickId) => {
  const conversion = await Conversion.create({
    link: linkId,
    affiliate: affiliateId,
    click: clickId,
    saleAmount: 100,
    commission: {
      amount: 10,
      rate: 10
    },
    status: 'completed',
    customerEmail: 'customer@example.com'
  });
  return conversion;
};

const getAuthToken = (userId) => {
  return generateToken(userId);
};

// ============================================
// Affiliate Registration Tests
// ============================================

describe('POST /api/affiliates/register', () => {
  let user;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    token = getAuthToken(user._id);
  });

  it('should register as affiliate successfully', async () => {
    const response = await request(app)
      .post('/api/affiliates/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        paymentMethod: {
          type: 'paypal',
          details: { email: 'affiliate@example.com' }
        },
        taxInfo: {
          taxId: 'TAX123',
          country: 'US'
        }
      })
      .expect(HTTP_STATUS.CREATED);

    expect(response.body.success).toBe(true);
    expect(response.body.data.affiliate).toBeDefined();
    expect(response.body.data.affiliate.status).toBe('pending');
    expect(response.body.data.affiliate.commissionRate).toBe(5); // Default

    const affiliate = await Affiliate.findOne({ user: user._id });
    expect(affiliate).toBeDefined();
    expect(affiliate.status).toBe('pending');
  });

  it('should return error if already an affiliate', async () => {
    await createTestAffiliate(user._id, 'pending');

    const response = await request(app)
      .post('/api/affiliates/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        paymentMethod: {
          type: 'paypal',
          details: { email: 'affiliate@example.com' }
        }
      })
      .expect(HTTP_STATUS.CONFLICT);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AFFILIATE_ALREADY_EXISTS);
  });

  it('should validate payment method', async () => {
    const response = await request(app)
      .post('/api/affiliates/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        paymentMethod: {
          type: 'invalid',
          details: {}
        }
      })
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.VALIDATION_FAILED);
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .post('/api/affiliates/register')
      .send({
        paymentMethod: {
          type: 'paypal',
          details: { email: 'affiliate@example.com' }
        }
      })
      .expect(HTTP_STATUS.UNAUTHORIZED);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AUTH_MISSING_TOKEN);
  });
});

// ============================================
// Affiliate Dashboard Tests
// ============================================

describe('GET /api/affiliates/dashboard', () => {
  let user;
  let affiliate;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    affiliate = await createTestAffiliate(user._id, 'active');
    token = getAuthToken(user._id);
  });

  it('should get affiliate dashboard successfully', async () => {
    // Create some test data
    const link = await createTestLink(user._id, affiliate._id);
    const click = await createTestClick(link._id, affiliate._id);
    const conversion = await createTestConversion(link._id, affiliate._id, click._id);

    const response = await request(app)
      .get('/api/affiliates/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.data.dashboard).toBeDefined();
    expect(response.body.data.dashboard.affiliate).toBeDefined();
    expect(response.body.data.dashboard.stats).toBeDefined();
    expect(response.body.data.dashboard.recentLinks).toBeDefined();
    expect(response.body.data.dashboard.recentClicks).toBeDefined();
    expect(response.body.data.dashboard.recentConversions).toBeDefined();
  });

  it('should return 404 if not an affiliate', async () => {
    const regularUser = await createTestUser();
    const regularToken = getAuthToken(regularUser._id);

    const response = await request(app)
      .get('/api/affiliates/dashboard')
      .set('Authorization', `Bearer ${regularToken}`)
      .expect(HTTP_STATUS.NOT_FOUND);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AFFILIATE_NOT_FOUND);
  });

  it('should return 403 if affiliate is not active', async () => {
    affiliate.status = 'suspended';
    await affiliate.save();

    const response = await request(app)
      .get('/api/affiliates/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.FORBIDDEN);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AFFILIATE_NOT_ACTIVE);
  });
});

// ============================================
// Affiliate Links Tests
// ============================================

describe('POST /api/affiliates/links', () => {
  let user;
  let affiliate;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    affiliate = await createTestAffiliate(user._id, 'active');
    token = getAuthToken(user._id);
  });

  it('should create affiliate link successfully', async () => {
    const response = await request(app)
      .post('/api/affiliates/links')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Product',
        targetUrl: 'https://example.com/product',
        description: 'Test description',
        tags: ['tech', 'gadgets'],
        commissionRate: 15
      })
      .expect(HTTP_STATUS.CREATED);

    expect(response.body.success).toBe(true);
    expect(response.body.data.link).toBeDefined();
    expect(response.body.data.link.name).toBe('Test Product');
    expect(response.body.data.link.trackingId).toBeDefined();
    expect(response.body.data.link.url).toBeDefined();
  });

  it('should use default commission rate if not provided', async () => {
    const response = await request(app)
      .post('/api/affiliates/links')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Product',
        targetUrl: 'https://example.com/product'
      })
      .expect(HTTP_STATUS.CREATED);

    expect(response.body.data.link.commissionRate).toBe(affiliate.commissionRate);
  });

  it('should validate required fields', async () => {
    const response = await request(app)
      .post('/api/affiliates/links')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.VALIDATION_FAILED);
  });
});

describe('GET /api/affiliates/links', () => {
  let user;
  let affiliate;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    affiliate = await createTestAffiliate(user._id, 'active');
    token = getAuthToken(user._id);

    // Create test links
    for (let i = 0; i < 5; i++) {
      await createTestLink(user._id, affiliate._id);
    }
  });

  it('should get all affiliate links', async () => {
    const response = await request(app)
      .get('/api/affiliates/links')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.data.links).toHaveLength(5);
    expect(response.body.data.pagination).toBeDefined();
  });

  it('should paginate results', async () => {
    const response = await request(app)
      .get('/api/affiliates/links?page=1&limit=2')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.data.links).toHaveLength(2);
    expect(response.body.data.pagination.page).toBe(1);
    expect(response.body.data.pagination.limit).toBe(2);
    expect(response.body.data.pagination.total).toBe(5);
  });

  it('should filter by status', async () => {
    // Deactivate one link
    const link = await AffiliateLink.findOne();
    link.status = 'inactive';
    await link.save();

    const response = await request(app)
      .get('/api/affiliates/links?status=active')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.data.links).toHaveLength(4);
    response.body.data.links.forEach(l => {
      expect(l.status).toBe('active');
    });
  });
});

describe('GET /api/affiliates/links/:id/stats', () => {
  let user;
  let affiliate;
  let link;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    affiliate = await createTestAffiliate(user._id, 'active');
    link = await createTestLink(user._id, affiliate._id);
    token = getAuthToken(user._id);

    // Create test clicks and conversions
    for (let i = 0; i < 10; i++) {
      const click = await createTestClick(link._id, affiliate._id);
      if (i % 3 === 0) { // 3 conversions
        await createTestConversion(link._id, affiliate._id, click._id);
        click.converted = true;
        await click.save();
      }
    }
  });

  it('should get link statistics', async () => {
    const response = await request(app)
      .get(`/api/affiliates/links/${link._id}/stats`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.data.stats).toBeDefined();
    expect(response.body.data.stats.totalClicks).toBe(10);
    expect(response.body.data.stats.uniqueClicks).toBe(10);
    expect(response.body.data.stats.conversions).toBe(3);
    expect(response.body.data.stats.conversionRate).toBe(30);
    expect(response.body.data.stats.totalCommission).toBe(30); // 3 * 10
  });

  it('should filter by date range', async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    const endDate = new Date();

    const response = await request(app)
      .get(`/api/affiliates/links/${link._id}/stats?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
  });

  it('should return 404 for non-existent link', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .get(`/api/affiliates/links/${fakeId}/stats`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.NOT_FOUND);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AFFILIATE_LINK_NOT_FOUND);
  });
});

// ============================================
// Commissions Tests
// ============================================

describe('GET /api/affiliates/commissions', () => {
  let user;
  let affiliate;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    affiliate = await createTestAffiliate(user._id, 'active');
    token = getAuthToken(user._id);

    // Create test commissions
    for (let i = 0; i < 5; i++) {
      await Commission.create({
        user: user._id,
        affiliate: affiliate._id,
        amount: 10 * (i + 1),
        type: 'direct',
        status: i % 2 === 0 ? 'paid' : 'pending',
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      });
    }
  });

  it('should get all commissions', async () => {
    const response = await request(app)
      .get('/api/affiliates/commissions')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.data.commissions).toHaveLength(5);
    expect(response.body.data.summary).toBeDefined();
  });

  it('should filter by status', async () => {
    const response = await request(app)
      .get('/api/affiliates/commissions?status=paid')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.data.commissions).toHaveLength(3);
    response.body.data.commissions.forEach(c => {
      expect(c.status).toBe('paid');
    });
  });

  it('should calculate summary correctly', async () => {
    const response = await request(app)
      .get('/api/affiliates/commissions')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    const summary = response.body.data.summary;
    expect(summary.totalEarnings).toBe(150); // 10+20+30+40+50
    expect(summary.pendingEarnings).toBe(90); // 20+40
    expect(summary.totalCommissions).toBe(5);
  });
});

// ============================================
// Payout Tests
// ============================================

describe('POST /api/affiliates/request-payout', () => {
  let user;
  let affiliate;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    affiliate = await createTestAffiliate(user._id, 'active');
    token = getAuthToken(user._id);

    // Create pending commissions
    for (let i = 0; i < 3; i++) {
      await Commission.create({
        user: user._id,
        affiliate: affiliate._id,
        amount: 100,
        type: 'direct',
        status: 'pending'
      });
    }

    affiliate.pendingEarnings = 300;
    await affiliate.save();
  });

  it('should request payout successfully', async () => {
    const response = await request(app)
      .post('/api/affiliates/request-payout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 200
      })
      .expect(HTTP_STATUS.CREATED);

    expect(response.body.success).toBe(true);
    expect(response.body.data.payout).toBeDefined();
    expect(response.body.data.payout.amount).toBe(200);
    expect(response.body.data.payout.status).toBe('pending');

    // Check updated balances
    const updatedAffiliate = await Affiliate.findById(affiliate._id);
    expect(updatedAffiliate.pendingEarnings).toBe(100); // 300 - 200

    // Check commissions updated
    const pendingCommissions = await Commission.find({ status: 'pending' });
    expect(pendingCommissions).toHaveLength(1);
  });

  it('should validate minimum payout amount', async () => {
    const response = await request(app)
      .post('/api/affiliates/request-payout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 5
      })
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.PAYOUT_MINIMUM_REQUIRED);
  });

  it('should validate sufficient balance', async () => {
    const response = await request(app)
      .post('/api/affiliates/request-payout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 500
      })
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.PAYOUT_INSUFFICIENT_BALANCE);
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .post('/api/affiliates/request-payout')
      .send({ amount: 200 })
      .expect(HTTP_STATUS.UNAUTHORIZED);

    expect(response.body.success).toBe(false);
  });
});

describe('GET /api/affiliates/payouts', () => {
  let user;
  let affiliate;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    affiliate = await createTestAffiliate(user._id, 'active');
    token = getAuthToken(user._id);

    // Create test payouts
    for (let i = 0; i < 3; i++) {
      await Payout.create({
        user: user._id,
        affiliate: affiliate._id,
        amount: 100 * (i + 1),
        method: {
          type: 'paypal',
          details: { email: 'affiliate@example.com' }
        },
        status: i === 0 ? 'completed' : i === 1 ? 'pending' : 'failed',
        requestedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      });
    }
  });

  it('should get payout history', async () => {
    const response = await request(app)
      .get('/api/affiliates/payouts')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.data.payouts).toHaveLength(3);
  });

  it('should filter by status', async () => {
    const response = await request(app)
      .get('/api/affiliates/payouts?status=completed')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.data.payouts).toHaveLength(1);
    expect(response.body.data.payouts[0].status).toBe('completed');
  });
});

// ============================================
// Click Tracking Tests
// ============================================

describe('POST /api/affiliates/track-click/:linkId', () => {
  let user;
  let affiliate;
  let link;

  beforeEach(async () => {
    user = await createTestUser();
    affiliate = await createTestAffiliate(user._id, 'active');
    link = await createTestLink(user._id, affiliate._id);
  });

  it('should track click successfully', async () => {
    const response = await request(app)
      .post(`/api/affiliates/track-click/${link.trackingId}`)
      .set('User-Agent', 'Mozilla/5.0')
      .set('X-Forwarded-For', '192.168.1.1')
      .send({
        referrer: 'https://google.com'
      })
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.data.clickId).toBeDefined();

    const click = await Click.findById(response.body.data.clickId);
    expect(click).toBeDefined();
    expect(click.link.toString()).toBe(link._id.toString());
    expect(click.ipAddress).toBe('192.168.1.1');
  });

  it('should redirect to target URL', async () => {
    const response = await request(app)
      .get(`/api/affiliates/redirect/${link.trackingId}`)
      .expect(302);

    expect(response.header.location).toBe(link.targetUrl);
  });

  it('should return 404 for invalid tracking ID', async () => {
    const response = await request(app)
      .post('/api/affiliates/track-click/invalid123')
      .expect(HTTP_STATUS.NOT_FOUND);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AFFILIATE_LINK_NOT_FOUND);
  });

  it('should handle inactive links', async () => {
    link.status = 'inactive';
    await link.save();

    const response = await request(app)
      .post(`/api/affiliates/track-click/${link.trackingId}`)
      .expect(HTTP_STATUS.FORBIDDEN);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.AFFILIATE_LINK_INACTIVE);
  });
});

// ============================================
// Conversion Tracking Tests
// ============================================

describe('POST /api/affiliates/conversion', () => {
  let user;
  let affiliate;
  let link;
  let click;

  beforeEach(async () => {
    user = await createTestUser();
    affiliate = await createTestAffiliate(user._id, 'active');
    link = await createTestLink(user._id, affiliate._id);
    click = await createTestClick(link._id, affiliate._id);
  });

  it('should record conversion successfully', async () => {
    const response = await request(app)
      .post('/api/affiliates/conversion')
      .send({
        clickId: click._id.toString(),
        orderId: 'ORDER123',
        saleAmount: 100,
        customerEmail: 'customer@example.com',
        customerName: 'John Doe'
      })
      .expect(HTTP_STATUS.CREATED);

    expect(response.body.success).toBe(true);
    expect(response.body.data.conversion).toBeDefined();
    expect(response.body.data.commission).toBeDefined();

    const conversion = await Conversion.findById(response.body.data.conversion._id);
    expect(conversion).toBeDefined();
    expect(conversion.saleAmount).toBe(100);
    expect(conversion.commission.amount).toBe(10); // 10% of 100

    // Check click updated
    const updatedClick = await Click.findById(click._id);
    expect(updatedClick.converted).toBe(true);

    // Check commission created
    const commission = await Commission.findOne({ conversion: conversion._id });
    expect(commission).toBeDefined();
    expect(commission.amount).toBe(10);
    expect(commission.status).toBe('pending');
  });

  it('should prevent duplicate conversion', async () => {
    await Conversion.create({
      link: link._id,
      affiliate: affiliate._id,
      click: click._id,
      saleAmount: 100,
      commission: { amount: 10, rate: 10 },
      status: 'completed'
    });

    click.converted = true;
    await click.save();

    const response = await request(app)
      .post('/api/affiliates/conversion')
      .send({
        clickId: click._id.toString(),
        orderId: 'ORDER123',
        saleAmount: 100
      })
      .expect(HTTP_STATUS.CONFLICT);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe(ERROR_CODES.CONVERSION_ALREADY_EXISTS);
  });

  it('should handle invalid click ID', async () => {
    const response = await request(app)
      .post('/api/affiliates/conversion')
      .send({
        clickId: 'invalid123',
        orderId: 'ORDER123',
        saleAmount: 100
      })
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body.success).toBe(false);
  });
});

// ============================================
// Analytics Tests
// ============================================

describe('GET /api/affiliates/analytics', () => {
  let user;
  let affiliate;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    affiliate = await createTestAffiliate(user._id, 'active');
    token = getAuthToken(user._id);

    // Create test data over 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Create 5 clicks per day
      for (let j = 0; j < 5; j++) {
        const click = await Click.create({
          link: new mongoose.Types.ObjectId(),
          affiliate: affiliate._id,
          ipAddress: `127.0.0.${j}`,
          clickedAt: date,
          converted: j % 5 === 0 // 1 conversion per day
        });

        if (j % 5 === 0) {
          await Conversion.create({
            link: click.link,
            affiliate: affiliate._id,
            click: click._id,
            saleAmount: 100,
            commission: { amount: 10, rate: 10 },
            convertedAt: date
          });
        }
      }
    }
  });

  it('should get analytics data', async () => {
    const response = await request(app)
      .get('/api/affiliates/analytics')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.data.analytics).toBeDefined();
    expect(response.body.data.analytics.summary).toBeDefined();
    expect(response.body.data.analytics.charts).toBeDefined();
    expect(response.body.data.analytics.topLinks).toBeDefined();
  });

  it('should filter by date range', async () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const response = await request(app)
      .get(`/api/affiliates/analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
  });

  it('should group by different periods', async () => {
    const response = await request(app)
      .get('/api/affiliates/analytics?groupBy=day')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.data.analytics.charts.byDay).toBeDefined();
  });
});
     // ============================================
// Referral Code Tests
// ============================================

describe('GET /api/affiliates/referral-code', () => {
  let user;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    token = getAuthToken(user._id);
  });

  it('should get referral code for user', async () => {
    const response = await request(app)
      .get('/api/affiliates/referral-code')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.data.referralCode).toBeDefined();
    expect(response.body.data.referralLink).toBeDefined();
  });

  it('should generate new code if not exists', async () => {
    user.referralCode = undefined;
    await user.save();

    const response = await request(app)
      .get('/api/affiliates/referral-code')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.data.referralCode).toBeDefined();
    expect(response.body.data.referralCode.length).toBe(8);
  });
});

describe('POST /api/affiliates/regenerate-code', () => {
  let user;
  let token;

  beforeEach(async () => {
    user = await createTestUser();
    user.referralCode = 'OLDCODE12';
    await user.save();
    token = getAuthToken(user._id);
  });

  it('should regenerate referral code', async () => {
    const oldCode = user.referralCode;

    const response = await request(app)
      .post('/api/affiliates/regenerate-code')
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.data.referralCode).toBeDefined();
    expect(response.body.data.referralCode).not.toBe(oldCode);
  });
});

// ============================================
// Admin Affiliate Management Tests
// ============================================

describe('Admin Affiliate Management', () => {
  let admin;
  let affiliate;
  let adminToken;

  beforeEach(async () => {
    admin = await createTestUser('admin');
    adminToken = getAuthToken(admin._id);

    const user = await createTestUser();
    affiliate = await createTestAffiliate(user._id, 'pending');
  });

  describe('PUT /api/admin/affiliates/:id/status', () => {
    it('should approve affiliate', async () => {
      const response = await request(app)
        .put(`/api/admin/affiliates/${affiliate._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'active'
        })
        .expect(HTTP_STATUS.OK);

      expect(response.body.success).toBe(true);

      const updatedAffiliate = await Affiliate.findById(affiliate._id);
      expect(updatedAffiliate.status).toBe('active');
      expect(updatedAffiliate.approvedAt).toBeDefined();
    });

    it('should reject affiliate', async () => {
      const response = await request(app)
        .put(`/api/admin/affiliates/${affiliate._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'rejected',
          reason: 'Invalid tax information'
        })
        .expect(HTTP_STATUS.OK);

      expect(response.body.success).toBe(true);

      const updatedAffiliate = await Affiliate.findById(affiliate._id);
      expect(updatedAffiliate.status).toBe('rejected');
    });

    it('should require admin role', async () => {
      const user = await createTestUser();
      const userToken = getAuthToken(user._id);

      const response = await request(app)
        .put(`/api/admin/affiliates/${affiliate._id}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'active'
        })
        .expect(HTTP_STATUS.FORBIDDEN);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/admin/affiliates/:id/commission-rate', () => {
    it('should update commission rate', async () => {
      const response = await request(app)
        .put(`/api/admin/affiliates/${affiliate._id}/commission-rate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          commissionRate: 20
        })
        .expect(HTTP_STATUS.OK);

      expect(response.body.success).toBe(true);

      const updatedAffiliate = await Affiliate.findById(affiliate._id);
      expect(updatedAffiliate.commissionRate).toBe(20);
    });

    it('should validate commission rate', async () => {
      const response = await request(app)
        .put(`/api/admin/affiliates/${affiliate._id}/commission-rate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          commissionRate: 150
        })
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body.success).toBe(false);
    });
  });
});
```
