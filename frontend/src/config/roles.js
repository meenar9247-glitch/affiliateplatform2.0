// ==================== Role Constants ====================

export const ROLES = {
  // Base roles
  USER: 'user',
  AFFILIATE: 'affiliate',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  
  // Special roles
  GUEST: 'guest',
  BANNED: 'banned',
  PENDING: 'pending',
  VERIFIED: 'verified',
  
  // Affiliate levels
  AFFILIATE_BRONZE: 'affiliate_bronze',
  AFFILIATE_SILVER: 'affiliate_silver',
  AFFILIATE_GOLD: 'affiliate_gold',
  AFFILIATE_PLATINUM: 'affiliate_platinum',
  AFFILIATE_DIAMOND: 'affiliate_diamond',
  AFFILIATE_ELITE: 'affiliate_elite',
  
  // Support roles
  SUPPORT_AGENT: 'support_agent',
  SUPPORT_MANAGER: 'support_manager',
  
  // Finance roles
  FINANCE_USER: 'finance_user',
  FINANCE_MANAGER: 'finance_manager',
  
  // Content roles
  CONTENT_CREATOR: 'content_creator',
  CONTENT_MANAGER: 'content_manager',
  
  // API roles
  API_USER: 'api_user',
  API_ADMIN: 'api_admin'
};

// ==================== Role Hierarchies ====================

export const ROLE_HIERARCHY = {
  [ROLES.GUEST]: 0,
  [ROLES.PENDING]: 1,
  [ROLES.USER]: 2,
  [ROLES.VERIFIED]: 3,
  [ROLES.AFFILIATE_BRONZE]: 4,
  [ROLES.AFFILIATE_SILVER]: 5,
  [ROLES.AFFILIATE_GOLD]: 6,
  [ROLES.AFFILIATE_PLATINUM]: 7,
  [ROLES.AFFILIATE_DIAMOND]: 8,
  [ROLES.AFFILIATE_ELITE]: 9,
  [ROLES.SUPPORT_AGENT]: 10,
  [ROLES.SUPPORT_MANAGER]: 11,
  [ROLES.CONTENT_CREATOR]: 12,
  [ROLES.CONTENT_MANAGER]: 13,
  [ROLES.FINANCE_USER]: 14,
  [ROLES.FINANCE_MANAGER]: 15,
  [ROLES.API_USER]: 16,
  [ROLES.API_ADMIN]: 17,
  [ROLES.MODERATOR]: 18,
  [ROLES.ADMIN]: 19,
  [ROLES.SUPER_ADMIN]: 20
};

// ==================== Role Groups ====================

export const ROLE_GROUPS = {
  // User groups
  ALL_USERS: [ROLES.USER, ROLES.VERIFIED, ROLES.AFFILIATE_BRONZE, ROLES.AFFILIATE_SILVER, ROLES.AFFILIATE_GOLD, ROLES.AFFILIATE_PLATINUM, ROLES.AFFILIATE_DIAMOND, ROLES.AFFILIATE_ELITE],
  
  // Affiliate groups
  ALL_AFFILIATES: [ROLES.AFFILIATE_BRONZE, ROLES.AFFILIATE_SILVER, ROLES.AFFILIATE_GOLD, ROLES.AFFILIATE_PLATINUM, ROLES.AFFILIATE_DIAMOND, ROLES.AFFILIATE_ELITE],
  BRONZE_AFFILIATES: [ROLES.AFFILIATE_BRONZE],
  SILVER_AFFILIATES: [ROLES.AFFILIATE_BRONZE, ROLES.AFFILIATE_SILVER],
  GOLD_AFFILIATES: [ROLES.AFFILIATE_BRONZE, ROLES.AFFILIATE_SILVER, ROLES.AFFILIATE_GOLD],
  PLATINUM_AFFILIATES: [ROLES.AFFILIATE_BRONZE, ROLES.AFFILIATE_SILVER, ROLES.AFFILIATE_GOLD, ROLES.AFFILIATE_PLATINUM],
  DIAMOND_AFFILIATES: [ROLES.AFFILIATE_BRONZE, ROLES.AFFILIATE_SILVER, ROLES.AFFILIATE_GOLD, ROLES.AFFILIATE_PLATINUM, ROLES.AFFILIATE_DIAMOND],
  ELITE_AFFILIATES: [ROLES.AFFILIATE_BRONZE, ROLES.AFFILIATE_SILVER, ROLES.AFFILIATE_GOLD, ROLES.AFFILIATE_PLATINUM, ROLES.AFFILIATE_DIAMOND, ROLES.AFFILIATE_ELITE],
  
  // Support groups
  SUPPORT_STAFF: [ROLES.SUPPORT_AGENT, ROLES.SUPPORT_MANAGER],
  
  // Finance groups
  FINANCE_STAFF: [ROLES.FINANCE_USER, ROLES.FINANCE_MANAGER],
  
  // Content groups
  CONTENT_STAFF: [ROLES.CONTENT_CREATOR, ROLES.CONTENT_MANAGER],
  
  // API groups
  API_USERS: [ROLES.API_USER, ROLES.API_ADMIN],
  
  // Staff groups
  ALL_STAFF: [ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.SUPPORT_AGENT, ROLES.SUPPORT_MANAGER, ROLES.CONTENT_CREATOR, ROLES.CONTENT_MANAGER, ROLES.FINANCE_USER, ROLES.FINANCE_MANAGER, ROLES.API_USER, ROLES.API_ADMIN],
  
  // Admin groups
  ALL_ADMINS: [ROLES.ADMIN, ROLES.SUPER_ADMIN]
};

