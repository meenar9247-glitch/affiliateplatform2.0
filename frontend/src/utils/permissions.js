// ==================== Permission Constants ====================

export const PERMISSIONS = {
  // User permissions
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  USER_MANAGE: 'user:manage',
  
  // Profile permissions
  PROFILE_VIEW: 'profile:view',
  PROFILE_EDIT: 'profile:edit',
  PROFILE_DELETE: 'profile:delete',
  
  // Affiliate permissions
  AFFILIATE_VIEW: 'affiliate:view',
  AFFILIATE_CREATE: 'affiliate:create',
  AFFILIATE_EDIT: 'affiliate:edit',
  AFFILIATE_DELETE: 'affiliate:delete',
  AFFILIATE_MANAGE: 'affiliate:manage',
  
  // Link permissions
  LINK_VIEW: 'link:view',
  LINK_CREATE: 'link:create',
  LINK_EDIT: 'link:edit',
  LINK_DELETE: 'link:delete',
  LINK_MANAGE: 'link:manage',
  
  // Referral permissions
  REFERRAL_VIEW: 'referral:view',
  REFERRAL_TRACK: 'referral:track',
  REFERRAL_MANAGE: 'referral:manage',
  
  // Earnings permissions
  EARNINGS_VIEW: 'earnings:view',
  EARNINGS_WITHDRAW: 'earnings:withdraw',
  EARNINGS_MANAGE: 'earnings:manage',
  
  // Commission permissions
  COMMISSION_VIEW: 'commission:view',
  COMMISSION_APPROVE: 'commission:approve',
  COMMISSION_REJECT: 'commission:reject',
  COMMISSION_MANAGE: 'commission:manage',
  
  // Payment permissions
  PAYMENT_VIEW: 'payment:view',
  PAYMENT_PROCESS: 'payment:process',
  PAYMENT_REFUND: 'payment:refund',
  PAYMENT_MANAGE: 'payment:manage',
  
  // Withdrawal permissions
  WITHDRAWAL_VIEW: 'withdrawal:view',
  WITHDRAWAL_REQUEST: 'withdrawal:request',
  WITHDRAWAL_APPROVE: 'withdrawal:approve',
  WITHDRAWAL_REJECT: 'withdrawal:reject',
  WITHDRAWAL_PROCESS: 'withdrawal:process',
  WITHDRAWAL_MANAGE: 'withdrawal:manage',
  
  // Analytics permissions
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
  ANALYTICS_MANAGE: 'analytics:manage',
  
  // Report permissions
  REPORT_VIEW: 'report:view',
  REPORT_CREATE: 'report:create',
  REPORT_EXPORT: 'report:export',
  REPORT_MANAGE: 'report:manage',
  
  // Support permissions
  SUPPORT_VIEW: 'support:view',
  SUPPORT_CREATE: 'support:create',
  SUPPORT_REPLY: 'support:reply',
  SUPPORT_CLOSE: 'support:close',
  SUPPORT_MANAGE: 'support:manage',
  
  // Settings permissions
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
  SETTINGS_MANAGE: 'settings:manage',
  
  // Admin permissions
  ADMIN_VIEW: 'admin:view',
  ADMIN_ACCESS: 'admin:access',
  ADMIN_MANAGE: 'admin:manage',
  
  // System permissions
  SYSTEM_VIEW: 'system:view',
  SYSTEM_MANAGE: 'system:manage',
  SYSTEM_CONFIG: 'system:configure',
  SYSTEM_MAINTENANCE: 'system:maintenance',
  
  // Log permissions
  LOG_VIEW: 'log:view',
  LOG_EXPORT: 'log:export',
  LOG_MANAGE: 'log:manage',
  
  // API permissions
  API_ACCESS: 'api:access',
  API_MANAGE: 'api:manage',
  API_KEY_CREATE: 'api:key:create',
  API_KEY_REVOKE: 'api:key:revoke',
  
  // Notification permissions
  NOTIFICATION_VIEW: 'notification:view',
  NOTIFICATION_SEND: 'notification:send',
  NOTIFICATION_MANAGE: 'notification:manage',
  
  // Content permissions
  CONTENT_VIEW: 'content:view',
  CONTENT_CREATE: 'content:create',
  CONTENT_EDIT: 'content:edit',
  CONTENT_DELETE: 'content:delete',
  CONTENT_PUBLISH: 'content:publish',
  CONTENT_MANAGE: 'content:manage',
  
  // Product permissions
  PRODUCT_VIEW: 'product:view',
  PRODUCT_CREATE: 'product:create',
  PRODUCT_EDIT: 'product:edit',
  PRODUCT_DELETE: 'product:delete',
  PRODUCT_MANAGE: 'product:manage',
  
  // Category permissions
  CATEGORY_VIEW: 'category:view',
  CATEGORY_CREATE: 'category:create',
  CATEGORY_EDIT: 'category:edit',
  CATEGORY_DELETE: 'category:delete',
  CATEGORY_MANAGE: 'category:manage',
  
  // Role permissions
  ROLE_VIEW: 'role:view',
  ROLE_CREATE: 'role:create',
  ROLE_EDIT: 'role:edit',
  ROLE_DELETE: 'role:delete',
  ROLE_MANAGE: 'role:manage',
  
  // Permission permissions
  PERMISSION_VIEW: 'permission:view',
  PERMISSION_ASSIGN: 'permission:assign',
  PERMISSION_REVOKE: 'permission:revoke',
  PERMISSION_MANAGE: 'permission:manage'
};

