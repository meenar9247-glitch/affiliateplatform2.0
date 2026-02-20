import React, { useState, useEffect } from 'react';
import { FiCircle, FiAlertCircle, FiHelpCircle } from 'react-icons/fi';

const RadioGroup = ({
  name,
  value,
  onChange,
  onBlur,
  options = [],
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
  labelClassName = '',
  optionClassName = '',
  errorClassName = '',
  helperClassName = '',
  ...props
}) => {
  const [selectedValue, setSelectedValue] = useState(value);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleChange = (optionValue) => {
    if (disabled || readOnly) return;

    setSelectedValue(optionValue);
    onChange?.({
      target: {
        name,
        value: optionValue,
        type: 'radio'
      }
    });
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

  // Direction classes
  const directionClasses = {
    column: 'radio-group-column',
    row: 'radio-group-row',
    'row-wrap': 'radio-group-row-wrap'
  };

  // Styles
  const styles = `
    .radio-group-wrapper {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }

    /* Label */
    .radio-group-label {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .radio-group-label.required::after {
      content: '*';
      color: var(--danger);
      margin-left: 4px;
    }

    /* Radio Group */
    .radio-group {
      display: flex;
    }

    .radio-group-column {
      flex-direction: column;
      gap: 12px;
    }

    .radio-group-row {
      flex-direction: row;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .radio-group-row-wrap {
      flex-direction: row;
      gap: 16px;
      flex-wrap: wrap;
    }

    /* Radio Option */
    .radio-option {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: ${disabled || readOnly ? 'not-allowed' : 'pointer'};
      user-select: none;
    }

    .radio-option.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Radio Circle */
    .radio-circle {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: var(--bg-primary);
      border: 2px solid var(--border);
      border-radius: 50%;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .radio-circle::after {
      content: '';
      display: block;
      border-radius: 50%;
      background: currentColor;
      transition: all var(--transition-fast) var(--transition-ease);
      transform: scale(0);
      opacity: 0;
    }

    /* Size Variants */
    .radio-small .radio-circle {
      width: 16px;
      height: 16px;
    }

    .radio-small .radio-circle::after {
      width: 8px;
      height: 8px;
    }

    .radio-medium .radio-circle {
      width: 20px;
      height: 20px;
    }

    .radio-medium .radio-circle::after {
      width: 10px;
      height: 10px;
    }

    .radio-large .radio-circle {
      width: 24px;
      height: 24px;
    }

    .radio-large .radio-circle::after {
      width: 12px;
      height: 12px;
    }

    /* Radio States */
    .radio-option:hover .radio-circle {
      border-color: var(--primary);
    }

    .radio-option:focus-within .radio-circle {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    /* Selected State */
    .radio-primary .radio-circle.selected {
      border-color: var(--primary);
      color: var(--primary);
    }

    .radio-secondary .radio-circle.selected {
      border-color: var(--secondary);
      color: var(--secondary);
    }

    .radio-success .radio-circle.selected {
      border-color: var(--success);
      color: var(--success);
    }

    .radio-danger .radio-circle.selected {
      border-color: var(--danger);
      color: var(--danger);
    }

    .radio-warning .radio-circle.selected {
      border-color: var(--warning);
      color: var(--warning);
    }

    .radio-info .radio-circle.selected {
      border-color: var(--info);
      color: var(--info);
    }

    .radio-circle.selected::after {
      transform: scale(1);
      opacity: 1;
    }

    /* Error State */
    .radio-group-error .radio-circle {
      border-color: var(--danger);
    }

    .radio-group-error .radio-option:hover .radio-circle {
      border-color: var(--danger-dark);
    }

    .radio-group-error .radio-option:focus-within .radio-circle {
      border-color: var(--danger);
      box-shadow: 0 0 0 3px var(--danger-100);
    }

    /* Option Label */
    .radio-option-label {
      font-size: var(--text-sm);
      color: var(--text-primary);
    }

    .radio-option-label.disabled {
      color: var(--text-secondary);
    }

    /* Hidden Input */
    .radio-hidden-input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      margin: 0;
      padding: 0;
      pointer-events: none;
    }

    /* Helper Text */
    .radio-group-helper {
      margin-top: 4px;
      font-size: var(--text-xs);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .radio-group-error-text {
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

    .help-icon {
      color: var(--text-secondary);
      cursor: help;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .radio-group-label {
        color: var(--dark-text-primary);
      }

      .radio-circle {
        background: var(--dark-bg-secondary);
        border-color: var(--dark-border);
      }

      .radio-option:hover .radio-circle {
        border-color: var(--dark-primary);
      }

      .radio-option-label {
        color: var(--dark-text-primary);
      }

      .radio-option-label.disabled {
        color: var(--dark-text-muted);
      }

      .radio-group-helper {
        color: var(--dark-text-muted);
      }

      .help-icon {
        color: var(--dark-text-muted);
      }
    }

    /* RTL Support */
    [dir="rtl"] .radio-option {
      flex-direction: row-reverse;
    }

    [dir="rtl"] .radio-group-row,
    [dir="rtl"] .radio-group-row-wrap {
      flex-direction: row-reverse;
    }

    /* Animations */
    .radio-circle::after {
      transition: transform 0.2s var(--transition-ease), opacity 0.2s var(--transition-ease);
    }

    .radio-circle.selected::after {
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
  `;

  return (
    <>
      <style>{styles}</style>
      <div className={`radio-group-wrapper ${className}`}>
        {/* Label */}
        {label && (
          <label className={`radio-group-label ${required ? 'required' : ''} ${labelClassName}`}>
            {label}
          </label>
        )}

        {/* Radio Options */}
        <div
          className={`
            radio-group
            ${directionClasses[direction]}
            ${sizeClasses[size]}
            ${colorClasses[color]}
            ${error && touched ? 'radio-group-error' : ''}
          `}
          role="radiogroup"
          aria-labelledby={label ? `radio-group-${name}-label` : undefined}
        >
          {options.map((option) => (
            <RadioOption
              key={option.value}
              name={name}
              value={option.value}
              label={option.label}
              checked={selectedValue === option.value}
              onChange={handleChange}
              onBlur={onBlur}
              disabled={disabled || readOnly || option.disabled}
              size={size}
              color={color}
              className={optionClassName}
              {...props}
            />
          ))}
        </div>

        {/* Error / Helper Text */}
        {error && touched ? (
          <div className={`radio-group-error-text ${errorClassName}`}>
            <FiAlertCircle className="error-icon" size={14} />
            <span>{error}</span>
          </div>
        ) : helperText ? (
          <div className={`radio-group-helper ${helperClassName}`}>
            <span>{helperText}</span>
            {helperText.includes('help') && <FiHelpCircle className="help-icon" size={12} />}
          </div>
        ) : null}
      </div>
    </>
  );
};

// Individual Radio Option Component
export const RadioOption = ({
  name,
  value,
  label,
  checked = false,
  onChange,
  onBlur,
  disabled = false,
  size = 'medium',
  color = 'primary',
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = () => {
    if (!disabled) {
      onChange(value);
    }
  };

  return (
    <label
      className={`
        radio-option
        radio-${size}
        radio-${color}
        ${disabled ? 'disabled' : ''}
        ${className}
      `}
    >
      <span className={`radio-circle ${checked ? 'selected' : ''}`} />
      
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        disabled={disabled}
        className="radio-hidden-input"
        {...props}
      />
      
      {label && (
        <span className={`radio-option-label ${disabled ? 'disabled' : ''}`}>
          {label}
        </span>
      )}
    </label>
  );
};

// Card Radio Group Component (with card style)
export const CardRadioGroup = ({
  options = [],
  value,
  onChange,
  columns = 2,
  ...props
}) => {
  const styles = `
    .card-radio-group {
      display: grid;
      grid-template-columns: repeat(${columns}, 1fr);
      gap: 16px;
    }

    .card-radio-option {
      padding: 16px;
      border: 2px solid var(--border);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--transition-fast) var(--transition-ease);
      background: var(--bg-primary);
    }

    .card-radio-option:hover {
      border-color: var(--primary);
    }

    .card-radio-option.selected {
      border-color: var(--primary);
      background: var(--primary-50);
    }

    .card-radio-option.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: var(--bg-secondary);
    }

    .card-radio-option.disabled:hover {
      border-color: var(--border);
    }

    .card-radio-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 8px;
    }

    .card-radio-icon {
      font-size: 24px;
      color: var(--primary);
    }

    .card-radio-title {
      font-weight: var(--font-semibold);
      color: var(--text-primary);
    }

    .card-radio-description {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    .card-radio-price {
      font-size: var(--text-lg);
      font-weight: var(--font-bold);
      color: var(--primary);
    }

    @media (prefers-color-scheme: dark) {
      .card-radio-option {
        background: var(--dark-bg-secondary);
        border-color: var(--dark-border);
      }

      .card-radio-option.selected {
        background: var(--dark-primary-50);
      }

      .card-radio-option.disabled {
        background: var(--dark-bg-tertiary);
      }

      .card-radio-title {
        color: var(--dark-text-primary);
      }

      .card-radio-description {
        color: var(--dark-text-muted);
      }
    }

    @media (max-width: 768px) {
      .card-radio-group {
        grid-template-columns: 1fr;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="card-radio-group">
        {options.map((option) => (
          <div
            key={option.value}
            className={`
              card-radio-option
              ${value === option.value ? 'selected' : ''}
              ${option.disabled ? 'disabled' : ''}
            `}
            onClick={() => !option.disabled && onChange(option.value)}
          >
            <div className="card-radio-content">
              {option.icon && <span className="card-radio-icon">{option.icon}</span>}
              <span className="card-radio-title">{option.label}</span>
              {option.description && (
                <span className="card-radio-description">{option.description}</span>
              )}
              {option.price && (
                <span className="card-radio-price">{option.price}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// Segmented Radio Group (button style)
export const SegmentedRadioGroup = ({
  options = [],
  value,
  onChange,
  size = 'medium',
  ...props
}) => {
  const sizeClasses = {
    small: 'segmented-small',
    medium: 'segmented-medium',
    large: 'segmented-large'
  };

  const styles = `
    .segmented-group {
      display: inline-flex;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--bg-primary);
    }

    .segmented-option {
      padding: 8px 16px;
      border: none;
      background: none;
      cursor: pointer;
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--text-secondary);
      transition: all var(--transition-fast) var(--transition-ease);
      border-right: 1px solid var(--border);
    }

    .segmented-option:last-child {
      border-right: none;
    }

    .segmented-option:hover {
      background: var(--bg-tertiary);
      color: var(--primary);
    }

    .segmented-option.selected {
      background: var(--primary);
      color: white;
    }

    .segmented-option.selected:hover {
      background: var(--primary-dark);
    }

    .segmented-option.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .segmented-option.disabled:hover {
      background: none;
      color: var(--text-secondary);
    }

    /* Size Variants */
    .segmented-small .segmented-option {
      padding: 4px 12px;
      font-size: var(--text-xs);
    }

    .segmented-large .segmented-option {
      padding: 12px 20px;
      font-size: var(--text-base);
    }

    @media (prefers-color-scheme: dark) {
      .segmented-group {
        background: var(--dark-bg-secondary);
        border-color: var(--dark-border);
      }

      .segmented-option {
        color: var(--dark-text-secondary);
        border-right-color: var(--dark-border);
      }

      .segmented-option:hover {
        background: var(--dark-bg-tertiary);
        color: var(--dark-primary);
      }

      .segmented-option.selected {
        background: var(--dark-primary);
        color: white;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className={`segmented-group ${sizeClasses[size]}`}>
        {options.map((option) => (
          <button
            key={option.value}
            className={`
              segmented-option
              ${value === option.value ? 'selected' : ''}
              ${option.disabled ? 'disabled' : ''}
            `}
            onClick={() => !option.disabled && onChange(option.value)}
            disabled={option.disabled}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </>
  );
};

export default RadioGroup;