// ==================== Role Display Names ====================

export const ROLE_NAMES = {
  [ROLES.GUEST]: 'Guest',
  [ROLES.PENDING]: 'Pending',
  [ROLES.USER]: 'User',
  [ROLES.VERIFIED]: 'Verified User',
  [ROLES.AFFILIATE_BRONZE]: 'Bronze Affiliate',
  [ROLES.AFFILIATE_SILVER]: 'Silver Affiliate',
  [ROLES.AFFILIATE_GOLD]: 'Gold Affiliate',
  [ROLES.AFFILIATE_PLATINUM]: 'Platinum Affiliate',
  [ROLES.AFFILIATE_DIAMOND]: 'Diamond Affiliate',
  [ROLES.AFFILIATE_ELITE]: 'Elite Affiliate',
  [ROLES.SUPPORT_AGENT]: 'Support Agent',
  [ROLES.SUPPORT_MANAGER]: 'Support Manager',
  [ROLES.CONTENT_CREATOR]: 'Content Creator',
  [ROLES.CONTENT_MANAGER]: 'Content Manager',
  [ROLES.FINANCE_USER]: 'Finance User',
  [ROLES.FINANCE_MANAGER]: 'Finance Manager',
  [ROLES.API_USER]: 'API User',
  [ROLES.API_ADMIN]: 'API Admin',
  [ROLES.MODERATOR]: 'Moderator',
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.SUPER_ADMIN]: 'Super Administrator'
};

// ==================== Role Descriptions ====================

export const ROLE_DESCRIPTIONS = {
  [ROLES.GUEST]: 'Unauthenticated visitor',
  [ROLES.PENDING]: 'User pending verification',
  [ROLES.USER]: 'Regular registered user',
  [ROLES.VERIFIED]: 'Email verified user',
  [ROLES.AFFILIATE_BRONZE]: 'Bronze level affiliate (0-100 earnings)',
  [ROLES.AFFILIATE_SILVER]: 'Silver level affiliate (100-1000 earnings)',
  [ROLES.AFFILIATE_GOLD]: 'Gold level affiliate (1000-5000 earnings)',
  [ROLES.AFFILIATE_PLATINUM]: 'Platinum level affiliate (5000-10000 earnings)',
  [ROLES.AFFILIATE_DIAMOND]: 'Diamond level affiliate (10000-50000 earnings)',
  [ROLES.AFFILIATE_ELITE]: 'Elite level affiliate (50000+ earnings)',
  [ROLES.SUPPORT_AGENT]: 'Customer support agent',
  [ROLES.SUPPORT_MANAGER]: 'Customer support manager',
  [ROLES.CONTENT_CREATOR]: 'Content creator',
  [ROLES.CONTENT_MANAGER]: 'Content manager',
  [ROLES.FINANCE_USER]: 'Finance team member',
  [ROLES.FINANCE_MANAGER]: 'Finance manager',
  [ROLES.API_USER]: 'API access user',
  [ROLES.API_ADMIN]: 'API administrator',
  [ROLES.MODERATOR]: 'Content moderator',
  [ROLES.ADMIN]: 'System administrator',
  [ROLES.SUPER_ADMIN]: 'Super administrator with full access'
};