// ==================== Role Definitions ====================

export const ROLES = {
  USER: 'user',
  AFFILIATE: 'affiliate',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

// ==================== Role Hierarchy ====================

export const ROLE_HIERARCHY = {
  [ROLES.USER]: 1,
  [ROLES.AFFILIATE]: 2,
  [ROLES.MODERATOR]: 3,
  [ROLES.ADMIN]: 4,
  [ROLES.SUPER_ADMIN]: 5
};

// ==================== Default Role Permissions ====================

export const ROLE_PERMISSIONS = {
  [ROLES.USER]: [
    // Profile
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PROFILE_EDIT,
    
    // Links
    PERMISSIONS.LINK_VIEW,
    PERMISSIONS.LINK_CREATE,
    PERMISSIONS.LINK_EDIT,
    PERMISSIONS.LINK_DELETE,
    
    // Referrals
    PERMISSIONS.REFERRAL_VIEW,
    PERMISSIONS.REFERRAL_TRACK,
    
    // Earnings
    PERMISSIONS.EARNINGS_VIEW,
    PERMISSIONS.EARNINGS_WITHDRAW,
    
    // Commissions
    PERMISSIONS.COMMISSION_VIEW,
    
    // Withdrawals
    PERMISSIONS.WITHDRAWAL_VIEW,
    PERMISSIONS.WITHDRAWAL_REQUEST,
    
    // Analytics
    PERMISSIONS.ANALYTICS_VIEW,
    
    // Support
    PERMISSIONS.SUPPORT_VIEW,
    PERMISSIONS.SUPPORT_CREATE,
    
    // Notifications
    PERMISSIONS.NOTIFICATION_VIEW,
    
    // Products
    PERMISSIONS.PRODUCT_VIEW
  ],
  
  [ROLES.AFFILIATE]: [
    // All user permissions
    ...ROLE_PERMISSIONS[ROLES.USER],
    
    // Additional affiliate permissions
    PERMISSIONS.AFFILIATE_VIEW,
    PERMISSIONS.REFERRAL_MANAGE,
    PERMISSIONS.COMMISSION_MANAGE,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT
  ],
  
  [ROLES.MODERATOR]: [
    // All affiliate permissions
    ...ROLE_PERMISSIONS[ROLES.AFFILIATE],
    
    // Additional moderator permissions
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.SUPPORT_REPLY,
    PERMISSIONS.SUPPORT_CLOSE,
    PERMISSIONS.REPORT_CREATE,
    PERMISSIONS.LOG_VIEW
  ],
  
  [ROLES.ADMIN]: [
    // All moderator permissions
    ...ROLE_PERMISSIONS[ROLES.MODERATOR],
    
    // Additional admin permissions
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_MANAGE,
    
    PERMISSIONS.AFFILIATE_CREATE,
    PERMISSIONS.AFFILIATE_EDIT,
    PERMISSIONS.AFFILIATE_DELETE,
    PERMISSIONS.AFFILIATE_MANAGE,
    
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.PAYMENT_PROCESS,
    PERMISSIONS.PAYMENT_REFUND,
    PERMISSIONS.PAYMENT_MANAGE,
    
    PERMISSIONS.WITHDRAWAL_APPROVE,
    PERMISSIONS.WITHDRAWAL_REJECT,
    PERMISSIONS.WITHDRAWAL_PROCESS,
    PERMISSIONS.WITHDRAWAL_MANAGE,
    
    PERMISSIONS.COMMISSION_APPROVE,
    PERMISSIONS.COMMISSION_REJECT,
    
    PERMISSIONS.ANALYTICS_MANAGE,
    PERMISSIONS.REPORT_MANAGE,
    PERMISSIONS.SUPPORT_MANAGE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.CONTENT_MANAGE,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_EDIT,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.PRODUCT_MANAGE,
    PERMISSIONS.CATEGORY_VIEW,
    PERMISSIONS.CATEGORY_CREATE,
    PERMISSIONS.CATEGORY_EDIT,
    PERMISSIONS.CATEGORY_DELETE,
    PERMISSIONS.CATEGORY_MANAGE,
    PERMISSIONS.ADMIN_VIEW,
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.SYSTEM_VIEW,
    PERMISSIONS.LOG_EXPORT,
    PERMISSIONS.API_ACCESS,
    PERMISSIONS.NOTIFICATION_SEND
  ],
  
  [ROLES.SUPER_ADMIN]: [
    // All admin permissions
    ...ROLE_PERMISSIONS[ROLES.ADMIN],
    
    // Additional super admin permissions
    PERMISSIONS.ROLE_VIEW,
    PERMISSIONS.ROLE_CREATE,
    PERMISSIONS.ROLE_EDIT,
    PERMISSIONS.ROLE_DELETE,
    PERMISSIONS.ROLE_MANAGE,
    
    PERMISSIONS.PERMISSION_VIEW,
    PERMISSIONS.PERMISSION_ASSIGN,
    PERMISSIONS.PERMISSION_REVOKE,
    PERMISSIONS.PERMISSION_MANAGE,
    
    PERMISSIONS.SYSTEM_MANAGE,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.SYSTEM_MAINTENANCE,
    
    PERMISSIONS.LOG_MANAGE,
    PERMISSIONS.API_MANAGE,
    PERMISSIONS.API_KEY_CREATE,
    PERMISSIONS.API_KEY_REVOKE,
    
    PERMISSIONS.SETTINGS_MANAGE
  ]
};
// ==================== Permission Helpers ====================

export const permissionHelpers = {
  // Check if user has a specific permission
  hasPermission: (user, permission) => {
    if (!user || !user.role) return false;
    
    // Super admin has all permissions
    if (user.role === ROLES.SUPER_ADMIN) return true;
    
    // Check user permissions
    const userPermissions = user.permissions || [];
    return userPermissions.includes(permission);
  },
  
  // Check if user has any of the given permissions
  hasAnyPermission: (user, permissions) => {
    if (!user || !user.role) return false;
    if (user.role === ROLES.SUPER_ADMIN) return true;
    
    const userPermissions = user.permissions || [];
    return permissions.some(p => userPermissions.includes(p));
  },
  
  // Check if user has all of the given permissions
  hasAllPermissions: (user, permissions) => {
    if (!user || !user.role) return false;
    if (user.role === ROLES.SUPER_ADMIN) return true;
    
    const userPermissions = user.permissions || [];
    return permissions.every(p => userPermissions.includes(p));
  },
  
  // Check if user has a specific role
  hasRole: (user, role) => {
    if (!user || !user.role) return false;
    return user.role === role;
  },
  
  // Check if user has any of the given roles
  hasAnyRole: (user, roles) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  },
  
  // Check if user has higher role than given role
  hasHigherRole: (user, role) => {
    if (!user || !user.role) return false;
    const userLevel = ROLE_HIERARCHY[user.role] || 0;
    const targetLevel = ROLE_HIERARCHY[role] || 0;
    return userLevel > targetLevel;
  },
  
  // Check if user has role at least given level
  hasRoleLevel: (user, minLevel) => {
    if (!user || !user.role) return false;
    const userLevel = ROLE_HIERARCHY[user.role] || 0;
    return userLevel >= minLevel;
  },
  
  // Get user role level
  getRoleLevel: (role) => {
    return ROLE_HIERARCHY[role] || 0;
  },
  
  // Get role permissions
  getRolePermissions: (role) => {
    return ROLE_PERMISSIONS[role] || [];
  },
  
  // Get all permissions for user (including role-based)
  getAllUserPermissions: (user) => {
    if (!user || !user.role) return [];
    
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    const userPermissions = user.permissions || [];
    
    // Super admin gets all permissions
    if (user.role === ROLES.SUPER_ADMIN) {
      return Object.values(PERMISSIONS);
    }
    
    // Combine and deduplicate
    return [...new Set([...rolePermissions, ...userPermissions])];
  },
  
  // Check if permission exists
  isValidPermission: (permission) => {
    return Object.values(PERMISSIONS).includes(permission);
  },
  
  // Get permission category
  getPermissionCategory: (permission) => {
    if (!permission) return null;
    return permission.split(':')[0];
  },
  
  // Get permission action
  getPermissionAction: (permission) => {
    if (!permission) return null;
    return permission.split(':')[1] || null;
  },
  
  // Group permissions by category
  groupPermissionsByCategory: (permissions) => {
    const grouped = {};
    
    permissions.forEach(perm => {
      const category = permissionHelpers.getPermissionCategory(perm);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(perm);
    });
    
    return grouped;
  },
  
  // Get permissions by category
  getPermissionsByCategory: (category) => {
    return Object.values(PERMISSIONS).filter(perm => 
      perm.startsWith(category + ':')
    );
  },
  
  // Check if permission is for specific resource
  isPermissionForResource: (permission, resource) => {
    return permission.startsWith(resource + ':');
  },
  
  // Get resource from permission
  getPermissionResource: (permission) => {
    return permission.split(':')[0];
  },
  
  // Check if permission is CRUD operation
  isCrudPermission: (permission) => {
    const action = permissionHelpers.getPermissionAction(permission);
    return ['view', 'create', 'edit', 'delete', 'manage'].includes(action);
  },
  
  // Get CRUD operations for resource
  getCrudPermissions: (resource) => {
    return [
      `${resource}:view`,
      `${resource}:create`,
      `${resource}:edit`,
      `${resource}:delete`,
      `${resource}:manage`
    ];
  }
};

