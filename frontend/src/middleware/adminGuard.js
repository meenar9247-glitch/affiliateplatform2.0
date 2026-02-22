import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/routes';
import { ROLES, roleHelpers } from '../config/roles';
import { PERMISSIONS } from '../config/roles';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { GuardResult, GuardContext, BaseGuard } from './authGuard';

// ==================== Admin Guard Types ====================

export const ADMIN_GUARD_TYPES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  STAFF: 'staff',
  CUSTOM: 'custom'
};

export const ADMIN_LEVELS = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  MODERATOR: 60,
  STAFF: 40,
  ASSISTANT: 20
};

export const ADMIN_REDIRECTS = {
  [ADMIN_GUARD_TYPES.SUPER_ADMIN]: ROUTES.UNAUTHORIZED,
  [ADMIN_GUARD_TYPES.ADMIN]: ROUTES.UNAUTHORIZED,
  [ADMIN_GUARD_TYPES.MODERATOR]: ROUTES.UNAUTHORIZED,
  [ADMIN_GUARD_TYPES.STAFF]: ROUTES.UNAUTHORIZED
};

// ==================== Admin Metrics ====================

export const ADMIN_METRICS = {
  totalUsers: 0,
  totalAffiliates: 0,
  totalEarnings: 0,
  totalWithdrawals: 0,
  pendingWithdrawals: 0,
  pendingApprovals: 0,
  systemHealth: 'healthy',
  lastBackup: null
};

// ==================== Base Admin Guard ====================

export class BaseAdminGuard extends BaseGuard {
  constructor(options = {}) {
    super({
      name: 'BaseAdminGuard',
      type: ADMIN_GUARD_TYPES.ADMIN,
      ...options
    });
    this.requiredLevel = options.requiredLevel || ADMIN_LEVELS.ADMIN;
    this.redirectTo = options.redirectTo || ROUTES.UNAUTHORIZED;
    this.checkIp = options.checkIp !== false;
    this.checkMfa = options.checkMfa !== false;
    this.checkSession = options.checkSession !== false;
    this.allowedIps = options.allowedIps || [];
    this.sessionTimeout = options.sessionTimeout || 3600000; // 1 hour
  }

  async checkAdminStatus(user) {
    if (!user) return false;
    
    // Check if user has admin role
    const isAdmin = roleHelpers.hasAnyRole(user, [
      ROLES.ADMIN,
      ROLES.SUPER_ADMIN,
      ROLES.MODERATOR
    ]);
    
    if (!isAdmin) return false;
    
    // Check admin level
    const userLevel = this.getAdminLevel(user.role);
    if (userLevel < this.requiredLevel) return false;
    
    return true;
  }

  getAdminLevel(role) {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return ADMIN_LEVELS.SUPER_ADMIN;
      case ROLES.ADMIN:
        return ADMIN_LEVELS.ADMIN;
      case ROLES.MODERATOR:
        return ADMIN_LEVELS.MODERATOR;
      default:
        return 0;
    }
  }

  async checkIpAddress(user, ip) {
    if (!this.checkIp || this.allowedIps.length === 0) return true;
    
    // Check if IP is allowed
    return this.allowedIps.includes(ip);
  }

  async checkMfaStatus(user) {
    if (!this.checkMfa) return true;
    
    // Check if 2FA is enabled for admin
    return user.mfaEnabled === true;
  }

  async checkSessionActivity(user, lastActivity) {
    if (!this.checkSession) return true;
    
    const now = Date.now();
    const timeSinceActivity = now - (lastActivity || now);
    
    return timeSinceActivity < this.sessionTimeout;
  }

  async check(context) {
    const { user, ip, sessionLastActivity } = context;
    
    // Check admin status
    const isAdmin = await this.checkAdminStatus(user);
    if (!isAdmin) {
      return this.getResult(false, {
        redirectTo: this.redirectTo,
        message: 'Admin access required',
        meta: { requiredLevel: this.requiredLevel }
      });
    }

    // Check IP whitelist
    const ipAllowed = await this.checkIpAddress(user, ip);
    if (!ipAllowed) {
      return this.getResult(false, {
        redirectTo: this.redirectTo,
        message: 'IP address not authorized',
        meta: { ip }
      });
    }

    // Check MFA status
    const mfaEnabled = await this.checkMfaStatus(user);
    if (!mfaEnabled) {
      return this.getResult(false, {
        redirectTo: ROUTES.SETTINGS_SECURITY,
        message: '2FA required for admin access',
        meta: { requiresMfa: true }
      });
    }

    // Check session activity
    const sessionValid = await this.checkSessionActivity(user, sessionLastActivity);
    if (!sessionValid) {
      return this.getResult(false, {
        redirectTo: ROUTES.LOGIN,
        message: 'Session expired',
        meta: { sessionTimeout: this.sessionTimeout }
      });
    }

    return this.getResult(true);
  }
}

