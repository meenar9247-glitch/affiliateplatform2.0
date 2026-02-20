import React, { useState, useEffect, useCallback } from 'react';
import {
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiInfo,
  FiAlertTriangle,
  FiBell,
  FiX
} from 'react-icons/fi';

// Toast Context
const ToastContext = React.createContext(null);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((type, message, options = {}) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const newToast = {
      id,
      type,
      message,
      title: options.title,
      duration: options.duration || 5000,
      position: options.position || 'top-right',
      variant: options.variant || 'solid',
      showIcon: options.showIcon !== false,
      dismissible: options.dismissible !== false,
      onClose: options.onClose
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    if (newToast.duration > 0) {
      setTimeout(() => {
        remove(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const success = useCallback((message, options = {}) => {
    return show('success', message, { ...options, title: options.title || 'Success' });
  }, [show]);

  const error = useCallback((message, options = {}) => {
    return show('error', message, { ...options, title: options.title || 'Error' });
  }, [show]);

  const warning = useCallback((message, options = {}) => {
    return show('warning', message, { ...options, title: options.title || 'Warning' });
  }, [show]);

  const info = useCallback((message, options = {}) => {
    return show('info', message, { ...options, title: options.title || 'Info' });
  }, [show]);

  const tip = useCallback((message, options = {}) => {
    return show('tip', message, { ...options, title: options.title || 'Tip' });
  }, [show]);

  const remove = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    toasts,
    show,
    success,
    error,
    warning,
    info,
    tip,
    remove,
    clearAll
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer = () => {
  const { toasts, remove } = useToast();

  // Group toasts by position
  const groupedToasts = toasts.reduce((acc, toast) => {
    const position = toast.position || 'top-right';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(toast);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(groupedToasts).map(([position, positionToasts]) => (
        <ToastPosition
          key={position}
          position={position}
          toasts={positionToasts}
          onRemove={remove}
        />
      ))}
    </>
  );
};

// Toast Position Component
const ToastPosition = ({ position, toasts, onRemove }) => {
  const getPositionStyles = () => {
    const positions = {
      'top-left': { top: 20, left: 20 },
      'top-right': { top: 20, right: 20 },
      'bottom-left': { bottom: 20, left: 20 },
      'bottom-right': { bottom: 20, right: 20 },
      'top-center': { top: 20, left: '50%', transform: 'translateX(-50%)' },
      'bottom-center': { bottom: 20, left: '50%', transform: 'translateX(-50%)' }
    };
    return positions[position] || positions['top-right'];
  };

  const styles = `
    .toast-position {
      position: fixed;
      z-index: var(--z-toast);
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 320px;
      max-width: 400px;
      pointer-events: none;
    }

    .toast-position > * {
      pointer-events: auto;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="toast-position" style={getPositionStyles()}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </>
  );
};

// Toast Item Component
const ToastItem = ({ toast, onRemove }) => {
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const [pauseProgress, setPauseProgress] = useState(false);

  useEffect(() => {
    let progressInterval;
    let exitTimeout;

    if (toast.duration > 0 && !pauseProgress) {
      const startTime = Date.now();
      const endTime = startTime + toast.duration;

      progressInterval = setInterval(() => {
        const now = Date.now();
        const remaining = endTime - now;
        const newProgress = (remaining / toast.duration) * 100;
        
        if (newProgress <= 0) {
          setProgress(0);
          clearInterval(progressInterval);
        } else {
          setProgress(newProgress);
        }
      }, 50);

      exitTimeout = setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          onRemove(toast.id);
          if (toast.onClose) toast.onClose();
        }, 300);
      }, toast.duration);
    }

    return () => {
      clearInterval(progressInterval);
      clearTimeout(exitTimeout);
    };
  }, [toast.duration, toast.id, toast.onClose, onRemove, pauseProgress]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
      if (toast.onClose) toast.onClose();
    }, 300);
  };

  // Get icon based on type
  const getIcon = () => {
    switch (toast.type) {
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
      default:
        return <FiInfo />;
    }
  };

  // Get color classes based on type and variant
  const getColorStyles = () => {
    const variants = {
      solid: {
        success: 'toast-success-solid',
        error: 'toast-error-solid',
        warning: 'toast-warning-solid',
        info: 'toast-info-solid',
        tip: 'toast-tip-solid'
      },
      outlined: {
        success: 'toast-success-outlined',
        error: 'toast-error-outlined',
        warning: 'toast-warning-outlined',
        info: 'toast-info-outlined',
        tip: 'toast-tip-outlined'
      },
      subtle: {
        success: 'toast-success-subtle',
        error: 'toast-error-subtle',
        warning: 'toast-warning-subtle',
        info: 'toast-info-subtle',
        tip: 'toast-tip-subtle'
      }
    };

    return variants[toast.variant]?.[toast.type] || variants.solid.info;
  };

  const styles = `
    .toast-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      animation: slideIn 0.3s var(--transition-ease);
      position: relative;
      overflow: hidden;
      cursor: pointer;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .toast-item:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-xl);
    }

    .toast-item-exit {
      animation: slideOut 0.3s var(--transition-ease) forwards;
    }

    /* Solid Variants */
    .toast-success-solid {
      background: var(--success);
      color: white;
    }

    .toast-error-solid {
      background: var(--danger);
      color: white;
    }

    .toast-warning-solid {
      background: var(--warning);
      color: white;
    }

    .toast-info-solid {
      background: var(--info);
      color: white;
    }

    .toast-tip-solid {
      background: var(--primary);
      color: white;
    }

    /* Outlined Variants */
    .toast-success-outlined {
      background: transparent;
      border: 2px solid var(--success);
      color: var(--success);
    }

    .toast-error-outlined {
      background: transparent;
      border: 2px solid var(--danger);
      color: var(--danger);
    }

    .toast-warning-outlined {
      background: transparent;
      border: 2px solid var(--warning);
      color: var(--warning);
    }

    .toast-info-outlined {
      background: transparent;
      border: 2px solid var(--info);
      color: var(--info);
    }

    .toast-tip-outlined {
      background: transparent;
      border: 2px solid var(--primary);
      color: var(--primary);
    }

    /* Subtle Variants */
    .toast-success-subtle {
      background: var(--success-50);
      color: var(--success-700);
    }

    .toast-error-subtle {
      background: var(--danger-50);
      color: var(--danger-700);
    }

    .toast-warning-subtle {
      background: var(--warning-50);
      color: var(--warning-700);
    }

    .toast-info-subtle {
      background: var(--info-50);
      color: var(--info-700);
    }

    .toast-tip-subtle {
      background: var(--primary-50);
      color: var(--primary-700);
    }

    /* Icon */
    .toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }

    /* Content */
    .toast-content {
      flex: 1;
    }

    .toast-title {
      font-weight: var(--font-semibold);
      margin-bottom: 4px;
    }

    .toast-message {
      font-size: var(--text-sm);
      opacity: 0.9;
      line-height: 1.5;
    }

    /* Close Button */
    .toast-close {
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
      flex-shrink: 0;
    }

    .toast-close:hover {
      opacity: 1;
      background: rgba(0, 0, 0, 0.1);
    }

    /* Progress Bar */
    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: rgba(255, 255, 255, 0.3);
    }

    .toast-progress-bar {
      height: 100%;
      background: currentColor;
      transition: width 0.1s linear;
      opacity: 0.5;
    }

    /* Animations */
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes slideOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100%);
      }
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .toast-success-subtle {
        background: rgba(34, 197, 94, 0.15);
        color: var(--success-400);
      }

      .toast-error-subtle {
        background: rgba(239, 68, 68, 0.15);
        color: var(--danger-400);
      }

      .toast-warning-subtle {
        background: rgba(245, 158, 11, 0.15);
        color: var(--warning-400);
      }

      .toast-info-subtle {
        background: rgba(6, 182, 212, 0.15);
        color: var(--info-400);
      }

      .toast-tip-subtle {
        background: rgba(102, 126, 234, 0.15);
        color: var(--primary-400);
      }
    }

    /* RTL Support */
    [dir="rtl"] .toast-item {
      flex-direction: row-reverse;
    }

    [dir="rtl"] .toast-progress {
      left: auto;
      right: 0;
    }

    [dir="rtl"] @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    [dir="rtl"] @keyframes slideOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(-100%);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div
        className={`toast-item ${getColorStyles()} ${exiting ? 'toast-item-exit' : ''}`}
        onClick={handleClose}
        onMouseEnter={() => setPauseProgress(true)}
        onMouseLeave={() => setPauseProgress(false)}
      >
        {/* Icon */}
        {toast.showIcon && (
          <div className="toast-icon">
            {getIcon()}
          </div>
        )}

        {/* Content */}
        <div className="toast-content">
          {toast.title && <div className="toast-title">{toast.title}</div>}
          <div className="toast-message">{toast.message}</div>
        </div>

        {/* Close Button */}
        {toast.dismissible && (
          <button className="toast-close" onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}>
            <FiX size={18} />
          </button>
        )}

        {/* Progress Bar */}
        {toast.duration > 0 && (
          <div className="toast-progress">
            <div className="toast-progress-bar" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </>
  );
};