// ==================== Role Badges ====================

export const ROLE_BADGES = {
  [ROLES.GUEST]: { color: '#6c757d', icon: '👤', variant: 'secondary' },
  [ROLES.PENDING]: { color: '#ffc107', icon: '⏳', variant: 'warning' },
  [ROLES.USER]: { color: '#17a2b8', icon: '👤', variant: 'info' },
  [ROLES.VERIFIED]: { color: '#28a745', icon: '✅', variant: 'success' },
  [ROLES.AFFILIATE_BRONZE]: { color: '#cd7f32', icon: '🥉', variant: 'bronze' },
  [ROLES.AFFILIATE_SILVER]: { color: '#c0c0c0', icon: '🥈', variant: 'silver' },
  [ROLES.AFFILIATE_GOLD]: { color: '#ffd700', icon: '🥇', variant: 'gold' },
  [ROLES.AFFILIATE_PLATINUM]: { color: '#e5e4e2', icon: '💎', variant: 'platinum' },
  [ROLES.AFFILIATE_DIAMOND]: { color: '#b9f2ff', icon: '💎', variant: 'diamond' },
  [ROLES.AFFILIATE_ELITE]: { color: '#ff00ff', icon: '👑', variant: 'elite' },
  [ROLES.SUPPORT_AGENT]: { color: '#20c997', icon: '🎧', variant: 'success' },
  [ROLES.SUPPORT_MANAGER]: { color: '#20c997', icon: '👑', variant: 'success' },
  [ROLES.CONTENT_CREATOR]: { color: '#6610f2', icon: '✍️', variant: 'primary' },
  [ROLES.CONTENT_MANAGER]: { color: '#6610f2', icon: '📝', variant: 'primary' },
  [ROLES.FINANCE_USER]: { color: '#198754', icon: '💰', variant: 'success' },
  [ROLES.FINANCE_MANAGER]: { color: '#198754', icon: '💼', variant: 'success' },
  [ROLES.API_USER]: { color: '#0dcaf0', icon: '🔌', variant: 'info' },
  [ROLES.API_ADMIN]: { color: '#0dcaf0', icon: '⚙️', variant: 'info' },
  [ROLES.MODERATOR]: { color: '#fd7e14', icon: '🛡️', variant: 'warning' },
  [ROLES.ADMIN]: { color: '#dc3545', icon: '⚡', variant: 'danger' },
  [ROLES.SUPER_ADMIN]: { color: '#dc3545', icon: '👑', variant: 'danger' }
};
// ==================== Permission Definitions ====================

