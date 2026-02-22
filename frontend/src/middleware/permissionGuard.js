import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/routes';
import { PERMISSIONS, roleHelpers } from '../config/roles';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { GuardResult, GuardContext, BaseGuard } from './authGuard';

// ==================== Permission Guard Types ====================

export const PERMISSION_GUARD_TYPES = {
  SINGLE: 'single',
  ANY: 'any',
  ALL: 'all',
  NONE: 'none',
  CUSTOM: 'custom'
};

export const PERMISSION_CHECK_MODES = {
  STRICT: 'strict',
  LAX: 'lax',
  HIERARCHICAL: 'hierarchical'
};

export const PERMISSION_CACHE_TYPES = {
  NONE: 'none',
  MEMORY: 'memory',
  LOCAL_STORAGE: 'localStorage',
  SESSION: 'session'
};

export const PERMISSION_REDIRECTS = {
  DEFAULT: ROUTES.UNAUTHORIZED,
  LOGIN: ROUTES.LOGIN,
  FORBIDDEN: ROUTES.FORBIDDEN,
  UPGRADE: ROUTES.UPGRADE_ACCOUNT
};

// ==================== Permission Cache ====================

class PermissionCache {
  constructor(type = PERMISSION_CACHE_TYPES.MEMORY, ttl = 300000) {
    this.type = type;
    this.ttl = ttl;
    this.cache = new Map();
    this.storage = type === PERMISSION_CACHE_TYPES.LOCAL_STORAGE ? localStorage : 
                   type === PERMISSION_CACHE_TYPES.SESSION ? sessionStorage : null;
  }

  get(key) {
    if (this.type === PERMISSION_CACHE_TYPES.NONE) return null;
    
    if (this.type === PERMISSION_CACHE_TYPES.MEMORY) {
      const item = this.cache.get(key);
      if (item && Date.now() - item.timestamp < this.ttl) {
        return item.value;
      }
      this.cache.delete(key);
      return null;
    }
    
    if (this.storage) {
      const item = JSON.parse(this.storage.getItem(`perm_${key}`) || 'null');
      if (item && Date.now() - item.timestamp < this.ttl) {
        return item.value;
      }
      this.storage.removeItem(`perm_${key}`);
      return null;
    }
    
    return null;
  }

  set(key, value) {
    const item = { value, timestamp: Date.now() };
    
    if (this.type === PERMISSION_CACHE_TYPES.MEMORY) {
      this.cache.set(key, item);
    } else if (this.storage) {
      this.storage.setItem(`perm_${key}`, JSON.stringify(item));
    }
  }

  clear() {
    this.cache.clear();
    if (this.storage) {
      const keys = Object.keys(this.storage);
      keys.forEach(key => {
        if (key.startsWith('perm_')) {
          this.storage.removeItem(key);
        }
      });
    }
  }

  remove(key) {
    this.cache.delete(key);
    if (this.storage) {
      this.storage.removeItem(`perm_${key}`);
    }
  }
}

// ==================== Base Permission Guard ====================

export class BasePermissionGuard extends BaseGuard {
  constructor(options = {}) {
    super({
      name: 'BasePermissionGuard',
      type: PERMISSION_GUARD_TYPES.SINGLE,
      ...options
    });
    this.permissions = options.permissions || [];
    this.checkMode = options.checkMode || PERMISSION_CHECK_MODES.STRICT;
    this.requireAll = options.requireAll !== false;
    this.requireAny = options.requireAny || false;
    this.requireNone = options.requireNone || false;
    this.redirectTo = options.redirectTo || PERMISSION_REDIRECTS.DEFAULT;
    this.cacheType = options.cacheType || PERMISSION_CACHE_TYPES.MEMORY;
    this.cacheTtl = options.cacheTtl || 300000; // 5 minutes
    this.cache = new PermissionCache(this.cacheType, this.cacheTtl);
    this.contextRequired = options.contextRequired || false;
  }

