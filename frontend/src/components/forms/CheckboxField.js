import React, { useState, useEffect } from 'react';
import { FiCheck, FiMinus, FiAlertCircle, FiHelpCircle } from 'react-icons/fi';

const CheckboxField = ({
  name,
  checked = false,
  onChange,
  onBlur,
  label,
  helperText,
  error,
  touched,
  required = false,
  disabled = false,
  readOnly = false,
  size = 'medium',
  color = 'primary',
  indeterminate = false,
  icon,
  fullWidth = false,
  className = '',
  labelClassName = '',
  errorClassName = '',
  helperClassName = '',
  ...props
}) => {
  const [isChecked, setIsChecked] = useState(checked);
  const [isIndeterminate, setIsIndeterminate] = useState(indeterminate);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  useEffect(() => {
    setIsIndeterminate(indeterminate);
  }, [indeterminate]);

  const handleChange = (e) => {
    if (disabled || readOnly) return;

    const newChecked = !isChecked;
    setIsChecked(newChecked);
    setIsIndeterminate(false);

    onChange?.({
      target: {
        name,
        value: newChecked,
        checked: newChecked,
        type: 'checkbox'
      }
    });
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

  // Status classes
  const statusClass = error && touched ? 'checkbox-error' : 
                     isFocused ? 'checkbox-focused' : '';

  // Styles
  const styles = `
    .checkbox-field-wrapper {
      display: inline-flex;
      flex-direction: column;
      ${fullWidth ? 'width: 100%;' : ''}
    }

    .checkbox-field-container {
      display: inline-flex;
      align-items: flex-start;
      gap: 8px;
      cursor: ${disabled || readOnly ? 'not-allowed' : 'pointer'};
      user-select: none;
    }

    .checkbox-field-container.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Checkbox Box */
    .checkbox-box {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: var(--bg-primary);
      border: 2px solid var(--border);
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast) var(--transition-ease);
      color: white;
    }

    /* Size Variants */
    .checkbox-small .checkbox-box {
      width: 16px;
      height: 16px;
      font-size: 12px;
    }

    .checkbox-medium .checkbox-box {
      width: 20px;
      height: 20px;
      font-size: 14px;
    }

    .checkbox-large .checkbox-box {
      width: 24px;
      height: 24px;
      font-size: 16px;
    }

    /* Checkbox States */
    .checkbox-field-container:hover .checkbox-box {
      border-color: var(--primary);
    }

    .checkbox-focused .checkbox-box {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    /* Color Variants */
    .checkbox-primary.checkbox-checked .checkbox-box,
    .checkbox-primary.checkbox-indeterminate .checkbox-box {
      background: var(--primary);
      border-color: var(--primary);
    }

    .checkbox-secondary.checkbox-checked .checkbox-box,
    .checkbox-secondary.checkbox-indeterminate .checkbox-box {
      background: var(--secondary);
      border-color: var(--secondary);
    }

    .checkbox-success.checkbox-checked .checkbox-box,
    .checkbox-success.checkbox-indeterminate .checkbox-box {
      background: var(--success);
      border-color: var(--success);
    }

    .checkbox-danger.checkbox-checked .checkbox-box,
    .checkbox-danger.checkbox-indeterminate .checkbox-box {
      background: var(--danger);
      border-color: var(--danger);
    }

    .checkbox-warning.checkbox-checked .checkbox-box,
    .checkbox-warning.checkbox-indeterminate .checkbox-box {
      background: var(--warning);
      border-color: var(--warning);
    }

    .checkbox-info.checkbox-checked .checkbox-box,
    .checkbox-info.checkbox-indeterminate .checkbox-box {
      background: var(--info);
      border-color: var(--info);
    }

    /* Error State */
    .checkbox-error .checkbox-box {
      border-color: var(--danger);
    }

    .checkbox-error.checkbox-focused .checkbox-box {
      box-shadow: 0 0 0 3px var(--danger-100);
    }

    .checkbox-error.checkbox-checked .checkbox-box,
    .checkbox-error.checkbox-indeterminate .checkbox-box {
      background: var(--danger);
      border-color: var(--danger);
    }

    /* Disabled State */
    .checkbox-field-container.disabled .checkbox-box {
      background: var(--bg-secondary);
      border-color: var(--border-light);
    }

    .checkbox-field-container.disabled.checkbox-checked .checkbox-box,
    .checkbox-field-container.disabled.checkbox-indeterminate .checkbox-box {
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
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .checkbox-error-text {
      margin-top: 4px;
      margin-left: 28px;
      font-size: var(--text-xs);
      color: var(--danger);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .error-icon {
      flex-shrink: 0;
    }

    .help-icon {
      color: var(--text-secondary);
      cursor: help;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .checkbox-box {
        background: var(--dark-bg-secondary);
        border-color: var(--dark-border);
      }

      .checkbox-field-container:hover .checkbox-box {
        border-color: var(--dark-primary);
      }

      .checkbox-label {
        color: var(--dark-text-primary);
      }

      .checkbox-helper {
        color: var(--dark-text-muted);
      }

      .help-icon {
        color: var(--dark-text-muted);
      }
    }

    /* RTL Support */
    [dir="rtl"] .checkbox-helper,
    [dir="rtl"] .checkbox-error-text {
      margin-left: 0;
      margin-right: 28px;
    }

    /* Animations */
    .checkbox-box {
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
  `;

  return (
    <>
      <style>{styles}</style>
      <div className={`checkbox-field-wrapper ${className}`}>
        <label
          className={`
            checkbox-field-container
            ${sizeClasses[size]}
            ${colorClasses[color]}
            ${isChecked ? 'checkbox-checked' : ''}
            ${isIndeterminate ? 'checkbox-indeterminate' : ''}
            ${statusClass}
            ${disabled || readOnly ? 'disabled' : ''}
          `}
        >
          {/* Checkbox Box */}
          <span className="checkbox-box">
            {isIndeterminate ? (
              <FiMinus />
            ) : isChecked ? (
              icon ? icon : <FiCheck />
            ) : null}
          </span>

          {/* Hidden Input for Accessibility */}
          <input
            type="checkbox"
            name={name}
            checked={isChecked}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            style={{
              position: 'absolute',
              opacity: 0,
              width: 0,
              height: 0,
              margin: 0,
              padding: 0,
              pointerEvents: 'none'
            }}
            {...props}
          />

          {/* Label */}
          {label && (
            <span className={`checkbox-label ${required ? 'required' : ''} ${labelClassName}`}>
              {label}
            </span>
          )}
        </label>

        {/* Error / Helper Text */}
        {error && touched ? (
          <div className={`checkbox-error-text ${errorClassName}`}>
            <FiAlertCircle className="error-icon" size={14} />
            <span>{error}</span>
          </div>
        ) : helperText ? (
          <div className={`checkbox-helper ${helperClassName}`}>
            <span>{helperText}</span>
            {helperText.includes('help') && <FiHelpCircle className="help-icon" size={12} />}
          </div>
        ) : null}
      </div>
    </>
  );
};

// Checkbox Group Component
export const CheckboxGroupField = ({
  name,
  options = [],
  value = [],
  onChange,
  onBlur,
  label,
  helperText,
  error,
  touched,
  required = false,
  disabled = false,
  readOnly = false,
  direction = 'column',
  size = 'medium',
  color = 'primary',
  className = '',
  ...props
}) => {
  const handleChange = (optionValue, checked) => {
    const newValue = checked
      ? [...value, optionValue]
      : value.filter(v => v !== optionValue);

    onChange?.({
      target: {
        name,
        value: newValue,
        type: 'checkbox-group'
      }
    });
  };

  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange?.({
        target: {
          name,
          value: [],
          type: 'checkbox-group'
        }
      });
    } else {
      onChange?.({
        target: {
          name,
          value: options.map(opt => opt.value),
          type: 'checkbox-group'
        }
      });
    }
  };

  const styles = `
    .checkbox-group-wrapper {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .checkbox-group-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .checkbox-group-label-text {
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--text-primary);
    }

    .checkbox-group-label-text.required::after {
      content: '*';
      color: var(--danger);
      margin-left: 4px;
    }

    .checkbox-group-select-all {
      background: none;
      border: none;
      color: var(--primary);
      font-size: var(--text-xs);
      cursor: pointer;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .checkbox-group-select-all:hover {
      background: var(--primary-50);
    }

    .checkbox-group-select-all:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .checkbox-group-error {
      margin-top: 4px;
      font-size: var(--text-xs);
      color: var(--danger);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    @media (prefers-color-scheme: dark) {
      .checkbox-group-label-text {
        color: var(--dark-text-primary);
      }

      .checkbox-group-select-all:hover {
        background: var(--dark-primary-50);
      }

      .checkbox-group-helper {
        color: var(--dark-text-muted);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className={`checkbox-group-wrapper ${className}`}>
        {(label || options.length > 0) && (
          <div className="checkbox-group-label">
            {label && (
              <span className={`checkbox-group-label-text ${required ? 'required' : ''}`}>
                {label}
              </span>
            )}
            {options.length > 0 && (
              <button
                type="button"
                className="checkbox-group-select-all"
                onClick={handleSelectAll}
                disabled={disabled || readOnly}
              >
                {value.length === options.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
        )}

        <div className={`checkbox-group ${direction}`}>
          {options.map((option) => (
            <CheckboxField
              key={option.value}
              name={`${name}.${option.value}`}
              checked={value.includes(option.value)}
              onChange={(e) => handleChange(option.value, e.target.checked)}
              label={option.label}
              disabled={disabled || readOnly || option.disabled}
              size={size}
              color={color}
              {...props}
            />
          ))}
        </div>

        {error && touched ? (
          <div className="checkbox-group-error">
            <FiAlertCircle size={14} />
            <span>{error}</span>
          </div>
        ) : helperText ? (
          <div className="checkbox-group-helper">
            <span>{helperText}</span>
          </div>
        ) : null}
      </div>
    </>
  );
};

// Toggle Switch Component (Styled Checkbox)
export const ToggleField = ({
  label,
  size = 'medium',
  color = 'primary',
  ...props
}) => {
  const sizeClasses = {
    small: 'toggle-small',
    medium: 'toggle-medium',
    large: 'toggle-large'
  };

  const colorClasses = {
    primary: 'toggle-primary',
    secondary: 'toggle-secondary',
    success: 'toggle-success',
    danger: 'toggle-danger',
    warning: 'toggle-warning',
    info: 'toggle-info'
  };

  const styles = `
    .toggle-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .toggle {
      position: relative;
      display: inline-block;
      cursor: pointer;
    }

    .toggle-track {
      position: relative;
      background: var(--border);
      border-radius: 100px;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .toggle-thumb {
      position: absolute;
      background: white;
      border-radius: 50%;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast) var(--transition-ease);
    }

    /* Size Variants */
    .toggle-small .toggle-track {
      width: 36px;
      height: 20px;
    }

    .toggle-small .toggle-thumb {
      width: 16px;
      height: 16px;
      top: 2px;
      left: 2px;
    }

    .toggle-small.toggle-checked .toggle-thumb {
      left: 18px;
    }

    .toggle-medium .toggle-track {
      width: 44px;
      height: 24px;
    }

    .toggle-medium .toggle-thumb {
      width: 20px;
      height: 20px;
      top: 2px;
      left: 2px;
    }

    .toggle-medium.toggle-checked .toggle-thumb {
      left: 22px;
    }

    .toggle-large .toggle-track {
      width: 52px;
      height: 28px;
    }

    .toggle-large .toggle-thumb {
      width: 24px;
      height: 24px;
      top: 2px;
      left: 2px;
    }

    .toggle-large.toggle-checked .toggle-thumb {
      left: 26px;
    }

    /* Color Variants */
    .toggle-primary.toggle-checked .toggle-track {
      background: var(--primary);
    }

    .toggle-secondary.toggle-checked .toggle-track {
      background: var(--secondary);
    }

    .toggle-success.toggle-checked .toggle-track {
      background: var(--success);
    }

    .toggle-danger.toggle-checked .toggle-track {
      background: var(--danger);
    }

    .toggle-warning.toggle-checked .toggle-track {
      background: var(--warning);
    }

    .toggle-info.toggle-checked .toggle-track {
      background: var(--info);
    }

    /* Focus State */
    .toggle-focused .toggle-track {
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    /* Disabled State */
    .toggle.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .toggle-label {
      font-size: var(--text-sm);
      color: var(--text-primary);
    }

    @media (prefers-color-scheme: dark) {
      .toggle-track {
        background: var(--dark-border);
      }

      .toggle-thumb {
        background: var(--dark-bg-tertiary);
      }

      .toggle-label {
        color: var(--dark-text-primary);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className={`toggle-wrapper ${sizeClasses[size]} ${colorClasses[color]}`}>
        <CheckboxField
          {...props}
          className={`toggle ${sizeClasses[size]} ${colorClasses[color]}`}
          icon={null}
        />
        {label && <span className="toggle-label">{label}</span>}
      </div>
    </>
  );
};

export default CheckboxField;
