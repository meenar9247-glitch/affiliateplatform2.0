// Validation error types
export const VALIDATION_ERROR_TYPES = {
  REQUIRED: 'required',
  INVALID_FORMAT: 'invalid_format',
  MIN_LENGTH: 'min_length',
  MAX_LENGTH: 'max_length',
  MIN_VALUE: 'min_value',
  MAX_VALUE: 'max_value',
  PATTERN_MISMATCH: 'pattern_mismatch',
  TYPE_MISMATCH: 'type_mismatch',
  CUSTOM: 'custom'
};

// Validation rules
export const VALIDATION_RULES = {
  // Common patterns
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  IP_V4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  IP_V6: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,
  CREDIT_CARD: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
  CVV: /^[0-9]{3,4}$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  HEX_COLOR: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  DATE_YYYY_MM_DD: /^\d{4}-\d{2}-\d{2}$/,
  TIME_HH_MM: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  BASE64: /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  HTML_TAG: /^<([a-z1-6]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)$/,
  MARKDOWN: /^[*_~`#\[\]()>+-]/
};

// Validation messages
export const VALIDATION_MESSAGES = {
  [VALIDATION_ERROR_TYPES.REQUIRED]: 'This field is required',
  [VALIDATION_ERROR_TYPES.INVALID_FORMAT]: 'Invalid format',
  [VALIDATION_ERROR_TYPES.MIN_LENGTH]: 'Must be at least {min} characters',
  [VALIDATION_ERROR_TYPES.MAX_LENGTH]: 'Must be at most {max} characters',
  [VALIDATION_ERROR_TYPES.MIN_VALUE]: 'Must be at least {min}',
  [VALIDATION_ERROR_TYPES.MAX_VALUE]: 'Must be at most {max}',
  [VALIDATION_ERROR_TYPES.PATTERN_MISMATCH]: 'Does not match required pattern',
  [VALIDATION_ERROR_TYPES.TYPE_MISMATCH]: 'Invalid type',
  [VALIDATION_ERROR_TYPES.CUSTOM]: 'Invalid value'
};

// Validation result class
export class ValidationResult {
  constructor(isValid = true, errors = [], warnings = [], info = []) {
    this.isValid = isValid;
    this.errors = errors;
    this.warnings = warnings;
    this.info = info;
    this.timestamp = Date.now();
  }

  addError(error) {
    this.errors.push(error);
    this.isValid = false;
  }

  addWarning(warning) {
    this.warnings.push(warning);
  }

  addInfo(info) {
    this.info.push(info);
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  hasWarnings() {
    return this.warnings.length > 0;
  }

  hasInfo() {
    return this.info.length > 0;
  }

  getAll() {
    return {
      isValid: this.isValid,
      errors: this.errors,
      warnings: this.warnings,
      info: this.info
    };
  }

  toString() {
    return this.errors.join(', ');
  }

  toJSON() {
    return {
      isValid: this.isValid,
      errors: this.errors,
      warnings: this.warnings,
      info: this.info,
      timestamp: this.timestamp
    };
  }
}

// Base validator class
export class Validator {
  constructor(options = {}) {
    this.options = {
      strict: options.strict || false,
      trim: options.trim || true,
      normalize: options.normalize || false,
      locale: options.locale || 'en-US',
      ...options
    };
  }

  // Normalize string
  normalizeString(value) {
    if (typeof value !== 'string') return value;
    
    let normalized = value;
    
    if (this.options.trim) {
      normalized = normalized.trim();
    }
    
    if (this.options.normalize) {
      normalized = normalized.normalize('NFC');
    }
    
    return normalized;
  }

  // Create validation result
  createResult(isValid = true, errors = [], warnings = [], info = []) {
    return new ValidationResult(isValid, errors, warnings, info);
  }

  // Validate required
  validateRequired(value) {
    if (value === undefined || value === null || value === '') {
      return {
        isValid: false,
        error: VALIDATION_MESSAGES[VALIDATION_ERROR_TYPES.REQUIRED]
      };
    }
    return { isValid: true };
  }

  // Validate type
  validateType(value, type) {
    const actualType = typeof value;
    
    if (actualType !== type) {
      return {
        isValid: false,
        error: `Expected ${type}, got ${actualType}`
      };
    }
    return { isValid: true };
  }

  // Validate length
  validateLength(value, min, max) {
    const length = value?.length || 0;
    
    if (min !== undefined && length < min) {
      return {
        isValid: false,
        error: VALIDATION_MESSAGES[VALIDATION_ERROR_TYPES.MIN_LENGTH].replace('{min}', min)
      };
    }
    
    if (max !== undefined && length > max) {
      return {
        isValid: false,
        error: VALIDATION_MESSAGES[VALIDATION_ERROR_TYPES.MAX_LENGTH].replace('{max}', max)
      };
    }
    
    return { isValid: true };
  }

  // Validate range
  validateRange(value, min, max) {
    if (min !== undefined && value < min) {
      return {
        isValid: false,
        error: VALIDATION_MESSAGES[VALIDATION_ERROR_TYPES.MIN_VALUE].replace('{min}', min)
      };
    }
    
    if (max !== undefined && value > max) {
      return {
        isValid: false,
        error: VALIDATION_MESSAGES[VALIDATION_ERROR_TYPES.MAX_VALUE].replace('{max}', max)
      };
    }
    
    return { isValid: true };
  }

  // Validate pattern
  validatePattern(value, pattern) {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    
    if (!regex.test(value)) {
      return {
        isValid: false,
        error: VALIDATION_MESSAGES[VALIDATION_ERROR_TYPES.PATTERN_MISMATCH]
      };
    }
    
    return { isValid: true };
  }
  }
// Email validator
export class EmailValidator extends Validator {
  validate(email, options = {}) {
    const result = this.createResult();
    const normalized = this.normalizeString(email);
    
    // Check required
    if (options.required !== false) {
      const requiredCheck = this.validateRequired(normalized);
      if (!requiredCheck.isValid) {
        result.addError(requiredCheck.error);
        return result;
      }
    }
    
    if (!normalized) return result;
    
    // Check format
    if (!VALIDATION_RULES.EMAIL.test(normalized)) {
      result.addError('Invalid email address format');
    }
    
    // Check length
    const lengthCheck = this.validateLength(normalized, options.minLength || 5, options.maxLength || 254);
    if (!lengthCheck.isValid) {
      result.addError(lengthCheck.error);
    }
    
    // Additional checks
    if (options.checkDomain) {
      const domain = normalized.split('@')[1];
      if (domain && options.allowedDomains && !options.allowedDomains.includes(domain)) {
        result.addError(`Domain ${domain} is not allowed`);
      }
      
      if (options.blockedDomains && options.blockedDomains.includes(domain)) {
        result.addError(`Domain ${domain} is blocked`);
      }
    }
    
    if (options.checkDisposable) {
      // Check against disposable email domains
      const disposableDomains = ['tempmail.com', 'throwaway.com', 'mailinator.com'];
      const domain = normalized.split('@')[1];
      if (disposableDomains.includes(domain)) {
        result.addError('Disposable email addresses are not allowed');
      }
    }
    
    return result;
  }
}

// Password validator
export class PasswordValidator extends Validator {
  validate(password, options = {}) {
    const result = this.createResult();
    const normalized = this.normalizeString(password);
    
    // Check required
    if (options.required !== false) {
      const requiredCheck = this.validateRequired(normalized);
      if (!requiredCheck.isValid) {
        result.addError(requiredCheck.error);
        return result;
      }
    }
    
    if (!normalized) return result;
    
    // Check length
    const minLength = options.minLength || 8;
    const maxLength = options.maxLength || 128;
    const lengthCheck = this.validateLength(normalized, minLength, maxLength);
    if (!lengthCheck.isValid) {
      result.addError(lengthCheck.error);
    }
    
    // Check complexity
    if (options.requireUppercase !== false && !/[A-Z]/.test(normalized)) {
      result.addError('Must contain at least one uppercase letter');
    }
    
    if (options.requireLowercase !== false && !/[a-z]/.test(normalized)) {
      result.addError('Must contain at least one lowercase letter');
    }
    
    if (options.requireNumber !== false && !/\d/.test(normalized)) {
      result.addError('Must contain at least one number');
    }
    
    if (options.requireSpecial !== false && !/[!@#$%^&*(),.?":{}|<>]/.test(normalized)) {
      result.addError('Must contain at least one special character');
    }
    
    // Check for common patterns
    if (options.avoidCommon && /^(password|123456|qwerty|admin|letmein|welcome)$/i.test(normalized)) {
      result.addError('This password is too common');
    }
    
    // Check for sequential characters
    if (options.avoidSequential) {
      const sequential = ['abcdefghijklmnopqrstuvwxyz', '0123456789', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
      const lower = normalized.toLowerCase();
      
      for (const seq of sequential) {
        for (let i = 0; i < seq.length - 3; i++) {
          const sub = seq.substr(i, 3);
          if (lower.includes(sub)) {
            result.addError('Contains sequential characters');
            break;
          }
        }
      }
    }
    
    // Check for repeated characters
    if (options.avoidRepeated && /(.)\1{2,}/.test(normalized)) {
      result.addError('Contains repeated characters');
    }
    
    // Check for keyboard patterns
    if (options.avoidKeyboardPatterns) {
      const keyboardPatterns = ['qwerty', 'asdfgh', 'zxcvbn', '123456', 'q1w2e3', '1qaz2wsx'];
      const lower = normalized.toLowerCase();
      
      for (const pattern of keyboardPatterns) {
        if (lower.includes(pattern)) {
          result.addError('Contains keyboard pattern');
          break;
        }
      }
    }
    
    return result;
  }

  // Calculate password strength
  calculateStrength(password) {
    let score = 0;
    
    if (!password) return { score: 0, level: 'very-weak', color: '#ff4444' };
    
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      lengthBonus: password.length >= 12 ? 1 : 0
    };
    
    score += checks.length ? 1 : 0;
    score += checks.uppercase ? 1 : 0;
    score += checks.lowercase ? 1 : 0;
    score += checks.numbers ? 1 : 0;
    score += checks.special ? 1 : 0;
    score += checks.lengthBonus ? 1 : 0;
    
    let level, color;
    if (score <= 2) {
      level = 'very-weak';
      color = '#ff4444';
    } else if (score <= 3) {
      level = 'weak';
      color = '#ff8c44';
    } else if (score <= 4) {
      level = 'medium';
      color = '#ffd966';
    } else if (score <= 5) {
      level = 'strong';
      color = '#4caf50';
    } else {
      level = 'very-strong';
      color = '#2e7d32';
    }
    
    return { score, level, color };
  }
}

// Phone validator
export class PhoneValidator extends Validator {
  validate(phone, options = {}) {
    const result = this.createResult();
    const normalized = this.normalizeString(phone);
    
    // Check required
    if (options.required !== false) {
      const requiredCheck = this.validateRequired(normalized);
      if (!requiredCheck.isValid) {
        result.addError(requiredCheck.error);
        return result;
      }
    }
    
    if (!normalized) return result;
    
    // Remove all non-digit characters for validation
    const digits = normalized.replace(/\D/g, '');
    
    // Check if it has at least minimum digits
    const minDigits = options.minDigits || 10;
    const maxDigits = options.maxDigits || 15;
    
    if (digits.length < minDigits) {
      result.addError(`Phone number must have at least ${minDigits} digits`);
    }
    
    if (digits.length > maxDigits) {
      result.addError(`Phone number cannot have more than ${maxDigits} digits`);
    }
    
    // Check format
    if (!VALIDATION_RULES.PHONE.test(normalized)) {
      result.addError('Invalid phone number format');
    }
    
    // Country code validation
    if (options.countryCode) {
      const hasCountryCode = normalized.startsWith('+') || normalized.startsWith(options.countryCode);
      if (!hasCountryCode) {
        result.addError(`Must include country code ${options.countryCode}`);
      }
    }
    
    return result;
  }

  // Format phone number
  format(phone, format = 'international') {
    const digits = phone.replace(/\D/g, '');
    
    if (format === 'international' && digits.length >= 11) {
      return `+${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
    
    if (format === 'national' && digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    return digits;
  }
}

// URL validator
export class URLValidator extends Validator {
  validate(url, options = {}) {
    const result = this.createResult();
    const normalized = this.normalizeString(url);
    
    // Check required
    if (options.required !== false) {
      const requiredCheck = this.validateRequired(normalized);
      if (!requiredCheck.isValid) {
        result.addError(requiredCheck.error);
        return result;
      }
    }
    
    if (!normalized) return result;
    
    // Check format
    if (!VALIDATION_RULES.URL.test(normalized)) {
      result.addError('Invalid URL format');
    }
    
    // Check protocol
    if (options.requireHttps && !normalized.startsWith('https://')) {
      result.addError('URL must use HTTPS protocol');
    }
    
    if (options.allowedProtocols) {
      const protocol = normalized.split('://')[0];
      if (!options.allowedProtocols.includes(protocol)) {
        result.addError(`Protocol ${protocol} is not allowed`);
      }
    }
    
    // Check domain
    if (options.allowedDomains) {
      const domain = normalized.split('/')[2];
      if (!options.allowedDomains.some(d => domain.includes(d))) {
        result.addError('Domain is not allowed');
      }
    }
    
    // Check for common URL issues
    if (normalized.includes(' ')) {
      result.addError('URL cannot contain spaces');
    }
    
    if (normalized.includes('..')) {
      result.addError('URL contains invalid path segments');
    }
    
    return result;
  }

  // Parse URL
  parse(url) {
    try {
      return new URL(url);
    } catch {
      return null;
    }
  }
}

// Credit card validator
export class CreditCardValidator extends Validator {
  validate(cardNumber, options = {}) {
    const result = this.createResult();
    const normalized = cardNumber.replace(/\s/g, '');
    
    // Check required
    if (options.required !== false) {
      const requiredCheck = this.validateRequired(normalized);
      if (!requiredCheck.isValid) {
        result.addError(requiredCheck.error);
        return result;
      }
    }
    
    if (!normalized) return result;
    
    // Check format
    if (!VALIDATION_RULES.CREDIT_CARD.test(normalized)) {
      result.addError('Invalid credit card number');
    }
    
    // Luhn algorithm
    if (!this.luhnCheck(normalized)) {
      result.addError('Invalid credit card number (checksum failed)');
    }
    
    // Detect card type
    const cardType = this.detectCardType(normalized);
    result.addInfo(`Card type: ${cardType}`);
    
    // Validate card type
    if (options.allowedTypes && !options.allowedTypes.includes(cardType)) {
      result.addError(`Card type ${cardType} is not accepted`);
    }
    
    return result;
  }

  // Luhn algorithm check
  luhnCheck(cardNumber) {
    let sum = 0;
    let alternate = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let n = parseInt(cardNumber.charAt(i), 10);
      
      if (alternate) {
        n *= 2;
        if (n > 9) {
          n = (n % 10) + 1;
        }
      }
      
      sum += n;
      alternate = !alternate;
    }
    
    return (sum % 10 === 0);
  }

  // Detect card type
  detectCardType(cardNumber) {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      diners: /^3(?:0[0-5]|[68])/,
      jcb: /^(?:2131|1800|35)/,
      unionpay: /^62/,
      maestro: /^(?:5[0678]|6[37])/
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cardNumber)) {
        return type;
      }
    }
    
    return 'unknown';
  }

  // Mask card number
  mask(cardNumber, visibleDigits = 4) {
    const cleaned = cardNumber.replace(/\s/g, '');
    const lastFour = cleaned.slice(-visibleDigits);
    const masked = '*'.repeat(cleaned.length - visibleDigits) + lastFour;
    
    // Add spaces every 4 digits
    return masked.match(/.{1,4}/g)?.join(' ') || masked;
  }
  }