// ==================== Access Control Functions ====================

export const accessControl = {
  // Check if user can access resource
  canAccess: (user, resource, action = 'view') => {
    const permission = `${resource}:${action}`;
    return permissionHelpers.hasPermission(user, permission);
  },
  
  // Check if user can create resource
  canCreate: (user, resource) => {
    return accessControl.canAccess(user, resource, 'create');
  },
  
  // Check if user can edit resource
  canEdit: (user, resource) => {
    return accessControl.canAccess(user, resource, 'edit');
  },
  
  // Check if user can delete resource
  canDelete: (user, resource) => {
    return accessControl.canAccess(user, resource, 'delete');
  },
  
  // Check if user can manage resource
  canManage: (user, resource) => {
    return accessControl.canAccess(user, resource, 'manage');
  },
  
  // Check if user can view user
  canViewUser: (user, targetUser) => {
    // Users can view themselves
    if (user.id === targetUser.id) return true;
    
    // Admins can view all users
    if (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN) return true;
    
    // Check permission
    return permissionHelpers.hasPermission(user, PERMISSIONS.USER_VIEW);
  },
  
  // Check if user can edit user
  canEditUser: (user, targetUser) => {
    // Users can edit themselves
    if (user.id === targetUser.id) return true;
    
    // Admins can edit users with lower role
    if (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN) {
      return permissionHelpers.hasHigherRole(user, targetUser.role);
    }
    
    // Check permission
    return permissionHelpers.hasPermission(user, PERMISSIONS.USER_EDIT);
  },
  
  // Check if user can delete user
  canDeleteUser: (user, targetUser) => {
    // Users cannot delete themselves
    if (user.id === targetUser.id) return false;
    
    // Only admins can delete users with lower role
    if (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN) {
      return permissionHelpers.hasHigherRole(user, targetUser.role);
    }
    
    return false;
  },
  
  // Check if user can view affiliate
  canViewAffiliate: (user, affiliate) => {
    // Affiliates can view themselves
    if (user.id === affiliate.userId) return true;
    
    // Check permission
    return permissionHelpers.hasPermission(user, PERMISSIONS.AFFILIATE_VIEW);
  },
  
  // Check if user can edit affiliate
  canEditAffiliate: (user, affiliate) => {
    // Affiliates can edit themselves
    if (user.id === affiliate.userId) return true;
    
    // Check permission
    return permissionHelpers.hasPermission(user, PERMISSIONS.AFFILIATE_EDIT);
  },
  
  // Check if user can view earnings
  canViewEarnings: (user, earnings) => {
    // Users can view their own earnings
    if (user.id === earnings.userId) return true;
    
    // Check permission
    return permissionHelpers.hasPermission(user, PERMISSIONS.EARNINGS_VIEW);
  },
  
  // Check if user can withdraw earnings
  canWithdrawEarnings: (user) => {
    return permissionHelpers.hasPermission(user, PERMISSIONS.EARNINGS_WITHDRAW);
  },
  
  // Check if user can view withdrawal
  canViewWithdrawal: (user, withdrawal) => {
    // Users can view their own withdrawals
    if (user.id === withdrawal.userId) return true;
    
    // Check permission
    return permissionHelpers.hasPermission(user, PERMISSIONS.WITHDRAWAL_VIEW);
  },
  
  // Check if user can approve withdrawal
  canApproveWithdrawal: (user) => {
    return permissionHelpers.hasPermission(user, PERMISSIONS.WITHDRAWAL_APPROVE);
  },
  
  // Check if user can view support ticket
  canViewTicket: (user, ticket) => {
    // Users can view their own tickets
    if (user.id === ticket.userId) return true;
    
    // Support staff can view all tickets
    if (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN) return true;
    
    // Check permission
    return permissionHelpers.hasPermission(user, PERMISSIONS.SUPPORT_VIEW);
  },
  
  // Check if user can reply to ticket
  canReplyToTicket: (user, ticket) => {
    // Users can reply to their own open tickets
    if (user.id === ticket.userId && ticket.status === 'open') return true;
    
    // Support staff can reply to all tickets
    if (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN) return true;
    
    // Check permission
    return permissionHelpers.hasPermission(user, PERMISSIONS.SUPPORT_REPLY);
  },
  
  // Check if user can close ticket
  canCloseTicket: (user, ticket) => {
    // Users can close their own tickets
    if (user.id === ticket.userId) return true;
    
    // Check permission
    return permissionHelpers.hasPermission(user, PERMISSIONS.SUPPORT_CLOSE);
  }
};
// ==================== Permission Guards ====================