export const PERMISSIONS = {
  // User permissions
  VIEW_USERS: 'users:view',
  CREATE_USERS: 'users:create',
  EDIT_USERS: 'users:edit',
  DELETE_USERS: 'users:delete',
  MANAGE_USERS: 'users:manage',
  
  // Affiliate permissions
  VIEW_AFFILIATES: 'affiliates:view',
  CREATE_AFFILIATES: 'affiliates:create',
  EDIT_AFFILIATES: 'affiliates:edit',
  DELETE_AFFILIATES: 'affiliates:delete',
  MANAGE_AFFILIATES: 'affiliates:manage',
  APPROVE_AFFILIATES: 'affiliates:approve',
  
  // Commission permissions
  VIEW_COMMISSIONS: 'commissions:view',
  EDIT_COMMISSIONS: 'commissions:edit',
  APPROVE_COMMISSIONS: 'commissions:approve',
  REJECT_COMMISSIONS: 'commissions:reject',
  MANAGE_COMMISSIONS: 'commissions:manage',
  
  // Payment permissions
  VIEW_PAYMENTS: 'payments:view',
  PROCESS_PAYMENTS: 'payments:process',
  REFUND_PAYMENTS: 'payments:refund',
  MANAGE_PAYMENTS: 'payments:manage',
  
  // Withdrawal permissions
  VIEW_WITHDRAWALS: 'withdrawals:view',
  APPROVE_WITHDRAWALS: 'withdrawals:approve',
  REJECT_WITHDRAWALS: 'withdrawals:reject',
  PROCESS_WITHDRAWALS: 'withdrawals:process',
  MANAGE_WITHDRAWALS: 'withdrawals:manage',
  
  // Report permissions
  VIEW_REPORTS: 'reports:view',
  CREATE_REPORTS: 'reports:create',
  EXPORT_REPORTS: 'reports:export',
  MANAGE_REPORTS: 'reports:manage',
  
  // Analytics permissions
  VIEW_ANALYTICS: 'analytics:view',
  EXPORT_ANALYTICS: 'analytics:export',
  MANAGE_ANALYTICS: 'analytics:manage',
  
  // Support permissions
  VIEW_TICKETS: 'tickets:view',
  CREATE_TICKETS: 'tickets:create',
  REPLY_TICKETS: 'tickets:reply',
  CLOSE_TICKETS: 'tickets:close',
  MANAGE_TICKETS: 'tickets:manage',
  
  // Content permissions
  VIEW_CONTENT: 'content:view',
  CREATE_CONTENT: 'content:create',
  EDIT_CONTENT: 'content:edit',
  DELETE_CONTENT: 'content:delete',
  PUBLISH_CONTENT: 'content:publish',
  MANAGE_CONTENT: 'content:manage',
  
  // Settings permissions
  VIEW_SETTINGS: 'settings:view',
  EDIT_SETTINGS: 'settings:edit',
  MANAGE_SETTINGS: 'settings:manage',
  
  // System permissions
  VIEW_SYSTEM: 'system:view',
  MANAGE_SYSTEM: 'system:manage',
  CONFIGURE_SYSTEM: 'system:configure',
  
  // Log permissions
  VIEW_LOGS: 'logs:view',
  EXPORT_LOGS: 'logs:export',
  MANAGE_LOGS: 'logs:manage',
  
  // API permissions
  USE_API: 'api:use',
  MANAGE_API: 'api:manage',
  
  // Role permissions
  VIEW_ROLES: 'roles:view',
  ASSIGN_ROLES: 'roles:assign',
  MANAGE_ROLES: 'roles:manage',
  
  // Permission permissions
  VIEW_PERMISSIONS: 'permissions:view',
  ASSIGN_PERMISSIONS: 'permissions:assign',
  MANAGE_PERMISSIONS: 'permissions:manage'
};

// ==================== Role Permissions ====================

