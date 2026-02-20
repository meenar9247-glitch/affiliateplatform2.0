import React, { useState, useEffect } from 'react';
import { FiCheck, FiMinus, FiHelpCircle } from 'react-icons/fi';

const Checkbox = ({
  checked = false,
  indeterminate = false,
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
  icon: CustomIcon,
  className = '',
  id,
  ...props
}) => {
  const [isChecked, setIsChecked] = useState(checked);
  const [isIndeterminate, setIsIndeterminate] = useState(indeterminate);
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  useEffect(() => {
    setIsIndeterminate(indeterminate);
  }, [indeterminate]);

  const handleChange = (e) => {
    if (disabled) return;

    const newChecked = !isChecked;
    setIsChecked(newChecked);
    setIsIndeterminate(false);
    
    if (onChange) {
      onChange({
        target: {
          name,
          value,
          checked: newChecked,
          type: 'checkbox'
        }
      });
    }
  };

  // Size classes
  const sizeClasses = {
    small: 'checkbox-small',
    medium: 'checkbox-medium',
    large: 'checkbox-large'
  };

  // Color classes
  const colorClasses = {
    primary: 'checkbox-primary',
    secondary: 'checkbox-secondary',
    success: 'checkbox-success',
    danger: 'checkbox-danger',
    warning: 'checkbox-warning',
    info: 'checkbox-info'
  };

  // Styles
  const styles = `
    .checkbox-wrapper {
      display: inline-flex;
      align-items: flex-start;
      gap: 8px;
      cursor: ${disabled ? 'not-allowed' : 'pointer'};
      user-select: none;
      ${disabled ? 'opacity: 0.6;' : ''}
    }

    .checkbox-wrapper.disabled {
      cursor: not-allowed;
    }

    /* Checkbox Container */
    .checkbox-container {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* Hidden Native Checkbox */
    .checkbox-native {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      margin: 0;
      padding: 0;
      pointer-events: none;
    }

    /* Custom Checkbox */
    .checkbox-custom {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      border: 2px solid var(--border);
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast) var(--transition-ease);
      color: white;
    }

    /* Sizes */
    .checkbox-small .checkbox-custom {
      width: 16px;
      height: 16px;
      font-size: 12px;
    }

    .checkbox-medium .checkbox-custom {
      width: 20px;
      height: 20px;
      font-size: 14px;
    }

    .checkbox-large .checkbox-custom {
      width: 24px;
      height: 24px;
      font-size: 16px;
    }

    /* Checkbox States */
    .checkbox-wrapper:hover .checkbox-custom {
      border-color: var(--primary);
    }

    .checkbox-wrapper:focus-within .checkbox-custom {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    /* Checked States */
    .checkbox-primary.checkbox-checked .checkbox-custom {
      background: var(--primary);
      border-color: var(--primary);
    }

    .checkbox-secondary.checkbox-checked .checkbox-custom {
      background: var(--secondary);
      border-color: var(--secondary);
    }

    .checkbox-success.checkbox-checked .checkbox-custom {
      background: var(--success);
      border-color: var(--success);
    }

    .checkbox-danger.checkbox-checked .checkbox-custom {
      background: var(--danger);
      border-color: var(--danger);
    }

    .checkbox-warning.checkbox-checked .checkbox-custom {
      background: var(--warning);
      border-color: var(--warning);
    }

    .checkbox-info.checkbox-checked .checkbox-custom {
      background: var(--info);
      border-color: var(--info);
    }

    /* Indeterminate States */
    .checkbox-primary.checkbox-indeterminate .checkbox-custom {
      background: var(--primary);
      border-color: var(--primary);
    }

    .checkbox-secondary.checkbox-indeterminate .checkbox-custom {
      background: var(--secondary);
      border-color: var(--secondary);
    }

    .checkbox-success.checkbox-indeterminate .checkbox-custom {
      background: var(--success);
      border-color: var(--success);
    }

    .checkbox-danger.checkbox-indeterminate .checkbox-custom {
      background: var(--danger);
      border-color: var(--danger);
    }

    .checkbox-warning.checkbox-indeterminate .checkbox-custom {
      background: var(--warning);
      border-color: var(--warning);
    }

    .checkbox-info.checkbox-indeterminate .checkbox-custom {
      background: var(--info);
      border-color: var(--info);
    }

    /* Error State */
    .checkbox-error .checkbox-custom {
      border-color: var(--danger);
    }

    .checkbox-wrapper.checkbox-error:hover .checkbox-custom {
      border-color: var(--danger-dark);
    }

    .checkbox-wrapper.checkbox-error:focus-within .checkbox-custom {
      border-color: var(--danger);
      box-shadow: 0 0 0 3px var(--danger-100);
    }

    /* Disabled State */
    .checkbox-wrapper.checkbox-disabled {
      cursor: not-allowed;
    }

    .checkbox-wrapper.checkbox-disabled .checkbox-custom {
      background: var(--bg-secondary);
      border-color: var(--border-light);
    }

    .checkbox-wrapper.checkbox-disabled.checkbox-checked .checkbox-custom,
    .checkbox-wrapper.checkbox-disabled.checkbox-indeterminate .checkbox-custom {
      background: var(--border);
      border-color: var(--border);
    }

    /* Label */
    .checkbox-label {
      flex: 1;
      font-size: var(--text-sm);
      color: var(--text-primary);
      line-height: 1.5;
    }

    .checkbox-label.required::after {
      content: '*';
      color: var(--danger);
      margin-left: 4px;
    }

    /* Helper Text */
    .checkbox-helper {
      margin-top: 4px;
      margin-left: 28px;
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    .checkbox-error-text {
      margin-top: 4px;
      margin-left: 28px;
      font-size: var(--text-xs);
      color: var(--danger);
    }

    /* Icon */
    .checkbox-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Help Icon */
    .help-icon {
      margin-left: 4px;
      color: var(--text-secondary);
      cursor: help;
      font-size: 14px;
    }

    /* Group Styles */
    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .checkbox-group-row {
      flex-direction: row;
      flex-wrap: wrap;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .checkbox-custom {
        background: var(--dark-bg-secondary);
        border-color: var(--dark-border);
      }

      .checkbox-wrapper:hover .checkbox-custom {
        border-color: var(--dark-primary);
      }

      .checkbox-wrapper.checkbox-disabled .checkbox-custom {
        background: var(--dark-bg-tertiary);
        border-color: var(--dark-border);
      }

      .checkbox-label {
        color: var(--dark-text-primary);
      }

      .help-icon {
        color: var(--dark-text-muted);
      }
    }

    /* Animations */
    .checkbox-custom {
      animation: checkboxPop 0.2s var(--transition-ease);
    }

    @keyframes checkboxPop {
      0% {
        transform: scale(0.8);
        opacity: 0;
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    /* RTL Support */
    [dir="rtl"] .checkbox-wrapper {
      flex-direction: row-reverse;
    }

    [dir="rtl"] .checkbox-helper,
    [dir="rtl"] .checkbox-error-text {
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
          checkbox-wrapper
          ${sizeClasses[size]}
          ${colorClasses[color]}
          ${isChecked ? 'checkbox-checked' : ''}
          ${isIndeterminate ? 'checkbox-indeterminate' : ''}
          ${error ? 'checkbox-error' : ''}
          ${disabled ? 'checkbox-disabled' : ''}
          ${className}
        `}
      >
        <div className="checkbox-container">
          {/* Native Checkbox (for accessibility) */}
          <input
            type="checkbox"
            id={checkboxId}
            name={name}
            value={value}
            checked={isChecked}
            indeterminate={isIndeterminate}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            className="checkbox-native"
            {...props}
          />

          {/* Custom Checkbox */}
          <div className="checkbox-custom" aria-hidden="true">
            {isIndeterminate ? (
              <FiMinus className="checkbox-icon" />
            ) : isChecked ? (
              CustomIcon ? (
                <CustomIcon className="checkbox-icon" />
              ) : (
                <FiCheck className="checkbox-icon" />
              )
            ) : null}
          </div>
        </div>

        {/* Label */}
        {label && (
          <label htmlFor={checkboxId} className={`checkbox-label ${required ? 'required' : ''}`}>
            {label}
          </label>
        )}
      </div>

      {/* Error / Helper Text */}
      {error ? (
        <div className="checkbox-error-text">{error}</div>
      ) : helperText ? (
        <div className="checkbox-helper">
          {helperText}
          {helperText.includes('help') && <FiHelpCircle className="help-icon" />}
        </div>
      ) : null}
    </>
  );
};