// Date validator
export class DateValidator extends Validator {
  validate(date, options = {}) {
    const result = this.createResult();
    
    // Check required
    if (options.required !== false) {
      const requiredCheck = this.validateRequired(date);
      if (!requiredCheck.isValid) {
        result.addError(requiredCheck.error);
        return result;
      }
    }
    
    if (!date) return result;
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if valid date
    if (isNaN(dateObj.getTime())) {
      result.addError('Invalid date');
    }
    
    // Check format if string
    if (typeof date === 'string' && options.format) {
      const formatRegex = {
        'YYYY-MM-DD': /^\d{4}-\d{2}-\d{2}$/,
        'DD/MM/YYYY': /^\d{2}\/\d{2}\/\d{4}$/,
        'MM/DD/YYYY': /^\d{2}\/\d{2}\/\d{4}$/
      };
      
      if (formatRegex[options.format] && !formatRegex[options.format].test(date)) {
        result.addError(`Date must be in format ${options.format}`);
      }
    }
    
    // Check range
    if (options.minDate) {
      const minDate = new Date(options.minDate);
      if (dateObj < minDate) {
        result.addError(`Date must be after ${minDate.toLocaleDateString()}`);
      }
    }
    
    if (options.maxDate) {
      const maxDate = new Date(options.maxDate);
      if (dateObj > maxDate) {
        result.addError(`Date must be before ${maxDate.toLocaleDateString()}`);
      }
    }
    
    // Check age
    if (options.minAge) {
      const today = new Date();
      const age = today.getFullYear() - dateObj.getFullYear();
      const monthDiff = today.getMonth() - dateObj.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateObj.getDate())) {
        age--;
      }
      