// ==================== Super Admin Guard ====================

export class SuperAdminGuard extends BaseAdminGuard {
  constructor(options = {}) {
    super({
      name: 'SuperAdminGuard',
      type: ADMIN_GUARD_TYPES.SUPER_ADMIN,
      requiredLevel: ADMIN_LEVELS.SUPER_ADMIN,
      ...options
    });
  }

  async check(context) {
    const result = await super.check(context);
    
    if (!result.allowed) return result;
    
    // Additional super admin specific checks
    const { user } = context;
    
    // Check if user has super admin permissions
    const hasSuperPermissions = roleHelpers.hasPermission(
      user,
      PERMISSIONS.MANAGE_SYSTEM
    );
    
    if (!hasSuperPermissions) {
      return this.getResult(false, {
        redirectTo: this.redirectTo,
        message: 'Super admin permissions required'
      });
    }
    
    return this.getResult(true);
  }
}

// ==================== Admin Dashboard Guard ====================

export class AdminDashboardGuard extends BaseAdminGuard {
  constructor(options = {}) {
    super({
      name: 'AdminDashboardGuard',
      type: ADMIN_GUARD_TYPES.ADMIN,
      ...options
    });
    this.allowedSections = options.allowedSections || [];
  }

  async check(context) {
    const result = await super.check(context);
    
    if (!result.allowed) return result;
    
    const { user, path } = context;
    
    // Check if user has access to specific dashboard section
    if (this.allowedSections.length > 0) {
      const section = this.getSectionFromPath(path);
      if (section && !this.allowedSections.includes(section)) {
        return this.getResult(false, {
          redirectTo: ROUTES.ADMIN_DASHBOARD,
          message: 'Access to this section restricted',
          meta: { section }
        });
      }
    }
    
    return this.getResult(true);
  }

  getSectionFromPath(path) {
    const parts = path.split('/').filter(p => p);
    return parts.length > 1 ? parts[1] : 'dashboard';
  }
  }
// ==================== Admin Permission Guard ====================

export class AdminPermissionGuard extends BaseAdminGuard {
  constructor(options = {}) {
    super({
      name: 'AdminPermissionGuard',
      type: ADMIN_GUARD_TYPES.CUSTOM,
      ...options
    });
    this.requiredPermissions = options.permissions || [];
    this.requireAll = options.requireAll || false;
  }

  async check(context) {
    const result = await super.check(context);
    
    if (!result.allowed) return result;
    
    const { user } = context;
    
    if (this.requiredPermissions.length === 0) {
      return this.getResult(true);
    }
    
    const hasPermissions = this.requireAll
      ? roleHelpers.hasAllPermissions(user, this.requiredPermissions)
      : roleHelpers.hasAnyPermission(user, this.requiredPermissions);
    
    if (!hasPermissions) {
      return this.getResult(false, {
        redirectTo: this.redirectTo,
        message: 'Insufficient admin permissions',
        meta: {
          required: this.requiredPermissions,
          requireAll: this.requireAll
        }
      });
    }
    
    return this.getResult(true);
  }
}

// ==================== Admin Resource Guard ====================