export const ROLE_PERMISSIONS = {
  [ROLES.GUEST]: [],
  
  [ROLES.PENDING]: [
    PERMISSIONS.VIEW_CONTENT
  ],
  
  [ROLES.USER]: [
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.CREATE_TICKETS,
    PERMISSIONS.VIEW_TICKETS,
    PERMISSIONS.VIEW_REPORTS
  ],
  
  [ROLES.VERIFIED]: [
    ...ROLE_PERMISSIONS[ROLES.USER],
    PERMISSIONS.VIEW_AFFILIATES
  ],
  
  [ROLES.AFFILIATE_BRONZE]: [
    ...ROLE_PERMISSIONS[ROLES.VERIFIED],
    PERMISSIONS.VIEW_COMMISSIONS,
    PERMISSIONS.VIEW_WITHDRAWALS,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  
  [ROLES.AFFILIATE_SILVER]: [
    ...ROLE_PERMISSIONS[ROLES.AFFILIATE_BRONZE]
  ],
  
  [ROLES.AFFILIATE_GOLD]: [
    ...ROLE_PERMISSIONS[ROLES.AFFILIATE_SILVER],
    PERMISSIONS.EXPORT_REPORTS
  ],
  
  [ROLES.AFFILIATE_PLATINUM]: [
    ...ROLE_PERMISSIONS[ROLES.AFFILIATE_GOLD],
    PERMISSIONS.VIEW_USERS
  ],
  
  [ROLES.AFFILIATE_DIAMOND]: [
    ...ROLE_PERMISSIONS[ROLES.AFFILIATE_PLATINUM]
  ],
  
  [ROLES.AFFILIATE_ELITE]: [
    ...ROLE_PERMISSIONS[ROLES.AFFILIATE_DIAMOND],
    PERMISSIONS.MANAGE_REPORTS
  ],
  
  [ROLES.SUPPORT_AGENT]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_TICKETS,
    PERMISSIONS.CREATE_TICKETS,
    PERMISSIONS.REPLY_TICKETS,
    PERMISSIONS.CLOSE_TICKETS,
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.VIEW_REPORTS
  ],
  
  [ROLES.SUPPORT_MANAGER]: [
    ...ROLE_PERMISSIONS[ROLES.SUPPORT_AGENT],
    PERMISSIONS.MANAGE_TICKETS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_REPORTS
  ],
  
  [ROLES.CONTENT_CREATOR]: [
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.CREATE_CONTENT,
    PERMISSIONS.EDIT_CONTENT,
    PERMISSIONS.VIEW_REPORTS
  ],
  
  [ROLES.CONTENT_MANAGER]: [
    ...ROLE_PERMISSIONS[ROLES.CONTENT_CREATOR],
    PERMISSIONS.DELETE_CONTENT,
    PERMISSIONS.PUBLISH_CONTENT,
    PERMISSIONS.MANAGE_CONTENT
  ],
  
  [ROLES.FINANCE_USER]: [
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.VIEW_WITHDRAWALS,
    PERMISSIONS.VIEW_COMMISSIONS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS
  ],
  
  [ROLES.FINANCE_MANAGER]: [
    ...ROLE_PERMISSIONS[ROLES.FINANCE_USER],
    PERMISSIONS.PROCESS_PAYMENTS,
    PERMISSIONS.APPROVE_WITHDRAWALS,
    PERMISSIONS.MANAGE_PAYMENTS,
    PERMISSIONS.APPROVE_COMMISSIONS
  ],
  
  [ROLES.API_USER]: [
    PERMISSIONS.USE_API,
    PERMISSIONS.VIEW_REPORTS
  ],
  
  [ROLES.API_ADMIN]: [
    ...ROLE_PERMISSIONS[ROLES.API_USER],
    PERMISSIONS.MANAGE_API,
    PERMISSIONS.VIEW_LOGS
  ],
  
  [ROLES.MODERATOR]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.EDIT_CONTENT,
    PERMISSIONS.DELETE_CONTENT,
    PERMISSIONS.VIEW_TICKETS,
    PERMISSIONS.REPLY_TICKETS,
    PERMISSIONS.VIEW_REPORTS
  ],
  
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.VIEW_AFFILIATES,
    PERMISSIONS.EDIT_AFFILIATES,
    PERMISSIONS.VIEW_COMMISSIONS,
    PERMISSIONS.APPROVE_COMMISSIONS,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.PROCESS_PAYMENTS,
    PERMISSIONS.VIEW_WITHDRAWALS,
    PERMISSIONS.APPROVE_WITHDRAWALS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CREATE_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_TICKETS,
    PERMISSIONS.MANAGE_TICKETS,
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.MANAGE_CONTENT,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.EDIT_SETTINGS,
    PERMISSIONS.VIEW_SYSTEM,
    PERMISSIONS.VIEW_LOGS,
    PERMISSIONS.USE_API,
    PERMISSIONS.VIEW_ROLES,
    PERMISSIONS.VIEW_PERMISSIONS
  ],
  
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS)
};
// ==================== Role Requirements ====================

export const ROLE_REQUIREMENTS = {
  [ROLES.AFFILIATE_BRONZE]: {
    earnings: 0,
    referrals: 0,
    clicks: 0,
    conversions: 0
  },
  [ROLES.AFFILIATE_SILVER]: {
    earnings: 100,
    referrals: 5,
    clicks: 100,
    conversions: 10
  },
  [ROLES.AFFILIATE_GOLD]: {
    earnings: 1000,
    referrals: 20,
    clicks: 1000,
    conversions: 50
  },
  [ROLES.AFFILIATE_PLATINUM]: {
    earnings: 5000,
    referrals: 50,
    clicks: 5000,
    conversions: 200
  },
  [ROLES.AFFILIATE_DIAMOND]: {
    earnings: 10000,
    referrals: 100,
    clicks: 10000,
    conversions: 500
  },
  [ROLES.AFFILIATE_ELITE]: {
    earnings: 50000,
    referrals: 200,
    clicks: 50000,
    conversions: 1000
  }
};

// ==================== Role Benefits ====================

