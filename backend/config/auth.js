/**
 * ============================================
 * AUTHENTICATION CONFIGURATION
 * Comprehensive auth configuration with JWT, OAuth, sessions,
 * password policies, and security settings
 * ============================================
 */

const crypto = require('crypto');

// ============================================
// JWT Configuration
// ============================================

const jwtConfig = {
  // Access token settings
  accessToken: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this',
    expiresIn: process.env.JWT_EXPIRE || '15m',
    algorithm: 'HS256',
    issuer: process.env.JWT_ISSUER || 'affiliate-platform',
    audience: process.env.JWT_AUDIENCE || 'affiliate-users'
  },

  // Refresh token settings
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-refresh-secret',
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    algorithm: 'HS256',
    issuer: process.env.JWT_ISSUER || 'affiliate-platform',
    audience: process.env.JWT_AUDIENCE || 'affiliate-users'
  },

  // Email verification token
  emailVerificationToken: {
    expiresIn: '24h',
    length: 32 // bytes
  },

  // Password reset token
  passwordResetToken: {
    expiresIn: '1h',
    length: 32 // bytes
  }
};

// ============================================
// OAuth Configuration
// ============================================

const oauthConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    scope: ['profile', 'email']
  },

  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback',
    scope: ['email', 'public_profile']
  },

  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
    scope: ['user:email']
  },

  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: process.env.LINKEDIN_CALLBACK_URL || '/api/auth/linkedin/callback',
    scope: ['r_emailaddress', 'r_liteprofile']
  }
};

// ============================================
// Session Configuration
// ============================================

const sessionConfig = {
  name: 'affiliate.sid',
  secret: process.env.SESSION_SECRET || 'your-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  rolling: true,
  unset: 'destroy'
};

// ============================================
// Password Policy
// ============================================

const passwordPolicy = {
  minLength: 8,
  maxLength: 50,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventPasswordReuse: 5, // Number of previous passwords to check
  maxLoginAttempts: 5,
  lockoutTime: 15 * 60 * 1000, // 15 minutes
  passwordExpiry: 90 * 24 * 60 * 60 * 1000, // 90 days
  passwordHistory: 5 // Remember last 5 passwords
};

// ============================================
// Two-Factor Authentication
// ============================================

const twoFactorConfig = {
  enabled: true,
  issuer: 'AffiliatePro',
  algorithm: 'sha1',
  digits: 6,
  period: 30,
  window: 1,
  backupCodesCount: 10,
  backupCodeLength: 10
};

// ============================================
// Rate Limiting for Auth
// ============================================

const authRateLimits = {
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    skipSuccessful: true
  },
  register: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per IP
    skipSuccessful: true
  },
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 reset requests
    skipSuccessful: true
  },
  verifyEmail: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 verification attempts
    skipSuccessful: true
  }
};

// ============================================
// Security Headers
// ============================================

const securityHeaders = {
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  xssProtection: '1; mode=block',
  noSniff: true,
  hidePoweredBy: true,
  frameguard: 'deny',
  referrerPolicy: 'strict-origin-when-cross-origin'
};

// ============================================
// Cookie Settings
// ============================================

const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  signed: true,
  overwrite: true
};

// ============================================
// Token Generation Functions
// ============================================

const tokenGenerators = {
  /**
   * Generate random token
   */
  generateRandomToken: (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
  },

  /**
   * Generate email verification token
   */
  generateEmailVerificationToken: () => {
    return tokenGenerators.generateRandomToken(jwtConfig.emailVerificationToken.length);
  },

  /**
   * Generate password reset token
   */
  generatePasswordResetToken: () => {
    return tokenGenerators.generateRandomToken(jwtConfig.passwordResetToken.length);
  },

  /**
   * Generate API key
   */
  generateApiKey: () => {
    return `aff_${crypto.randomBytes(24).toString('hex')}`;
  },

  /**
   * Generate backup codes for 2FA
   */
  generateBackupCodes: (count = twoFactorConfig.backupCodesCount) => {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(twoFactorConfig.backupCodeLength / 2).toString('hex'));
    }
    return codes;
  }
};

// ============================================
// Password Validation
// ============================================

const passwordValidator = {
  /**
   * Validate password against policy
   */
  validate: (password) => {
    const errors = [];

    if (password.length < passwordPolicy.minLength) {
      errors.push(`Password must be at least ${passwordPolicy.minLength} characters`);
    }

    if (password.length > passwordPolicy.maxLength) {
      errors.push(`Password must not exceed ${passwordPolicy.maxLength} characters`);
    }

    if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (passwordPolicy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Calculate password strength
   */
  calculateStrength: (password) => {
    let score = 0;

    // Length contribution
    if (password.length >= 12) score += 25;
    else if (password.length >= 8) score += 15;
    else if (password.length >= 6) score += 5;

    // Character variety
    if (/[A-Z]/.test(password)) score += 15;
    if (/[a-z]/.test(password)) score += 15;
    if (/\d/.test(password)) score += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;

    // Mix of cases and positions
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      score += 15;
    }

    // Penalize common patterns
    if (/^[A-Za-z]+$/.test(password)) score -= 10;
    if (/^\d+$/.test(password)) score -= 10;
    if (/password|123456|qwerty/i.test(password)) score = 0;

    return Math.min(100, Math.max(0, score));
  }
};

// ============================================
// JWT Helpers
// ============================================

const jwtHelpers = {
  /**
   * Get token expiration time in milliseconds
   */
  getTokenExpiry: (expiresIn) => {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch(unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return value;
    }
  },

  /**
   * Create token payload
   */
  createPayload: (user) => {
    return {
      sub: user._id,
      email: user.email,
      role: user.role,
      permissions: user.permissions || []
    };
  }
};

// ============================================
// Export all configurations
// ============================================

module.exports = {
  jwt: jwtConfig,
  oauth: oauthConfig,
  session: sessionConfig,
  password: passwordPolicy,
  twoFactor: twoFactorConfig,
  rateLimits: authRateLimits,
  securityHeaders,
  cookies: cookieConfig,
  tokens: tokenGenerators,
  passwordValidator,
  jwtHelpers
};