export class AdminResourceGuard extends BaseAdminGuard {
  constructor(options = {}) {
    super({
      name: 'AdminResourceGuard',
      type: ADMIN_GUARD_TYPES.CUSTOM,
      ...options
    });
    this.resourceType = options.resourceType;
    this.allowedActions = options.allowedActions || ['view'];
    this.ownershipCheck = options.ownershipCheck || false;
  }

  async check(context) {
    const result = await super.check(context);
    
    if (!result.allowed) return result;
    
    const { user, params } = context;
    const resourceId = params?.id;
    
    // Check if user can access this resource type
    const canAccess = await this.checkResourceAccess(user, this.resourceType);
    if (!canAccess) {
      return this.getResult(false, {
        redirectTo: this.redirectTo,
        message: `Cannot access ${this.resourceType} resources`,
        meta: { resourceType: this.resourceType }
      });
    }
    
    // Check specific action permission
    const action = this.getActionFromPath(context.path);
    if (!this.allowedActions.includes(action)) {
      return this.getResult(false, {
        redirectTo: this.redirectTo,
        message: `Action '${action}' not allowed`,
        meta: { allowedActions: this.allowedActions }
      });
    }
    
    // Check resource ownership if required
    if (this.ownershipCheck && resourceId) {
      const isOwner = await this.checkResourceOwnership(user, resourceId);
      if (!isOwner) {
        return this.getResult(false, {
          redirectTo: this.redirectTo,
          message: 'You do not own this resource',
          meta: { resourceId }
        });
      }
    }
    
    return this.getResult(true);
  }

  async checkResourceAccess(user, resourceType) {
    // Implement resource-specific access logic
    const resourcePermissions = {
      users: [PERMISSIONS.VIEW_USERS, PERMISSIONS.MANAGE_USERS],
      affiliates: [PERMISSIONS.VIEW_AFFILIATES, PERMISSIONS.MANAGE_AFFILIATES],
      payments: [PERMISSIONS.VIEW_PAYMENTS, PERMISSIONS.MANAGE_PAYMENTS],
      withdrawals: [PERMISSIONS.VIEW_WITHDRAWALS, PERMISSIONS.MANAGE_WITHDRAWALS],
      reports: [PERMISSIONS.VIEW_REPORTS, PERMISSIONS.MANAGE_REPORTS],
      settings: [PERMISSIONS.VIEW_SETTINGS, PERMISSIONS.MANAGE_SETTINGS],
      logs: [PERMISSIONS.VIEW_LOGS, PERMISSIONS.MANAGE_LOGS],
      system: [PERMISSIONS.VIEW_SYSTEM, PERMISSIONS.MANAGE_SYSTEM]
    };
    
    const requiredPermissions = resourcePermissions[resourceType] || [];
    return roleHelpers.hasAnyPermission(user, requiredPermissions);
  }

  async checkResourceOwnership(user, resourceId) {
    // Implement ownership check logic
    // This would typically query the database
    return true; // Placeholder
  }

  getActionFromPath(path) {
    const parts = path.split('/').filter(p => p);
    const lastPart = parts[parts.length - 1];
    
    if (lastPart === 'create') return 'create';
    if (lastPart === 'edit') return 'edit';
    if (lastPart.match(/^[0-9a-f]+$/)) return 'view';
    
    return lastPart;
  }
}

// ==================== Admin IP Restriction Guard ====================

export class AdminIPRestrictionGuard extends BaseAdminGuard {
  constructor(options = {}) {
    super({
      name: 'AdminIPRestrictionGuard',
      type: ADMIN_GUARD_TYPES.CUSTOM,
      ...options
    });
    this.allowedCountries = options.allowedCountries || [];
    this.blockedCountries = options.blockedCountries || [];
    this.allowedIPs = options.allowedIPs || [];
    this.blockedIPs = options.blockedIPs || [];
    this.useGeoIP = options.useGeoIP || false;
  }

