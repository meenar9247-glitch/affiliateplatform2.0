import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROLES } from '../config/roles';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/routes';

import { GuardResult, GuardContext, BaseGuard } from './authGuard';

// ==================== Guest Guard Types ====================

export const GUEST_GUARD_TYPES = {
  PUBLIC: 'public',
  AUTH_ONLY: 'auth_only',
  GUEST_ONLY: 'guest_only',
  VERIFIED_ONLY: 'verified_only',
  UNVERIFIED_ONLY: 'unverified_only',
  CUSTOM: 'custom',
};

export const GUEST_REDIRECTS = {
  [GUEST_GUARD_TYPES.PUBLIC]: null,
  [GUEST_GUARD_TYPES.AUTH_ONLY]: ROUTES.LOGIN,
  [GUEST_GUARD_TYPES.GUEST_ONLY]: ROUTES.DASHBOARD,
  [GUEST_GUARD_TYPES.VERIFIED_ONLY]: ROUTES.VERIFY_EMAIL,
  [GUEST_GUARD_TYPES.UNVERIFIED_ONLY]: ROUTES.DASHBOARD,
};

export const GUEST_PRIORITIES = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
};

// ==================== Guest Session Types ====================

export const GUEST_SESSION_TYPES = {
  TEMPORARY: 'temporary',
  PERSISTENT: 'persistent',
  LIMITED: 'limited',
};

export const GUEST_SESSION_DEFAULTS = {
  [GUEST_SESSION_TYPES.TEMPORARY]: {
    duration: 3600000, // 1 hour
    maxActions: 100,
    canRegister: true,
  },
  [GUEST_SESSION_TYPES.PERSISTENT]: {
    duration: 2592000000, // 30 days
    maxActions: 1000,
    canRegister: true,
  },
  [GUEST_SESSION_TYPES.LIMITED]: {
    duration: 1800000, // 30 minutes
    maxActions: 20,
    canRegister: false,
  },
};

// ==================== Base Guest Guard ====================

export class BaseGuestGuard extends BaseGuard {
  constructor(options = {}) {
    super({
      name: 'BaseGuestGuard',
      type: GUEST_GUARD_TYPES.PUBLIC,
      ...options,
    });
    this.guardType = options.guardType || GUEST_GUARD_TYPES.PUBLIC;
    this.redirectTo = options.redirectTo || GUEST_REDIRECTS[this.guardType];
    this.checkVerified = options.checkVerified !== false;
    this.checkBanned = options.checkBanned !== false;
    this.checkIp = options.checkIp || false;
    this.allowedIps = options.allowedIps || [];
    this.blockedIps = options.blockedIps || [];
    this.maxAttempts = options.maxAttempts || 10;
    this.rateWindow = options.rateWindow || 60000; // 1 minute
    this.attempts = new Map();
  }

  async check(context) {
    const { isAuthenticated, user, ip } = context;
    
    // Check IP restrictions
    if (this.checkIp) {
      const ipAllowed = await this.checkIpAccess(ip);
      if (!ipAllowed) {
        return this.getResult(false, {
          redirectTo: ROUTES.FORBIDDEN,
          message: 'IP address not allowed',
          meta: { ip },
        });
      }
    }

    // Check rate limiting
    const rateLimited = await this.checkRateLimit(ip);
    if (rateLimited) {
      return this.getResult(false, {
        redirectTo: ROUTES.TOO_MANY_REQUESTS,
        message: 'Too many requests',
        meta: { ip },
      });
    }

    // Apply guard type logic
    switch (this.guardType) {
      case GUEST_GUARD_TYPES.PUBLIC:
        return this.handlePublic(context);
        
      case GUEST_GUARD_TYPES.AUTH_ONLY:
        return this.handleAuthOnly(context);
        
      case GUEST_GUARD_TYPES.GUEST_ONLY:
        return this.handleGuestOnly(context);
        
      case GUEST_GUARD_TYPES.VERIFIED_ONLY:
        return this.handleVerifiedOnly(context);
        
      case GUEST_GUARD_TYPES.UNVERIFIED_ONLY:
        return this.handleUnverifiedOnly(context);
        
      default:
        return this.handleCustom(context);
    }
  }

  async handlePublic(context) {
    // Public pages are accessible to everyone
    return this.getResult(true);
  }