  async check(context) {
    const { user } = context;
    
    if (!user) {
      return this.getResult(false, {
        redirectTo: PERMISSION_REDIRECTS.LOGIN,
        message: 'Authentication required'
      });
    }

    // Check cache first
    const cacheKey = this.getCacheKey(user, context);
    const cached = this.cache.get(cacheKey);
    if (cached !== null) {
      return cached ? this.getResult(true) : this.getResult(false, {
        redirectTo: this.redirectTo,
        message: 'Permission denied (cached)',
        meta: { permissions: this.permissions }
      });
    }

    // Perform permission check
    const hasPermission = await this.checkPermissions(user, context);
    
    // Cache the result
    this.cache.set(cacheKey, hasPermission);
    
    if (!hasPermission) {
      return this.getResult(false, {
        redirectTo: this.redirectTo,
        message: 'Insufficient permissions',
        meta: {
          permissions: this.permissions,
          userRole: user.role,
          userPermissions: user.permissions
        }
      });
    }

    return this.getResult(true);
  }

  async checkPermissions(user, context) {
    if (this.requireNone) {
      return !await this.hasAnyPermission(user, this.permissions, context);
    }
    
    if (this.requireAny) {
      return await this.hasAnyPermission(user, this.permissions, context);
    }
    
    if (this.requireAll) {
      return await this.hasAllPermissions(user, this.permissions, context);
    }
    
    // Single permission
    return await this.hasPermission(user, this.permissions[0], context);
  }

  async hasPermission(user, permission, context) {
    // Check if user has the permission directly
    if (roleHelpers.hasPermission(user, permission)) {
      return true;
    }
    
    // Check hierarchical permissions if mode is hierarchical
    if (this.checkMode === PERMISSION_CHECK_MODES.HIERARCHICAL) {
      return await this.checkHierarchicalPermission(user, permission, context);
    }
    
    // Check context-based permissions if required
    if (this.contextRequired) {
      return await this.checkContextPermission(user, permission, context);
    }
    
    return false;
  }

  async hasAnyPermission(user, permissions, context) {
    for (const permission of permissions) {
      if (await this.hasPermission(user, permission, context)) {
        return true;
      }
    }
    return false;
  }

  async hasAllPermissions(user, permissions, context) {
    for (const permission of permissions) {
      if (!await this.hasPermission(user, permission, context)) {
        return false;
      }
    }
    return true;
  }

  async checkHierarchicalPermission(user, permission, context) {
    // Implement hierarchical permission checking
    // e.g., if user has 'manage_users', they automatically have 'view_users'
    const hierarchy = {
      [PERMISSIONS.MANAGE_USERS]: [PERMISSIONS.VIEW_USERS, PERMISSIONS.EDIT_USERS, PERMISSIONS.CREATE_USERS, PERMISSIONS.DELETE_USERS],
      [PERMISSIONS.MANAGE_AFFILIATES]: [PERMISSIONS.VIEW_AFFILIATES, PERMISSIONS.EDIT_AFFILIATES, PERMISSIONS.CREATE_AFFILIATES, PERMISSIONS.DELETE_AFFILIATES],
      [PERMISSIONS.MANAGE_PAYMENTS]: [PERMISSIONS.VIEW_PAYMENTS, PERMISSIONS.PROCESS_PAYMENTS, PERMISSIONS.REFUND_PAYMENTS],
      [PERMISSIONS.MANAGE_WITHDRAWALS]: [PERMISSIONS.VIEW_WITHDRAWALS, PERMISSIONS.APPROVE_WITHDRAWALS, PERMISSIONS.PROCESS_WITHDRAWALS]
    };

    for (const [parentPerm, childPerms] of Object.entries(hierarchy)) {
      if (childPerms.includes(permission) && roleHelpers.hasPermission(user, parentPerm)) {
        return true;
      }
    }

    return false;
  }

  async checkContextPermission(user, permission, context) {
    // Implement context-based permission checking
    // e.g., user can edit their own profile even without EDIT_USERS permission
    const { resourceId, resourceType, ownerId } = context;
    
    if (permission === PERMISSIONS.EDIT_USERS && resourceId === user.id) {
      return true;
    }
    
    if (permission === PERMISSIONS.VIEW_AFFILIATES && ownerId === user.id) {
      return true;
    }
    
    return false;
  }

  getCacheKey(user, context) {
    return `${user.id}_${this.permissions.join('_')}_${this.requireAll}_${this.requireAny}_${this.requireNone}`;
  }

  clearCache() {
    this.cache.clear();
  }
        }
// ==================== Resource Permission Guard ====================

export class ResourcePermissionGuard extends BasePermissionGuard {
  constructor(options = {}) {
    super({
      name: 'ResourcePermissionGuard',
      ...options
    });
    this.resourceType = options.resourceType;
    this.resourceActions = options.resourceActions || ['view', 'create', 'edit', 'delete'];
    this.ownershipRequired = options.ownershipRequired || false;
    this.ownershipField = options.ownershipField || 'userId';
  }