  async check(context) {
    const result = await super.check(context);
    
    if (!result.allowed) return result;
    
    const { ip } = context;
    
    // Check IP whitelist
    if (this.allowedIPs.length > 0 && !this.allowedIPs.includes(ip)) {
      return this.getResult(false, {
        redirectTo: this.redirectTo,
        message: 'IP not in whitelist',
        meta: { ip }
      });
    }
    
    // Check IP blacklist
    if (this.blockedIPs.includes(ip)) {
      return this.getResult(false, {
        redirectTo: this.redirectTo,
        message: 'IP is blacklisted',
        meta: { ip }
      });
    }
    
    // Check country restrictions
    if (this.useGeoIP && (this.allowedCountries.length > 0 || this.blockedCountries.length > 0)) {
      const country = await this.getCountryFromIP(ip);
      
      if (this.allowedCountries.length > 0 && !this.allowedCountries.includes(country)) {
        return this.getResult(false, {
          redirectTo: this.redirectTo,
          message: 'Access from your country is restricted',
          meta: { country }
        });
      }
      
      if (this.blockedCountries.includes(country)) {
        return this.getResult(false, {
          redirectTo: this.redirectTo,
          message: 'Access from your country is blocked',
          meta: { country }
        });
      }
    }
    
    return this.getResult(true);
  }

  async getCountryFromIP(ip) {
    // Implement IP to country lookup
    // This would typically call a geolocation API
    return 'US'; // Placeholder
  }
}

// ==================== Admin Time Restriction Guard ====================

export class AdminTimeRestrictionGuard extends BaseAdminGuard {
  constructor(options = {}) {
    super({
      name: 'AdminTimeRestrictionGuard',
      type: ADMIN_GUARD_TYPES.CUSTOM,
      ...options
    });
    this.allowedHours = options.allowedHours || { start: 0, end: 24 };
    this.allowedDays = options.allowedDays || [0, 1, 2, 3, 4, 5, 6];
    this.timezone = options.timezone || 'UTC';
  }

  async check(context) {
    const result = await super.check(context);
    
    if (!result.allowed) return result;
    
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Check hour restriction
    if (hour < this.allowedHours.start || hour >= this.allowedHours.end) {
      return this.getResult(false, {
        redirectTo: this.redirectTo,
        message: 'Access restricted during these hours',
        meta: {
          currentHour: hour,
          allowedHours: this.allowedHours
        }
      });
    }
    
    // Check day restriction
    if (!this.allowedDays.includes(day)) {
      return this.getResult(false, {
        redirectTo: this.redirectTo,
        message: 'Access restricted on this day',
        meta: {
          currentDay: day,
          allowedDays: this.allowedDays
        }
      });
    }
    
    return this.getResult(true);
  }
}

// ==================== Admin Audit Guard ====================

export class AdminAuditGuard extends BaseAdminGuard {
  constructor(options = {}) {
    super({
      name: 'AdminAuditGuard',
      type: ADMIN_GUARD_TYPES.CUSTOM,
      ...options
    });
    this.auditLevel = options.auditLevel || 'basic'; // basic, detailed, full
    this.logActions = options.logActions !== false;
  }

  async check(context) {
    const result = await super.check(context);
    
    // Log the access attempt
    await this.logAccess(context, result);
    
    return result;
  }

  async logAccess(context, result) {
    if (!this.logActions) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      user: context.user?.id,
      ip: context.ip,
      path: context.path,
      method: context.method,
      action: this.getActionFromPath(context.path),
      allowed: result.allowed,
      reason: result.message,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
      auditLevel: this.auditLevel
    };
    
    // Store in database or send to logging service
    console.log('Admin access audit:', logEntry);
    
    // Store in localStorage for development
    if (process.env.NODE_ENV === 'development') {
      const logs = JSON.parse(localStorage.getItem('admin_audit_logs') || '[]');
      logs.push(logEntry);
      localStorage.setItem('admin_audit_logs', JSON.stringify(logs.slice(-100)));
    }
  }

  getActionFromPath(path) {
    const parts = path.split('/').filter(p => p);
    return parts.length > 1 ? `${parts[0]}_${parts[1]}` : parts[0] || 'root';
  }
  }
// ==================== Admin Guard Factory ====================

