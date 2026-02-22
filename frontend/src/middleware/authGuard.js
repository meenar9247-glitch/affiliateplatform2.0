import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/routes';
import { ROLES, roleHelpers } from '../config/roles';
import LoadingSpinner from '../components/common/LoadingSpinner';

// ==================== Guard Types ====================

export const GUARD_TYPES = {
  AUTH: 'auth',
  GUEST: 'guest',
  ROLE: 'role',
  PERMISSION: 'permission',
  FEATURE: 'feature',
  CUSTOM: 'custom'
};

export const REDIRECT_TYPES = {
  LOGIN: 'login',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  HOME: 'home',
  DASHBOARD: 'dashboard',
  CUSTOM: 'custom'
};

export const GUARD_PRIORITIES = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3
};

// ==================== Guard Result Class ====================

export class GuardResult {
  constructor({
    allowed = true,
    redirectTo = null,
    redirectType = null,
    message = null,
    priority = GUARD_PRIORITIES.MEDIUM,
    meta = {}
  } = {}) {
    this.allowed = allowed;
    this.redirectTo = redirectTo;
    this.redirectType = redirectType;
    this.message = message;
    this.priority = priority;
    this.meta = meta;
    this.timestamp = Date.now();
  }

  isAllowed() {
    return this.allowed;
  }

  shouldRedirect() {
    return !this.allowed && this.redirectTo;
  }

  getRedirect() {
    if (!this.shouldRedirect()) return null;
    
    return {
      to: this.redirectTo,
      type: this.redirectType,
      message: this.message
    };
  }

  toJSON() {
    return {
      allowed: this.allowed,
      redirectTo: this.redirectTo,
      redirectType: this.redirectType,
      message: this.message,
      priority: this.priority,
      meta: this.meta,
      timestamp: this.timestamp
    };
  }
}

// ==================== Base Guard Class ====================

export class BaseGuard {
  constructor(options = {}) {
    this.name = options.name || 'BaseGuard';
    this.type = options.type || GUARD_TYPES.CUSTOM;
    this.priority = options.priority || GUARD_PRIORITIES.MEDIUM;
    this.options = options;
  }

  async check(context) {
    throw new Error('Guard must implement check method');
  }

  getResult(allowed, redirectOptions = {}) {
    return new GuardResult({
      allowed,
      priority: this.priority,
      ...redirectOptions
    });
  }

  async execute(context) {
    try {
      const result = await this.check(context);
      return result instanceof GuardResult ? result : this.getResult(result);
    } catch (error) {
      console.error(`Guard ${this.name} error:`, error);
      return this.getResult(false, {
        redirectTo: ROUTES.SERVER_ERROR,
        redirectType: REDIRECT_TYPES.CUSTOM,
        message: 'Guard execution error',
        meta: { error: error.message }
      });
    }
  }
}

// ==================== Auth Guard ====================

export class AuthGuard extends BaseGuard {
  constructor(options = {}) {
    super({
      name: 'AuthGuard',
      type: GUARD_TYPES.AUTH,
      ...options
    });
    this.requireAuth = options.requireAuth !== false;
    this.redirectTo = options.redirectTo || ROUTES.LOGIN;
    this.redirectType = options.redirectType || REDIRECT_TYPES.LOGIN;
  }

  async check(context) {
    const { isAuthenticated, user } = context;
    
    if (this.requireAuth && !isAuthenticated) {
      return this.getResult(false, {
        redirectTo: this.redirectTo,
        redirectType: this.redirectType,
        message: 'Authentication required',
        meta: { requireAuth: this.requireAuth }
      });
    }
    
    if (!this.requireAuth && isAuthenticated) {
      return this.getResult(false, {
        redirectTo: ROUTES.DASHBOARD,
        redirectType: REDIRECT_TYPES.DASHBOARD,
        message: 'Already authenticated'
      });
    }
    
    return this.getResult(true);
  }
}

// ==================== Guest Guard ====================

export class GuestGuard extends BaseGuard {
  constructor(options = {}) {
    super({
      name: 'GuestGuard',
      type: GUARD_TYPES.GUEST,
      ...options
    });
    this.redirectTo = options.redirectTo || ROUTES.DASHBOARD;
    this.redirectType = options.redirectType || REDIRECT_TYPES.DASHBOARD;
  }

  async check(context) {
    const { isAuthenticated } = context;
    
    if (isAuthenticated) {
      return this.getResult(false, {
        redirectTo: this.redirectTo,
        redirectType: this.redirectType,
        message: 'Page only for guests'
      });
    }
    
    return this.getResult(true);
  }
}

