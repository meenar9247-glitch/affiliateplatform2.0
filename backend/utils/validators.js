/**
 * ============================================
 * VALIDATORS UTILITY
 * Comprehensive validation functions for all data types
 * Used across models, controllers, and middleware
 * ============================================
 */

const validator = require('validator');
const { REGEX, USER_ROLES, PAYOUT_METHODS } = require('./constants');

// ============================================
// Basic Validators
// ============================================

/**
 * Check if value is present (not null/undefined/empty)
 */
exports.isRequired = (value, field = 'Field') => {
  if (value === undefined || value === null || value === '') {
    return { valid: false, message: `${field} is required` };
  }
  return { valid: true };
};

/**
 * Check if value is a string
 */
exports.isString = (value, field = 'Field') => {
  if (typeof value !== 'string') {
    return { valid: false, message: `${field} must be a string` };
  }
  return { valid: true };
};

/**
 * Check if value is a number
 */
exports.isNumber = (value, field = 'Field') => {
  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, message: `${field} must be a number` };
  }
  return { valid: true };
};

/**
 * Check if value is a boolean
 */
exports.isBoolean = (value, field = 'Field') => {
  if (typeof value !== 'boolean') {
    return { valid: false, message: `${field} must be a boolean` };
  }
  return { valid: true };
};

/**
 * Check if value is an array
 */
exports.isArray = (value, field = 'Field') => {
  if (!Array.isArray(value)) {
    return { valid: false, message: `${field} must be an array` };
  }
  return { valid: true };
};

/**
 * Check if value is an object
 */
exports.isObject = (value, field = 'Field') => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { valid: false, message: `${field} must be an object` };
  }
  return { valid: true };
};

/**
 * Check if value is a date
 */
exports.isDate = (value, field = 'Field') => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { valid: false, message: `${field} must be a valid date` };
  }
  return { valid: true };
};

// ============================================
// String Validators
// ============================================

/**
 * Check string length
 */
exports.hasLength = (value, min, max, field = 'Field') => {
  if (typeof value !== 'string') {
    return { valid: false, message: `${field} must be a string` };
  }
  
  if (value.length < min) {
    return { valid: false, message: `${field} must be at least ${min} characters` };
  }
  
  if (max && value.length > max) {
    return { valid: false, message: `${field} must not exceed ${max} characters` };
  }
  
  return { valid: true };
};

/**
 * Check if string matches regex pattern
 */
exports.matchesPattern = (value, pattern, message, field = 'Field') => {
  if (typeof value !== 'string') {
    return { valid: false, message: `${field} must be a string` };
  }
  
  if (!pattern.test(value)) {
    return { valid: false, message: message || `${field} has invalid format` };
  }
  
  return { valid: true };
};

/**
 * Validate email
 */
exports.isEmail = (value, field = 'Email') => {
  if (!value) {
    return { valid: false, message: `${field} is required` };
  }
  
  if (!validator.isEmail(value)) {
    return { valid: false, message: `Invalid ${field.toLowerCase()} format` };
  }
  
  return { valid: true };
};

/**
 * Validate password strength
 */
exports.isStrongPassword = (value, field = 'Password') => {
  if (!value) {
    return { valid: false, message: `${field} is required` };
  }
  
  const checks = {
    length: value.length >= 6,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
  };
  
  const failedChecks = Object.entries(checks)
    .filter(([key, passed]) => !passed)
    .map(([key]) => key);
  
  if (failedChecks.length > 0) {
    const messages = {
      length: 'at least 6 characters',
      uppercase: 'an uppercase letter',
      lowercase: 'a lowercase letter',
      number: 'a number',
      special: 'a special character'
    };
    
    const requirements = failedChecks.map(c => messages[c]).join(', ');
    return { 
      valid: false, 
      message: `${field} must contain ${requirements}`,
      details: checks
    };
  }
  
  return { valid: true, details: checks };
};

/**
 * Validate phone number
 */
exports.isPhone = (value, field = 'Phone') => {
  if (!value) {
    return { valid: false, message: `${field} is required` };
  }
  
  // Basic phone validation - can be enhanced for country-specific
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  
  if (!phoneRegex.test(value)) {
    return { valid: false, message: `Invalid ${field.toLowerCase()} format` };
  }
  
  return { valid: true };
};

/**
 * Validate URL
 */
exports.isURL = (value, field = 'URL') => {
  if (!value) {
    return { valid: false, message: `${field} is required` };
  }
  
  if (!validator.isURL(value, { require_protocol: false })) {
    return { valid: false, message: `Invalid ${field.toLowerCase()} format` };
  }
  
  return { valid: true };
};

/**
 * Validate referral code
 */
exports.isReferralCode = (value, field = 'Referral code') => {
  return exports.matchesPattern(
    value, 
    REGEX.REFERRAL_CODE, 
    `${field} must be 6-10 alphanumeric characters`,
    field
  );
};

