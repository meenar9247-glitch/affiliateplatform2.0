import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  className = '',
  ...props
}) => {
  // Button variants
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    danger: 'btn-danger',
    warning: 'btn-warning',
    info: 'btn-info',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    link: 'btn-link'
  };

  // Button sizes
  const sizes = {
    small: 'btn-sm',
    medium: 'btn-md',
    large: 'btn-lg'
  };

  const buttonClasses = [
    'btn',
    variants[variant] || 'btn-primary',
    sizes[size] || 'btn-md',
    fullWidth ? 'btn-full' : '',
    loading ? 'btn-loading' : '',
    disabled ? 'btn-disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="btn-spinner">
          <span className="spinner"></span>
        </span>
      )}
      <span className="btn-text">{children}</span>
    </button>
  );
};

// Styles for the button
const styles = `
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
    border-radius: 5px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .btn:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
  }

  /* Button Variants */
  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #5a6268;
    transform: translateY(-2px);
  }

  .btn-success {
    background: #28a745;
    color: white;
  }

  .btn-success:hover:not(:disabled) {
    background: #218838;
    transform: translateY(-2px);
  }

  .btn-danger {
    background: #dc3545;
    color: white;
  }

  .btn-danger:hover:not(:disabled) {
    background: #c82333;
    transform: translateY(-2px);
  }

  .btn-warning {
    background: #ffc107;
    color: #212529;
  }

  .btn-warning:hover:not(:disabled) {
    background: #e0a800;
    transform: translateY(-2px);
  }

  .btn-info {
    background: #17a2b8;
    color: white;
  }

  .btn-info:hover:not(:disabled) {
    background: #138496;
    transform: translateY(-2px);
  }

  .btn-outline {
    background: transparent;
    border: 2px solid #667eea;
    color: #667eea;
  }

  .btn-outline:hover:not(:disabled) {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
  }

  .btn-ghost {
    background: transparent;
    color: #667eea;
  }

  .btn-ghost:hover:not(:disabled) {
    background: rgba(102, 126, 234, 0.1);
  }

  .btn-link {
    background: transparent;
    color: #667eea;
    text-decoration: underline;
    padding: 0;
  }

  .btn-link:hover:not(:disabled) {
    color: #764ba2;
  }

  /* Button Sizes */
  .btn-sm {
    padding: 6px 12px;
    font-size: 12px;
  }

  .btn-md {
    padding: 8px 16px;
    font-size: 14px;
  }

  .btn-lg {
    padding: 12px 24px;
    font-size: 16px;
  }

  /* Full Width */
  .btn-full {
    width: 100%;
  }

  /* Loading State */
  .btn-loading {
    cursor: not-allowed;
    opacity: 0.8;
  }

  .btn-spinner {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .btn-loading .btn-text {
    opacity: 0.7;
  }

  /* Disabled State */
  .btn-disabled,
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Spinner Animation */
  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Ripple Effect */
  .btn::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%);
    transform-origin: 50% 50%;
  }

  .btn:focus:not(:active)::after {
    animation: ripple 1s ease-out;
  }

  @keyframes ripple {
    0% {
      transform: scale(0, 0);
      opacity: 0.5;
    }
    100% {
      transform: scale(20, 20);
      opacity: 0;
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .btn {
      width: 100%;
      justify-content: center;
    }
  }
`;

export default Button;