// ==================== Role Guard ====================

export class RoleGuard extends BaseGuard {
  constructor(options = {}) {
    super({
      name: 'RoleGuard',
      type: GUARD_TYPES.ROLE,
      ...options
    });
    this.requiredRoles = options.roles || [];
    this.requireAll = options.requireAll || false;
    this.minLevel = options.minLevel || null;
    this.redirectTo = options.redirectTo || ROUTES.UNAUTHORIZED;
    this.redirectType = options.redirectType || REDIRECT_TYPES.UNAUTHORIZED;
  }

  async check(context) {
    const { user } = context;
    
    if (!user) {
      return this.getResult(false, {
        redirectTo: ROUTES.LOGIN,
        redirectType: REDIRECT_TYPES.LOGIN,
        message: 'Authentication required'
      });
    }

    // Check minimum role level
    if (this.minLevel !== null) {
      if (!roleHelpers.hasMinRoleLevel(user, this.minLevel)) {
        return this.getResult(false, {
          redirectTo: this.redirectTo,
          redirectType: this.redirectType,
          message: `Minimum role level ${this.minLevel} required`,
          meta: { requiredLevel: this.minLevel, userLevel: roleHelpers.getRoleLevel(user.role) }
        });
      }
    }

    // Check specific roles
    if (this.requiredRoles.length > 0) {
      const hasRoles = this.requireAll
        ? roleHelpers.hasAllRoles(user, this.requiredRoles)
        : roleHelpers.hasAnyRole(user, this.requiredRoles);

      if (!hasRoles) {
        return this.getResult(false, {
          redirectTo: this.redirectTo,
          redirectType: this.redirectType,
          message: 'Insufficient role permissions',
          meta: {
            required: this.requiredRoles,
            requireAll: this.requireAll,
            userRole: user.role
          }
        });
      }
    }
    
    return this.getResult(true);
  }
    }
// ==================== Permission Guard ====================

export class PermissionGuard extends BaseGuard {
  constructor(options = {}) {
    super({
      name: 'PermissionGuard',
      type: GUARD_TYPES.PERMISSION,
      ...options
    });
    this.requiredPermissions = options.permissions || [];
    this.requireAll = options.requireAll || false;
    this.redirectTo = options.redirectTo || ROUTES.UNAUTHORIZED;
    this.redirectType = options.redirectType || REDIRECT_TYPES.UNAUTHORIZED;
  }

  async check(context) {
    const { user } = context;
    
    if (!user) {
      return this.getResult(false, {
        redirectTo: ROUTES.LOGIN,
        redirectType: REDIRECT_TYPES.LOGIN,
        message: 'Authentication required'
      });
    }

    if (this.requiredPermissions.length === 0) {
      return this.getResult(true);
    }

    const hasPermissions = this.requireAll
      ? roleHelpers.hasAllPermissions(user, this.requiredPermissions)
      : roleHelpers.hasAnyPermission(user, this.requiredPermissions);

    if (!hasPermissions) {
      return this.getResult(false, {
        redirectTo: this.redirectTo,
        redirectType: this.redirectType,
        message: 'Insufficient permissions',
        meta: {
          required: this.requiredPermissions,
          requireAll: this.requireAll
        }
      });
    }
    
    return this.getResult(true);
  }
}

// ==================== Feature Guard ====================

export class FeatureGuard extends BaseGuard {
  constructor(options = {}) {
    super({
      name: 'FeatureGuard',
      type: GUARD_TYPES.FEATURE,
      ...options
    });
    this.feature = options.feature;
    this.redirectTo = options.redirectTo || ROUTES.NOT_FOUND;
    this.redirectType = options.redirectType || REDIRECT_TYPES.CUSTOM;
  }

  async check(context) {
    const { features } = context;
    
    if (!features || !this.feature) {
      return this.getResult(false, {
        redirectTo: this.redirectTo,
        redirectType: this.redirectType,
        message: 'Feature check failed'
      });
    }

    const isEnabled = features[this.feature] === true;

    if (!isEnabled) {
      return this.getResult(false, {
        redirectTo: this.redirectTo,
        redirectType: this.redirectType,
        message: `Feature '${this.feature}' is disabled`,
        meta: { feature: this.feature }
      });
    }
    
    return this.getResult(true);
  }
}

// ==================== Composite Guard ====================

