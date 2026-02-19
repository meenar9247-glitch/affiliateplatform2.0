import React, { useState } from 'react';
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

const Input = ({
  type = 'text',
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  icon,
  iconPosition = 'left',
  size = 'medium',
  fullWidth = true,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine input type
  const inputType = type === 'password' && showPassword ? 'text' : type;

  // Size classes
  const sizeClasses = {
    small: 'input-small',
    medium: 'input-medium',
    large: 'input-large'
  };

  // Status classes
  const statusClass = error ? 'input-error' : (focused ? 'input-focused' : '');

  return (
    <div className={`input-wrapper ${fullWidth ? 'input-full' : ''} ${className}`}>
      {/* Label */}
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className={`input-container ${sizeClasses[size]} ${statusClass} ${disabled ? 'input-disabled' : ''}`}>
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <span className="input-icon left-icon">{icon}</span>
        )}

        {/* Input Element */}
        <input
          type={inputType}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setFocused(false);
            if (onBlur) onBlur(e);
          }}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          className="input-element"
          {...props}
        />

        {/* Right Icon / Password Toggle */}
        <div className="input-right-elements">
          {type === 'password' && (
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
              tabIndex="-1"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          )}
          {icon && iconPosition === 'right' && (
            <span className="input-icon right-icon">{icon}</span>
          )}
        </div>
      </div>

      {/* Error / Helper Text */}
      {(error || helperText) && (
        <div className={`input-message ${error ? 'input-error-message' : ''}`}>
          {error && <FiAlertCircle className="message-icon" size={14} />}
          <span>{error || helperText}</span>
        </div>
      )}
    </div>
  );
};

// Styles
const styles = `
  .input-wrapper {
    margin-bottom: 20px;
    position: relative;
  }

  .input-full {
    width: 100%;
  }

  /* Label */
  .input-label {
    display: block;
    margin-bottom: 5px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }

  .required-star {
    color: #dc3545;
    margin-left: 3px;
  }

  /* Input Container */
  .input-container {
    display: flex;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 5px;
    background: white;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .input-container:hover:not(.input-disabled) {
    border-color: #999;
  }

  .input-container.input-focused {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .input-container.input-error {
    border-color: #dc3545;
  }

  .input-container.input-disabled {
    background: #f8f9fa;
    border-color: #dee2e6;
    cursor: not-allowed;
  }

  /* Input Sizes */
  .input-small {
    min-height: 32px;
  }

  .input-small .input-element {
    padding: 6px 12px;
    font-size: 12px;
  }

  .input-medium {
    min-height: 40px;
  }

  .input-medium .input-element {
    padding: 10px 12px;
    font-size: 14px;
  }

  .input-large {
    min-height: 48px;
  }

  .input-large .input-element {
    padding: 12px 16px;
    font-size: 16px;
  }

  /* Input Element */
  .input-element {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: #333;
    width: 100%;
  }

  .input-element::placeholder {
    color: #999;
  }

  .input-element:disabled {
    cursor: not-allowed;
    color: #6c757d;
  }

  /* Icons */
  .input-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    padding: 0 8px;
  }

  .left-icon {
    border-right: 1px solid #eee;
  }

  .right-icon {
    border-left: 1px solid #eee;
  }

  /* Right Elements Container */
  .input-right-elements {
    display: flex;
    align-items: center;
    padding-right: 8px;
  }

  /* Password Toggle */
  .password-toggle {
    background: none;
    border: none;
    padding: 0 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    cursor: pointer;
    transition: color 0.3s ease;
  }

  .password-toggle:hover {
    color: #667eea;
  }

  /* Messages */
  .input-message {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 5px;
    font-size: 12px;
    color: #666;
  }

  .input-error-message {
    color: #dc3545;
  }

  .message-icon {
    flex-shrink: 0;
  }

  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .input-label {
      color: #e2e8f0;
    }

    .input-container {
      background: #1a202c;
      border-color: #4a5568;
    }

    .input-element {
      color: #f7fafc;
    }

    .input-element::placeholder {
      color: #a0aec0;
    }

    .input-icon {
      color: #a0aec0;
    }

    .left-icon {
      border-right-color: #4a5568;
    }

    .right-icon {
      border-left-color: #4a5568;
    }

    .password-toggle {
      color: #a0aec0;
    }

    .password-toggle:hover {
      color: #667eea;
    }

    .input-container.input-disabled {
      background: #2d3748;
    }
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .input-label {
      font-size: 13px;
    }

    .input-medium .input-element {
      padding: 8px 12px;
    }

    .input-large .input-element {
      padding: 10px 14px;
    }
  }
`;

export default Input;
