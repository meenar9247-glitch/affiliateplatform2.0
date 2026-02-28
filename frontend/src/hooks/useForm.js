import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import { useDebounce } from './useDebounce';
import { useLocalStorage } from './useLocalStorage';

// Validation strategies
export const VALIDATION_STRATEGIES = {
  ON_CHANGE: 'onChange',
  ON_BLUR: 'onBlur',
  ON_SUBMIT: 'onSubmit',
  ON_TOUCH: 'onTouch',
  DEBOUNCE: 'debounce',
};

// Form submission states
export const SUBMISSION_STATES = {
  IDLE: 'idle',
  SUBMITTING: 'submitting',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Field types
export const FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
  NUMBER: 'number',
  TEL: 'tel',
  URL: 'url',
  DATE: 'date',
  TIME: 'time',
  DATETIME: 'datetime-local',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  TEXTAREA: 'textarea',
  FILE: 'file',
  IMAGE: 'image',
  COLOR: 'color',
  RANGE: 'range',
};

// Default validation messages
export const DEFAULT_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  min: 'Value must be at least {min}',
  max: 'Value must be at most {max}',
  minLength: 'Must be at least {minLength} characters',
  maxLength: 'Must be at most {maxLength} characters',
  pattern: 'Please match the requested format',
  match: 'Fields do not match',
  number: 'Please enter a valid number',
  url: 'Please enter a valid URL',
  tel: 'Please enter a valid phone number',
  date: 'Please enter a valid date',
  time: 'Please enter a valid time',
  file: 'Please select a valid file',
  image: 'Please select a valid image',
  custom: 'Invalid value',
};

// Default options
const DEFAULT_OPTIONS = {
  // Validation options
  validateOnChange: true,
  validateOnBlur: true,
  validateOnSubmit: true,
  validationStrategy: VALIDATION_STRATEGIES.ON_SUBMIT,
  debounceDelay: 300,
  
  // Submission options
  resetOnSubmit: false,
  resetOnSuccess: true,
  resetOnError: false,
  
  // Storage options
  persistToStorage: false,
  storageKey: null,
  storageType: 'session', // 'local' or 'session'
  
  // UI options
  showErrorsOnChange: false,
  showErrorsOnBlur: true,
  showErrorsOnSubmit: true,
  showTouchedErrors: true,
  
  // Performance options
  enableDebounce: false,
  enableMemoization: true,
  enableLazyValidation: true,
  
  // Callbacks
  onSubmit: null,
  onSuccess: null,
  onError: null,
  onValidate: null,
  onChange: null,
  onBlur: null,
  onFocus: null,
  onReset: null,
};