  async check(context) {
    const result = await super.check(context);
    
    if (!result.allowed) return result;
    
    const { user, params } = context;
    const resourceId = params?.id;
    
    // Check resource type permissions
    for (const action of this.resourceActions) {
      const permission = `${this.resourceType}:${action}`;
      const hasPermission = await this.hasPermission(user, permission, context);
      
      if (!hasPermission && this.requireAll) {
        return this.getResult(false, {
          redirectTo: this.redirectTo,
          message: `Missing permission: ${permission}`,
          meta: { resourceType: this.resourceType, action }
        });
      }
    }
    
    // Check ownership if required
    if (this.ownershipRequired && resourceId) {
      const isOwner = await this.checkOwnership(user, resourceId, context);
      if (!isOwner) {
        return this.getResult(false, {
          redirectTo: this.redirectTo,
          message: 'You do not own this resource',
          meta: { resourceId, resourceType: this.resourceType }
        });
      }
    }
    
    return this.getResult(true);
  }

  async checkOwnership(user, resourceId, context) {
    // This would typically query the database
    // For now, return true if user has admin role
    if (user.role === 'admin' || user.role === 'super_admin') {
      return true;
    }
    
    // Check if resource exists and belongs to user
    const resource = await this.getResource(resourceId, context);
    return resource && resource[this.ownershipField] === user.id;
  }

  async getResource(resourceId, context) {
    // Implement resource fetching logic
    // This would typically call an API or database
    return null;
  }
}

// ==================== Role Hierarchy Permission Guard ====================

export class RoleHierarchyGuard extends BasePermissionGuard {
  constructor(options = {}) {
    super({
      name: 'RoleHierarchyGuard',
      checkMode: PERMISSION_CHECK_MODES.HIERARCHICAL,
      ...options
    });
    this.minRoleLevel = options.minRoleLevel;
    this.maxRoleLevel = options.maxRoleLevel;
    this.allowedRoles = options.allowedRoles || [];
  }

  async check(context) {
    const result = await super.check(context);
    
    if (!result.allowed) return result;
    
    const { user } = context;
    
    // Check role level restrictions
    if (this.minRoleLevel) {
      const userLevel = roleHelpers.getRoleLevel(user.role);
      if (userLevel < this.minRoleLevel) {
        return this.getResult(false, {
          redirectTo: this.redirectTo,
          message: 'Insufficient role level',
          meta: { requiredLevel: this.minRoleLevel, userLevel }
        });
      }
    }
    
    if (this.maxRoleLevel) {
      const userLevel = roleHelpers.getRoleLevel(user.role);
      if (userLevel > this.maxRoleLevel) {
        return this.getResult(false, {
          redirectTo: this.redirectTo,
          message: 'Role level too high',
          meta: { maxLevel: this.maxRoleLevel, userLevel }
        });
      }
    }
    
    // Check specific roles
    if (this.allowedRoles.length > 0) {
      const hasAllowedRole = this.allowedRoles.includes(user.role);
      if (!hasAllowedRole) {
        return this.getResult(false, {
          redirectTo: this.redirectTo,
          message: 'Role not allowed',
          meta: { allowedRoles: this.allowedRoles, userRole: user.role }
        });
      }
    }
    
    return this.getResult(true);
  }
}

// ==================== Feature Flag Permission Guard ====================

export class FeatureFlagGuard extends BasePermissionGuard {
  constructor(options = {}) {
    super({
      name: 'FeatureFlagGuard',
      ...options
    });
    this.featureFlag = options.featureFlag;
    this.requiredValue = options.requiredValue !== false;
    this.fallbackAction = options.fallbackAction || 'disable';
  }

  async check(context) {
    const { features } = context;
    
    // Check if feature flag exists and matches required value
    const featureValue = features?.[this.featureFlag];
    
    if (featureValue !== this.requiredValue) {
      if (this.fallbackAction === 'disable') {
        return this.getResult(false, {
          redirectTo: this.redirectTo,
          message: 'Feature not available',
          meta: { featureFlag: this.featureFlag, requiredValue: this.requiredValue, actualValue: featureValue }
        });
      } else {
        // Fallback to permission-based check
        return await super.check(context);
      }
    }
    
    return this.getResult(true);
  }
}

// ==================== Conditional Permission Guard ====================