  async handleAuthOnly(context) {
    const { isAuthenticated, user } = context;
    
    if (!isAuthenticated) {
      return this.getResult(false, {
        redirectTo: this.redirectTo || ROUTES.LOGIN,
        message: 'Authentication required',
      });
    }

    // Check if user is banned
    if (this.checkBanned && user?.status === 'banned') {
      return this.getResult(false, {
        redirectTo: ROUTES.FORBIDDEN,
        message: 'Your account has been banned',
      });
    }

    return this.getResult(true);
  }

  async handleGuestOnly(context) {
    const { isAuthenticated } = context;
    
    if (isAuthenticated) {
      return this.getResult(false, {
        redirectTo: this.redirectTo || ROUTES.DASHBOARD,
        message: 'Already logged in',
      });
    }

    return this.getResult(true);
  }

  async handleVerifiedOnly(context) {
    const { isAuthenticated, user } = context;
    
    if (!isAuthenticated) {
      return this.getResult(false, {
        redirectTo: ROUTES.LOGIN,
        message: 'Authentication required',
      });
    }

    if (this.checkVerified && !user?.isEmailVerified) {
      return this.getResult(false, {
        redirectTo: this.redirectTo || ROUTES.VERIFY_EMAIL,
        message: 'Email verification required',
        meta: { email: user?.email },
      });
    }

    return this.getResult(true);
  }

  async handleUnverifiedOnly(context) {
    const { isAuthenticated, user } = context;
    
    if (!isAuthenticated) {
      return this.getResult(true);
    }

    if (this.checkVerified && user?.isEmailVerified) {
      return this.getResult(false, {
        redirectTo: this.redirectTo || ROUTES.DASHBOARD,
        message: 'Email already verified',
      });
    }

    return this.getResult(true);
  }

  async handleCustom(context) {
    // To be overridden by custom guards
    return this.getResult(true);
  }

  async checkIpAccess(ip) {
    if (this.allowedIps.length > 0 && !this.allowedIps.includes(ip)) {
      return false;
    }
    
    if (this.blockedIps.includes(ip)) {
      return false;
    }
    
    return true;
  }

  async checkRateLimit(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    
    const recentAttempts = userAttempts.filter(t => now - t < this.rateWindow);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return true;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return false;
  }

  resetRateLimit(key) {
    this.attempts.delete(key);
  }
}
// ==================== Guest Session Guard ====================

export class GuestSessionGuard extends BaseGuestGuard {
  constructor(options = {}) {
    super({
      name: 'GuestSessionGuard',
      guardType: GUEST_GUARD_TYPES.GUEST_ONLY,
      ...options,
    });
    this.sessionType = options.sessionType || GUEST_SESSION_TYPES.TEMPORARY;
    this.sessionDefaults = GUEST_SESSION_DEFAULTS[this.sessionType];
    this.trackActions = options.trackActions !== false;
    this.actionLimit = options.actionLimit || this.sessionDefaults.maxActions;
    this.sessionDuration = options.sessionDuration || this.sessionDefaults.duration;
    
    // Session storage
    this.sessions = new Map();
  }

  async check(context) {
    const result = await super.check(context);
    
    if (!result.allowed) return result;
    
    const { sessionId, ip } = context;
    
    // Create or get guest session
    let session = this.sessions.get(sessionId) || await this.createGuestSession(sessionId, ip);
    
    // Check session expiry
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return this.getResult(false, {
        redirectTo: ROUTES.HOME,
        message: 'Guest session expired',
        meta: { sessionType: this.sessionType },
      });
    }
    
    // Check action limit
    if (this.trackActions && session.actions >= this.actionLimit) {
      return this.getResult(false, {
        redirectTo: ROUTES.REGISTER,
        message: 'Action limit reached. Please register to continue.',
        meta: { actions: session.actions, limit: this.actionLimit },
      });
    }
    
    // Update session
    session.lastActive = Date.now();
    session.actions++;
    this.sessions.set(sessionId, session);
    
    // Attach session to context
    context.guestSession = session;
    
    return this.getResult(true);
  }

  async createGuestSession(sessionId, ip) {
    const session = {
      id: sessionId,
      ip,
      type: this.sessionType,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.sessionDuration,
      lastActive: Date.now(),
      actions: 0,
      canRegister: this.sessionDefaults.canRegister,
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  deleteSession(sessionId) {
    this.sessions.delete(sessionId);
  }

  clearExpiredSessions() {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now > session.expiresAt) {
        this.sessions.delete(id);
      }
    }
  }
}

// ==================== Guest Feature Guard ====================