export const useForm = (initialValues = {}, options = {}) => {
  // Merge options with defaults
  const {
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
    validationStrategy = VALIDATION_STRATEGIES.ON_SUBMIT,
    debounceDelay = 300,
    resetOnSubmit = false,
    resetOnSuccess = true,
    resetOnError = false,
    persistToStorage = false,
    storageKey = null,
    storageType = 'session',
    showErrorsOnChange = false,
    showErrorsOnBlur = true,
    showErrorsOnSubmit = true,
    showTouchedErrors = true,
    enableDebounce = false,
    enableMemoization = true,
    enableLazyValidation = true,
    onSubmit = null,
    onSuccess = null,
    onError = null,
    onValidate = null,
    onChange = null,
    onBlur = null,
    onFocus = null,
    onReset = null,
  } = { ...DEFAULT_OPTIONS, ...options };

  // Core form state
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [dirty, setDirty] = useState({});
  const [focused, setFocused] = useState({});
  
  // Form meta state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [submissionState, setSubmissionState] = useState(SUBMISSION_STATES.IDLE);
  const [submissionError, setSubmissionError] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  
  // Validation cache
  const [validationCache, setValidationCache] = useState({});
  
  // Refs
  const initialValuesRef = useRef(initialValues);
  const validationTimeoutRef = useRef(null);
  const submitPromiseRef = useRef(null);
  const fieldRefs = useRef({});

  // Load persisted data
  useEffect(() => {
    if (!persistToStorage || !storageKey) return;

    const storage = storageType === 'local' ? localStorage : sessionStorage;
    const savedData = storage.getItem(storageKey);
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setValues(parsed.values || initialValues);
        setTouched(parsed.touched || {});
        setDirty(parsed.dirty || {});
      } catch (error) {
        console.error('Failed to load persisted form data:', error);
      }
    }
  }, [persistToStorage, storageKey, storageType, initialValues]);

  // Persist data
  useEffect(() => {
    if (!persistToStorage || !storageKey) return;

    const storage = storageType === 'local' ? localStorage : sessionStorage;
    storage.setItem(storageKey, JSON.stringify({
      values,
      touched,
      dirty,
      timestamp: Date.now(),
    }));
  }, [values, touched, dirty, persistToStorage, storageKey, storageType]);

  // Computed properties
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  const isDirty = useMemo(() => {
    return Object.values(dirty).some(Boolean);
  }, [dirty]);

  const isTouched = useMemo(() => {
    return Object.values(touched).some(Boolean);
  }, [touched]);

  const hasErrors = useMemo(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  const dirtyFields = useMemo(() => {
    return Object.keys(dirty).filter(key => dirty[key]);
  }, [dirty]);

  const touchedFields = useMemo(() => {
    return Object.keys(touched).filter(key => touched[key]);
  }, [touched]);

  const errorFields = useMemo(() => {
    return Object.keys(errors);
  }, [errors]);

  // Field registration
  const register = useCallback((name, fieldOptions = {}) => {
    const {
      type = FIELD_TYPES.TEXT,
      required = false,
      min = null,
      max = null,
      minLength = null,
      maxLength = null,
      pattern = null,
      validate = null,
      disabled = false,
      readOnly = false,
      defaultValue = '',
      placeholder = '',
      autoComplete = 'off',
      ...rest
    } = fieldOptions;

    const handleChange = (e) => {
      const value = e?.target?.value !== undefined ? e.target.value : e;
      setValues(prev => ({ ...prev, [name]: value }));
      setDirty(prev => ({ ...prev, [name]: true }));
      onChange?.({ name, value, values });

      if (validateOnChange && validationStrategy !== VALIDATION_STRATEGIES.ON_SUBMIT) {
        validateField(name, value, fieldOptions);
      }
    };

    const handleBlur = (e) => {
      setTouched(prev => ({ ...prev, [name]: true }));
      onBlur?.({ name, value: values[name], values });

      if (validateOnBlur && validationStrategy !== VALIDATION_STRATEGIES.ON_SUBMIT) {
        validateField(name, values[name], fieldOptions);
      }
    };

    const handleFocus = (e) => {
      setFocused(prev => ({ ...prev, [name]: true }));
      onFocus?.({ name, value: values[name], values });
    };

    return {
      name,
      value: values[name] ?? defaultValue,
      onChange: handleChange,
      onBlur: handleBlur,
      onFocus: handleFocus,
      disabled,
      readOnly,
      placeholder,
      autoComplete,
      type,
      required,
      min,
      max,
      minLength,
      maxLength,
      pattern,
      ref: (el) => {
        if (el) fieldRefs.current[name] = el;
      },
      ...rest,
    };
  }, [values, validateOnChange, validateOnBlur, validationStrategy, onChange, onBlur, onFocus]);
  // Validate a single field
  const validateField = useCallback((name, value, fieldOptions = {}) => {
    const {
      required = false,
      min = null,
      max = null,
      minLength = null,
      maxLength = null,
      pattern = null,
      validate: customValidate = null,
      type = FIELD_TYPES.TEXT,
    } = fieldOptions;

    let fieldError = null;

    // Required validation
    if (required) {
      if (value === undefined || value === null || value === '') {
        fieldError = DEFAULT_MESSAGES.required;
      }
    }

    // Type-specific validation
    if (!fieldError) {
      switch (type) {
        case FIELD_TYPES.EMAIL:
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            fieldError = DEFAULT_MESSAGES.email;
          }
          break;
        
        case FIELD_TYPES.NUMBER:
          if (value && isNaN(Number(value))) {
            fieldError = DEFAULT_MESSAGES.number;
          }
          break;
        
        case FIELD_TYPES.URL:
          if (value && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value)) {
            fieldError = DEFAULT_MESSAGES.url;
          }
          break;
        
        case FIELD_TYPES.TEL:
          if (value && !/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/.test(value)) {
            fieldError = DEFAULT_MESSAGES.tel;
          }
          break;
      }
    }

    // Min validation
    if (!fieldError && min !== null) {
      if (type === FIELD_TYPES.NUMBER) {
        if (Number(value) < min) {
          fieldError = DEFAULT_MESSAGES.min.replace('{min}', min);
        }
      } else {
        if (value.length < min) {
          fieldError = DEFAULT_MESSAGES.minLength.replace('{minLength}', min);
        }
      }
    }

    // Max validation
    if (!fieldError && max !== null) {
      if (type === FIELD_TYPES.NUMBER) {
        if (Number(value) > max) {
          fieldError = DEFAULT_MESSAGES.max.replace('{max}', max);
        }
      } else {
        if (value.length > max) {
          fieldError = DEFAULT_MESSAGES.maxLength.replace('{maxLength}', max);
        }
      }
    }

    // MinLength validation
    if (!fieldError && minLength !== null && value?.length < minLength) {
      fieldError = DEFAULT_MESSAGES.minLength.replace('{minLength}', minLength);
    }

    // MaxLength validation
    if (!fieldError && maxLength !== null && value?.length > maxLength) {
      fieldError = DEFAULT_MESSAGES.maxLength.replace('{maxLength}', maxLength);
    }

    // Pattern validation
    if (!fieldError && pattern && value) {
      const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
      if (!regex.test(value)) {
        fieldError = DEFAULT_MESSAGES.pattern;
      }
    }

    // Custom validation
    if (!fieldError && customValidate) {
      const customError = customValidate(value, values);
      if (customError) {
        fieldError = customError;
      }
    }

    // Update errors state
    setErrors(prev => {
      if (fieldError) {
        return { ...prev, [name]: fieldError };
      } else {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
    });

    return fieldError;
  }, [values]);

  // Validate all fields
  const validateAll = useCallback(() => {
    setIsValidating(true);
  
    const newErrors = {};
  
    Object.keys(values).forEach(key => {
      const error = validateField(key, values[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    // Custom validation callback
    if (onValidate) {
      const customErrors = onValidate(values);
      if (customErrors) {
        Object.assign(newErrors, customErrors);
      }
    }

    setErrors(newErrors);
    setIsValidating(false);
  
    return Object.keys(newErrors).length === 0;
  }, [values, validateField, onValidate]);

  // Debounced validation
  const debouncedValidateField = useDebounce(validateField, debounceDelay);

  // Set field value
  const setValue = useCallback((name, value, shouldValidate = true) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setDirty(prev => ({ ...prev, [name]: true }));
  
    if (shouldValidate) {
      if (enableDebounce) {
        debouncedValidateField(name, value);
      } else {
        validateField(name, value);
      }
    }
  
    onChange?.({ name, value, values });
  }, [values, validateField, debouncedValidateField, enableDebounce, onChange]);

  // Set multiple values
  const setValues_ = useCallback((newValues, shouldValidate = true) => {
    setValues(prev => ({ ...prev, ...newValues }));
  
    Object.keys(newValues).forEach(key => {
      setDirty(prev => ({ ...prev, [key]: true }));
    });
  
    if (shouldValidate) {
      Object.entries(newValues).forEach(([key, value]) => {
        validateField(key, value);
      });
    }
  
    onChange?.({ values: { ...values, ...newValues } });
  }, [values, validateField, onChange]);

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValuesRef.current);
    setErrors({});
    setTouched({});
    setDirty({});
    setFocused({});
    setSubmissionState(SUBMISSION_STATES.IDLE);
    setSubmissionError(null);
    setSubmissionResult(null);
    onReset?.();
  }, [onReset]);

  // Clear form
  const clear = useCallback(() => {
    setValues({});
    setErrors({});
    setTouched({});
    setDirty({});
    setFocused({});
  }, []);

  // Set touched
  const setTouchedField = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  // Set focused
  const setFocusedField = useCallback((name, isFocused = true) => {
    setFocused(prev => ({ ...prev, [name]: isFocused }));
  }, []);

  // Set error
  const setError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Get field props
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    error: errors[name],
    touched: touched[name],
    dirty: dirty[name],
    focused: focused[name],
    onChange: (e) => setValue(name, e.target.value),
    onBlur: () => setTouchedField(name, true),
    onFocus: () => setFocusedField(name, true),
  }), [values, errors, touched, dirty, focused, setValue, setTouchedField, setFocusedField]);
  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();

    setSubmitCount(prev => prev + 1);
    setIsSubmitting(true);
    setSubmissionState(SUBMISSION_STATES.SUBMITTING);
    setSubmissionError(null);

    // Touch all fields
    const allTouched = {};
    Object.keys(values).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    const isValid = validateAll();

    if (!isValid && validateOnSubmit) {
      setIsSubmitting(false);
      setSubmissionState(SUBMISSION_STATES.ERROR);
      setSubmissionError({ type: 'validation', errors });
      onError?.({ type: 'validation', errors });
      return;
    }

    try {
      // Call custom onSubmit if provided
      let result = onSubmit ? await onSubmit(values) : null;

      // Handle async validation
      if (onValidate) {
        const customErrors = await onValidate(values);
        if (customErrors && Object.keys(customErrors).length > 0) {
          setErrors(customErrors);
          throw new Error('Validation failed');
        }
      }

      setSubmissionState(SUBMISSION_STATES.SUCCESS);
      setSubmissionResult(result);
      onSuccess?.(result);

      // Reset form if needed
      if (resetOnSuccess || resetOnSubmit) {
        reset();
      }

      return result;

    } catch (error) {
      setSubmissionState(SUBMISSION_STATES.ERROR);
      setSubmissionError(error);
      onError?.(error);
      
      if (resetOnError) {
        reset();
      }
      
      throw error;

    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateAll, validateOnSubmit, onSubmit, onValidate, onSuccess, onError, resetOnSuccess, resetOnSubmit, resetOnError, reset]);

  // Submit handler wrapper
  const submit = useCallback(() => {
    return handleSubmit();
  }, [handleSubmit]);

  // Submit form programmatically
  const submitForm = useCallback(async () => {
    return handleSubmit();
  }, [handleSubmit]);

  // Focus field
  const focusField = useCallback((name) => {
    const field = fieldRefs.current[name];
    if (field) {
      field.focus();
      setFocusedField(name, true);
    }
  }, [setFocusedField]);

  // Blur field
  const blurField = useCallback((name) => {
    const field = fieldRefs.current[name];
    if (field) {
      field.blur();
      setFocusedField(name, false);
      setTouchedField(name, true);
    }
  }, [setFocusedField, setTouchedField]);

  // Check if field has error
  const hasFieldError = useCallback((name) => {
    return !!errors[name];
  }, [errors]);

  // Get field error
  const getFieldError = useCallback((name) => {
    return errors[name];
  }, [errors]);

  // Check if field is touched
  const isFieldTouched = useCallback((name) => {
    return !!touched[name];
  }, [touched]);

  // Check if field is dirty
  const isFieldDirty = useCallback((name) => {
    return !!dirty[name];
  }, [dirty]);

  // Check if field is focused
  const isFieldFocused = useCallback((name) => {
    return !!focused[name];
  }, [focused]);

  // Return form state and helpers
  return {
    // Values
    values,
    setValue,
    setValues: setValues_,
    
    // Errors
    errors,
    setError,
    clearErrors,
    hasFieldError,
    getFieldError,
    
    // Touch state
    touched,
    setTouched: setTouchedField,
    isFieldTouched,
    
    // Dirty state
    dirty,
    isFieldDirty,
    
    // Focus state
    focused,
    setFocused: setFocusedField,
    isFieldFocused,
    
    // Form meta
    isValid,
    isDirty,
    isTouched,
    hasErrors,
    dirtyFields,
    touchedFields,
    errorFields,
    
    // Submission state
    isSubmitting,
    isValidating,
    submitCount,
    submissionState,
    submissionError,
    submissionResult,
    
    // Field management
    register,
    getFieldProps,
    focusField,
    blurField,
    
    // Form actions
    handleSubmit,
    submit,
    submitForm,
    reset,
    clear,
    
    // Validation
    validateField,
    validateAll,
    
    // Refs
    fieldRefs,
    
    // Constants
    FIELD_TYPES,
    SUBMISSION_STATES,
    VALIDATION_STRATEGIES,
  };
};