export class ConditionalPermissionGuard extends BasePermissionGuard {
  constructor(options = {}) {
    super({
      name: 'ConditionalPermissionGuard',
      ...options
    });
    this.condition = options.condition;
    this.truePermissions = options.truePermissions || [];
    this.falsePermissions = options.falsePermissions || [];
  }

  async check(context) {
    // Evaluate condition
    const conditionResult = await this.evaluateCondition(context);
    
    // Use appropriate permission set based on condition
    const permissions = conditionResult ? this.truePermissions : this.falsePermissions;
    
    if (permissions.length === 0) {
      return this.getResult(true);
    }
    
    // Check permissions
    const hasPermissions = await this.hasAllPermissions(context.user, permissions, context);
    
    if (!hasPermissions) {
      return this.getResult(false, {
        redirectTo: this.redirectTo,
        message: 'Conditional permissions not met',
        meta: { condition: conditionResult, requiredPermissions: permissions }
      });
    }
    
    return this.getResult(true);
  }

  async evaluateCondition(context) {
    if (typeof this.condition === 'function') {
      return await this.condition(context);
    }
    return !!this.condition;
  }
}

// ==================== Time-Based Permission Guard ====================

export class TimeBasedPermissionGuard extends BasePermissionGuard {
  constructor(options = {}) {
    super({
      name: 'TimeBasedPermissionGuard',
      ...options
    });
    this.timeRanges = options.timeRanges || [];
    this.defaultPermission = options.defaultPermission || false;
  }

  async check(context) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    
    // Check if current time falls within any allowed range
    let allowed = this.defaultPermission;
    
    for (const range of this.timeRanges) {
      const { days, startHour, endHour, permissions } = range;
      
      // Check day
      if (days && !days.includes(currentDay)) {
        continue;
      }
      
      // Check hour
      if (startHour !== undefined && endHour !== undefined) {
        if (currentHour < startHour || currentHour >= endHour) {
          continue;
        }
      }
      
      // Time range matched, check permissions
      if (permissions && permissions.length > 0) {
        const hasPermissions = await this.hasAllPermissions(context.user, permissions, context);
        if (hasPermissions) {
          allowed = true;
          break;
        }
      } else {
        allowed = true;
        break;
      }
    }
    
    if (!allowed) {
      return this.getResult(false, {
        redirectTo: this.redirectTo,
        message: 'Access not allowed at this time',
        meta: { currentHour, currentDay, timeRanges: this.timeRanges }
      });
    }
    
    return this.getResult(true);
  }
  }
// ==================== Permission Guard Factory ====================

export class PermissionGuardFactory {
  static createGuard(type, options = {}) {
    switch (type) {
      case PERMISSION_GUARD_TYPES.SINGLE:
        return new BasePermissionGuard({ ...options, requireAll: false, requireAny: false });
      case PERMISSION_GUARD_TYPES.ANY:
        return new BasePermissionGuard({ ...options, requireAny: true });
      case PERMISSION_GUARD_TYPES.ALL:
        return new BasePermissionGuard({ ...options, requireAll: true });
      case PERMISSION_GUARD_TYPES.NONE:
        return new BasePermissionGuard({ ...options, requireNone: true });
      default:
        throw new Error(`Unknown permission guard type: ${type}`);
    }
  }

  static createResourceGuard(resourceType, options = {}) {
    return new ResourcePermissionGuard({ ...options, resourceType });
  }

  static createRoleHierarchyGuard(options = {}) {
    return new RoleHierarchyGuard(options);
  }

  static createFeatureFlagGuard(featureFlag, options = {}) {
    return new FeatureFlagGuard({ ...options, featureFlag });
  }

  static createConditionalGuard(condition, options = {}) {
    return new ConditionalPermissionGuard({ ...options, condition });
  }