export class GuestFeatureGuard extends BaseGuestGuard {
  constructor(options = {}) {
    super({
      name: 'GuestFeatureGuard',
      guardType: GUEST_GUARD_TYPES.PUBLIC,
      ...options,
    });
    this.feature = options.feature;
    this.requireAuth = options.requireAuth || false;
    this.fallbackFeature = options.fallbackFeature || null;
  }

  async check(context) {
    const result = await super.check(context);
    
    if (!result.allowed) return result;
    
    const { features, isAuthenticated } = context;
    
    // Check if feature requires authentication
    if (this.requireAuth && !isAuthenticated) {
      return this.getResult(false, {
        redirectTo: ROUTES.LOGIN,
        message: 'Authentication required for this feature',
        meta: { feature: this.feature },
      });
    }
    
    // Check if feature is enabled
    if (!features || !features[this.feature]) {
      if (this.fallbackFeature) {
        context.feature = this.fallbackFeature;
        return this.getResult(true, {
          meta: { fallback: this.fallbackFeature },
        });
      }
      
      return this.getResult(false, {
        redirectTo: ROUTES.NOT_FOUND,
        message: 'Feature not available',
        meta: { feature: this.feature },
      });
    }
    
    return this.getResult(true);
  }
}

// ==================== Guest Device Guard ====================

export class GuestDeviceGuard extends BaseGuestGuard {
  constructor(options = {}) {
    super({
      name: 'GuestDeviceGuard',
      guardType: GUEST_GUARD_TYPES.PUBLIC,
      ...options,
    });
    this.allowedDevices = options.allowedDevices || ['desktop', 'mobile', 'tablet'];
    this.allowedBrowsers = options.allowedBrowsers || [];
    this.allowedOs = options.allowedOs || [];
    this.blockedDevices = options.blockedDevices || [];
    this.blockedBrowsers = options.blockedBrowsers || [];
    this.blockedOs = options.blockedOs || [];
  }

  async check(context) {
    const result = await super.check(context);
    
    if (!result.allowed) return result;
    
    const { userAgent } = context;
    const deviceInfo = this.parseUserAgent(userAgent);
    
    // Check device type
    if (!this.allowedDevices.includes(deviceInfo.device)) {
      return this.getResult(false, {
        redirectTo: ROUTES.UNSUPPORTED_DEVICE,
        message: 'Device type not supported',
        meta: { device: deviceInfo.device },
      });
    }
    
    // Check browser
    if (this.allowedBrowsers.length > 0 && !this.allowedBrowsers.includes(deviceInfo.browser)) {
      return this.getResult(false, {
        redirectTo: ROUTES.UNSUPPORTED_BROWSER,
        message: 'Browser not supported',
        meta: { browser: deviceInfo.browser },
      });
    }
    
    // Check OS
    if (this.allowedOs.length > 0 && !this.allowedOs.includes(deviceInfo.os)) {
      return this.getResult(false, {
        redirectTo: ROUTES.UNSUPPORTED_OS,
        message: 'Operating system not supported',
        meta: { os: deviceInfo.os },
      });
    }
    
    // Check blocked lists
    if (this.blockedDevices.includes(deviceInfo.device)) {
      return this.getResult(false, {
        redirectTo: ROUTES.FORBIDDEN,
        message: 'Device type blocked',
        meta: { device: deviceInfo.device },
      });
    }
    
    if (this.blockedBrowsers.includes(deviceInfo.browser)) {
      return this.getResult(false, {
        redirectTo: ROUTES.FORBIDDEN,
        message: 'Browser blocked',
        meta: { browser: deviceInfo.browser },
      });
    }
    
    if (this.blockedOs.includes(deviceInfo.os)) {
      return this.getResult(false, {
        redirectTo: ROUTES.FORBIDDEN,
        message: 'Operating system blocked',
        meta: { os: deviceInfo.os },
      });
    }
    
    return this.getResult(true);
  }

  parseUserAgent(userAgent) {
    // Simple user agent parsing
    const ua = userAgent.toLowerCase();
    
    let device = 'desktop';
    if (/(mobile|android|iphone|ipod|blackberry)/.test(ua)) {
      device = 'mobile';
    } else if (/(tablet|ipad)/.test(ua)) {
      device = 'tablet';
    }
    
    let browser = 'unknown';
    if (ua.includes('chrome')) browser = 'chrome';
    else if (ua.includes('firefox')) browser = 'firefox';
    else if (ua.includes('safari')) browser = 'safari';
    else if (ua.includes('edge')) browser = 'edge';
    else if (ua.includes('opera')) browser = 'opera';
    
    let os = 'unknown';
    if (ua.includes('windows')) os = 'windows';
    else if (ua.includes('mac')) os = 'macos';
    else if (ua.includes('linux')) os = 'linux';
    else if (ua.includes('android')) os = 'android';
    else if (ua.includes('ios')) os = 'ios';
    
    return { device, browser, os };
  }
}