// Checkbox Group Component
export const CheckboxGroup = ({
  options = [],
  value = [],
  onChange,
  label,
  error,
  helperText,
  disabled = false,
  direction = 'column',
  size = 'medium',
  color = 'primary',
  className = ''
}) => {
  const handleChange = (optionValue, checked) => {
    const newValue = checked
      ? [...value, optionValue]
      : value.filter(v => v !== optionValue);
    
    onChange?.(newValue);
  };

  const styles = `
    .checkbox-group-wrapper {
      margin-bottom: 16px;
    }

    .checkbox-group-label {
      display: block;
      margin-bottom: 8px;
      font-weight: var(--font-medium);
      color: var(--text-primary);
      font-size: var(--text-sm);
    }

    .checkbox-group {
      display: flex;
      gap: 12px;
    }

    .checkbox-group.column {
      flex-direction: column;
    }

    .checkbox-group.row {
      flex-direction: row;
      flex-wrap: wrap;
    }

    .checkbox-group-helper {
      margin-top: 4px;
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    .checkbox-group-error {
      margin-top: 4px;
      font-size: var(--text-xs);
      color: var(--danger);
    }

    @media (prefers-color-scheme: dark) {
      .checkbox-group-label {
        color: var(--dark-text-primary);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className={`checkbox-group-wrapper ${className}`}>
        {label && <div className="checkbox-group-label">{label}</div>}
        
        <div className={`checkbox-group ${direction}`}>
          {options.map((option) => (
            <Checkbox
              key={option.value}
              checked={value.includes(option.value)}
              onChange={(e) => handleChange(option.value, e.target.checked)}
              label={option.label}
              disabled={disabled || option.disabled}
              size={size}
              color={color}
            />
          ))}
        </div>

        {error ? (
          <div className="checkbox-group-error">{error}</div>
        ) : helperText ? (
          <div className="checkbox-group-helper">{helperText}</div>
        ) : null}
      </div>
    </>
  );
};

export default Checkbox;
