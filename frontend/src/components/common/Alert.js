import React, { useState, useEffect } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiXCircle,
  FiX,
  FiAlertTriangle,
  FiBell,
  FiHelpCircle
} from 'react-icons/fi';

const Alert = ({
  type = 'info',
  title,
  message,
  children,
  onClose,
  showIcon = true,
  dismissible = false,
  autoClose = false,
  autoCloseTime = 5000,
  icon: CustomIcon,
  variant = 'solid', // solid, outlined, subtle
  size = 'medium',
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    let timer;
    let progressTimer;

    if (autoClose && isVisible) {
      const startTime = Date.now();
      const endTime = startTime + autoCloseTime;

      progressTimer = setInterval(() => {
        const now = Date.now();
        const remaining = endTime - now;
        const newProgress = (remaining / autoCloseTime) * 100;
        
        if (newProgress <= 0) {
          setProgress(0);
          clearInterval(progressTimer);
        } else {
          setProgress(newProgress);
        }
      }, 100);

      timer = setTimeout(() => {
        handleClose();
      }, autoCloseTime);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [autoClose, autoCloseTime, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (!isVisible) return null;

  // Get icon based on type
  const getIcon = () => {
    if (CustomIcon) return <CustomIcon />;

    switch (type) {
      case 'success':
        return <FiCheckCircle />;
      case 'error':
        return <FiXCircle />;
      case 'warning':
        return <FiAlertTriangle />;
      case 'info':
        return <FiInfo />;
      case 'tip':
        return <FiBell />;
      case 'help':
        return <FiHelpCircle />;
      default:
        return <FiInfo />;
    }
  };

  // Get color classes based on type and variant
  const getColorClasses = () => {
    const baseClasses = {
      success: {
        solid: 'alert-success-solid',
        outlined: 'alert-success-outlined',
        subtle: 'alert-success-subtle'
      },
      error: {
        solid: 'alert-error-solid',
        outlined: 'alert-error-outlined',
        subtle: 'alert-error-subtle'
      },
      warning: {
        solid: 'alert-warning-solid',
        outlined: 'alert-warning-outlined',
        subtle: 'alert-warning-subtle'
      },
      info: {
        solid: 'alert-info-solid',
        outlined: 'alert-info-outlined',
        subtle: 'alert-info-subtle'
      },
      tip: {
        solid: 'alert-tip-solid',
        outlined: 'alert-tip-outlined',
        subtle: 'alert-tip-subtle'
      },
      help: {
        solid: 'alert-help-solid',
        outlined: 'alert-help-outlined',
        subtle: 'alert-help-subtle'
      }
    };

    return baseClasses[type]?.[variant] || baseClasses.info.solid;
  };

  // Size classes
  const sizeClasses = {
    small: 'alert-small',
    medium: 'alert-medium',
    large: 'alert-large'
  };

  // Styles
  const styles = `
    .alert {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: var(--radius-lg);
      margin-bottom: 16px;
      overflow: hidden;
      animation: slideIn 0.3s var(--transition-ease);
    }

    /* Size Variants */
    .alert-small {
      padding: 8px 12px;
      font-size: var(--text-xs);
    }

    .alert-small .alert-icon {
      font-size: 16px;
    }

    .alert-medium {
      padding: 12px 16px;
      font-size: var(--text-sm);
    }

    .alert-medium .alert-icon {
      font-size: 20px;
    }

    .alert-large {
      padding: 16px 20px;
      font-size: var(--text-base);
    }

    .alert-large .alert-icon {
      font-size: 24px;
    }

    /* Solid Variants */
    .alert-success-solid {
      background: var(--success);
      color: white;
    }

    .alert-error-solid {
      background: var(--danger);
      color: white;
    }

    .alert-warning-solid {
      background: var(--warning);
      color: white;
    }

    .alert-info-solid {
      background: var(--info);
      color: white;
    }

    .alert-tip-solid {
      background: var(--primary);
      color: white;
    }

    .alert-help-solid {
      background: var(--secondary);
      color: white;
    }

    /* Outlined Variants */
    .alert-success-outlined {
      background: transparent;
      border: 2px solid var(--success);
      color: var(--success);
    }

    .alert-error-outlined {
      background: transparent;
      border: 2px solid var(--danger);
      color: var(--danger);
    }

    .alert-warning-outlined {
      background: transparent;
      border: 2px solid var(--warning);
      color: var(--warning);
    }

    .alert-info-outlined {
      background: transparent;
      border: 2px solid var(--info);
      color: var(--info);
    }

    .alert-tip-outlined {
      background: transparent;
      border: 2px solid var(--primary);
      color: var(--primary);
    }

    .alert-help-outlined {
      background: transparent;
      border: 2px solid var(--secondary);
      color: var(--secondary);
    }

    /* Subtle Variants */
    .alert-success-subtle {
      background: var(--success-50);
      color: var(--success-700);
    }

    .alert-error-subtle {
      background: var(--danger-50);
      color: var(--danger-700);
    }

    .alert-warning-subtle {
      background: var(--warning-50);
      color: var(--warning-700);
    }

    .alert-info-subtle {
      background: var(--info-50);
      color: var(--info-700);
    }

    .alert-tip-subtle {
      background: var(--primary-50);
      color: var(--primary-700);
    }

    .alert-help-subtle {
      background: var(--secondary-50);
      color: var(--secondary-700);
    }

    /* Icon */
    .alert-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* Content */
    .alert-content {
      flex: 1;
    }

    .alert-title {
      font-weight: var(--font-semibold);
      margin-bottom: 4px;
    }

    .alert-message {
      opacity: 0.9;
      line-height: 1.5;
    }

    /* Close Button */
    .alert-close {
      background: none;
      border: none;
      color: currentColor;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast) var(--transition-ease);
      opacity: 0.7;
    }

    .alert-close:hover {
      opacity: 1;
      background: rgba(0, 0, 0, 0.1);
    }

    /* Progress Bar */
    .alert-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: rgba(255, 255, 255, 0.3);
    }

    .alert-progress-bar {
      height: 100%;
      background: currentColor;
      transition: width 0.1s linear;
      opacity: 0.5;
    }

    /* Dark Mode Adjustments */
    @media (prefers-color-scheme: dark) {
      .alert-success-solid,
      .alert-error-solid,
      .alert-warning-solid,
      .alert-info-solid,
      .alert-tip-solid,
      .alert-help-solid {
        filter: brightness(0.9);
      }

      .alert-success-outlined,
      .alert-error-outlined,
      .alert-warning-outlined,
      .alert-info-outlined,
      .alert-tip-outlined,
      .alert-help-outlined {
        background: transparent;
      }

      .alert-success-subtle {
        background: rgba(34, 197, 94, 0.1);
      }

      .alert-error-subtle {
        background: rgba(239, 68, 68, 0.1);
      }

      .alert-warning-subtle {
        background: rgba(245, 158, 11, 0.1);
      }

      .alert-info-subtle {
        background: rgba(6, 182, 212, 0.1);
      }

      .alert-tip-subtle {
        background: rgba(102, 126, 234, 0.1);
      }

      .alert-help-subtle {
        background: rgba(159, 122, 234, 0.1);
      }
    }

    /* Animations */
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideOut {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-20px);
      }
    }

    .alert-exit {
      animation: slideOut 0.3s var(--transition-ease) forwards;
    }

    /* RTL Support */
    [dir="rtl"] .alert {
      flex-direction: row-reverse;
    }

    [dir="rtl"] .alert-progress {
      left: auto;
      right: 0;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div
        className={`
          alert
          ${getColorClasses()}
          ${sizeClasses[size]}
          ${className}
        `}
        role="alert"
        {...props}
      >
        {/* Icon */}
        {showIcon && (
          <div className="alert-icon">
            {getIcon()}
          </div>
        )}

        {/* Content */}
        <div className="alert-content">
          {title && <div className="alert-title">{title}</div>}
          {message && <div className="alert-message">{message}</div>}
          {children}
        </div>

        {/* Close Button */}
        {dismissible && (
          <button className="alert-close" onClick={handleClose} aria-label="Close">
            <FiX size={18} />
          </button>
        )}

        {/* Progress Bar */}
        {autoClose && (
          <div className="alert-progress">
            <div className="alert-progress-bar" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </>
  );
};

// Alert Container for multiple alerts
export const AlertContainer = ({ alerts = [], position = 'top-right', onClose }) => {
  const positions = {
    'top-left': { top: 20, left: 20 },
    'top-right': { top: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
    'bottom-right': { bottom: 20, right: 20 },
    'top-center': { top: 20, left: '50%', transform: 'translateX(-50%)' },
    'bottom-center': { bottom: 20, left: '50%', transform: 'translateX(-50%)' }
  };

  const styles = `
    .alert-container {
      position: fixed;
      z-index: var(--z-toast);
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 300px;
      max-width: 400px;
    }

    .alert-item {
      animation: slideInRight 0.3s var(--transition-ease);
    }

    .alert-item-exit {
      animation: slideOutRight 0.3s var(--transition-ease) forwards;
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes slideOutRight {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100%);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="alert-container" style={positions[position]}>
        {alerts.map((alert, index) => (
          <div key={alert.id || index} className="alert-item">
            <Alert
              type={alert.type}
              title={alert.title}
              message={alert.message}
              variant={alert.variant}
              size={alert.size}
              dismissible={alert.dismissible !== false}
              onClose={() => onClose?.(alert.id || index)}
              showIcon={alert.showIcon}
            />
          </div>
        ))}
      </div>
    </>
  );
};

// Toast function for programmatic usage
export const toast = {
  success: (message, options = {}) => {
    // Implement toast logic here
    console.log('Toast success:', message);
  },
  error: (message, options = {}) => {
    console.log('Toast error:', message);
  },
  warning: (message, options = {}) => {
    console.log('Toast warning:', message);
  },
  info: (message, options = {}) => {
    console.log('Toast info:', message);
  },
  tip: (message, options = {}) => {
    console.log('Toast tip:', message);
  }
};

export default Alert;