// Specialized form hooks
export const useLoginForm = (options = {}) => {
  const form = useForm(
    { email: '', password: '', remember: false },
    {
      validateOnChange: true,
      validateOnBlur: true,
      ...options,
    },
  );

  const { register, errors, isSubmitting, handleSubmit } = form;

  const customRegister = {
    email: register('email', {
      type: FIELD_TYPES.EMAIL,
      required: true,
      validate: (value) => {
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email';
        }
      },
    }),
    password: register('password', {
      type: FIELD_TYPES.PASSWORD,
      required: true,
      minLength: 8,
      validate: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
      },
    }),
    remember: register('remember', {
      type: FIELD_TYPES.CHECKBOX,
    }),
  };

  return {
    ...form,
    register: customRegister,
    errors,
    isSubmitting,
    handleSubmit,
  };
};

export const useRegisterForm = (options = {}) => {
  const form = useForm(
    {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
    {
      validateOnChange: true,
      validateOnBlur: true,
      ...options,
    },
  );

  const { register, values, errors, isSubmitting, handleSubmit } = form;

  const customRegister = {
    name: register('name', {
      type: FIELD_TYPES.TEXT,
      required: true,
      minLength: 2,
      maxLength: 50,
    }),
    email: register('email', {
      type: FIELD_TYPES.EMAIL,
      required: true,
      validate: (value) => {
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email';
        }
      },
    }),
    password: register('password', {
      type: FIELD_TYPES.PASSWORD,
      required: true,
      minLength: 8,
      validate: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
      },
    }),
    confirmPassword: register('confirmPassword', {
      type: FIELD_TYPES.PASSWORD,
      required: true,
      validate: (value) => {
        if (!value) return 'Please confirm your password';
        if (value !== values.password) return 'Passwords do not match';
      },
    }),
    terms: register('terms', {
      type: FIELD_TYPES.CHECKBOX,
      required: true,
      validate: (value) => {
        if (!value) return 'You must accept the terms and conditions';
      },
    }),
  };

  return {
    ...form,
    register: customRegister,
    errors,
    isSubmitting,
    handleSubmit,
  };
};