// Hook for using toast
export const useToastHook = () => {
  const [toasts, setToasts] = useState([]);

  const show = (type, message, options = {}) => {
    const id = Date.now();
    const newToast = {
      id,
      type,
      message,
      ...options
    };
    setToasts(prev => [...prev, newToast]);

    if (options.duration !== 0) {
      setTimeout(() => {
        remove(id);
      }, options.duration || 5000);
    }

    return id;
  };

  const remove = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clear = () => {
    setToasts([]);
  };

  const success = (message, options) => show('success', message, options);
  const error = (message, options) => show('error', message, options);
  const warning = (message, options) => show('warning', message, options);
  const info = (message, options) => show('info', message, options);
  const tip = (message, options) => show('tip', message, options);

  return {
    toasts,
    success,
    error,
    warning,
    info,
    tip,
    remove,
    clear
  };
};

// Default toast function (simplified version)
const toast = {
  success: (message, options = {}) => {
    console.log('✅ Success:', message);
    // Implement actual toast logic here
  },
  error: (message, options = {}) => {
    console.log('❌ Error:', message);
  },
  warning: (message, options = {}) => {
    console.log('⚠️ Warning:', message);
  },
  info: (message, options = {}) => {
    console.log('ℹ️ Info:', message);
  },
  tip: (message, options = {}) => {
    console.log('💡 Tip:', message);
  }
};

export default toast;