export const ROLE_BENEFITS = {
  [ROLES.AFFILIATE_BRONZE]: {
    commissionRate: 5,
    payoutMethods: ['paypal'],
    supportPriority: 'standard',
    analytics: 'basic'
  },
  [ROLES.AFFILIATE_SILVER]: {
    commissionRate: 10,
    payoutMethods: ['paypal', 'bank'],
    supportPriority: 'standard',
    analytics: 'basic'
  },
  [ROLES.AFFILIATE_GOLD]: {
    commissionRate: 15,
    payoutMethods: ['paypal', 'bank', 'upi'],
    supportPriority: 'priority',
    analytics: 'advanced'
  },
  [ROLES.AFFILIATE_PLATINUM]: {
    commissionRate: 20,
    payoutMethods: ['paypal', 'bank', 'upi', 'crypto'],
    supportPriority: 'priority',
    analytics: 'advanced'
  },
  [ROLES.AFFILIATE_DIAMOND]: {
    commissionRate: 25,
    payoutMethods: ['paypal', 'bank', 'upi', 'crypto', 'wire'],
    supportPriority: 'dedicated',
    analytics: 'premium'
  },
  [ROLES.AFFILIATE_ELITE]: {
    commissionRate: 30,
    payoutMethods: ['all'],
    supportPriority: 'dedicated',
    analytics: 'premium'
  }
};

// ==================== Role Helpers ====================

export const roleHelpers = {
  // Check if user has role
  hasRole: (user, role) => {
    if (!user || !user.role) return false;
    return user.role === role;
  },

  // Check if user has any of the given roles
  hasAnyRole: (user, roles) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  },

  // Check if user has all of the given roles
  hasAllRoles: (user, roles) => {
    if (!user || !user.role) return false;
    return roles.every(role => user.role === role);
  },

  // Check if user has higher role than given role
  hasHigherRole: (user, role) => {
    if (!user || !user.role) return false;
    const userLevel = ROLE_HIERARCHY[user.role] || 0;
    const targetLevel = ROLE_HIERARCHY[role] || 0;
    return userLevel > targetLevel;
  },

  // Check if user has role level at least given level
  hasMinRoleLevel: (user, minLevel) => {
    if (!user || !user.role) return false;
    const userLevel = ROLE_HIERARCHY[user.role] || 0;
    return userLevel >= minLevel;
  },

  // Get user role level
  getRoleLevel: (role) => {
    return ROLE_HIERARCHY[role] || 0;
  },

  // Get role display name
  getRoleName: (role) => {
    return ROLE_NAMES[role] || role;
  },

  // Get role description
  getRoleDescription: (role) => {
    return ROLE_DESCRIPTIONS[role] || '';
  },

  // Get role badge
  getRoleBadge: (role) => {
    return ROLE_BADGES[role] || ROLE_BADGES[ROLES.USER];
  },

  // Get role permissions
  getRolePermissions: (role) => {
    return ROLE_PERMISSIONS[role] || [];
  },

  // Check if user has permission
  hasPermission: (user, permission) => {
    if (!user || !user.role) return false;
    
    // Super admin has all permissions
    if (user.role === ROLES.SUPER_ADMIN) return true;
    
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    const userPermissions = user.permissions || [];
    
    return rolePermissions.includes(permission) || userPermissions.includes(permission);
  },

  // Check if user has any of the given permissions
  hasAnyPermission: (user, permissions) => {
    if (!user || !user.role) return false;
    
    // Super admin has all permissions
    if (user.role === ROLES.SUPER_ADMIN) return true;
    
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    const userPermissions = user.permissions || [];
    const allPermissions = [...rolePermissions, ...userPermissions];
    
    return permissions.some(p => allPermissions.includes(p));
  },

  // Check if user has all of the given permissions
  hasAllPermissions: (user, permissions) => {
    if (!user || !user.role) return false;
    
    // Super admin has all permissions
    if (user.role === ROLES.SUPER_ADMIN) return true;
    
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    const userPermissions = user.permissions || [];
    const allPermissions = [...rolePermissions, ...userPermissions];
    
    return permissions.every(p => allPermissions.includes(p));
  },

  // Get all permissions for user
  getAllPermissions: (user) => {
    if (!user || !user.role) return [];
    
    // Super admin has all permissions
    if (user.role === ROLES.SUPER_ADMIN) {
      return Object.values(PERMISSIONS);
    }
    
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    const userPermissions = user.permissions || [];
    
    return [...new Set([...rolePermissions, ...userPermissions])];
  },

  // Get next role
  getNextRole: (currentRole) => {
    const hierarchy = Object.entries(ROLE_HIERARCHY)
      .sort(([, a], [, b]) => a - b);
    
    const currentIndex = hierarchy.findIndex(([role]) => role === currentRole);
    
    if (currentIndex < hierarchy.length - 1) {
      return hierarchy[currentIndex + 1][0];
    }
    
    return null;
  },

  // Get previous role
  getPreviousRole: (currentRole) => {
    const hierarchy = Object.entries(ROLE_HIERARCHY)
      .sort(([, a], [, b]) => a - b);
    
    const currentIndex = hierarchy.findIndex(([role]) => role === currentRole);
    
    if (currentIndex > 0) {
      return hierarchy[currentIndex - 1][0];
    }
    
    return null;
  },

  // Get role requirements
  getRoleRequirements: (role) => {
    return ROLE_REQUIREMENTS[role] || null;
  },

  // Get role benefits
  getRoleBenefits: (role) => {
    return ROLE_BENEFITS[role] || null;
  },

  // Check if user meets role requirements
  meetsRequirements: (userStats, targetRole) => {
    const requirements = ROLE_REQUIREMENTS[targetRole];
    if (!requirements) return true;
    
    return (
      userStats.earnings >= requirements.earnings &&
      userStats.referrals >= requirements.referrals &&
      userStats.clicks >= requirements.clicks &&
      userStats.conversions >= requirements.conversions
    );
  },

  // Get eligible roles based on user stats
  getEligibleRoles: (userStats) => {
    const eligible = [];
    
    for (const [role, requirements] of Object.entries(ROLE_REQUIREMENTS)) {
      if (
        userStats.earnings >= requirements.earnings &&
        userStats.referrals >= requirements.referrals &&
        userStats.clicks >= requirements.clicks &&
        userStats.conversions >= requirements.conversions
      ) {
        eligible.push(role);
      }
    }
    
    return eligible;
  },

  // Get all roles in group
  getRolesInGroup: (group) => {
    return ROLE_GROUPS[group] || [];
  },

  // Check if user is in group
  isInGroup: (user, group) => {
    if (!user || !user.role) return false;
    const groupRoles = ROLE_GROUPS[group] || [];
    return groupRoles.includes(user.role);
  },

  // Get all available roles
  getAllRoles: () => {
    return Object.values(ROLES);
  },

  // Get all role options for select
  getRoleOptions: () => {
    return Object.entries(ROLE_NAMES).map(([value, label]) => ({
      value,
      label,
      badge: ROLE_BADGES[value]
    }));
  },

  // Validate role
  isValidRole: (role) => {
    return Object.values(ROLES).includes(role);
  },

  // Compare two roles
  compareRoles: (role1, role2) => {
    const level1 = ROLE_HIERARCHY[role1] || 0;
    const level2 = ROLE_HIERARCHY[role2] || 0;
    
    if (level1 > level2) return 1;
    if (level1 < level2) return -1;
    return 0;
  },

  // Get role color
  getRoleColor: (role) => {
    return ROLE_BADGES[role]?.color || '#6c757d';
  },

  // Get role icon
  getRoleIcon: (role) => {
    return ROLE_BADGES[role]?.icon || '👤';
  },

  // Get role variant
  getRoleVariant: (role) => {
    return ROLE_BADGES[role]?.variant || 'secondary';
  }
};