export class AdminGuardFactory {
  static createGuard(type, options = {}) {
    switch (type) {
      case ADMIN_GUARD_TYPES.SUPER_ADMIN:
        return new SuperAdminGuard(options);
      case ADMIN_GUARD_TYPES.ADMIN:
        return new BaseAdminGuard(options);
      case ADMIN_GUARD_TYPES.MODERATOR:
        return new BaseAdminGuard({ ...options, requiredLevel: ADMIN_LEVELS.MODERATOR });
      case ADMIN_GUARD_TYPES.STAFF:
        return new BaseAdminGuard({ ...options, requiredLevel: ADMIN_LEVELS.STAFF });
      default:
        throw new Error(`Unknown admin guard type: ${type}`);
    }
  }

  static createPermissionGuard(permissions, options = {}) {
    return new AdminPermissionGuard({ ...options, permissions });
  }

  static createResourceGuard(resourceType, options = {}) {
    return new AdminResourceGuard({ ...options, resourceType });
  }

  static createIPRestrictionGuard(options = {}) {
    return new AdminIPRestrictionGuard(options);
  }

  static createTimeRestrictionGuard(options = {}) {
    return new AdminTimeRestrictionGuard(options);
  }

  static createAuditGuard(options = {}) {
    return new AdminAuditGuard(options);
  }

  static createDashboardGuard(options = {}) {
    return new AdminDashboardGuard(options);
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
      }
    };
  }
}

// ==================== React Components ====================