      if (age < options.minAge) {
        result.addError(`Must be at least ${options.minAge} years old`);
      }
    }
    
    return result;
  }

  // Format date
  format(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    
    const formats = {
      'YYYY-MM-DD': `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      'DD/MM/YYYY': `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`,
      'MM/DD/YYYY': `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`,
      'DD MMM YYYY': d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      'DD MMMM YYYY': d.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
    };
    
    return formats[format] || formats['YYYY-MM-DD'];
  }
}

// JSON validator
export class JSONValidator extends Validator {
  validate(json, options = {}) {
    const result = this.createResult();
    
    // Check required
    if (options.required !== false) {
      const requiredCheck = this.validateRequired(json);
      if (!requiredCheck.isValid) {
        result.addError(requiredCheck.error);
        return result;
      }
    }
    
    if (!json) return result;
    
    try {
      const parsed = typeof json === 'string' ? JSON.parse(json) : json;
      
      // Validate schema if provided
      if (options.schema) {
        const schemaErrors = this.validateSchema(parsed, options.schema);
        schemaErrors.forEach(error => result.addError(error));
      }
      
      // Check required fields
      if (options.requiredFields) {
        options.requiredFields.forEach(field => {
          if (!parsed.hasOwnProperty(field)) {
            result.addError(`Missing required field: ${field}`);
          }
        });
      }
      
      // Validate field types
      if (options.fieldTypes) {
        Object.entries(options.fieldTypes).forEach(([field, type]) => {
          if (parsed.hasOwnProperty(field) && typeof parsed[field] !== type) {
            result.addError(`Field ${field} must be of type ${type}`);
          }
        });
      }
      
    } catch (error) {
      result.addError('Invalid JSON: ' + error.message);
    }
    
    return result;
  }

  // Validate against JSON schema
  validateSchema(data, schema, path = '') {
    const errors = [];
    
    for (const [key, rules] of Object.entries(schema)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (rules.required && !data.hasOwnProperty(key)) {
        errors.push(`${currentPath} is required`);
        continue;
      }
      
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        
        // Type validation
        if (rules.type && typeof value !== rules.type) {
          errors.push(`${currentPath} must be of type ${rules.type}`);
        }
        
        // Pattern validation
        if (rules.pattern && typeof value === 'string' && !new RegExp(rules.pattern).test(value)) {
          errors.push(`${currentPath} does not match required pattern`);
        }
        
        // Min/Max validation
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${currentPath} must be at least ${rules.min}`);
        }
        
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${currentPath} must be at most ${rules.max}`);
        }
        
        // Enum validation
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`${currentPath} must be one of: ${rules.enum.join(', ')}`);
        }
        
        // Nested object validation
        if (rules.properties && typeof value === 'object') {
          errors.push(...this.validateSchema(value, rules.properties, currentPath));
        }
      }
    }
    
    return errors;
  }
}

// File validator
export class FileValidator extends Validator {
  validate(file, options = {}) {
    const result = this.createResult();
    
    // Check required
    if (options.required !== false) {
      const requiredCheck = this.validateRequired(file);
      if (!requiredCheck.isValid) {
        result.addError(requiredCheck.error);
        return result;
      }
    }
    
    if (!file) return result;
    
    // Check file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      result.addError(`File type ${file.type} is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`);
    }
    
    // Check file size
    if (options.maxSize && file.size > options.maxSize) {
      const maxSizeMB = options.maxSize / (1024 * 1024);
      const fileSizeMB = file.size / (1024 * 1024);
      result.addError(`File size ${fileSizeMB.toFixed(2)}MB exceeds maximum ${maxSizeMB}MB`);
    }
    
    if (options.minSize && file.size < options.minSize) {
      const minSizeKB = options.minSize / 1024;
      const fileSizeKB = file.size / 1024;
      result.addError(`File size ${fileSizeKB.toFixed(2)}KB is below minimum ${minSizeKB}KB`);
    }
    
    // Check dimensions for images
    if (options.checkDimensions && file.type.startsWith('image/')) {
      this.checkImageDimensions(file, options).then(dimensionErrors => {
        dimensionErrors.forEach(error => result.addError(error));
      });
    }
    
    // Check file name
    if (options.allowedExtensions) {
      const extension = file.name.split('.').pop().toLowerCase();
      if (!options.allowedExtensions.includes(extension)) {
        result.addError(`File extension .${extension} is not allowed`);
      }
    }
    
    return result;
  }

  // Check image dimensions
  async checkImageDimensions(file, options) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const errors = [];
        
        if (options.minWidth && img.width < options.minWidth) {
          errors.push(`Image width ${img.width}px is below minimum ${options.minWidth}px`);
        }
        
        if (options.maxWidth && img.width > options.maxWidth) {
          errors.push(`Image width ${img.width}px exceeds maximum ${options.maxWidth}px`);
        }
        
        if (options.minHeight && img.height < options.minHeight) {
          errors.push(`Image height ${img.height}px is below minimum ${options.minHeight}px`);
        }
        
        if (options.maxHeight && img.height > options.maxHeight) {
          errors.push(`Image height ${img.height}px exceeds maximum ${options.maxHeight}px`);
        }
        
        if (options.aspectRatio) {
          const ratio = img.width / img.height;
          const [targetWidth, targetHeight] = options.aspectRatio.split(':').map(Number);
          const targetRatio = targetWidth / targetHeight;
          
          if (Math.abs(ratio - targetRatio) > 0.01) {
            errors.push(`Image aspect ratio must be ${options.aspectRatio}`);
          }
        }
        
        resolve(errors);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve(['Invalid image file']);
      };
    });
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}

// Utility functions
export const validators = {
  // Create validator instances
  email: new EmailValidator(),
  password: new PasswordValidator(),
  phone: new PhoneValidator(),
  url: new URLValidator(),
  creditCard: new CreditCardValidator(),
  date: new DateValidator(),
  json: new JSONValidator(),
  file: new FileValidator(),

  // General validation function
  validate: (value, rules) => {
    const result = new ValidationResult();
    
    rules.forEach(rule => {
      const { type, ...options } = rule;
      
      switch (type) {
        case 'required':
          if (!value) result.addError('This field is required');
          break;
          
        case 'email':
          if (value && !validators.email.validate(value, options).isValid) {
            result.addError('Invalid email address');
          }
          break;
          
        case 'password':
          if (value) {
            const passwordResult = validators.password.validate(value, options);
            passwordResult.errors.forEach(error => result.addError(error));
          }
          break;
          
        case 'phone':
          if (value && !validators.phone.validate(value, options).isValid) {
            result.addError('Invalid phone number');
          }
          break;
          
        case 'url':
          if (value && !validators.url.validate(value, options).isValid) {
            result.addError('Invalid URL');
          }
          break;
          
        case 'min':
          if (value && value.length < options.value) {
            result.addError(`Must be at least ${options.value} characters`);
          }
          break;
          
        case 'max':
          if (value && value.length > options.value) {
            result.addError(`Must be at most ${options.value} characters`);
          }
          break;
          
        case 'pattern':
          if (value && !new RegExp(options.pattern).test(value)) {
            result.addError(options.message || 'Invalid format');
          }
          break;
          
        case 'match':
          if (value !== options.value) {
            result.addError(options.message || 'Fields do not match');
          }
          break;
          
        case 'custom':
          const customResult = options.validator(value);
          if (customResult !== true) {
            result.addError(customResult);
          }
          break;
      }
    });
    
    return result;
  },

  // Check if value is empty
  isEmpty: (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  },

  // Check if value is numeric
  isNumeric: (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },

  // Check if value is integer
  isInteger: (value) => {
    return Number.isInteger(Number(value));
  },

  // Check if value is boolean
  isBoolean: (value) => {
    return typeof value === 'boolean' || value === 'true' || value === 'false';
  },

  // Check if value is array
  isArray: (value) => {
    return Array.isArray(value);
  },

  // Check if value is object
  isObject: (value) => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  },

  // Check if value is function
  isFunction: (value) => {
    return typeof value === 'function';
  },

  // Check if value is date
  isDate: (value) => {
    return value instanceof Date && !isNaN(value);
  },

  // Sanitize input
  sanitize: (value, options = {}) => {
    if (typeof value !== 'string') return value;
    
    let sanitized = value;
    
    if (options.trim) {
      sanitized = sanitized.trim();
    }
    
    if (options.lowercase) {
      sanitized = sanitized.toLowerCase();
    }
    
    if (options.uppercase) {
      sanitized = sanitized.toUpperCase();
    }
    
    if (options.stripTags) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }
    
    if (options.escapeHtml) {
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
    
    if (options.removeWhitespace) {
      sanitized = sanitized.replace(/\s+/g, '');
    }
    
    if (options.allowOnly) {
      sanitized = sanitized.replace(new RegExp(`[^${options.allowOnly}]`, 'g'), '');
    }
    
    return sanitized;
  }
};

// Export constants
export const VALIDATOR_CONSTANTS = {
  ERROR_TYPES: VALIDATION_ERROR_TYPES,
  RULES: VALIDATION_RULES,
  MESSAGES: VALIDATION_MESSAGES
};

export default validators;