export class CompositeGuard extends BaseGuard {
  constructor(options = {}) {
    super({
      name: 'CompositeGuard',
      type: GUARD_TYPES.CUSTOM,
      ...options
    });
    this.guards = options.guards || [];
    this.mode = options.mode || 'all'; // 'all' or 'any'
    this.failFast = options.failFast !== false;
  }

  async check(context) {
    const results = [];
    
    for (const guard of this.guards) {
      const result = await guard.execute(context);
      results.push(result);
      
      if (this.failFast) {
        if (this.mode === 'all' && !result.allowed) {
          return result;
        }
        if (this.mode === 'any' && result.allowed) {
          return result;
        }
      }
    }

    // Check final result based on mode
    const allowed = this.mode === 'all'
      ? results.every(r => r.allowed)
      : results.some(r => r.allowed);

    if (!allowed) {
      // Find first failed guard for redirect
      const failedGuard = results.find(r => !r.allowed);
      return failedGuard || this.getResult(false);
    }

    return this.getResult(true);
  }

  addGuard(guard) {
    this.guards.push(guard);
    return this;
  }

  removeGuard(guardName) {
    this.guards = this.guards.filter(g => g.name !== guardName);
    return this;
  }
}

// ==================== Rate Limit Guard ====================

export class RateLimitGuard extends BaseGuard {
  constructor(options = {}) {
    super({
      name: 'RateLimitGuard',
      type: GUARD_TYPES.CUSTOM,
      ...options
    });
    this.maxAttempts = options.maxAttempts || 5;
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
    this.redirectTo = options.redirectTo || ROUTES.TOO_MANY_REQUESTS;
    this.redirectType = options.redirectType || REDIRECT_TYPES.CUSTOM;
    
    // Store attempts in memory (use Redis in production)
    this.attempts = new Map();
  }

  async check(context) {
    const { userId, ip } = context;
    const key = userId || ip || 'anonymous';
    
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    
    // Clean old attempts
    const recentAttempts = userAttempts.filter(t => now - t < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return this.getResult(false, {
        redirectTo: this.redirectTo,
        redirectType: this.redirectType,
        message: 'Rate limit exceeded',
        meta: {
          maxAttempts: this.maxAttempts,
          windowMs: this.windowMs,
          attempts: recentAttempts.length
        }
      });
    }
    
    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return this.getResult(true);
  }

  reset(key) {
    this.attempts.delete(key);
  }

  resetAll() {
    this.attempts.clear();
  }
}

// ==================== IP Whitelist Guard ====================

export class IPWhitelistGuard extends BaseGuard {
  constructor(options = {}) {
    super({
      name: 'IPWhitelistGuard',
      type: GUARD_TYPES.CUSTOM,
      ...options
    });
    this.whitelist = options.whitelist || [];
    this.redirectTo = options.redirectTo || ROUTES.FORBIDDEN;
    this.redirectType = options.redirectType || REDIRECT_TYPES.FORBIDDEN;
  }

  async check(context) {
    const { ip } = context;
    
    if (!ip) {
      return this.getResult(false, {
        redirectTo: this.redirectTo,
        redirectType: this.redirectType,
        message: 'IP address not found'
      });
    }

    const isAllowed = this.whitelist.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(ip);
      }
      return pattern === ip;
    });

    if (!isAllowed) {
      return this.getResult(false, {
        redirectTo: this.redirectTo,
        redirectType: this.redirectType,
        message: 'IP address not whitelisted',
        meta: { ip }
      });
    }
    
    return this.getResult(true);
  }
}

// ==================== Maintenance Guard ====================

export class MaintenanceGuard extends BaseGuard {
  constructor(options = {}) {
    super({
      name: 'MaintenanceGuard',
      type: GUARD_TYPES.CUSTOM,
      ...options
    });
    this.maintenanceMode = options.maintenanceMode || false;
    this.bypassRoles = options.bypassRoles || [ROLES.ADMIN, ROLES.SUPER_ADMIN];
    this.redirectTo = options.redirectTo || ROUTES.MAINTENANCE;
    this.redirectType = options.redirectType || REDIRECT_TYPES.CUSTOM;
  }

  async check(context) {
    const { user } = context;
    
    if (!this.maintenanceMode) {
      return this.getResult(true);
    }

    // Check if user can bypass maintenance
    if (user && this.bypassRoles.includes(user.role)) {
      return this.getResult(true);
    }

    return this.getResult(false, {
      redirectTo: this.redirectTo,
      redirectType: this.redirectType,
      message: 'Site is under maintenance',
      meta: { maintenanceMode: this.maintenanceMode }
    });
  }

