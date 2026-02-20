import React, { useState, useEffect } from 'react';
import { FiSave, FiX, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

const FormWrapper = ({
  children,
  initialValues = {},
  validationSchema = {},
  onSubmit,
  onCancel,
  onReset,
  title,
  subtitle,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  resetLabel = 'Reset',
  loading = false,
  error = null,
  success = null,
  layout = 'vertical', // vertical, horizontal, inline
  size = 'medium', // small, medium, large
  spacing = 'normal', // compact, normal, relaxed
  showSubmit = true,
  showCancel = true,
  showReset = false,
  submitPosition = 'right', // left, center, right
  disabled = false,
  readOnly = false,
  validateOnChange = true,
  validateOnBlur = true,
  resetAfterSubmit = false,
  className = '',
  style = {},
  ...props
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(error);
  const [formSuccess, setFormSuccess] = useState(success);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  useEffect(() => {
    setFormError(error);
  }, [error]);

  useEffect(() => {
    setFormSuccess(success);
  }, [success]);

  // Validation function
  const validateField = (name, value) => {
    if (!validationSchema[name]) return '';

    const rules = validationSchema[name];
    
    // Required validation
    if (rules.required && !value) {
      return rules.required.message || 'This field is required';
    }

    // Min length validation
    if (rules.minLength && value?.length < rules.minLength.value) {
      return rules.minLength.message || `Minimum length is ${rules.minLength.value}`;
    }

    // Max length validation
    if (rules.maxLength && value?.length > rules.maxLength.value) {
      return rules.maxLength.message || `Maximum length is ${rules.maxLength.value}`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.value.test(value)) {
      return rules.pattern.message || 'Invalid format';
    }

    // Custom validation
    if (rules.validate) {
      return rules.validate(value, values);
    }

    return '';
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle field change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setValues(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    if (validateOnChange && touched[name]) {
      const error = validateField(name, fieldValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }

    // Clear form messages
    setFormError(null);
    setFormSuccess(null);
  };

  // Handle field blur
  const handleBlur = (e) => {
    const { name } = e.target;

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    if (validateOnBlur) {
      const error = validateField(name, values[name]);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(validationSchema).forEach(fieldName => {
      allTouched[fieldName] = true;
    });
    setTouched(allTouched);

    // Validate form
    if (!validateForm()) {
      setFormError('Please fix the errors below');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      await onSubmit(values);
      
      if (resetAfterSubmit) {
        setValues(initialValues);
        setTouched({});
        setErrors({});
      }
      
      setFormSuccess('Form submitted successfully');
    } catch (err) {
      setFormError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    setValues(initialValues);
    setTouched({});
    setErrors({});
    setFormError(null);
    setFormSuccess(null);
    onReset?.();
  };

  // Handle cancel
  const handleCancel = () => {
    onCancel?.();
  };

  // Clone children with form props
  const childrenWithProps = React.Children.map(children, child => {
    if (!React.isValidElement(child)) return child;

    // Pass form props to input components
    if (child.props.name) {
      return React.cloneElement(child, {
        value: values[child.props.name] || '',
        error: errors[child.props.name],
        touched: touched[child.props.name],
        onChange: handleChange,
        onBlur: handleBlur,
        disabled: disabled || child.props.disabled,
        readOnly: readOnly || child.props.readOnly,
        size: child.props.size || size
      });
    }

    return child;
  });

  // Layout classes
  const layoutClasses = {
    vertical: 'form-vertical',
    horizontal: 'form-horizontal',
    inline: 'form-inline'
  };

  // Size classes
  const sizeClasses = {
    small: 'form-small',
    medium: 'form-medium',
    large: 'form-large'
  };

  // Spacing classes
  const spacingClasses = {
    compact: 'form-compact',
    normal: 'form-normal',
    relaxed: 'form-relaxed'
  };

  // Submit button position
  const submitPositionClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  // Styles
  const styles = `
    .form-wrapper {
      width: 100%;
      max-width: 100%;
    }

    /* Form Header */
    .form-header {
      margin-bottom: 24px;
    }

    .form-title {
      font-size: var(--text-xl);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .form-subtitle {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    /* Form */
    .form {
      width: 100%;
    }

    /* Layout Variants */
    .form-vertical .form-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-horizontal .form-fields {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .form-inline .form-fields {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }

    /* Size Variants */
    .form-small .form-fields {
      gap: 12px;
    }

    .form-medium .form-fields {
      gap: 16px;
    }

    .form-large .form-fields {
      gap: 20px;
    }

    /* Spacing Variants */
    .form-compact .form-fields {
      gap: 8px;
    }

    .form-normal .form-fields {
      gap: 16px;
    }

    .form-relaxed .form-fields {
      gap: 24px;
    }

    /* Messages */
    .form-messages {
      margin-bottom: 20px;
    }

    .form-error {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: var(--danger-50);
      border: 1px solid var(--danger-200);
      border-radius: var(--radius-md);
      color: var(--danger-700);
      font-size: var(--text-sm);
    }

    .form-success {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: var(--success-50);
      border: 1px solid var(--success-200);
      border-radius: var(--radius-md);
      color: var(--success-700);
      font-size: var(--text-sm);
    }

    /* Actions */
    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .form-actions-left {
      justify-content: flex-start;
    }

    .form-actions-center {
      justify-content: center;
    }

    .form-actions-right {
      justify-content: flex-end;
    }

    /* Buttons */
    .form-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      cursor: pointer;
      transition: all var(--transition-fast) var(--transition-ease);
      border: none;
      outline: none;
    }

    .form-btn:focus-visible {
      box-shadow: 0 0 0 3px var(--primary-200);
    }

    .form-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .form-btn-submit {
      background: var(--primary);
      color: white;
    }

    .form-btn-submit:hover:not(:disabled) {
      background: var(--primary-dark);
    }

    .form-btn-cancel {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }

    .form-btn-cancel:hover:not(:disabled) {
      background: var(--bg-tertiary);
      border-color: var(--primary);
    }

    .form-btn-reset {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }

    .form-btn-reset:hover:not(:disabled) {
      background: var(--bg-tertiary);
      border-color: var(--primary);
    }

    .form-btn-icon {
      margin-right: 4px;
    }

    /* Loading Spinner */
    .form-btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .form-title {
        color: var(--dark-text-primary);
      }

      .form-subtitle {
        color: var(--dark-text-muted);
      }

      .form-error {
        background: rgba(239, 68, 68, 0.15);
        border-color: rgba(239, 68, 68, 0.3);
        color: var(--danger-400);
      }

      .form-success {
        background: rgba(34, 197, 94, 0.15);
        border-color: rgba(34, 197, 94, 0.3);
        color: var(--success-400);
      }

      .form-btn-cancel,
      .form-btn-reset {
        background: transparent;
        color: var(--dark-text-secondary);
        border-color: var(--dark-border);
      }

      .form-btn-cancel:hover:not(:disabled),
      .form-btn-reset:hover:not(:disabled) {
        background: var(--dark-bg-tertiary);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .form-horizontal .form-fields {
        grid-template-columns: 1fr;
      }

      .form-inline .form-fields {
        flex-direction: column;
        align-items: stretch;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-btn {
        width: 100%;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className={`form-wrapper ${className}`} style={style}>
        {/* Header */}
        {(title || subtitle) && (
          <div className="form-header">
            {title && <h3 className="form-title">{title}</h3>}
            {subtitle && <p className="form-subtitle">{subtitle}</p>}
          </div>
        )}

        {/* Messages */}
        {(formError || formSuccess) && (
          <div className="form-messages">
            {formError && (
              <div className="form-error">
                <FiAlertCircle size={18} />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="form-success">
                <FiSave size={18} />
                <span>{formSuccess}</span>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={`
            form
            ${layoutClasses[layout]}
            ${sizeClasses[size]}
            ${spacingClasses[spacing]}
          `}
          noValidate
          {...props}
        >
          <div className="form-fields">
            {childrenWithProps}
          </div>

          {/* Form Actions */}
          {(showSubmit || showCancel || showReset) && (
            <div className={`form-actions ${submitPositionClasses[submitPosition]}`}>
              {showSubmit && (
                <button
                  type="submit"
                  className="form-btn form-btn-submit"
                  disabled={disabled || loading || isSubmitting}
                >
                  {(loading || isSubmitting) ? (
                    <>
                      <span className="form-btn-spinner" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiSave className="form-btn-icon" />
                      {submitLabel}
                    </>
                  )}
                </button>
              )}

              {showCancel && (
                <button
                  type="button"
                  className="form-btn form-btn-cancel"
                  onClick={handleCancel}
                  disabled={disabled || loading}
                >
                  <FiX className="form-btn-icon" />
                  {cancelLabel}
                </button>
              )}

              {showReset && (
                <button
                  type="button"
                  className="form-btn form-btn-reset"
                  onClick={handleReset}
                  disabled={disabled || loading}
                >
                  <FiRefreshCw className="form-btn-icon" />
                  {resetLabel}
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </>
  );
};

// Form Field Component (to be used with FormWrapper)
export const FormField = ({
  name,
  label,
  children,
  required = false,
  error,
  touched,
  className = '',
  ...props
}) => {
  const styles = `
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-field-label {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--text-primary);
    }

    .form-field-required {
      color: var(--danger);
      font-size: var(--text-xs);
    }

    .form-field-error {
      font-size: var(--text-xs);
      color: var(--danger);
      margin-top: 2px;
    }

    .form-field-children {
      width: 100%;
    }

    .form-field.has-error .form-field-children {
      animation: shake 0.3s ease-in-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    @media (prefers-color-scheme: dark) {
      .form-field-label {
        color: var(--dark-text-primary);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className={`form-field ${error && touched ? 'has-error' : ''} ${className}`}>
        {label && (
          <label htmlFor={name} className="form-field-label">
            {label}
            {required && <span className="form-field-required">*</span>}
          </label>
        )}
        <div className="form-field-children">
          {React.cloneElement(children, { name, ...props })}
        </div>
        {error && touched && <div className="form-field-error">{error}</div>}
      </div>
    </>
  );
};

// Form Section Component
export const FormSection = ({ title, children, collapsible = false, defaultCollapsed = false }) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const styles = `
    .form-section {
      margin-bottom: 24px;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .form-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--bg-secondary);
      cursor: ${collapsible ? 'pointer' : 'default'};
      transition: background var(--transition-fast) var(--transition-ease);
    }

    .form-section-header:hover {
      background: ${collapsible ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'};
    }

    .form-section-title {
      font-size: var(--text-base);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin: 0;
    }

    .form-section-content {
      padding: ${collapsed ? '0' : '16px'};
      display: ${collapsed ? 'none' : 'block'};
      background: var(--bg-primary);
    }

    @media (prefers-color-scheme: dark) {
      .form-section {
        border-color: var(--dark-border);
      }

      .form-section-header {
        background: var(--dark-bg-secondary);
      }

      .form-section-title {
        color: var(--dark-text-primary);
      }

      .form-section-content {
        background: var(--dark-bg-primary);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="form-section">
        <div
          className="form-section-header"
          onClick={() => collapsible && setCollapsed(!collapsed)}
        >
          <h4 className="form-section-title">{title}</h4>
          {collapsible && (
            <span className="form-section-toggle">
              {collapsed ? '▼' : '▲'}
            </span>
          )}
        </div>
        <div className="form-section-content">
          {children}
        </div>
      </div>
    </>
  );
};

// Form Row Component
export const FormRow = ({ columns = 2, gap = 'normal', children, ...props }) => {
  const gapClasses = {
    compact: '8px',
    normal: '16px',
    relaxed: '24px'
  };

  const styles = `
    .form-row {
      display: grid;
      grid-template-columns: repeat(${columns}, 1fr);
      gap: ${gapClasses[gap]};
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="form-row" {...props}>
        {children}
      </div>
    </>
  );
};

// Form Divider Component
export const FormDivider = ({ text, ...props }) => {
  const styles = `
    .form-divider {
      position: relative;
      text-align: center;
      margin: 24px 0;
    }

    .form-divider::before,
    .form-divider::after {
      content: '';
      position: absolute;
      top: 50%;
      width: calc(50% - 30px);
      height: 1px;
      background: var(--border);
    }

    .form-divider::before {
      left: 0;
    }

    .form-divider::after {
      right: 0;
    }

    .form-divider-text {
      display: inline-block;
      padding: 0 16px;
      background: var(--bg-primary);
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }

    @media (prefers-color-scheme: dark) {
      .form-divider::before,
      .form-divider::after {
        background: var(--dark-border);
      }

      .form-divider-text {
        background: var(--dark-bg-primary);
        color: var(--dark-text-muted);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="form-divider" {...props}>
        {text && <span className="form-divider-text">{text}</span>}
      </div>
    </>
  );
};

export default FormWrapper;