// ==================== Guest Referrer Guard ====================

export class GuestReferrerGuard extends BaseGuestGuard {
  constructor(options = {}) {
    super({
      name: 'GuestReferrerGuard',
      guardType: GUEST_GUARD_TYPES.PUBLIC,
      ...options,
    });
    this.allowedReferrers = options.allowedReferrers || [];
    this.blockedReferrers = options.blockedReferrers || [];
    this.allowDirect = options.allowDirect !== false;
    this.trackReferrer = options.trackReferrer !== false;
  }

  async check(context) {
    const result = await super.check(context);
    
    if (!result.allowed) return result;
    
    const { referrer } = context;
    
    // Check direct access
    if (!referrer && !this.allowDirect) {
      return this.getResult(false, {
        redirectTo: ROUTES.HOME,
        message: 'Direct access not allowed',
      });
    }
    
    if (referrer) {
      const referrerDomain = this.extractDomain(referrer);
      
      // Check allowed referrers
      if (this.allowedReferrers.length > 0 && !this.allowedReferrers.includes(referrerDomain)) {
        return this.getResult(false, {
          redirectTo: ROUTES.HOME,
          message: 'Referrer not allowed',
          meta: { referrer: referrerDomain },
        });
      }
      
      // Check blocked referrers
      if (this.blockedReferrers.includes(referrerDomain)) {
        return this.getResult(false, {
          redirectTo: ROUTES.HOME,
          message: 'Referrer blocked',
          meta: { referrer: referrerDomain },
        });
      }
    }
    
    // Track referrer if enabled
    if (this.trackReferrer && referrer) {
      context.referrerInfo = {
        url: referrer,
        domain: this.extractDomain(referrer),
        timestamp: Date.now(),
      };
    }
    
    return this.getResult(true);
  }

  extractDomain(url) {
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return url;
    }
  }
}
// ==================== Guest Guard Factory ====================

export class GuestGuardFactory {
  static createGuard(type, options = {}) {
    switch (type) {
      case GUEST_GUARD_TYPES.PUBLIC:
        return new BaseGuestGuard({ ...options, guardType: type });
      case GUEST_GUARD_TYPES.AUTH_ONLY:
        return new BaseGuestGuard({ ...options, guardType: type });
      case GUEST_GUARD_TYPES.GUEST_ONLY:
        return new BaseGuestGuard({ ...options, guardType: type });
      case GUEST_GUARD_TYPES.VERIFIED_ONLY:
        return new BaseGuestGuard({ ...options, guardType: type });
      case GUEST_GUARD_TYPES.UNVERIFIED_ONLY:
        return new BaseGuestGuard({ ...options, guardType: type });
      default:
        throw new Error(`Unknown guest guard type: ${type}`);
    }
  }

  static createSessionGuard(options = {}) {
    return new GuestSessionGuard(options);
  }

  static createFeatureGuard(feature, options = {}) {
    return new GuestFeatureGuard({ ...options, feature });
  }

  static createDeviceGuard(options = {}) {
    return new GuestDeviceGuard(options);
  }

  static createReferrerGuard(options = {}) {
    return new GuestReferrerGuard(options);
  }

  static createCompositeGuard(guards, mode = 'all') {
    return {
      async execute(context) {
        const results = [];
        
        for (const guard of guards) {
          const result = await guard.execute(context);
          results.push(result);
          
          if (mode === 'all' && !result.allowed) {
            return { allowed: false, result, results };
          }
          if (mode === 'any' && result.allowed) {
            return { allowed: true, result, results };
          }
        }
        
        const allowed = mode === 'all'
          ? results.every(r => r.allowed)
          : results.some(r => r.allowed);
        
        return { allowed, results };
      },
    };
  }
}

// ==================== React Components ====================