  static createTimeBasedGuard(timeRanges, options = {}) {
    return new TimeBasedPermissionGuard({ ...options, timeRanges });
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

export const PermissionGuard = ({ children, permissions, requireAll = true, requireAny = false, requireNone = false, fallback = null, ...options }) => {
  const auth = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    const checkGuard = async () => {
      let guardType = PERMISSION_GUARD_TYPES.SINGLE;
      if (requireAny) guardType = PERMISSION_GUARD_TYPES.ANY;
      if (requireAll) guardType = PERMISSION_GUARD_TYPES.ALL;
      if (requireNone) guardType = PERMISSION_GUARD_TYPES.NONE;
      
      const guard = PermissionGuardFactory.createGuard(guardType, {
        permissions,
        ...options
      });
      
      const context = GuardContext.fromAuth(auth);
      context.path = location.pathname;
      context.params = { id: location.pathname.split('/').pop() };
      context.features = options.features || {};
      
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
  }, [auth, location, permissions, requireAll, requireAny, requireNone, options]);

  if (isChecking) {
    return fallback || <LoadingSpinner />;
  }

  if (!isAllowed && redirect) {
    return <Navigate to={redirect.to} state={redirect.state} replace />;
  }

  return children;
};

export const SinglePermissionGuard = ({ children, permission, ...options }) => {
  return (
    <PermissionGuard permissions={[permission]} requireAll={false} requireAny={false} {...options}>
      {children}
    </PermissionGuard>
  );
};

export const AnyPermissionGuard = ({ children, permissions, ...options }) => {
  return (
    <PermissionGuard permissions={permissions} requireAny={true} {...options}>
      {children}
    </PermissionGuard>
  );
};

export const AllPermissionsGuard = ({ children, permissions, ...options }) => {
  return (
    <PermissionGuard permissions={permissions} requireAll={true} {...options}>
      {children}
    </PermissionGuard>
  );
};

export const NonePermissionGuard = ({ children, permissions, ...options }) => {
  return (
    <PermissionGuard permissions={permissions} requireNone={true} {...options}>
      {children}
    </PermissionGuard>
  );
};

export const ResourcePermissionGuardComponent = ({ children, resourceType, actions, ...options }) => {
  const auth = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    const checkGuard = async () => {
      const guard = new ResourcePermissionGuard({ resourceType, resourceActions: actions, ...options });
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
  }, [auth, location, resourceType, actions, options]);

  if (isChecking) {
    return <LoadingSpinner />;
  }

  if (!isAllowed && redirect) {
    return <Navigate to={redirect.to} state={redirect.state} replace />;
  }

  return children;
};

// ==================== HOCs ====================