export const permissionGuards = {
  // Guard function for permissions
  guard: (user, requiredPermissions, requireAll = false) => {
    if (!user) {
      return {
        allowed: false,
        reason: 'No user provided'
      };
    }
    
    if (requireAll) {
      if (!permissionHelpers.hasAllPermissions(user, requiredPermissions)) {
        return {
          allowed: false,
          reason: 'Missing required permissions',
          missing: requiredPermissions.filter(p => !permissionHelpers.hasPermission(user, p))
        };
      }
    } else {
      if (!permissionHelpers.hasAnyPermission(user, requiredPermissions)) {
        return {
          allowed: false,
          reason: 'No matching permissions found'
        };
      }
    }
    
    return {
      allowed: true
    };
  },
  
  // Guard for roles
  guardRole: (user, requiredRoles) => {
    if (!user) {
      return {
        allowed: false,
        reason: 'No user provided'
      };
    }
    
    if (!permissionHelpers.hasAnyRole(user, requiredRoles)) {
      return {
        allowed: false,
        reason: 'Insufficient role',
        required: requiredRoles,
        current: user.role
      };
    }
    
    return {
      allowed: true
    };
  },
  
  // Guard for resource access
  guardResource: (user, resource, action, ownerId = null) => {
    if (!user) {
      return {
        allowed: false,
        reason: 'No user provided'
      };
    }
    
    // Check if user owns the resource
    if (ownerId && user.id === ownerId) {
      return {
        allowed: true
      };
    }
    
    // Check permission
    const permission = `${resource}:${action}`;
    if (permissionHelpers.hasPermission(user, permission)) {
      return {
        allowed: true
      };
    }
    
    return {
      allowed: false,
      reason: `Missing permission: ${permission}`
    };
  },
  
  // Guard for user management
  guardUserManagement: (user, targetUser, action) => {
    if (!user) {
      return {
        allowed: false,
        reason: 'No user provided'
      };
    }
    
    switch (action) {
      case 'view':
        return accessControl.canViewUser(user, targetUser)
          ? { allowed: true }
          : { allowed: false, reason: 'Cannot view user' };
          
      case 'edit':
        return accessControl.canEditUser(user, targetUser)
          ? { allowed: true }
          : { allowed: false, reason: 'Cannot edit user' };
          
      case 'delete':
        return accessControl.canDeleteUser(user, targetUser)
          ? { allowed: true }
          : { allowed: false, reason: 'Cannot delete user' };
          
      default:
        return { allowed: false, reason: 'Invalid action' };
    }
  },
  
  // Guard for affiliate management
  guardAffiliateManagement: (user, affiliate, action) => {
    if (!user) {
      return {
        allowed: false,
        reason: 'No user provided'
      };
    }
    
    switch (action) {
      case 'view':
        return accessControl.canViewAffiliate(user, affiliate)
          ? { allowed: true }
          : { allowed: false, reason: 'Cannot view affiliate' };
          
      case 'edit':
        return accessControl.canEditAffiliate(user, affiliate)
          ? { allowed: true }
          : { allowed: false, reason: 'Cannot edit affiliate' };
          
      default:
        return { allowed: false, reason: 'Invalid action' };
    }
  },
  
  // Guard for withdrawal management
  guardWithdrawalManagement: (user, withdrawal, action) => {
    if (!user) {
      return {
        allowed: false,
        reason: 'No user provided'
      };
    }
    
    switch (action) {
      case 'view':
        return accessControl.canViewWithdrawal(user, withdrawal)
          ? { allowed: true }
          : { allowed: false, reason: 'Cannot view withdrawal' };
          
      case 'approve':
        return accessControl.canApproveWithdrawal(user)
          ? { allowed: true }
          : { allowed: false, reason: 'Cannot approve withdrawal' };
          
      default:
        return { allowed: false, reason: 'Invalid action' };
    }
  },
  
  // Guard for ticket management
  guardTicketManagement: (user, ticket, action) => {
    if (!user) {
      return {
        allowed: false,
        reason: 'No user provided'
      };
    }
    
    switch (action) {
      case 'view':
        return accessControl.canViewTicket(user, ticket)
          ? { allowed: true }
          : { allowed: false, reason: 'Cannot view ticket' };
          
      case 'reply':
        return accessControl.canReplyToTicket(user, ticket)
          ? { allowed: true }
          : { allowed: false, reason: 'Cannot reply to ticket' };
          
      case 'close':
        return accessControl.canCloseTicket(user, ticket)
          ? { allowed: true }
          : { allowed: false, reason: 'Cannot close ticket' };
          
      default:
        return { allowed: false, reason: 'Invalid action' };
    }
  }
};