// ==================== Role Guards ====================

export const roleGuards = {
  // Guard for role
  requireRole: (requiredRole) => {
    return (user) => roleHelpers.hasRole(user, requiredRole);
  },

  // Guard for any role
  requireAnyRole: (requiredRoles) => {
    return (user) => roleHelpers.hasAnyRole(user, requiredRoles);
  },

  // Guard for all roles
  requireAllRoles: (requiredRoles) => {
    return (user) => roleHelpers.hasAllRoles(user, requiredRoles);
  },

  // Guard for minimum role level
  requireMinLevel: (minLevel) => {
    return (user) => roleHelpers.hasMinRoleLevel(user, minLevel);
  },

  // Guard for permission
  requirePermission: (requiredPermission) => {
    return (user) => roleHelpers.hasPermission(user, requiredPermission);
  },

  // Guard for any permission
  requireAnyPermission: (requiredPermissions) => {
    return (user) => roleHelpers.hasAnyPermission(user, requiredPermissions);
  },

  // Guard for all permissions
  requireAllPermissions: (requiredPermissions) => {
    return (user) => roleHelpers.hasAllPermissions(user, requiredPermissions);
  },

  // Guard for group membership
  requireGroup: (group) => {
    return (user) => roleHelpers.isInGroup(user, group);
  }
};

// ==================== Export all ====================

export const roleConfig = {
  ROLES,
  ROLE_HIERARCHY,
  ROLE_GROUPS,
  ROLE_NAMES,
  ROLE_DESCRIPTIONS,
  ROLE_BADGES,