// ============================================
// Number Validators
// ============================================

/**
 * Check if number is within range
 */
exports.isInRange = (value, min, max, field = 'Field') => {
  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, message: `${field} must be a number` };
  }
  
  if (value < min) {
    return { valid: false, message: `${field} must be at least ${min}` };
  }
  
  if (max !== undefined && value > max) {
    return { valid: false, message: `${field} must not exceed ${max}` };
  }
  
  return { valid: true };
};

/**
 * Check if number is positive
 */
exports.isPositive = (value, field = 'Field') => {
  return exports.isInRange(value, 0, undefined, field);
};

/**
 * Check if number is integer
 */
exports.isInteger = (value, field = 'Field') => {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return { valid: false, message: `${field} must be an integer` };
  }
  return { valid: true };
};

/**
 * Check if number is decimal with specified precision
 */
exports.isDecimal = (value, precision = 2, field = 'Field') => {
  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, message: `${field} must be a number` };
  }
  
  const decimalPlaces = (value.toString().split('.')[1] || '').length;
  if (decimalPlaces > precision) {
    return { valid: false, message: `${field} must have at most ${precision} decimal places` };
  }
  
  return { valid: true };
};

// ============================================
// Array Validators
// ============================================

/**
 * Check array length
 */
exports.arrayLength = (value, min, max, field = 'Field') => {
  if (!Array.isArray(value)) {
    return { valid: false, message: `${field} must be an array` };
  }
  
  if (value.length < min) {
    return { valid: false, message: `${field} must have at least ${min} items` };
  }
  
  if (max && value.length > max) {
    return { valid: false, message: `${field} must have at most ${max} items` };
  }
  
  return { valid: true };
};

/**
 * Check if array contains unique values
 */
exports.isUniqueArray = (value, field = 'Field') => {
  if (!Array.isArray(value)) {
    return { valid: false, message: `${field} must be an array` };
  }
  
  const unique = new Set(value);
  if (unique.size !== value.length) {
    return { valid: false, message: `${field} must contain unique values` };
  }
  
  return { valid: true };
};

// ============================================
// Object Validators
// ============================================

/**
 * Check if object has required fields
 */
exports.hasRequiredFields = (value, requiredFields, field = 'Object') => {
  if (typeof value !== 'object' || value === null) {
    return { valid: false, message: `${field} must be an object` };
  }
  
  const missing = requiredFields.filter(f => !value.hasOwnProperty(f));
  
  if (missing.length > 0) {
    return { 
      valid: false, 
      message: `${field} is missing required fields: ${missing.join(', ')}`,
      missing 
    };
  }
  
  return { valid: true };
};

// ============================================
// ID Validators
// ============================================

/**
 * Validate MongoDB ObjectId
 */
exports.isObjectId = (value, field = 'ID') => {
  if (!value) {
    return { valid: false, message: `${field} is required` };
  }
  
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(value)) {
    return { valid: false, message: `Invalid ${field.toLowerCase()} format` };
  }
  
  return { valid: true };
};

/**
 * Validate array of ObjectIds
 */
exports.areObjectIds = (values, field = 'IDs') => {
  if (!Array.isArray(values)) {
    return { valid: false, message: `${field} must be an array` };
  }
  
  for (const value of values) {
    const result = exports.isObjectId(value, field);
    if (!result.valid) return result;
  }
  
  return { valid: true };
};

// ============================================
// Enum Validators
// ============================================

/**
 * Check if value is in enum
 */
exports.isInEnum = (value, enumObj, field = 'Field') => {
  const enumValues = Object.values(enumObj);
  
  if (!enumValues.includes(value)) {
    return { 
      valid: false, 
      message: `${field} must be one of: ${enumValues.join(', ')}` 
    };
  }
  
  return { valid: true };
};

/**
 * Validate user role
 */
exports.isUserRole = (value) => {
  return exports.isInEnum(value, USER_ROLES, 'Role');
};

/**
 * Validate payout method
 */
exports.isPayoutMethod = (value) => {
  return exports.isInEnum(value, PAYOUT_METHODS, 'Payout method');
};

// ============================================
// Date Validators
// ============================================

/**
 * Check if date is in the past
 */
exports.isPastDate = (value, field = 'Date') => {
  const result = exports.isDate(value, field);
  if (!result.valid) return result;
  
  const date = new Date(value);
  if (date > new Date()) {
    return { valid: false, message: `${field} must be in the past` };
  }
  
  return { valid: true };
};

/**
 * Check if date is in the future
 */
exports.isFutureDate = (value, field = 'Date') => {
  const result = exports.isDate(value, field);
  if (!result.valid) return result;
  
  const date = new Date(value);
  if (date < new Date()) {
    return { valid: false, message: `${field} must be in the future` };
  }
  
  return { valid: true };
};