// ==================== Higher-Order Functions ====================

export const withPermission = (WrappedComponent, requiredPermissions, requireAll = false) => {
  return function WithPermissionComponent(props) {
    const { user } = props;
    const guard = permissionGuards.guard(user, requiredPermissions, requireAll);
    
    if (!guard.allowed) {
      return null; // Or a fallback component
    }
    
    return <WrappedComponent {...props} />;
  };
};

export const withRole = (WrappedComponent, requiredRoles) => {
  return function WithRoleComponent(props) {
    const { user } = props;
    const guard = permissionGuards.guardRole(user, requiredRoles);
    
    if (!guard.allowed) {
      return null; // Or a fallback component
    }
    
    return <WrappedComponent {...props} />;
  };
};

export const withResourceGuard = (WrappedComponent, resource, action, getOwnerId) => {
  return function WithResourceGuardComponent(props) {
    const { user } = props;
    const ownerId = getOwnerId ? getOwnerId(props) : null;
    const guard = permissionGuards.guardResource(user, resource, action, ownerId);
    
    if (!guard.allowed) {
      return null; // Or a fallback component
    }
    
    return <WrappedComponent {...props} />;
  };
};

// ==================== Permission Middleware ====================

export const permissionMiddleware = (requiredPermissions, requireAll = false) => {
  return (req, res, next) => {
    const user = req.user;
    const guard = permissionGuards.guard(user, requiredPermissions, requireAll);
    
    if (!guard.allowed) {
      return res.status(403).json({
        error: 'Forbidden',
        message: guard.reason,
        required: requiredPermissions
      });
    }
    
    next();
  };
};

export const roleMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    const user = req.user;
    const guard = permissionGuards.guardRole(user, requiredRoles);
    
    if (!guard.allowed) {
      return res.status(403).json({
        error: 'Forbidden',
        message: guard.reason,
        required: requiredRoles,
        current: user?.role
      });
    }
    
    next();
  };
};

// ==================== Export all ====================

export default {
  PERMISSIONS,
  ROLES,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  permissionHelpers,
  accessControl,
  permissionGuards,
  withPermission,
  withRole,
  withResourceGuard,
  permissionMiddleware,
  roleMiddleware
};
