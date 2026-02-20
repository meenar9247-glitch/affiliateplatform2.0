import React, { useState, useRef, useEffect } from 'react';
import {
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiSearch,
  FiCalendar,
  FiClock,
  FiMail,
  FiLock,
  FiUser,
  FiPhone,
  FiMapPin,
  FiLink,
  FiDollarSign,
  FiPercent,
  FiHash,
  FiAtSign
} from 'react-icons/fi';

const TextField = ({
  type = 'text',
  name,
  value = '',
  onChange,
  onBlur,
  onFocus,
  label,
  placeholder,
  helperText,
  error,
  touched,
  required = false,
  disabled = false,
  readOnly = false,
  size = 'medium',
  variant = 'outlined', // outlined, filled, underlined
  fullWidth = true,
  icon,
  iconPosition = 'left',
  clearable = false,
  maxLength,
  minLength,
  pattern,
  autoComplete,
  autoFocus = false,
  multiline = false,
  rows = 3,
  resizable = true,
  prefix,
  suffix,
  className = '',
  inputClassName = '',
  labelClassName = '',
  errorClassName = '',
  helperClassName = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (value) {
      setCharCount(value.toString().length);
    } else {
      setCharCount(0);
    }
  }, [value]);

  const handleChange = (e) => {
    onChange?.(e);
    if (maxLength) {
      setCharCount(e.target.value.length);
    }
  };

  const handleClear = () => {
    const event = {
      target: {
        name,
        value: '',
        type: 'text'
      }
    };
    onChange?.(event);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getInputType = () => {
    if (type === 'password') {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  const getIcon = () => {
    if (icon) return icon;

    switch (type) {
      case 'email':
        return <FiMail />;
      case 'password':
        return <FiLock />;
      case 'search':
        return <FiSearch />;
      case 'tel':
        return <FiPhone />;
      case 'url':
        return <FiLink />;
      case 'number':
        return <FiHash />;
      case 'date':
        return <FiCalendar />;
      case 'time':
        return <FiClock />;
      default:
        return null;
    }
  };

  // Size classes
  const sizeClasses = {
    small: 'input-small',
    medium: 'input-medium',
    large: 'input-large'
  };

  // Variant classes
  const variantClasses = {
    outlined: 'input-outlined',
    filled: 'input-filled',
    underlined: 'input-underlined'
  };

  // Status classes
  const statusClass = error && touched ? 'input-error' : 
                     isFocused ? 'input-focused' : '';

  // Styles
  const styles = `
    .text-field-wrapper {
      display: flex;
      flex-direction: column;
      margin-bottom: 16px;
      ${fullWidth ? 'width: 100%;' : ''}
    }

    /* Label */
    .text-field-label {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 6px;
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--text-primary);
      transition: color var(--transition-fast) var(--transition-ease);
    }

    .text-field-label-required {
      color: var(--danger);
      font-size: var(--text-xs);
    }

    /* Input Container */
    .text-field-container {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    /* Size Variants */
    .input-small {
      min-height: 32px;
    }

    .input-small .input-element,
    .input-small textarea {
      padding: 6px 10px;
      font-size: var(--text-xs);
    }

    .input-medium {
      min-height: 40px;
    }

    .input-medium .input-element,
    .input-medium textarea {
      padding: 8px 12px;
      font-size: var(--text-sm);
    }

    .input-large {
      min-height: 48px;
    }

    .input-large .input-element,
    .input-large textarea {
      padding: 10px 16px;
      font-size: var(--text-base);
    }

    /* Variant Styles */
    .input-outlined {
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
    }

    .input-filled {
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      background: var(--bg-secondary);
    }

    .input-underlined {
      border: none;
      border-bottom: 1px solid var(--border);
      border-radius: 0;
      background: transparent;
    }

    .input-outlined:hover:not(.input-disabled) {
      border-color: var(--primary);
    }

    .input-filled:hover:not(.input-disabled) {
      background: var(--bg-tertiary);
    }

    .input-underlined:hover:not(.input-disabled) {
      border-bottom-color: var(--primary);
    }

    .input-focused.input-outlined {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    .input-focused.input-filled {
      background: var(--bg-tertiary);
    }

    .input-focused.input-underlined {
      border-bottom-color: var(--primary);
      border-bottom-width: 2px;
    }

    .input-error.input-outlined {
      border-color: var(--danger);
    }

    .input-error.input-filled {
      background: var(--danger-50);
    }

    .input-error.input-underlined {
      border-bottom-color: var(--danger);
    }

    .input-error.input-focused.input-outlined {
      box-shadow: 0 0 0 3px var(--danger-100);
    }

    .input-disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background: var(--bg-secondary);
    }

    /* Input Element */
    .input-element {
      width: 100%;
      height: 100%;
      border: none;
      outline: none;
      background: transparent;
      color: var(--text-primary);
      font-family: inherit;
    }

    .input-element::placeholder {
      color: var(--text-disabled);
    }

    .input-element:disabled {
      cursor: not-allowed;
    }

    textarea.input-element {
      resize: ${resizable ? 'vertical' : 'none'};
      min-height: ${rows * 20}px;
    }

    /* Icons */
    .input-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      font-size: 16px;
    }

    .input-icon-left {
      margin-left: 12px;
      margin-right: -4px;
    }

    .input-icon-right {
      margin-right: 12px;
      margin-left: -4px;
    }

    /* Password Toggle */
    .password-toggle {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color var(--transition-fast) var(--transition-ease);
    }

    .password-toggle:hover {
      color: var(--primary);
    }

    /* Clear Button */
    .clear-button {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast) var(--transition-ease);
      border-radius: 50%;
    }

    .clear-button:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }

    /* Prefix/Suffix */
    .input-prefix,
    .input-suffix {
      display: flex;
      align-items: center;
      padding: 0 8px;
      color: var(--text-secondary);
      font-size: var(--text-sm);
      white-space: nowrap;
    }

    .input-prefix {
      border-right: 1px solid var(--border);
    }

    .input-suffix {
      border-left: 1px solid var(--border);
    }

    /* Character Counter */
    .char-counter {
      margin-top: 4px;
      font-size: var(--text-xs);
      color: var(--text-secondary);
      text-align: right;
    }

    .char-counter.near-limit {
      color: var(--warning);
    }

    .char-counter.at-limit {
      color: var(--danger);
    }

    /* Helper Text */
    .text-field-helper {
      margin-top: 4px;
      font-size: var(--text-xs);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .text-field-error {
      margin-top: 4px;
      font-size: var(--text-xs);
      color: var(--danger);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .error-icon {
      flex-shrink: 0;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .text-field-label {
        color: var(--dark-text-primary);
      }

      .input-outlined {
        background: var(--dark-bg-secondary);
        border-color: var(--dark-border);
      }

      .input-filled {
        background: var(--dark-bg-tertiary);
      }

      .input-element {
        color: var(--dark-text-primary);
      }

      .input-element::placeholder {
        color: var(--dark-text-muted);
      }

      .input-icon,
      .input-prefix,
      .input-suffix {
        color: var(--dark-text-muted);
      }

      .input-prefix,
      .input-suffix {
        border-color: var(--dark-border);
      }

      .clear-button:hover {
        background: var(--dark-bg-tertiary);
      }

      .text-field-helper {
        color: var(--dark-text-muted);
      }
    }

    /* RTL Support */
    [dir="rtl"] .input-icon-left {
      margin-left: -4px;
      margin-right: 12px;
    }

    [dir="rtl"] .input-icon-right {
      margin-right: -4px;
      margin-left: 12px;
    }

    [dir="rtl"] .input-prefix {
      border-right: none;
      border-left: 1px solid var(--border);
    }

    [dir="rtl"] .input-suffix {
      border-left: none;
      border-right: 1px solid var(--border);
    }
  `;

  const iconElement = getIcon();

  return (
    <>
      <style>{styles}</style>
      <div className={`text-field-wrapper ${className}`}>
        {/* Label */}
        {label && (
          <label htmlFor={name} className={`text-field-label ${labelClassName}`}>
            {label}
            {required && <span className="text-field-label-required">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div
          className={`
            text-field-container
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${statusClass}
            ${disabled ? 'input-disabled' : ''}
          `}
        >
          {/* Prefix */}
          {prefix && <span className="input-prefix">{prefix}</span>}

          {/* Left Icon */}
          {iconElement && iconPosition === 'left' && (
            <span className="input-icon input-icon-left">{iconElement}</span>
          )}

          {/* Input / Textarea */}
          {multiline ? (
            <textarea
              ref={inputRef}
              name={name}
              value={value}
              onChange={handleChange}
              onBlur={(e) => {
                setIsFocused(false);
                onBlur?.(e);
              }}
              onFocus={(e) => {
                setIsFocused(true);
                onFocus?.(e);
              }}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={readOnly}
              rows={rows}
              maxLength={maxLength}
              minLength={minLength}
              autoComplete={autoComplete}
              autoFocus={autoFocus}
              className={`input-element ${inputClassName}`}
              {...props}
            />
          ) : (
            <input
              ref={inputRef}
              type={getInputType()}
              name={name}
              value={value}
              onChange={handleChange}
              onBlur={(e) => {
                setIsFocused(false);
                onBlur?.(e);
              }}
              onFocus={(e) => {
                setIsFocused(true);
                onFocus?.(e);
              }}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={readOnly}
              maxLength={maxLength}
              minLength={minLength}
              pattern={pattern}
              autoComplete={autoComplete}
              autoFocus={autoFocus}
              className={`input-element ${inputClassName}`}
              {...props}
            />
          )}

          {/* Right Icon */}
          {iconElement && iconPosition === 'right' && (
            <span className="input-icon input-icon-right">{iconElement}</span>
          )}

          {/* Clear Button */}
          {clearable && value && !disabled && !readOnly && (
            <button
              type="button"
              className="clear-button"
              onClick={handleClear}
              aria-label="Clear input"
            >
              <FiX size={16} />
            </button>
          )}

          {/* Password Toggle */}
          {type === 'password' && (
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          )}

          {/* Suffix */}
          {suffix && <span className="input-suffix">{suffix}</span>}
        </div>

        {/* Character Counter */}
        {maxLength && (
          <div className={`char-counter ${charCount >= maxLength ? 'at-limit' : charCount >= maxLength * 0.8 ? 'near-limit' : ''}`}>
            {charCount} / {maxLength}
          </div>
        )}

        {/* Error Message */}
        {error && touched ? (
          <div className={`text-field-error ${errorClassName}`}>
            <FiAlertCircle className="error-icon" size={14} />
            <span>{error}</span>
          </div>
        ) : helperText ? (
          <div className={`text-field-helper ${helperClassName}`}>
            <span>{helperText}</span>
          </div>
        ) : null}
      </div>
    </>
  );
};

// Specialized Input Components
export const EmailField = (props) => (
  <TextField type="email" icon={<FiMail />} {...props} />
);

export const PasswordField = (props) => (
  <TextField type="password" icon={<FiLock />} {...props} />
);

export const SearchField = (props) => (
  <TextField type="search" icon={<FiSearch />} clearable {...props} />
);

export const PhoneField = (props) => (
  <TextField type="tel" icon={<FiPhone />} {...props} />
);

export const UrlField = (props) => (
  <TextField type="url" icon={<FiLink />} {...props} />
);

export const NumberField = (props) => (
  <TextField type="number" icon={<FiHash />} {...props} />
);

export const CurrencyField = ({ currency = 'USD', ...props }) => (
  <TextField
    type="number"
    prefix={currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹'}
    step="0.01"
    min="0"
    {...props}
  />
);

export const PercentageField = (props) => (
  <TextField type="number" suffix="%" step="0.1" min="0" max="100" {...props} />
);

export const DateField = (props) => (
  <TextField type="date" icon={<FiCalendar />} {...props} />
);

export const TimeField = (props) => (
  <TextField type="time" icon={<FiClock />} {...props} />
);

export default TextField;