/**
 * Check if date is within range
 */
exports.isDateInRange = (value, startDate, endDate, field = 'Date') => {
  const result = exports.isDate(value, field);
  if (!result.valid) return result;
  
  const date = new Date(value);
  
  if (startDate && date < new Date(startDate)) {
    return { valid: false, message: `${field} must be after ${startDate}` };
  }
  
  if (endDate && date > new Date(endDate)) {
    return { valid: false, message: `${field} must be before ${endDate}` };
  }
  
  return { valid: true };
};

// ============================================
// Conditional Validators
// ============================================

/**
 * Validate based on condition
 */
exports.when = (condition, validator, value, field) => {
  if (condition) {
    return validator(value, field);
  }
  return { valid: true };
};

/**
 * Validate either of two values
 */
exports.eitherOr = (value1, value2, validator, field) => {
  if (value1 && value2) {
    return { valid: false, message: `Provide either one, not both` };
  }
  
  if (!value1 && !value2) {
    return { valid: false, message: `At least one is required` };
  }
  
  return { valid: true };
};

// ============================================
// Compound Validators
// ============================================

/**
 * Validate user registration data
 */
exports.validateRegistration = (data) => {
  const errors = {};
  
  // Name validation
  const nameResult = exports.hasLength(data.name, 2, 50, 'Name');
  if (!nameResult.valid) errors.name = nameResult.message;
  
  // Email validation
  const emailResult = exports.isEmail(data.email);
  if (!emailResult.valid) errors.email = emailResult.message;
  
  // Password validation
  const passwordResult = exports.isStrongPassword(data.password);
  if (!passwordResult.valid) errors.password = passwordResult.message;
  
  // Confirm password
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  // Referral code (optional)
  if (data.referralCode) {
    const referralResult = exports.isReferralCode(data.referralCode);
    if (!referralResult.valid) errors.referralCode = referralResult.message;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate user login data
 */
exports.validateLogin = (data) => {
  const errors = {};
  
  const emailResult = exports.isEmail(data.email);
  if (!emailResult.valid) errors.email = emailResult.message;
  
  if (!data.password) {
    errors.password = 'Password is required';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate payout request
 */
exports.validatePayoutRequest = (data) => {
  const errors = {};
  
  // Amount validation
  const amountResult = exports.isInRange(data.amount, 10, 10000, 'Amount');
  if (!amountResult.valid) errors.amount = amountResult.message;
  
  // Method validation
  const methodResult = exports.isPayoutMethod(data.method);
  if (!methodResult.valid) errors.method = methodResult.message;
  
  // Method details validation
  if (data.method === 'bank_transfer') {
    if (!data.accountName) errors.accountName = 'Account name is required';
    if (!data.accountNumber) errors.accountNumber = 'Account number is required';
    if (!data.routingNumber) errors.routingNumber = 'Routing number is required';
  }
  
  if (data.method === 'paypal' && !data.paypalEmail) {
    errors.paypalEmail = 'PayPal email is required';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate ticket creation
 */
exports.validateTicket = (data) => {
  const errors = {};
  
  const subjectResult = exports.hasLength(data.subject, 5, 200, 'Subject');
  if (!subjectResult.valid) errors.subject = subjectResult.message;
  
  const descriptionResult = exports.hasLength(data.description, 10, 5000, 'Description');
  if (!descriptionResult.valid) errors.description = descriptionResult.message;
  
  // Category validation (would be expanded with actual categories)
  if (!data.category) {
    errors.category = 'Category is required';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate date range
 */
exports.validateDateRange = (startDate, endDate) => {
  const errors = {};
  
  if (startDate && !exports.isDate(startDate).valid) {
    errors.startDate = 'Invalid start date';
  }
  
  if (endDate && !exports.isDate(endDate).valid) {
    errors.endDate = 'Invalid end date';
  }
  
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    errors.range = 'Start date must be before end date';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// ============================================
// Sanitizers
// ============================================

/**
 * Sanitize email
 */
exports.sanitizeEmail = (email) => {
  return validator.normalizeEmail(email);
};

/**
 * Sanitize string (trim, escape)
 */
exports.sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return validator.escape(validator.trim(str));
};

/**
 * Sanitize number
 */
exports.sanitizeNumber = (num) => {
  if (typeof num === 'string') {
    num = parseFloat(num);
  }
  return isNaN(num) ? null : num;
};

/**
 * Sanitize array
 */
exports.sanitizeArray = (arr) => {
  if (!Array.isArray(arr)) return arr;
  return arr.map(item => {
    if (typeof item === 'string') return exports.sanitizeString(item);
    return item;
  });
};

// ============================================
// Export all validators
// ============================================

module.exports = exports;