  setMaintenanceMode(enabled) {
    this.maintenanceMode = enabled;
  }
  }
// ==================== Guard Factory ====================

export class GuardFactory {
  static createGuard(type, options = {}) {
    switch (type) {
      case GUARD_TYPES.AUTH:
        return new AuthGuard(options);
      case GUARD_TYPES.GUEST:
        return new GuestGuard(options);
      case GUARD_TYPES.ROLE:
        return new RoleGuard(options);
      case GUARD_TYPES.PERMISSION:
        return new PermissionGuard(options);
      case GUARD_TYPES.FEATURE:
        return new FeatureGuard(options);
      default:
        throw new Error(`Unknown guard type: ${type}`);
    }
  }

  static createCompositeGuard(guards, mode = 'all', options = {}) {
    return new CompositeGuard({
      ...options,
      guards,
      mode
    });
  }

  static createAuthGuard(options = {}) {
    return new AuthGuard(options);
  }

  static createGuestGuard(options = {}) {
    return new GuestGuard(options);
  }

  static createRoleGuard(roles, options = {}) {
    return new RoleGuard({
      ...options,
      roles
    });
  }

  static createPermissionGuard(permissions, options = {}) {
    return new PermissionGuard({
      ...options,
      permissions
    });
  }

  static createFeatureGuard(feature, options = {}) {
    return new FeatureGuard({
      ...options,
      feature
    });
  }

  static createRateLimitGuard(options = {}) {
    return new RateLimitGuard(options);
  }

  static createIPWhitelistGuard(whitelist, options = {}) {
    return new IPWhitelistGuard({
      ...options,
      whitelist
    });
  }

  static createMaintenanceGuard(options = {}) {
    return new MaintenanceGuard(options);
  }
}

// ==================== Guard Context ====================

export class GuardContext {
  constructor(options = {}) {
    this.user = options.user || null;
    this.isAuthenticated = options.isAuthenticated || false;
    this.features = options.features || {};
    this.ip = options.ip || null;
    this.userId = options.userId || null;
    this.path = options.path || null;
    this.query = options.query || {};
    this.params = options.params || {};
    this.meta = options.meta || {};
  }

  static fromRequest(req) {
    return new GuardContext({
      user: req.user,
      isAuthenticated: !!req.user,
      ip: req.ip,
      userId: req.user?.id,
      path: req.path,
      query: req.query,
      params: req.params,
      meta: req.meta
    });
  }

  static fromAuth(auth, features = {}) {
    return new GuardContext({
      user: auth.user,
      isAuthenticated: auth.isAuthenticated,
      userId: auth.user?.id,
      features
    });
  }

  update(updates) {
    Object.assign(this, updates);
  }

  clone() {
    return new GuardContext({ ...this });
  }
}

// ==================== Guard Chain ====================

export class GuardChain {
  constructor() {
    this.guards = [];
    this.context = null;
  }

  addGuard(guard) {
    this.guards.push(guard);
    return this;
  }

  addGuards(guards) {
    this.guards.push(...guards);
    return this;
  }

  setContext(context) {
    this.context = context;
    return this;
  }

  async execute() {
    if (!this.context) {
      throw new Error('Guard context not set');
    }

    const results = [];
    
    for (const guard of this.guards) {
      const result = await guard.execute(this.context);
      results.push(result);
      
      if (!result.allowed) {
        return {
          allowed: false,
          result,
          results
        };
      }
    }

    return {
      allowed: true,
      results
    };
  }

  clear() {
    this.guards = [];
    this.context = null;
    return this;
  }
}

// ==================== React Components ====================

export const AuthGuard = ({ children, fallback = null, ...options }) => {
  const auth = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    const checkGuard = async () => {
      const guard = GuardFactory.createAuthGuard(options);
      const context = GuardContext.fromAuth(auth);
      context.path = location.pathname;
      
      const result = await guard.execute(context);
      
      setIsAllowed(result.allowed);
      setRedirect(result.getRedirect());
      setIsChecking(false);
    };

    checkGuard();
  }, [auth, location, options]);

  if (isChecking) {
    return fallback || <LoadingSpinner />;
  }

  if (!isAllowed && redirect) {
    return <Navigate to={redirect.to} state={{ from: location }} replace />;
  }

  return children;
};

