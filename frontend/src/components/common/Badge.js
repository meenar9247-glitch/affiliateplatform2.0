import React from 'react';
import {
  FiStar,
  FiAward,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiInfo,
  FiClock,
  FiTrendingUp,
  FiUsers,
  FiShield,
  FiHeart,
  FiBell,
  FiMail,
  FiMessageSquare
} from 'react-icons/fi';

const Badge = ({
  children,
  variant = 'solid', // solid, outlined, subtle
  color = 'primary', // primary, secondary, success, danger, warning, info
  size = 'medium', // small, medium, large
  shape = 'rounded', // rounded, circle, square
  icon,
  iconPosition = 'left', // left, right
  removable = false,
  onRemove,
  count,
  dot = false,
  pulse = false,
  className = '',
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    small: 'badge-small',
    medium: 'badge-medium',
    large: 'badge-large'
  };

  // Shape classes
  const shapeClasses = {
    rounded: 'badge-rounded',
    circle: 'badge-circle',
    square: 'badge-square'
  };

  // Color classes based on variant
  const getColorClasses = () => {
    const variants = {
      solid: {
        primary: 'badge-primary-solid',
        secondary: 'badge-secondary-solid',
        success: 'badge-success-solid',
        danger: 'badge-danger-solid',
        warning: 'badge-warning-solid',
        info: 'badge-info-solid'
      },
      outlined: {
        primary: 'badge-primary-outlined',
        secondary: 'badge-secondary-outlined',
        success: 'badge-success-outlined',
        danger: 'badge-danger-outlined',
        warning: 'badge-warning-outlined',
        info: 'badge-info-outlined'
      },
      subtle: {
        primary: 'badge-primary-subtle',
        secondary: 'badge-secondary-subtle',
        success: 'badge-success-subtle',
        danger: 'badge-danger-subtle',
        warning: 'badge-warning-subtle',
        info: 'badge-info-subtle'
      }
    };

    return variants[variant]?.[color] || variants.solid.primary;
  };

  // Icon mapping
  const getIcon = () => {
    if (icon) return icon;
    
    switch (color) {
      case 'success':
        return <FiCheck />;
      case 'danger':
        return <FiX />;
      case 'warning':
        return <FiAlertCircle />;
      case 'info':
        return <FiInfo />;
      case 'secondary':
        return <FiStar />;
      default:
        return null;
    }
  };

  const iconElement = getIcon();

  // Styles
  const styles = `
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-weight: var(--font-medium);
      white-space: nowrap;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    /* Size Variants */
    .badge-small {
      padding: 2px 6px;
      font-size: var(--text-xs);
      min-height: 18px;
    }

    .badge-small .badge-icon {
      font-size: 10px;
    }

    .badge-medium {
      padding: 4px 8px;
      font-size: var(--text-xs);
      min-height: 22px;
    }

    .badge-medium .badge-icon {
      font-size: 12px;
    }

    .badge-large {
      padding: 6px 12px;
      font-size: var(--text-sm);
      min-height: 28px;
    }

    .badge-large .badge-icon {
      font-size: 14px;
    }

    /* Shape Variants */
    .badge-rounded {
      border-radius: var(--radius-full);
    }

    .badge-circle {
      border-radius: 50%;
      padding: 0;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .badge-circle.badge-small {
      width: 18px;
      min-width: 18px;
    }

    .badge-circle.badge-medium {
      width: 22px;
      min-width: 22px;
    }

    .badge-circle.badge-large {
      width: 28px;
      min-width: 28px;
    }

    .badge-square {
      border-radius: var(--radius-sm);
    }

    /* Solid Variants */
    .badge-primary-solid {
      background: var(--primary);
      color: white;
    }

    .badge-secondary-solid {
      background: var(--secondary);
      color: white;
    }

    .badge-success-solid {
      background: var(--success);
      color: white;
    }

    .badge-danger-solid {
      background: var(--danger);
      color: white;
    }

    .badge-warning-solid {
      background: var(--warning);
      color: white;
    }

    .badge-info-solid {
      background: var(--info);
      color: white;
    }

    /* Outlined Variants */
    .badge-primary-outlined {
      background: transparent;
      border: 1px solid var(--primary);
      color: var(--primary);
    }

    .badge-secondary-outlined {
      background: transparent;
      border: 1px solid var(--secondary);
      color: var(--secondary);
    }

    .badge-success-outlined {
      background: transparent;
      border: 1px solid var(--success);
      color: var(--success);
    }

    .badge-danger-outlined {
      background: transparent;
      border: 1px solid var(--danger);
      color: var(--danger);
    }

    .badge-warning-outlined {
      background: transparent;
      border: 1px solid var(--warning);
      color: var(--warning);
    }

    .badge-info-outlined {
      background: transparent;
      border: 1px solid var(--info);
      color: var(--info);
    }

    /* Subtle Variants */
    .badge-primary-subtle {
      background: var(--primary-50);
      color: var(--primary-700);
    }

    .badge-secondary-subtle {
      background: var(--secondary-50);
      color: var(--secondary-700);
    }

    .badge-success-subtle {
      background: var(--success-50);
      color: var(--success-700);
    }

    .badge-danger-subtle {
      background: var(--danger-50);
      color: var(--danger-700);
    }

    .badge-warning-subtle {
      background: var(--warning-50);
      color: var(--warning-700);
    }

    .badge-info-subtle {
      background: var(--info-50);
      color: var(--info-700);
    }

    /* Icon */
    .badge-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .badge-icon-left {
      margin-right: 2px;
    }

    .badge-icon-right {
      margin-left: 2px;
    }

    /* Count Badge */
    .badge-count {
      position: relative;
      display: inline-flex;
    }

    .badge-count-wrapper {
      position: absolute;
      top: -6px;
      right: -6px;
      min-width: 18px;
      height: 18px;
      padding: 0 4px;
      font-size: 11px;
      font-weight: var(--font-bold);
    }

    /* Dot Badge */
    .badge-dot {
      width: 8px;
      height: 8px;
      padding: 0;
      border-radius: 50%;
      background: currentColor;
    }

    /* Pulse Animation */
    .badge-pulse {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
      }
    }

    /* Removable */
    .badge-remove {
      background: none;
      border: none;
      color: currentColor;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: inherit;
      opacity: 0.7;
      transition: opacity var(--transition-fast) var(--transition-ease);
      margin-left: 4px;
    }

    .badge-remove:hover {
      opacity: 1;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .badge-primary-subtle {
        background: rgba(102, 126, 234, 0.15);
        color: var(--primary-400);
      }

      .badge-secondary-subtle {
        background: rgba(159, 122, 234, 0.15);
        color: var(--secondary-400);
      }

      .badge-success-subtle {
        background: rgba(34, 197, 94, 0.15);
        color: var(--success-400);
      }

      .badge-danger-subtle {
        background: rgba(239, 68, 68, 0.15);
        color: var(--danger-400);
      }

      .badge-warning-subtle {
        background: rgba(245, 158, 11, 0.15);
        color: var(--warning-400);
      }

      .badge-info-subtle {
        background: rgba(6, 182, 212, 0.15);
        color: var(--info-400);
      }
    }

    /* RTL Support */
    [dir="rtl"] .badge-icon-left {
      margin-right: 0;
      margin-left: 2px;
    }

    [dir="rtl"] .badge-icon-right {
      margin-left: 0;
      margin-right: 2px;
    }

    [dir="rtl"] .badge-count-wrapper {
      right: auto;
      left: -6px;
    }

    [dir="rtl"] .badge-remove {
      margin-left: 0;
      margin-right: 4px;
    }
  `;

  if (dot) {
    return (
      <>
        <style>{styles}</style>
        <span
          className={`
            badge
            badge-dot
            ${getColorClasses()}
            ${pulse ? 'badge-pulse' : ''}
            ${className}
          `}
          {...props}
        />
      </>
    );
  }

  if (count !== undefined) {
    return (
      <>
        <style>{styles}</style>
        <span className="badge-count">
          {children}
          <span
            className={`
              badge
              badge-count-wrapper
              ${sizeClasses[size]}
              ${shapeClasses[shape]}
              ${getColorClasses()}
              ${pulse ? 'badge-pulse' : ''}
            `}
          >
            {count > 99 ? '99+' : count}
          </span>
        </span>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <span
        className={`
          badge
          ${sizeClasses[size]}
          ${shapeClasses[shape]}
          ${getColorClasses()}
          ${pulse ? 'badge-pulse' : ''}
          ${className}
        `}
        {...props}
      >
        {/* Left Icon */}
        {iconElement && iconPosition === 'left' && (
          <span className="badge-icon badge-icon-left">{iconElement}</span>
        )}

        {/* Content */}
        {children}

        {/* Right Icon */}
        {iconElement && iconPosition === 'right' && (
          <span className="badge-icon badge-icon-right">{iconElement}</span>
        )}

        {/* Remove Button */}
        {removable && (
          <button className="badge-remove" onClick={onRemove} aria-label="Remove">
            <FiX size={size === 'small' ? 10 : size === 'large' ? 14 : 12} />
          </button>
        )}
      </span>
    </>
  );
};

// Status Badge Component
export const StatusBadge = ({ status, ...props }) => {
  const statusConfig = {
    active: { color: 'success', label: 'Active', icon: FiCheck },
    inactive: { color: 'danger', label: 'Inactive', icon: FiX },
    pending: { color: 'warning', label: 'Pending', icon: FiClock },
    verified: { color: 'success', label: 'Verified', icon: FiCheck },
    unverified: { color: 'danger', label: 'Unverified', icon: FiX },
    processing: { color: 'info', label: 'Processing', icon: FiClock },
    completed: { color: 'success', label: 'Completed', icon: FiCheck },
    failed: { color: 'danger', label: 'Failed', icon: FiX },
    cancelled: { color: 'danger', label: 'Cancelled', icon: FiX },
    refunded: { color: 'warning', label: 'Refunded', icon: FiX },
    premium: { color: 'secondary', label: 'Premium', icon: FiStar },
    pro: { color: 'primary', label: 'Pro', icon: FiTrendingUp },
    new: { color: 'success', label: 'New', icon: FiStar },
    popular: { color: 'warning', label: 'Popular', icon: FiTrendingUp },
    admin: { color: 'danger', label: 'Admin', icon: FiShield },
    user: { color: 'primary', label: 'User', icon: FiUsers }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge
      color={config.color}
      icon={config.icon}
      {...props}
    >
      {config.label}
    </Badge>
  );
};

// Role Badge Component
export const RoleBadge = ({ role, ...props }) => {
  const roleConfig = {
    admin: { color: 'danger', label: 'Admin', icon: FiShield },
    moderator: { color: 'warning', label: 'Moderator', icon: FiShield },
    user: { color: 'primary', label: 'User', icon: FiUsers },
    guest: { color: 'secondary', label: 'Guest', icon: FiUsers },
    affiliate: { color: 'success', label: 'Affiliate', icon: FiUsers },
    manager: { color: 'info', label: 'Manager', icon: FiUsers }
  };

  const config = roleConfig[role] || roleConfig.user;

  return (
    <Badge
      color={config.color}
      icon={config.icon}
      {...props}
    >
      {config.label}
    </Badge>
  );
};

// Notification Badge Component
export const NotificationBadge = ({ count, ...props }) => {
  return (
    <Badge
      color="danger"
      shape="circle"
      size="small"
      count={count}
      {...props}
    >
      <FiBell />
    </Badge>
  );
};

// Message Badge Component
export const MessageBadge = ({ count, ...props }) => {
  return (
    <Badge
      color="primary"
      shape="circle"
      size="small"
      count={count}
      {...props}
    >
      <FiMail />
    </Badge>
  );
};

// Premium Badge Component
export const PremiumBadge = ({ type = 'pro', ...props }) => {
  const config = {
    pro: { color: 'primary', label: 'PRO', icon: FiStar },
    elite: { color: 'secondary', label: 'ELITE', icon: FiAward },
    vip: { color: 'warning', label: 'VIP', icon: FiStar },
    gold: { color: 'warning', label: 'GOLD', icon: FiStar },
    silver: { color: 'secondary', label: 'SILVER', icon: FiStar },
    bronze: { color: 'warning', label: 'BRONZE', icon: FiStar }
  };

  const { color, label, icon } = config[type] || config.pro;

  return (
    <Badge
      variant="solid"
      color={color}
      icon={icon}
      {...props}
    >
      {label}
    </Badge>
  );
};

// Count Badge Component
export const CountBadge = ({ count, max = 99, ...props }) => {
  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge
      variant="solid"
      color="danger"
      shape="circle"
      size="small"
      className="count-badge"
      {...props}
    >
      {displayCount}
    </Badge>
  );
};

// Icon Badge Component
export const IconBadge = ({ icon: Icon, color = 'primary', ...props }) => {
  return (
    <Badge
      variant="solid"
      color={color}
      shape="circle"
      icon={<Icon />}
      {...props}
    />
  );
};

export default Badge;