export const useProfileForm = (initialData = {}, options = {}) => {
  const form = useForm(
    {
      name: '',
      email: '',
      phone: '',
      bio: '',
      avatar: null,
      ...initialData,
    },
    options,
  );

  const { register, values, errors, isSubmitting, handleSubmit } = form;

  const customRegister = {
    name: register('name', {
      type: FIELD_TYPES.TEXT,
      required: true,
      minLength: 2,
      maxLength: 50,
    }),
    email: register('email', {
      type: FIELD_TYPES.EMAIL,
      required: true,
    }),
    phone: register('phone', {
      type: FIELD_TYPES.TEL,
    }),
    bio: register('bio', {
      type: FIELD_TYPES.TEXTAREA,
      maxLength: 500,
    }),
    avatar: register('avatar', {
      type: FIELD_TYPES.FILE,
      validate: (file) => {
        if (file && file.size > 5 * 1024 * 1024) {
          return 'File size must be less than 5MB';
        }
      },
    }),
  };

  return {
    ...form,
    register: customRegister,
    values,
    errors,
    isSubmitting,
    handleSubmit,
  };
};

// Utility functions
export const formUtils = {
  // Create form data from values
  createFormData: (values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File || value instanceof Blob) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, item);
          });
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }
    });
    return formData;
  },

  // Parse form data to object
  parseFormData: (formData) => {
    const values = {};
    formData.forEach((value, key) => {
      if (key.endsWith(']')) {
        // Handle array
        const baseKey = key.split('[')[0];
        if (!values[baseKey]) values[baseKey] = [];
        const index = parseInt(key.match(/\[(\d+)\]/)[1]);
        values[baseKey][index] = value;
      } else {
        values[key] = value;
      }
    });
    return values;
  },

  // Check if form is empty
  isEmpty: (values) => {
    return Object.values(values).every(val => !val);
  },

  // Get changed fields
  getChangedFields: (initialValues, currentValues) => {
    const changed = {};
    Object.keys(currentValues).forEach(key => {
      if (currentValues[key] !== initialValues[key]) {
        changed[key] = currentValues[key];
      }
    });
    return changed;
  },

  // Deep clone values
  cloneValues: (values) => {
    return JSON.parse(JSON.stringify(values));
  },
};

// Export constants
export const FORM_CONSTANTS = {
  VALIDATION_STRATEGIES,
  SUBMISSION_STATES,
  FIELD_TYPES,
  DEFAULT_MESSAGES,
  DEFAULTS: DEFAULT_OPTIONS,
};

export default useForm;
