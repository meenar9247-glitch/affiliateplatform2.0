import React, { useState, useEffect } from 'react';
import { FiCircle, FiHelpCircle } from 'react-icons/fi';

const Radio = ({
  checked = false,
  onChange,
  label,
  name,
  value,
  disabled = false,
  required = false,
  error,
  helperText,
  size = 'medium',
  color = 'primary',
  className = '',
  id,
  ...props
}) => {
  const [isChecked, setIsChecked] = useState(checked);
  const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleChange = (e) => {
    if (disabled) return;

    const newChecked = e.target.checked;
    setIsChecked(newChecked);
    
    if (onChange) {
      onChange({
        target: {
          name,
          value,
          checked: newChecked,
          type: 'radio'
        }
      });
    }
  };

  // Size classes
  const sizeClasses = {
    small: 'radio-small',
    medium: 'radio-medium',
    large: 'radio-large'
  };

  // Color classes
  const colorClasses = {
    primary: 'radio-primary',
    secondary: 'radio-secondary',
    success: 'radio-success',
    danger: 'radio-danger',
    warning: 'radio-warning',
    info: 'radio-info'
  };

  // Styles
  const styles = `
    .radio-wrapper {
      display: inline-flex;
      align-items: flex-start;
      gap: 8px;
      cursor: ${disabled ? 'not-allowed' : 'pointer'};
      user-select: none;
      ${disabled ? 'opacity: 0.6;' : ''}
    }

    .radio-wrapper.disabled {
      cursor: not-allowed;
    }

    /* Radio Container */
    .radio-container {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* Hidden Native Radio */
    .radio-native {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      margin: 0;
      padding: 0;
      pointer-events: none;
    }

    /* Custom Radio */
    .radio-custom {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      border: 2px solid var(--border);
      border-radius: 50%;
      transition: all var(--transition-fast) var(--transition-ease);
      color: white;
      position: relative;
    }

    .radio-custom::after {
      content: '';
      display: block;
      border-radius: 50%;
      background: currentColor;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    /* Sizes */
    .radio-small .radio-custom {
      width: 16px;
      height: 16px;
    }

    .radio-small .radio-custom::after {
      width: 8px;
      height: 8px;
    }

    .radio-medium .radio-custom {
      width: 20px;
      height: 20px;
    }

    .radio-medium .radio-custom::after {
      width: 10px;
      height: 10px;
    }

    .radio-large .radio-custom {
      width: 24px;
      height: 24px;
    }

    .radio-large .radio-custom::after {
      width: 12px;
      height: 12px;
    }

    /* Radio States */
    .radio-wrapper:hover .radio-custom {
      border-color: var(--primary);
    }

    .radio-wrapper:focus-within .radio-custom {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    /* Checked States */
    .radio-primary.radio-checked .radio-custom {
      border-color: var(--primary);
      color: var(--primary);
    }

    .radio-secondary.radio-checked .radio-custom {
      border-color: var(--secondary);
      color: var(--secondary);
    }

    .radio-success.radio-checked .radio-custom {
      border-color: var(--success);
      color: var(--success);
    }

    .radio-danger.radio-checked .radio-custom {
      border-color: var(--danger);
      color: var(--danger);
    }

    .radio-warning.radio-checked .radio-custom {
      border-color: var(--warning);
      color: var(--warning);
    }

    .radio-info.radio-checked .radio-custom {
      border-color: var(--info);
      color: var(--info);
    }

    .radio-checked .radio-custom::after {
      transform: scale(1);
      opacity: 1;
    }

    .radio-custom::after {
      transform: scale(0);
      opacity: 0;
    }

    /* Error State */
    .radio-error .radio-custom {
      border-color: var(--danger);
    }

    .radio-wrapper.radio-error:hover .radio-custom {
      border-color: var(--danger-dark);
    }

    .radio-wrapper.radio-error:focus-within .radio-custom {
      border-color: var(--danger);
      box-shadow: 0 0 0 3px var(--danger-100);
    }

    /* Disabled State */
    .radio-wrapper.radio-disabled {
      cursor: not-allowed;
    }

    .radio-wrapper.radio-disabled .radio-custom {
      background: var(--bg-secondary);
      border-color: var(--border-light);
    }

    .radio-wrapper.radio-disabled.radio-checked .radio-custom {
      color: var(--border);
    }

    /* Label */
    .radio-label {
      flex: 1;
      font-size: var(--text-sm);
      color: var(--text-primary);
      line-height: 1.5;
    }

    .radio-label.required::after {
      content: '*';
      color: var(--danger);
      margin-left: 4px;
    }

    /* Helper Text */
    .radio-helper {
      margin-top: 4px;
      margin-left: 28px;
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    .radio-error-text {
      margin-top: 4px;
      margin-left: 28px;
      font-size: var(--text-xs);
      color: var(--danger);
    }

    /* Help Icon */
    .help-icon {
      margin-left: 4px;
      color: var(--text-secondary);
      cursor: help;
      font-size: 14px;
    }

    /* Group Styles */
    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .radio-group-row {
      flex-direction: row;
      flex-wrap: wrap;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .radio-custom {
        background: var(--dark-bg-secondary);
        border-color: var(--dark-border);
      }

      .radio-wrapper:hover .radio-custom {
        border-color: var(--dark-primary);
      }

      .radio-wrapper.radio-disabled .radio-custom {
        background: var(--dark-bg-tertiary);
        border-color: var(--dark-border);
      }

      .radio-label {
        color: var(--dark-text-primary);
      }

      .help-icon {
        color: var(--dark-text-muted);
      }
    }

    /* Animations */
    .radio-custom::after {
      transition: transform 0.2s var(--transition-ease), opacity 0.2s var(--transition-ease);
    }

    .radio-checked .radio-custom::after {
      animation: radioPop 0.2s var(--transition-ease);
    }

    @keyframes radioPop {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      50% {
        transform: scale(1.2);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    /* RTL Support */
    [dir="rtl"] .radio-wrapper {
      flex-direction: row-reverse;
    }

    [dir="rtl"] .radio-helper,
    [dir="rtl"] .radio-error-text {
      margin-left: 0;
      margin-right: 28px;
    }

    [dir="rtl"] .help-icon {
      margin-left: 0;
      margin-right: 4px;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div
        className={`
          radio-wrapper
          ${sizeClasses[size]}
          ${colorClasses[color]}
          ${isChecked ? 'radio-checked' : ''}
          ${error ? 'radio-error' : ''}
          ${disabled ? 'radio-disabled' : ''}
          ${className}
        `}
      >
        <div className="radio-container">
          {/* Native Radio (for accessibility) */}
          <input
            type="radio"
            id={radioId}
            name={name}
            value={value}
            checked={isChecked}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            className="radio-native"
            {...props}
          />

          {/* Custom Radio */}
          <div className="radio-custom" aria-hidden="true" />
        </div>

        {/* Label */}
        {label && (
          <label htmlFor={radioId} className={`radio-label ${required ? 'required' : ''}`}>
            {label}
          </label>
        )}
      </div>

      {/* Error / Helper Text */}
      {error ? (
        <div className="radio-error-text">{error}</div>
      ) : helperText ? (
        <div className="radio-helper">
          {helperText}
          {helperText.includes('help') && <FiHelpCircle className="help-icon" />}
        </div>
      ) : null}
    </>
  );
};

// Radio Group Component
export const RadioGroup = ({
  options = [],
  value,
  onChange,
  label,
  name,
  error,
  helperText,
  disabled = false,
  direction = 'column',
  size = 'medium',
  color = 'primary',
  className = ''
}) => {
  const handleChange = (optionValue) => {
    onChange?.(optionValue);
  };

  const styles = `
    .radio-group-wrapper {
      margin-bottom: 16px;
    }

    .radio-group-label {
      display: block;
      margin-bottom: 8px;
      font-weight: var(--font-medium);
      color: var(--text-primary);
      font-size: var(--text-sm);
    }

    .radio-group {
      display: flex;
      gap: 12px;
    }

    .radio-group.column {
      flex-direction: column;
    }

    .radio-group.row {
      flex-direction: row;
      flex-wrap: wrap;
    }

    .radio-group-helper {
      margin-top: 4px;
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    .radio-group-error {
      margin-top: 4px;
      font-size: var(--text-xs);
      color: var(--danger);
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .radio-group-label {
        color: var(--dark-text-primary);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className={`radio-group-wrapper ${className}`}>
        {label && <div className="radio-group-label">{label}</div>}
        
        <div className={`radio-group ${direction}`}>
          {options.map((option) => (
            <Radio
              key={option.value}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => handleChange(option.value)}
              label={option.label}
              disabled={disabled || option.disabled}
              size={size}
              color={color}
            />
          ))}
        </div>

        {error ? (
          <div className="radio-group-error">{error}</div>
        ) : helperText ? (
          <div className="radio-group-helper">{helperText}</div>
        ) : null}
      </div>
    </>
  );
};

export default Radio;