export const GuestGuard = ({ children, fallback = null, ...options }) => {
  const auth = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    const checkGuard = async () => {
      const guard = new BaseGuestGuard(options);
      const context = GuardContext.fromAuth(auth);
      context.path = location.pathname;
      context.referrer = document.referrer;
      context.userAgent = navigator.userAgent;
      context.features = options.features || {};
      context.sessionId = localStorage.getItem('guest_session_id') || 
        `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (!localStorage.getItem('guest_session_id')) {
        localStorage.setItem('guest_session_id', context.sessionId);
      }
      
      const result = await guard.execute(context);
      
      setIsAllowed(result.allowed);
      
      if (!result.allowed && result.redirectTo) {
        setRedirect({
          to: result.redirectTo,
          state: { from: location, message: result.message },
        });
      }
      
      setIsChecking(false);
    };

    checkGuard();
  }, [auth, location, options]);

  if (isChecking) {
    return fallback || <LoadingSpinner />;
  }

  if (!isAllowed && redirect) {
    return <Navigate to={redirect.to} state={redirect.state} replace />;
  }

  return children;
};

export const PublicGuard = ({ children, ...options }) => {
  return (
    <GuestGuard guardType={GUEST_GUARD_TYPES.PUBLIC} {...options}>
      {children}
    </GuestGuard>
  );
};

export const AuthOnlyGuard = ({ children, ...options }) => {
  return (
    <GuestGuard guardType={GUEST_GUARD_TYPES.AUTH_ONLY} {...options}>
      {children}
    </GuestGuard>
  );
};

export const GuestOnlyGuard = ({ children, ...options }) => {
  return (
    <GuestGuard guardType={GUEST_GUARD_TYPES.GUEST_ONLY} {...options}>
      {children}
    </GuestGuard>
  );
};

export const VerifiedOnlyGuard = ({ children, ...options }) => {
  return (
    <GuestGuard guardType={GUEST_GUARD_TYPES.VERIFIED_ONLY} {...options}>
      {children}
    </GuestGuard>
  );
};

export const UnverifiedOnlyGuard = ({ children, ...options }) => {
  return (
    <GuestGuard guardType={GUEST_GUARD_TYPES.UNVERIFIED_ONLY} {...options}>
      {children}
    </GuestGuard>
  );
};

export const GuestSessionGuardComponent = ({ children, ...options }) => {
  const auth = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    const checkGuard = async () => {
      const guard = new GuestSessionGuard(options);
      const context = GuardContext.fromAuth(auth);
      context.path = location.pathname;
      context.sessionId = localStorage.getItem('guest_session_id');
      context.ip = options.testIp || '127.0.0.1';
      
      const result = await guard.execute(context);
      
      setIsAllowed(result.allowed);
      
      if (!result.allowed && result.redirectTo) {
        setRedirect({
          to: result.redirectTo,
          state: { from: location, message: result.message },
        });
      }
      
      setIsChecking(false);
    };

    checkGuard();
  }, [auth, location, options]);

  if (isChecking) {
    return <LoadingSpinner />;
  }

  if (!isAllowed && redirect) {
    return <Navigate to={redirect.to} state={redirect.state} replace />;
  }

  return children;
};

// ==================== HOCs ====================

export const withGuestGuard = (WrappedComponent, options = {}) => {
  return function WithGuestGuard(props) {
    return (
      <GuestGuard {...options}>
        <WrappedComponent {...props} />
      </GuestGuard>
    );
  };
};

export const withPublicGuard = (WrappedComponent, options = {}) => {
  return function WithPublicGuard(props) {
    return (
      <PublicGuard {...options}>
        <WrappedComponent {...props} />
      </PublicGuard>
    );
  };
};

export const withAuthOnlyGuard = (WrappedComponent, options = {}) => {
  return function WithAuthOnlyGuard(props) {
    return (
      <AuthOnlyGuard {...options}>
        <WrappedComponent {...props} />
      </AuthOnlyGuard>
    );
  };
};

export const withGuestOnlyGuard = (WrappedComponent, options = {}) => {
  return function WithGuestOnlyGuard(props) {
    return (
      <GuestOnlyGuard {...options}>
        <WrappedComponent {...props} />
      </GuestOnlyGuard>
    );
  };
};

// ==================== Utility Functions ====================

export const guestGuardUtils = {
  // Check if user is guest
  isGuest: (user) => {
    return !user;
  },

  // Get guest session ID
  getGuestSessionId: () => {
    return localStorage.getItem('guest_session_id');
  },

  // Create guest session
  createGuestSession: (type = GUEST_SESSION_TYPES.TEMPORARY) => {
    const sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('guest_session_id', sessionId);
    localStorage.setItem('guest_session_type', type);
    localStorage.setItem('guest_session_created', Date.now().toString());
    return sessionId;
  },

  // Clear guest session
  clearGuestSession: () => {
    localStorage.removeItem('guest_session_id');
    localStorage.removeItem('guest_session_type');
    localStorage.removeItem('guest_session_created');
    localStorage.removeItem('guest_session_actions');
  },

  // Track guest action
  trackGuestAction: () => {
    const actions = parseInt(localStorage.getItem('guest_session_actions') || '0');
    localStorage.setItem('guest_session_actions', (actions + 1).toString());
  },

  // Get guest action count
  getGuestActionCount: () => {
    return parseInt(localStorage.getItem('guest_session_actions') || '0');
  },

  // Check if guest can register
  canGuestRegister: () => {
    const type = localStorage.getItem('guest_session_type') || GUEST_SESSION_TYPES.TEMPORARY;
    return GUEST_SESSION_DEFAULTS[type]?.canRegister || false;
  },

  // Get guest session info
  getGuestSessionInfo: () => {
    return {
      id: localStorage.getItem('guest_session_id'),
      type: localStorage.getItem('guest_session_type'),
      created: localStorage.getItem('guest_session_created'),
      actions: parseInt(localStorage.getItem('guest_session_actions') || '0'),
    };
  },

  // Check if guest session is valid
  isGuestSessionValid: () => {
    const created = parseInt(localStorage.getItem('guest_session_created') || '0');
    const type = localStorage.getItem('guest_session_type') || GUEST_SESSION_TYPES.TEMPORARY;
    const duration = GUEST_SESSION_DEFAULTS[type]?.duration || 3600000;
    
    return Date.now() - created < duration;
  },

  // Get remaining guest actions
  getRemainingGuestActions: () => {
    const type = localStorage.getItem('guest_session_type') || GUEST_SESSION_TYPES.TEMPORARY;
    const maxActions = GUEST_SESSION_DEFAULTS[type]?.maxActions || 100;
    const currentActions = parseInt(localStorage.getItem('guest_session_actions') || '0');
    
    return Math.max(0, maxActions - currentActions);
  },

  // Check if guest has reached action limit
  hasReachedActionLimit: () => {
    return guestGuardUtils.getRemainingGuestActions() <= 0;
  },

  // Get guest device info
  getGuestDeviceInfo: () => {
    const ua = navigator.userAgent;
    const parser = new GuestDeviceGuard();
    return parser.parseUserAgent(ua);
  },

  // Get guest referrer
  getGuestReferrer: () => {
    return document.referrer || null;
  },

  // Store guest data
  storeGuestData: (key, value) => {
    const data = JSON.parse(localStorage.getItem('guest_data') || '{}');
    data[key] = value;
    localStorage.setItem('guest_data', JSON.stringify(data));
  },

  // Get guest data
  getGuestData: (key) => {
    const data = JSON.parse(localStorage.getItem('guest_data') || '{}');
    return key ? data[key] : data;
  },

  // Clear guest data
  clearGuestData: () => {
    localStorage.removeItem('guest_data');
  },

  // Convert guest to user
  convertGuestToUser: async (userId) => {
    const guestData = guestGuardUtils.getGuestData();
    // Send guest data to server to associate with user
    try {
      const response = await fetch('/api/guest/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, guestData }),
      });
      
      if (response.ok) {
        guestGuardUtils.clearGuestSession();
        guestGuardUtils.clearGuestData();
      }
      
      return response.ok;
    } catch (error) {
      console.error('Failed to convert guest to user:', error);
      return false;
    }
  },
};

// ==================== Export all ====================

export const guestGuard = {
  // Types
  GUEST_GUARD_TYPES,
  GUEST_REDIRECTS,
  GUEST_PRIORITIES,
  GUEST_SESSION_TYPES,
  GUEST_SESSION_DEFAULTS,
  
  // Guards
  BaseGuestGuard,
  GuestSessionGuard,
  GuestFeatureGuard,
  GuestDeviceGuard,
  GuestReferrerGuard,
  
  // Factory
  GuestGuardFactory,
  
  // React Components
  GuestGuard,
  PublicGuard,
  AuthOnlyGuard,
  GuestOnlyGuard,
  VerifiedOnlyGuard,
  UnverifiedOnlyGuard,
  GuestSessionGuardComponent,
  
  // HOCs
  withGuestGuard,
  withPublicGuard,
  withAuthOnlyGuard,
  withGuestOnlyGuard,
  
  // Utilities
  guestGuardUtils,
};

export default guestGuard;