export const withPermissionGuard = (WrappedComponent, permissions, options = {}) => {
  return function WithPermissionGuard(props) {
    return (
      <PermissionGuard permissions={permissions} {...options}>
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
};

export const withSinglePermission = (WrappedComponent, permission, options = {}) => {
  return function WithSinglePermission(props) {
    return (
      <SinglePermissionGuard permission={permission} {...options}>
        <WrappedComponent {...props} />
      </SinglePermissionGuard>
    );
  };
};

export const withAnyPermission = (WrappedComponent, permissions, options = {}) => {
  return function WithAnyPermission(props) {
    return (
      <AnyPermissionGuard permissions={permissions} {...options}>
        <WrappedComponent {...props} />
      </AnyPermissionGuard>
    );
  };
};

export const withAllPermissions = (WrappedComponent, permissions, options = {}) => {
  return function WithAllPermissions(props) {
    return (
      <AllPermissionsGuard permissions={permissions} {...options}>
        <WrappedComponent {...props} />
      </AllPermissionsGuard>
    );
  };
};

// ==================== Utility Functions ====================

export const permissionGuardUtils = {
  // Check if user has permission
  hasPermission: (user, permission) => {
    return roleHelpers.hasPermission(user, permission);
  },

  // Check if user has any permission
  hasAnyPermission: (user, permissions) => {
    return roleHelpers.hasAnyPermission(user, permissions);
  },

  // Check if user has all permissions
  hasAllPermissions: (user, permissions) => {
    return roleHelpers.hasAllPermissions(user, permissions);
  },

  // Get all user permissions
  getAllPermissions: (user) => {
    return roleHelpers.getAllPermissions(user);
  },

  // Check resource permission
  checkResourcePermission: async (user, resourceType, action, resourceId) => {
    const guard = new ResourcePermissionGuard({ resourceType, resourceActions: [action] });
    const context = { user, params: { id: resourceId } };
    const result = await guard.check(context);
    return result.allowed;
  },

  // Get permission description
  getPermissionDescription: (permission) => {
    const descriptions = {
      [PERMISSIONS.VIEW_USERS]: 'View user list and details',
      [PERMISSIONS.CREATE_USERS]: 'Create new users',
      [PERMISSIONS.EDIT_USERS]: 'Edit user information',
      [PERMISSIONS.DELETE_USERS]: 'Delete users',
      [PERMISSIONS.MANAGE_USERS]: 'Full user management',
      
      [PERMISSIONS.VIEW_AFFILIATES]: 'View affiliate list',
      [PERMISSIONS.CREATE_AFFILIATES]: 'Create new affiliates',
      [PERMISSIONS.EDIT_AFFILIATES]: 'Edit affiliate information',
      [PERMISSIONS.DELETE_AFFILIATES]: 'Delete affiliates',
      [PERMISSIONS.MANAGE_AFFILIATES]: 'Full affiliate management',
      
      [PERMISSIONS.VIEW_PAYMENTS]: 'View payment transactions',
      [PERMISSIONS.PROCESS_PAYMENTS]: 'Process payments',
      [PERMISSIONS.REFUND_PAYMENTS]: 'Process refunds',
      [PERMISSIONS.MANAGE_PAYMENTS]: 'Full payment management',
      
      [PERMISSIONS.VIEW_WITHDRAWALS]: 'View withdrawal requests',
      [PERMISSIONS.APPROVE_WITHDRAWALS]: 'Approve withdrawals',
      [PERMISSIONS.PROCESS_WITHDRAWALS]: 'Process withdrawals',
      [PERMISSIONS.MANAGE_WITHDRAWALS]: 'Full withdrawal management'
    };
    
    return descriptions[permission] || permission;
  },

  // Get permission category
  getPermissionCategory: (permission) => {
    return permission?.split(':')[0] || 'unknown';
  },

  // Get permission action
  getPermissionAction: (permission) => {
    return permission?.split(':')[1] || 'unknown';
  },

  // Group permissions by category
  groupPermissionsByCategory: (permissions) => {
    return permissions.reduce((groups, permission) => {
      const category = permissionGuardUtils.getPermissionCategory(permission);
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(permission);
      return groups;
    }, {});
  },

  // Get permissions by resource
  getPermissionsByResource: (resource) => {
    return Object.values(PERMISSIONS).filter(p => p.startsWith(`${resource}:`));
  },

  // Check if permission exists
  isValidPermission: (permission) => {
    return Object.values(PERMISSIONS).includes(permission);
  },

  // Get all available permissions
  getAllAvailablePermissions: () => {
    return Object.values(PERMISSIONS);
  },

  // Get permission options for select
  getPermissionOptions: () => {
    return Object.values(PERMISSIONS).map(permission => ({
      value: permission,
      label: permissionGuardUtils.getPermissionDescription(permission),
      category: permissionGuardUtils.getPermissionCategory(permission)
    }));
  },

  // Clear permission cache
  clearPermissionCache: () => {
    const guards = [
      BasePermissionGuard,
      ResourcePermissionGuard,
      RoleHierarchyGuard,
      FeatureFlagGuard,
      ConditionalPermissionGuard,
      TimeBasedPermissionGuard
    ];
    
    guards.forEach(Guard => {
      if (Guard.prototype.cache) {
        Guard.prototype.cache.clear();
      }
    });
  },

  // Create permission middleware for Express
  createPermissionMiddleware: (permission, options = {}) => {
    return async (req, res, next) => {
      const guard = new BasePermissionGuard({ permissions: [permission], ...options });
      const context = GuardContext.fromRequest(req);
      const result = await guard.execute(context);
      
      if (!result.allowed) {
        return res.status(403).json({
          error: 'Forbidden',
          message: result.message,
          required: permission
        });
      }
      
      next();
    };
  }
};

// ==================== Export all ====================

export const permissionGuard = {
  // Types
  PERMISSION_GUARD_TYPES,
  PERMISSION_CHECK_MODES,
  PERMISSION_CACHE_TYPES,
  PERMISSION_REDIRECTS,
  
  // Classes
  PermissionCache,
  BasePermissionGuard,
  ResourcePermissionGuard,
  RoleHierarchyGuard,
  FeatureFlagGuard,
  ConditionalPermissionGuard,
  TimeBasedPermissionGuard,
  
  // Factory
  PermissionGuardFactory,
  
  // React Components
  PermissionGuard,
  SinglePermissionGuard,
  AnyPermissionGuard,
  AllPermissionsGuard,
  NonePermissionGuard,
  ResourcePermissionGuardComponent,
  
  // HOCs
  withPermissionGuard,
  withSinglePermission,
  withAnyPermission,
  withAllPermissions,
  
  // Utilities
  permissionGuardUtils
};

export default permissionGuard;