export const AdminGuard = ({ children, fallback = null, ...options }) => {
  const auth = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    const checkGuard = async () => {
      const guard = new BaseAdminGuard(options);
      const context = GuardContext.fromAuth(auth);
      context.path = location.pathname;
      context.ip = options.testIp || '127.0.0.1'; // In production, get from request
      context.sessionLastActivity = auth.user?.lastActivity;
      
      const result = await guard.execute(context);
      
      setIsAllowed(result.allowed);
      
      if (!result.allowed && result.redirectTo) {
        setRedirect({
          to: result.redirectTo,
          state: { from: location, message: result.message }
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

export const SuperAdminGuard = ({ children, ...options }) => {
  return (
    <AdminGuard type={ADMIN_GUARD_TYPES.SUPER_ADMIN} {...options}>
      {children}
    </AdminGuard>
  );
};

export const AdminPermissionGuardComponent = ({ 
  children, 
  permissions, 
  requireAll = false,
  ...options 
}) => {
  const auth = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    const checkGuard = async () => {
      const guard = new AdminPermissionGuard({ ...options, permissions, requireAll });
      const context = GuardContext.fromAuth(auth);
      context.path = location.pathname;
      
      const result = await guard.execute(context);
      
      setIsAllowed(result.allowed);
      
      if (!result.allowed && result.redirectTo) {
        setRedirect({
          to: result.redirectTo,
          state: { from: location, message: result.message }
        });
      }
      
      setIsChecking(false);
    };

    checkGuard();
  }, [auth, location, permissions, requireAll, options]);

  if (isChecking) {
    return <LoadingSpinner />;
  }

  if (!isAllowed && redirect) {
    return <Navigate to={redirect.to} state={redirect.state} replace />;
  }

  return children;
};

export const AdminResourceGuardComponent = ({ 
  children, 
  resourceType,
  allowedActions = ['view'],
  ...options 
}) => {
  const auth = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    const checkGuard = async () => {
      const guard = new AdminResourceGuard({ 
        ...options, 
        resourceType, 
        allowedActions 
      });
      const context = GuardContext.fromAuth(auth);
      context.path = location.pathname;
      context.params = { id: location.pathname.split('/').pop() };
      
      const result = await guard.execute(context);
      
      setIsAllowed(result.allowed);
      
      if (!result.allowed && result.redirectTo) {
        setRedirect({
          to: result.redirectTo,
          state: { from: location, message: result.message }
        });
      }
      
      setIsChecking(false);
    };

    checkGuard();
  }, [auth, location, resourceType, allowedActions, options]);

  if (isChecking) {
    return <LoadingSpinner />;
  }

  if (!isAllowed && redirect) {
    return <Navigate to={redirect.to} state={redirect.state} replace />;
  }

  return children;
};

// ==================== HOCs ====================

export const withAdminGuard = (WrappedComponent, options = {}) => {
  return function WithAdminGuard(props) {
    return (
      <AdminGuard {...options}>
        <WrappedComponent {...props} />
      </AdminGuard>
    );
  };
};

export const withSuperAdminGuard = (WrappedComponent, options = {}) => {
  return function WithSuperAdminGuard(props) {
    return (
      <SuperAdminGuard {...options}>
        <WrappedComponent {...props} />
      </SuperAdminGuard>
    );
  };
};

export const withAdminPermissionGuard = (WrappedComponent, permissions, options = {}) => {
  return function WithAdminPermissionGuard(props) {
    return (
      <AdminPermissionGuardComponent permissions={permissions} {...options}>
        <WrappedComponent {...props} />
      </AdminPermissionGuardComponent>
    );
  };
};

// ==================== Utility Functions ====================

export const adminGuardUtils = {
  // Check if user is admin
  isAdmin: (user) => {
    return roleHelpers.hasAnyRole(user, [
      ROLES.ADMIN,
      ROLES.SUPER_ADMIN,
      ROLES.MODERATOR
    ]);
  },

  // Check if user is super admin
  isSuperAdmin: (user) => {
    return user?.role === ROLES.SUPER_ADMIN;
  },

  // Get admin level
  getAdminLevel: (role) => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return 'super_admin';
      case ROLES.ADMIN:
        return 'admin';
      case ROLES.MODERATOR:
        return 'moderator';
      default:
        return null;
    }
  },

  // Get admin dashboard metrics
  getAdminMetrics: async () => {
    // Fetch from API
    return ADMIN_METRICS;
  },

  // Log admin action
  logAdminAction: (action, details = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      details,
      user: JSON.parse(localStorage.getItem('auth_user') || '{}').id
    };
    
    const logs = JSON.parse(localStorage.getItem('admin_action_logs') || '[]');
    logs.push(logEntry);
    localStorage.setItem('admin_action_logs', JSON.stringify(logs.slice(-100)));
  },

  // Check admin session
  checkAdminSession: (user) => {
    if (!user) return false;
    
    const sessionStart = localStorage.getItem('admin_session_start');
    if (!sessionStart) return false;
    
    const sessionDuration = Date.now() - parseInt(sessionStart);
    const maxSessionDuration = 8 * 60 * 60 * 1000; // 8 hours
    
    return sessionDuration < maxSessionDuration;
  },

  // Start admin session
  startAdminSession: () => {
    localStorage.setItem('admin_session_start', Date.now().toString());
  },

  // End admin session
  endAdminSession: () => {
    localStorage.removeItem('admin_session_start');
  },

  // Get admin activity summary
  getAdminActivitySummary: () => {
    const logs = JSON.parse(localStorage.getItem('admin_action_logs') || '[]');
    
    return {
      totalActions: logs.length,
      lastAction: logs[logs.length - 1],
      actionsByType: logs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {})
    };
  }
};

// ==================== Export all ====================

export const adminGuard = {
  // Types
  ADMIN_GUARD_TYPES,
  ADMIN_LEVELS,
  ADMIN_REDIRECTS,
  
  // Guards
  BaseAdminGuard,
  SuperAdminGuard,
  AdminDashboardGuard,
  AdminPermissionGuard,
  AdminResourceGuard,
  AdminIPRestrictionGuard,
  AdminTimeRestrictionGuard,
  AdminAuditGuard,
  
  // Factory
  AdminGuardFactory,
  
  // React Components
  AdminGuard,
  SuperAdminGuard,
  AdminPermissionGuardComponent,
  AdminResourceGuardComponent,
  
  // HOCs
  withAdminGuard,
  withSuperAdminGuard,
  withAdminPermissionGuard,
  
  // Utilities
  adminGuardUtils
};

export default adminGuard;
