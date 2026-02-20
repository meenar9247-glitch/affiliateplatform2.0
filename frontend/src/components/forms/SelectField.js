import React, { useState, useEffect, useRef } from 'react';
import {
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiCheck,
  FiSearch,
  FiAlertCircle
} from 'react-icons/fi';

const SelectField = ({
  name,
  value,
  onChange,
  onBlur,
  options = [],
  label,
  placeholder = 'Select an option',
  helperText,
  error,
  touched,
  required = false,
  disabled = false,
  readOnly = false,
  size = 'medium',
  variant = 'outlined', // outlined, filled, underlined
  fullWidth = true,
  multiple = false,
  searchable = false,
  clearable = false,
  creatable = false,
  loading = false,
  maxSelected,
  closeOnSelect = true,
  icon,
  className = '',
  inputClassName = '',
  labelClassName = '',
  errorClassName = '',
  helperClassName = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSelectedLabel = () => {
    if (!value) return placeholder;

    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      return `${value.length} selected`;
    }

    const selected = options.find(opt => opt.value === value);
    return selected ? selected.label : placeholder;
  };

  const isSelected = (optionValue) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  const handleSelect = (optionValue) => {
    if (disabled || readOnly) return;

    let newValue;
    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      if (currentValue.includes(optionValue)) {
        newValue = currentValue.filter(v => v !== optionValue);
      } else {
        if (maxSelected && currentValue.length >= maxSelected) {
          return;
        }
        newValue = [...currentValue, optionValue];
      }
    } else {
      newValue = optionValue;
    }

    onChange?.({
      target: {
        name,
        value: newValue,
        type: 'select'
      }
    });

    if (!multiple || closeOnSelect) {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleRemove = (optionValue, e) => {
    e.stopPropagation();
    
    const currentValue = Array.isArray(value) ? value : [];
    const newValue = currentValue.filter(v => v !== optionValue);
    
    onChange?.({
      target: {
        name,
        value: newValue,
        type: 'select'
      }
    });
  };

  const handleClear = (e) => {
    e.stopPropagation();
    
    onChange?.({
      target: {
        name,
        value: multiple ? [] : null,
        type: 'select'
      }
    });
    
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
      case 'Tab':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Size classes
  const sizeClasses = {
    small: 'select-small',
    medium: 'select-medium',
    large: 'select-large'
  };

  // Variant classes
  const variantClasses = {
    outlined: 'select-outlined',
    filled: 'select-filled',
    underlined: 'select-underlined'
  };

  // Status classes
  const statusClass = error && touched ? 'select-error' : 
                     isFocused ? 'select-focused' : '';

  // Styles
  const styles = `
    .select-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      ${fullWidth ? 'width: 100%;' : ''}
    }

    /* Label */
    .select-label {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 6px;
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--text-primary);
    }

    .select-label-required {
      color: var(--danger);
      font-size: var(--text-xs);
    }

    /* Select Container */
    .select-container {
      position: relative;
      width: 100%;
    }

    /* Select Control */
    .select-control {
      display: flex;
      align-items: center;
      width: 100%;
      min-height: 40px;
      cursor: pointer;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    /* Size Variants */
    .select-small {
      min-height: 32px;
    }

    .select-small .select-value {
      padding: 4px 8px;
      font-size: var(--text-xs);
    }

    .select-medium {
      min-height: 40px;
    }

    .select-medium .select-value {
      padding: 8px 12px;
      font-size: var(--text-sm);
    }

    .select-large {
      min-height: 48px;
    }

    .select-large .select-value {
      padding: 12px 16px;
      font-size: var(--text-base);
    }

    /* Variant Styles */
    .select-outlined {
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
    }

    .select-filled {
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      background: var(--bg-secondary);
    }

    .select-underlined {
      border: none;
      border-bottom: 1px solid var(--border);
      border-radius: 0;
      background: transparent;
    }

    .select-outlined:hover:not(.select-disabled) {
      border-color: var(--primary);
    }

    .select-filled:hover:not(.select-disabled) {
      background: var(--bg-tertiary);
    }

    .select-underlined:hover:not(.select-disabled) {
      border-bottom-color: var(--primary);
    }

    .select-focused.select-outlined {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    .select-focused.select-filled {
      background: var(--bg-tertiary);
    }

    .select-focused.select-underlined {
      border-bottom-color: var(--primary);
      border-bottom-width: 2px;
    }

    .select-error.select-outlined {
      border-color: var(--danger);
    }

    .select-error.select-filled {
      background: var(--danger-50);
    }

    .select-error.select-underlined {
      border-bottom-color: var(--danger);
    }

    .select-error.select-focused.select-outlined {
      box-shadow: 0 0 0 3px var(--danger-100);
    }

    .select-disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background: var(--bg-secondary);
    }

    /* Value Display */
    .select-value {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .select-placeholder {
      color: var(--text-disabled);
    }

    /* Multiple Values */
    .select-multiple {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      padding: 4px;
    }

    .select-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: var(--primary-50);
      color: var(--primary-700);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      font-size: var(--text-xs);
    }

    .select-tag-remove {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .select-tag-remove:hover {
      background: var(--primary-200);
    }

    /* Icons */
    .select-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      margin: 0 8px;
    }

    .select-arrow {
      color: var(--text-secondary);
      transition: transform var(--transition-fast) var(--transition-ease);
    }

    .select-arrow.open {
      transform: rotate(180deg);
    }

    .select-clear {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .select-clear:hover {
      background: var(--bg-tertiary);
      color: var(--danger);
    }

    /* Dropdown */
    .select-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: var(--z-dropdown);
      max-height: 300px;
      overflow: hidden;
      animation: slideDown 0.2s var(--transition-ease);
    }

    /* Search Input */
    .select-search {
      padding: 8px;
      border-bottom: 1px solid var(--border);
    }

    .select-search-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: var(--text-sm);
    }

    .select-search-input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    /* Options List */
    .select-options {
      max-height: 250px;
      overflow-y: auto;
      padding: 4px 0;
    }

    /* Option */
    .select-option {
      padding: 8px 12px;
      cursor: pointer;
      transition: all var(--transition-fast) var(--transition-ease);
      color: var(--text-primary);
      font-size: var(--text-sm);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .select-option:hover {
      background: var(--bg-tertiary);
    }

    .select-option.highlighted {
      background: var(--primary-50);
    }

    .select-option.selected {
      background: var(--primary-50);
      color: var(--primary-700);
    }

    .select-option.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .select-option.disabled:hover {
      background: none;
    }

    .select-option-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .select-option-check {
      color: var(--primary);
    }

    /* Loading State */
    .select-loading {
      padding: 16px;
      text-align: center;
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }

    .select-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 8px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* No Options */
    .select-no-options {
      padding: 16px;
      text-align: center;
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }

    /* Create Option */
    .select-create-option {
      padding: 8px 12px;
      cursor: pointer;
      color: var(--primary);
      font-size: var(--text-sm);
      border-top: 1px solid var(--border);
    }

    .select-create-option:hover {
      background: var(--primary-50);
    }

    /* Helper Text */
    .select-helper {
      margin-top: 4px;
      font-size: var(--text-xs);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .select-error-text {
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
      .select-label {
        color: var(--dark-text-primary);
      }

      .select-outlined {
        background: var(--dark-bg-secondary);
        border-color: var(--dark-border);
      }

      .select-filled {
        background: var(--dark-bg-tertiary);
      }

      .select-tag {
        background: var(--dark-primary-50);
        color: var(--dark-primary);
      }

      .select-dropdown {
        background: var(--dark-bg-secondary);
        border-color: var(--dark-border);
      }

      .select-search-input {
        background: var(--dark-bg-tertiary);
        border-color: var(--dark-border);
        color: var(--dark-text-primary);
      }

      .select-option {
        color: var(--dark-text-primary);
      }

      .select-option:hover {
        background: var(--dark-bg-tertiary);
      }

      .select-option.highlighted {
        background: var(--dark-primary-50);
      }

      .select-option.selected {
        background: var(--dark-primary-50);
        color: var(--dark-primary);
      }

      .select-helper {
        color: var(--dark-text-muted);
      }
    }

    /* Animations */
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div
        ref={selectRef}
        className={`select-wrapper ${className}`}
        onKeyDown={handleKeyDown}
      >
        {/* Label */}
        {label && (
          <label htmlFor={name} className={`select-label ${labelClassName}`}>
            {label}
            {required && <span className="select-label-required">*</span>}
          </label>
        )}

        {/* Select Control */}
        <div
          className={`
            select-container
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${statusClass}
            ${disabled ? 'select-disabled' : ''}
          `}
          onClick={() => !disabled && !readOnly && setIsOpen(!isOpen)}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
        >
          {/* Multiple Tags */}
          {multiple && Array.isArray(value) && value.length > 0 ? (
            <div className="select-multiple">
              {value.map(val => {
                const option = options.find(opt => opt.value === val);
                return (
                  <span key={val} className="select-tag">
                    {option?.label || val}
                    {!disabled && !readOnly && (
                      <button
                        className="select-tag-remove"
                        onClick={(e) => handleRemove(val, e)}
                        type="button"
                      >
                        <FiX size={12} />
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          ) : (
            <div className={`select-value ${!value ? 'select-placeholder' : ''}`}>
              {getSelectedLabel()}
            </div>
          )}

          {/* Icons */}
          <div className="select-icons" style={{ display: 'flex', alignItems: 'center' }}>
            {clearable && value && (multiple ? value.length > 0 : true) && !disabled && !readOnly && (
              <button
                className="select-clear"
                onClick={handleClear}
                type="button"
              >
                <FiX size={16} />
              </button>
            )}
            <span className={`select-arrow ${isOpen ? 'open' : ''}`}>
              {isOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </span>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="select-dropdown">
            {/* Search Input */}
            {searchable && (
              <div className="select-search">
                <div style={{ position: 'relative' }}>
                  <FiSearch
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-secondary)'
                    }}
                    size={14}
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="select-search-input"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ paddingLeft: 32 }}
                  />
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="select-loading">
                <div className="select-spinner" />
                Loading...
              </div>
            )}

            {/* Options */}
            {!loading && (
              <div className="select-options">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, index) => (
                    <div
                      key={option.value}
                      className={`
                        select-option
                        ${isSelected(option.value) ? 'selected' : ''}
                        ${option.disabled ? 'disabled' : ''}
                        ${highlightedIndex === index ? 'highlighted' : ''}
                      `}
                      onClick={() => !option.disabled && handleSelect(option.value)}
                    >
                      <div className="select-option-content">
                        {option.icon && (
                          <span className="select-option-icon">{option.icon}</span>
                        )}
                        <span>{option.label}</span>
                      </div>
                      {isSelected(option.value) && (
                        <FiCheck className="select-option-check" size={14} />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="select-no-options">
                    {searchTerm ? 'No matching options' : 'No options available'}
                  </div>
                )}

                {/* Create Option */}
                {creatable && searchTerm && !filteredOptions.some(opt => 
                  opt.label.toLowerCase() === searchTerm.toLowerCase()
                ) && (
                  <div
                    className="select-create-option"
                    onClick={() => handleSelect(searchTerm)}
                  >
                    + Create "{searchTerm}"
                  </div>
                )}
              </div>
            )}
    {/* Error / Helper Text */}
        {error && touched ? (
          <div className={`select-error-text ${errorClassName}`}>
            <FiAlertCircle className="error-icon" size={14} />
            <span>{error}</span>
          </div>
        ) : helperText ? (
          <div className={`select-helper ${helperClassName}`}>
            <span>{helperText}</span>
          </div>
        ) : null}
      </div>
    </>
  );
};

// Specialized Select Components
export const CountrySelect = ({ options = [], ...props }) => {
  const countryOptions = options.length ? options : [
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'IN', label: 'India' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'JP', label: 'Japan' },
    { value: 'BR', label: 'Brazil' },
    { value: 'MX', label: 'Mexico' }
  ];

  return <SelectField options={countryOptions} searchable {...props} />;
};

export const CurrencySelect = ({ options = [], ...props }) => {
  const currencyOptions = options.length ? options : [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'JPY', label: 'JPY - Japanese Yen' },
    { value: 'AUD', label: 'AUD - Australian Dollar' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
    { value: 'CHF', label: 'CHF - Swiss Franc' },
    { value: 'CNY', label: 'CNY - Chinese Yuan' },
    { value: 'INR', label: 'INR - Indian Rupee' },
    { value: 'BRL', label: 'BRL - Brazilian Real' }
  ];

  return <SelectField options={currencyOptions} searchable {...props} />;
};

export const LanguageSelect = ({ options = [], ...props }) => {
  const languageOptions = options.length ? options : [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ru', label: 'Russian' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'zh', label: 'Chinese' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ar', label: 'Arabic' }
  ];

  return <SelectField options={languageOptions} searchable {...props} />;
};

export const TimezoneSelect = ({ options = [], ...props }) => {
  const timezoneOptions = options.length ? options : [
    { value: 'UTC-12', label: '(UTC-12:00) International Date Line West' },
    { value: 'UTC-11', label: '(UTC-11:00) Coordinated Universal Time-11' },
    { value: 'UTC-10', label: '(UTC-10:00) Hawaii' },
    { value: 'UTC-09', label: '(UTC-09:00) Alaska' },
    { value: 'UTC-08', label: '(UTC-08:00) Pacific Time (US & Canada)' },
    { value: 'UTC-07', label: '(UTC-07:00) Mountain Time (US & Canada)' },
    { value: 'UTC-06', label: '(UTC-06:00) Central Time (US & Canada)' },
    { value: 'UTC-05', label: '(UTC-05:00) Eastern Time (US & Canada)' },
    { value: 'UTC-04', label: '(UTC-04:00) Atlantic Time (Canada)' },
    { value: 'UTC-03', label: '(UTC-03:00) Brasilia' },
    { value: 'UTC-02', label: '(UTC-02:00) Mid-Atlantic' },
    { value: 'UTC-01', label: '(UTC-01:00) Azores' },
    { value: 'UTC+00', label: '(UTC+00:00) London, Dublin, Edinburgh' },
    { value: 'UTC+01', label: '(UTC+01:00) Berlin, Paris, Rome, Madrid' },
    { value: 'UTC+02', label: '(UTC+02:00) Athens, Helsinki, Jerusalem' },
    { value: 'UTC+03', label: '(UTC+03:00) Moscow, St. Petersburg' },
    { value: 'UTC+04', label: '(UTC+04:00) Abu Dhabi, Muscat' },
    { value: 'UTC+05', label: '(UTC+05:00) Islamabad, Karachi' },
    { value: 'UTC+05:30', label: '(UTC+05:30) New Delhi, Mumbai, Chennai' },
    { value: 'UTC+06', label: '(UTC+06:00) Dhaka' },
    { value: 'UTC+07', label: '(UTC+07:00) Bangkok, Hanoi, Jakarta' },
    { value: 'UTC+08', label: '(UTC+08:00) Beijing, Singapore, Hong Kong' },
    { value: 'UTC+09', label: '(UTC+09:00) Tokyo, Seoul, Osaka' },
    { value: 'UTC+10', label: '(UTC+10:00) Sydney, Melbourne, Brisbane' },
    { value: 'UTC+11', label: '(UTC+11:00) Solomon Islands' },
    { value: 'UTC+12', label: '(UTC+12:00) Auckland, Wellington' }
  ];

  return <SelectField options={timezoneOptions} searchable {...props} />;
};

export default SelectField;
