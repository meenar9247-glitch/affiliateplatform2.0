import React, { useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiChevronUp, FiX, FiCheck, FiSearch } from 'react-icons/fi';

const Select = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  multiple = false,
  searchable = false,
  clearable = false,
  size = 'medium',
  fullWidth = true,
  className = '',
  name,
  id,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

  // Handle click outside
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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      const filteredOptions = getFilteredOptions();

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
            handleOptionClick(filteredOptions[highlightedIndex]);
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

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, options, searchTerm]);

  const getFilteredOptions = () => {
    if (!searchTerm) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
      setHighlightedIndex(-1);
    }
  };

  const handleOptionClick = (option) => {
    if (option.disabled) return;

    if (multiple) {
      const newValue = Array.isArray(value) ? [...value] : [];
      const index = newValue.findIndex(v => v.value === option.value);

      if (index >= 0) {
        newValue.splice(index, 1);
      } else {
        newValue.push(option);
      }

      onChange?.(newValue);
    } else {
      onChange?.(option);
      setIsOpen(false);
      setSearchTerm('');
    }

    setHighlightedIndex(-1);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (multiple) {
      onChange?.([]);
    } else {
      onChange?.(null);
    }
  };

  const handleRemoveTag = (option, e) => {
    e.stopPropagation();
    if (multiple && Array.isArray(value)) {
      const newValue = value.filter(v => v.value !== option.value);
      onChange?.(newValue);
    }
  };

  const getDisplayValue = () => {
    if (multiple) {
      if (!value || value.length === 0) return placeholder;
      return `${value.length} selected`;
    } else {
      return value?.label || placeholder;
    }
  };

  const isSelected = (option) => {
    if (multiple && Array.isArray(value)) {
      return value.some(v => v.value === option.value);
    }
    return value?.value === option.value;
  };

  // Size classes
  const sizeClasses = {
    small: 'select-small',
    medium: 'select-medium',
    large: 'select-large'
  };

  // Filtered options
  const filteredOptions = getFilteredOptions();

  // Styles
  const styles = `
    .select-wrapper {
      position: relative;
      display: inline-block;
      ${fullWidth ? 'width: 100%;' : ''}
    }

    /* Label */
    .select-label {
      display: block;
      margin-bottom: 8px;
      font-weight: var(--font-medium);
      color: var(--text-primary);
      font-size: var(--text-sm);
    }

    .required-star {
      color: var(--danger);
      margin-left: 4px;
    }

    /* Select Container */
    .select-container {
      position: relative;
      cursor: pointer;
      width: 100%;
    }

    /* Select Control */
    .select-control {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast) var(--transition-ease);
      color: var(--text-primary);
      cursor: pointer;
    }

    .select-control:hover:not(.select-disabled) {
      border-color: var(--primary);
    }

    .select-control.select-open {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    .select-control.select-error {
      border-color: var(--danger);
    }

    .select-control.select-error:hover {
      border-color: var(--danger);
    }

    .select-control.select-disabled {
      background: var(--bg-secondary);
      border-color: var(--border-light);
      cursor: not-allowed;
      opacity: 0.7;
    }

    /* Size Variants */
    .select-small {
      min-height: 32px;
      padding: 4px 8px;
      font-size: var(--text-xs);
    }

    .select-small .select-value {
      padding: 4px 8px;
      font-size: var(--text-xs);
    }

    .select-medium {
      min-height: 40px;
      padding: 8px 12px;
      font-size: var(--text-sm);
    }

    .select-medium .select-value {
      padding: 8px 12px;
      font-size: var(--text-sm);
    }

    .select-large {
      min-height: 48px;
      padding: 12px 16px;
      font-size: var(--text-base);
    }

    .select-large .select-value {
      padding: 12px 16px;
      font-size: var(--text-base);
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

    /* Multiple Tags */
    .select-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      flex: 1;
    }

    .select-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: var(--primary-bg);
      color: var(--primary);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      font-size: var(--text-xs);
      white-space: nowrap;
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
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .select-tag-remove:hover {
      background: var(--primary);
      color: white;
    }

    /* Icons */
    .select-icons {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-left: 8px;
    }

    .select-clear {
      background: none;
      border: none;
      color: var(--text-disabled);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-full);
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .select-clear:hover:not(:disabled) {
      background: var(--bg-tertiary);
      color: var(--danger);
    }

    .select-clear:disabled {
      cursor: not-allowed;
    }

    .select-arrow {
      color: var(--text-secondary);
      transition: transform var(--transition-fast) var(--transition-ease);
    }

    .select-arrow.open {
      transform: rotate(180deg);
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
      border-bottom: 1px solid var(--border-light);
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
      background: var(--primary-bg);
    }

    .select-option.selected {
      background: var(--primary-bg);
      color: var(--primary);
      font-weight: var(--font-medium);
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
      margin-left: 8px;
    }

    /* No Options */
    .select-no-options {
      padding: 16px;
      text-align: center;
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }

    /* Helper Text */
    .select-helper {
      margin-top: 4px;
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    .select-error-text {
      margin-top: 4px;
      font-size: var(--text-xs);
      color: var(--danger);
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .select-control {
        background: var(--dark-bg-secondary);
        border-color: var(--dark-border);
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

      .select-option:hover {
        background: var(--dark-bg-tertiary);
      }

      .select-option.highlighted {
        background: var(--dark-bg-tertiary);
      }

      .select-option.selected {
        background: var(--dark-bg-primary);
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
      <div className={`select-wrapper ${className}`} ref={selectRef}>
        {/* Label */}
        {label && (
          <label className="select-label" htmlFor={id || name}>
            {label}
            {required && <span className="required-star">*</span>}
          </label>
        )}

        {/* Select Control */}
        <div className="select-container">
          <div
            className={`select-control ${sizeClasses[size]} ${isOpen ? 'select-open' : ''} 
              ${error ? 'select-error' : ''} ${disabled ? 'select-disabled' : ''}`}
            onClick={handleToggle}
          >
            {/* Value Display */}
            {multiple && Array.isArray(value) && value.length > 0 ? (
              <div className="select-tags">
                {value.map(option => (
                  <span key={option.value} className="select-tag">
                    {option.label}
                    {!disabled && (
                      <button
                        className="select-tag-remove"
                        onClick={(e) => handleRemoveTag(option, e)}
                        type="button"
                      >
                        <FiX size={12} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <div className={`select-value ${!value ? 'select-placeholder' : ''}`}>
                {getDisplayValue()}
              </div>
            )}

            {/* Icons */}
            <div className="select-icons">
              {clearable && value && (multiple ? value.length > 0 : true) && !disabled && (
                <button
                  className="select-clear"
                  onClick={handleClear}
                  type="button"
                  disabled={disabled}
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
              {/* Search */}
              {searchable && (
                <div className="select-search">
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="select-search-input"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              {/* Options */}
              <div className="select-options">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, index) => (
                    <div
                      key={option.value}
                      className={`select-option ${isSelected(option) ? 'selected' : ''} 
                        ${option.disabled ? 'disabled' : ''} 
                        ${highlightedIndex === index ? 'highlighted' : ''}`}
                      onClick={() => handleOptionClick(option)}
                    >
                      <div className="select-option-content">
                        {option.icon && (
                          <span className="select-option-icon">{option.icon}</span>
                        )}
                        <span>{option.label}</span>
                      </div>
                      {isSelected(option) && (
                        <FiCheck className="select-option-check" size={16} />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="select-no-options">
                    {searchTerm ? 'No matching options' : 'No options available'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error / Helper Text */}
        {error ? (
          <div className="select-error-text">{error}</div>
        ) : helperText ? (
          <div className="select-helper">{helperText}</div>
        ) : null}
      </div>
    </>
  );
};

export default Select;