export const GuestGuard = ({ children, fallback = null, ...options }) => {
  const auth = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    const checkGuard = async () => {
      const guard = GuardFactory.createGuestGuard(options);
      const context = GuardContext.fromAuth(auth);
      context.path = location.pathname;
      
      const result = await guard.execute(context);
      
      setIsAllowed(result.allowed);
      setRedirect(result.getRedirect());
      setIsChecking(false);
    };

    checkGuard();
  }, [auth, location, options]);

  if (isChecking) {
    return fallback || <LoadingSpinner />;
  }

  if (!isAllowed && redirect) {
    return <Navigate to={redirect.to} state={{ from: location }} replace />;
  }

  return children;
};

export const RoleGuard = ({ children, roles, requireAll = false, fallback = null, ...options }) => {
  const auth = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    const checkGuard = async () => {
      const guard = GuardFactory.createRoleGuard(roles, { ...options, requireAll });
      const context = GuardContext.fromAuth(auth);
      context.path = location.pathname;
      
      const result = await guard.execute(context);
      
      setIsAllowed(result.allowed);
      setRedirect(result.getRedirect());
      setIsChecking(false);
    };

    checkGuard();
  }, [auth, location, roles, requireAll, options]);

  if (isChecking) {
    return fallback || <LoadingSpinner />;
  }

  if (!isAllowed && redirect) {
    return <Navigate to={redirect.to} state={{ from: location }} replace />;
  }

  return children;
};

export const PermissionGuard = ({ children, permissions, requireAll = false, fallback = null, ...options }) => {
  const auth = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    const checkGuard = async () => {
      const guard = GuardFactory.createPermissionGuard(permissions, { ...options, requireAll });
      const context = GuardContext.fromAuth(auth);
      context.path = location.pathname;
      
      const result = await guard.execute(context);
      
      setIsAllowed(result.allowed);
      setRedirect(result.getRedirect());
      setIsChecking(false);
    };

    checkGuard();
  }, [auth, location, permissions, requireAll, options]);

  if (isChecking) {
    return fallback || <LoadingSpinner />;
  }

  if (!isAllowed && redirect) {
    return <Navigate to={redirect.to} state={{ from: location }} replace />;
  }

  return children;
};

export const CompositeGuard = ({ children, guards, mode = 'all', fallback = null }) => {
  const auth = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    const checkGuards = async () => {
      const compositeGuard = new CompositeGuard({ guards, mode });
      const context = GuardContext.fromAuth(auth);
      context.path = location.pathname;
      
      const result = await compositeGuard.execute(context);
      
      setIsAllowed(result.allowed);
      setRedirect(result.getRedirect());
      setIsChecking(false);
    };

    checkGuards();
  }, [auth, location, guards, mode]);

  if (isChecking) {
    return fallback || <LoadingSpinner />;
  }

  if (!isAllowed && redirect) {
    return <Navigate to={redirect.to} state={{ from: location }} replace />;
  }

  return children;
};

// ==================== HOC Guards ====================

export const withAuthGuard = (WrappedComponent, options = {}) => {
  return function WithAuthGuard(props) {
    return (
      <AuthGuard {...options}>
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  };
};

export const withGuestGuard = (WrappedComponent, options = {}) => {
  return function WithGuestGuard(props) {
    return (
      <GuestGuard {...options}>
        <WrappedComponent {...props} />
      </GuestGuard>
    );
  };
};

export const withRoleGuard = (WrappedComponent, roles, options = {}) => {
  return function WithRoleGuard(props) {
    return (
      <RoleGuard roles={roles} {...options}>
        <WrappedComponent {...props} />
      </RoleGuard>
    );
  };
};

export const withPermissionGuard = (WrappedComponent, permissions, options = {}) => {
  return function WithPermissionGuard(props) {
    return (
      <PermissionGuard permissions={permissions} {...options}>
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
};

// ==================== Export all ====================

export const authGuard = {
  // Types
  GUARD_TYPES,
  REDIRECT_TYPES,
  GUARD_PRIORITIES,
  
  // Classes
  GuardResult,
  BaseGuard,
  AuthGuard,
  GuestGuard,
  RoleGuard,
  PermissionGuard,
  FeatureGuard,
  CompositeGuard,
  RateLimitGuard,
  IPWhitelistGuard,
  MaintenanceGuard,
  GuardContext,
  GuardChain,
  
  // Factory
  GuardFactory,
  
  // React Components
  AuthGuard: AuthGuard,
  GuestGuard: GuestGuard,
  RoleGuard: RoleGuard,
  PermissionGuard: PermissionGuard,
  CompositeGuard: CompositeGuard,
  
  // HOCs
  withAuthGuard,
  withGuestGuard,
  withRoleGuard,
  withPermissionGuard
};

export default authGuard;
