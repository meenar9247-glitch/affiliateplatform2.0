import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
  className = ''
}) => {
  // Close on ESC key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Size classes
  const sizeClasses = {
    small: 'modal-small',
    medium: 'modal-medium',
    large: 'modal-large',
    full: 'modal-full'
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-container ${sizeClasses[size]} ${className}`}>
        {/* Header */}
        <div className="modal-header">
          {title && <h3 className="modal-title">{title}</h3>}
          {showCloseButton && (
            <button className="modal-close-btn" onClick={onClose}>
              <FiX size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="modal-content">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const styles = `
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    max-height: 90vh;
    overflow-y: auto;
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-small {
    width: 400px;
  }

  .modal-medium {
    width: 600px;
  }

  .modal-large {
    width: 800px;
  }

  .modal-full {
    width: 95vw;
    height: 95vh;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e9ecef;
  }

  .modal-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  .modal-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.3s ease;
  }

  .modal-close-btn:hover {
    background: #f1f3f5;
    color: #333;
  }

  .modal-content {
    padding: 20px;
  }

  .modal-footer {
    padding: 20px;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .modal-container {
      background: #2d3748;
    }

    .modal-header {
      border-bottom-color: #4a5568;
    }

    .modal-title {
      color: #f7fafc;
    }

    .modal-close-btn {
      color: #a0aec0;
    }

    .modal-close-btn:hover {
      background: #4a5568;
      color: #f7fafc;
    }

    .modal-footer {
      border-top-color: #4a5568;
    }
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .modal-small,
    .modal-medium,
    .modal-large {
      width: 95vw;
    }

    .modal-header {
      padding: 15px;
    }

    .modal-content {
      padding: 15px;
    }

    .modal-footer {
      padding: 15px;
    }
  }
`;

export default Modal;
