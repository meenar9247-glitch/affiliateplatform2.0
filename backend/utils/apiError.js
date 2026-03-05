/**
 * ============================================
 * API ERROR UTILITY
 * Standardized error handling for the entire API
 * Extends native Error with additional properties and methods
 * ============================================
 */

const { ERROR_CODES, HTTP_STATUS } = require('./constants');

/**
 * Base API Error class
 * All custom errors extend this class
 */
class ApiError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errorCode = null, details = null) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode || this.getDefaultErrorCode(statusCode);
    this.details = details;
    this.isOperational = true; // Indicates if error is operational (vs programming)
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Get default error code based on status code
   */
  getDefaultErrorCode(statusCode) {
    const defaultCodes = {
      [HTTP_STATUS.BAD_REQUEST]: ERROR_CODES.VALIDATION_FAILED,
      [HTTP_STATUS.UNAUTHORIZED]: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      [HTTP_STATUS.FORBIDDEN]: ERROR_CODES.UNAUTHORIZED_ACCESS,
      [HTTP_STATUS.NOT_FOUND]: 'ERR_NOT_FOUND',
      [HTTP_STATUS.CONFLICT]: ERROR_CODES.DB_DUPLICATE_KEY,
      [HTTP_STATUS.UNPROCESSABLE_ENTITY]: ERROR_CODES.VALIDATION_INVALID_INPUT,
      [HTTP_STATUS.TOO_MANY_REQUESTS]: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: ERROR_CODES.SYSTEM_ERROR
    };
    
    return defaultCodes[statusCode] || `ERR_${statusCode}`;
  }

  /**
   * Convert error to JSON for response
   */
  toJSON() {
    const json = {
      success: false,
      message: this.message,
      errorCode: this.errorCode,
      timestamp: this.timestamp
    };

    if (this.details) {
      json.details = this.details;
    }

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
      json.stack = this.stack;
    }

    return json;
  }

  /**
   * Convert error to string
   */
  toString() {
    return `${this.name}: [${this.errorCode}] ${this.message}`;
  }
}

// ============================================
// 4xx Client Errors
// ============================================

/**
 * Bad Request Error (400)
 */
class BadRequestError extends ApiError {
  constructor(message = 'Bad request', details = null, errorCode = ERROR_CODES.VALIDATION_FAILED) {
    super(message, HTTP_STATUS.BAD_REQUEST, errorCode, details);
  }
}

/**
 * Unauthorized Error (401)
 */
class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required', details = null, errorCode = ERROR_CODES.AUTH_MISSING_TOKEN) {
    super(message, HTTP_STATUS.UNAUTHORIZED, errorCode, details);
  }
}

/**
 * Forbidden Error (403)
 */
class ForbiddenError extends ApiError {
  constructor(message = 'Access denied', details = null, errorCode = ERROR_CODES.UNAUTHORIZED_ACCESS) {
    super(message, HTTP_STATUS.FORBIDDEN, errorCode, details);
  }
}

/**
 * Not Found Error (404)
 */
class NotFoundError extends ApiError {
  constructor(resource = 'Resource', details = null) {
    super(`${resource} not found`, HTTP_STATUS.NOT_FOUND, ERROR_CODES[`${resource.toUpperCase()}_NOT_FOUND`] || 'ERR_NOT_FOUND', details);
  }
}

/**
 * Method Not Allowed Error (405)
 */
class MethodNotAllowedError extends ApiError {
  constructor(method = 'Method', details = null) {
    super(`${method} not allowed`, HTTP_STATUS.METHOD_NOT_ALLOWED, 'ERR_METHOD_NOT_ALLOWED', details);
  }
}

/**
 * Conflict Error (409)
 */
class ConflictError extends ApiError {
  constructor(message = 'Resource already exists', details = null, errorCode = ERROR_CODES.DB_DUPLICATE_KEY) {
    super(message, HTTP_STATUS.CONFLICT, errorCode, details);
  }
}

/**
 * Unprocessable Entity Error (422)
 */
class UnprocessableEntityError extends ApiError {
  constructor(message = 'Validation failed', details = null, errorCode = ERROR_CODES.VALIDATION_INVALID_INPUT) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, errorCode, details);
  }
}

/**
 * Too Many Requests Error (429)
 */
class TooManyRequestsError extends ApiError {
  constructor(message = 'Too many requests', retryAfter = 60, details = null) {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, ERROR_CODES.RATE_LIMIT_EXCEEDED, {
      ...details,
      retryAfter
    });
  }
}

// ============================================
// 5xx Server Errors
// ============================================

/**
 * Internal Server Error (500)
 */
class InternalServerError extends ApiError {
  constructor(message = 'Internal server error', details = null, errorCode = ERROR_CODES.SYSTEM_ERROR) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, errorCode, details);
  }
}

/**
 * Service Unavailable Error (503)
 */
class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service temporarily unavailable', details = null) {
    super(message, HTTP_STATUS.SERVICE_UNAVAILABLE, ERROR_CODES.SERVICE_UNAVAILABLE, details);
  }
}

/**
 * Gateway Timeout Error (504)
 */
class GatewayTimeoutError extends ApiError {
  constructor(message = 'Gateway timeout', details = null) {
    super(message, HTTP_STATUS.GATEWAY_TIMEOUT, 'ERR_GATEWAY_TIMEOUT', details);
  }
}

// ============================================
// Authentication & Authorization Errors
// ============================================

/**
 * Invalid Credentials Error
 */
class InvalidCredentialsError extends UnauthorizedError {
  constructor(message = 'Invalid email or password') {
    super(message, null, ERROR_CODES.AUTH_INVALID_CREDENTIALS);
  }
}

/**
 * Token Expired Error
 */
class TokenExpiredError extends UnauthorizedError {
  constructor(message = 'Token expired') {
    super(message, null, ERROR_CODES.AUTH_TOKEN_EXPIRED);
  }
}

/**
 * Invalid Token Error
 */
class InvalidTokenError extends UnauthorizedError {
  constructor(message = 'Invalid token') {
    super(message, null, ERROR_CODES.AUTH_INVALID_TOKEN);
  }
}

/**
 * Account Locked Error
 */
class AccountLockedError extends ForbiddenError {
  constructor(message = 'Account locked', unlockTime = null) {
    super(message, { unlockTime }, ERROR_CODES.AUTH_ACCOUNT_LOCKED);
  }
}

/**
 * Account Disabled Error
 */
class AccountDisabledError extends ForbiddenError {
  constructor(message = 'Account disabled') {
    super(message, null, ERROR_CODES.AUTH_ACCOUNT_DISABLED);
  }
}

/**
 * Email Not Verified Error
 */
class EmailNotVerifiedError extends ForbiddenError {
  constructor(message = 'Email not verified') {
    super(message, null, ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED);
  }
}

/**
 * 2FA Required Error
 */
class TwoFactorRequiredError extends UnauthorizedError {
  constructor(message = '2FA verification required') {
    super(message, null, ERROR_CODES.AUTH_2FA_REQUIRED);
  }
}

/**
 * Invalid 2FA Token Error
 */
class InvalidTwoFactorTokenError extends UnauthorizedError {
  constructor(message = 'Invalid 2FA token') {
    super(message, null, ERROR_CODES.AUTH_2FA_INVALID);
  }
}

// ============================================
// User Related Errors
// ============================================

/**
 * User Not Found Error
 */
class UserNotFoundError extends NotFoundError {
  constructor(details = null) {
    super('User', details);
    this.errorCode = ERROR_CODES.USER_NOT_FOUND;
  }
}

/**
 * User Already Exists Error
 */
class UserAlreadyExistsError extends ConflictError {
  constructor(field = 'email', value = null) {
    super(`User with this ${field} already exists`, { field, value }, ERROR_CODES.USER_ALREADY_EXISTS);
  }
}

// ============================================
// Affiliate Related Errors
// ============================================

/**
 * Affiliate Not Found Error
 */
class AffiliateNotFoundError extends NotFoundError {
  constructor(details = null) {
    super('Affiliate', details);
    this.errorCode = ERROR_CODES.AFFILIATE_NOT_FOUND;
  }
}

/**
 * Affiliate Not Active Error
 */
class AffiliateNotActiveError extends ForbiddenError {
  constructor(status = null) {
    super('Affiliate account is not active', { status }, ERROR_CODES.AFFILIATE_NOT_ACTIVE);
  }
}

/**
 * Affiliate Pending Error
 */
class AffiliatePendingError extends ForbiddenError {
  constructor(message = 'Affiliate application pending') {
    super(message, null, ERROR_CODES.AFFILIATE_PENDING);
  }
}

/**
 * Affiliate Suspended Error
 */
class AffiliateSuspendedError extends ForbiddenError {
  constructor(reason = null) {
    super('Affiliate account suspended', { reason }, ERROR_CODES.AFFILIATE_SUSPENDED);
  }
}

// ============================================
// Referral Related Errors
// ============================================

/**
 * Referral Not Found Error
 */
class ReferralNotFoundError extends NotFoundError {
  constructor(details = null) {
    super('Referral', details);
    this.errorCode = ERROR_CODES.REFERRAL_NOT_FOUND;
  }
}

/**
 * Referral Already Exists Error
 */
class ReferralAlreadyExistsError extends ConflictError {
  constructor(details = null) {
    super('Referral already exists', details, ERROR_CODES.REFERRAL_ALREADY_EXISTS);
  }
}

/**
 * Invalid Referral Code Error
 */
class InvalidReferralCodeError extends BadRequestError {
  constructor(code = null) {
    super('Invalid referral code', { code }, ERROR_CODES.REFERRAL_INVALID_CODE);
  }
}

/**
 * Self Referral Error
 */
class SelfReferralError extends BadRequestError {
  constructor(message = 'Cannot refer yourself') {
    super(message, null, ERROR_CODES.REFERRAL_SELF);
  }
}

// ============================================
// Commission Related Errors
// ============================================

/**
 * Commission Not Found Error
 */
class CommissionNotFoundError extends NotFoundError {
  constructor(details = null) {
    super('Commission', details);
    this.errorCode = ERROR_CODES.COMMISSION_NOT_FOUND;
  }
}

/**
 * Invalid Commission Amount Error
 */
class InvalidCommissionAmountError extends BadRequestError {
  constructor(details = null) {
    super('Invalid commission amount', details, ERROR_CODES.COMMISSION_INVALID_AMOUNT);
  }
}

/**
 * Commission Already Paid Error
 */
class CommissionAlreadyPaidError extends ConflictError {
  constructor(details = null) {
    super('Commission already paid', details, ERROR_CODES.COMMISSION_ALREADY_PAID);
  }
}

// ============================================
// Payout Related Errors
// ============================================

/**
 * Payout Not Found Error
 */
class PayoutNotFoundError extends NotFoundError {
  constructor(details = null) {
    super('Payout', details);
    this.errorCode = ERROR_CODES.PAYOUT_NOT_FOUND;
  }
}

/**
 * Insufficient Balance Error
 */
class InsufficientBalanceError extends BadRequestError {
  constructor(available = null, requested = null) {
    super('Insufficient balance', { available, requested }, ERROR_CODES.PAYOUT_INSUFFICIENT_BALANCE);
  }
}

/**
 * Minimum Payout Error
 */
class MinimumPayoutError extends BadRequestError {
  constructor(minAmount = null) {
    super(`Minimum payout amount is ${minAmount}`, { minAmount }, ERROR_CODES.PAYOUT_MINIMUM_REQUIRED);
  }
}

/**
 * Maximum Payout Error
 */
class MaximumPayoutError extends BadRequestError {
  constructor(maxAmount = null) {
    super(`Maximum payout amount is ${maxAmount}`, { maxAmount }, ERROR_CODES.PAYOUT_MAXIMUM_EXCEEDED);
  }
}

/**
 * Invalid Payout Method Error
 */
class InvalidPayoutMethodError extends BadRequestError {
  constructor(method = null) {
    super('Invalid payout method', { method }, ERROR_CODES.PAYOUT_METHOD_INVALID);
  }
}

// ============================================
// Wallet Related Errors
// ============================================

/**
 * Wallet Not Found Error
 */
class WalletNotFoundError extends NotFoundError {
  constructor(details = null) {
    super('Wallet', details);
    this.errorCode = ERROR_CODES.WALLET_NOT_FOUND;
  }
}

/**
 * Wallet Frozen Error
 */
class WalletFrozenError extends ForbiddenError {
  constructor(reason = null) {
    super('Wallet is frozen', { reason }, ERROR_CODES.WALLET_FROZEN);
  }
}

/**
 * Wallet Limit Exceeded Error
 */
class WalletLimitExceededError extends BadRequestError {
  constructor(limit = null, period = null) {
    super(`${period} withdrawal limit exceeded`, { limit, period }, ERROR_CODES[`WALLET_${period}_LIMIT`] || ERROR_CODES.WALLET_DAILY_LIMIT);
  }
}

// ============================================
// Ticket Related Errors
// ============================================

/**
 * Ticket Not Found Error
 */
class TicketNotFoundError extends NotFoundError {
  constructor(details = null) {
    super('Ticket', details);
    this.errorCode = ERROR_CODES.TICKET_NOT_FOUND;
  }
}

/**
 * Ticket Closed Error
 */
class TicketClosedError extends BadRequestError {
  constructor(message = 'Ticket is closed') {
    super(message, null, ERROR_CODES.TICKET_CLOSED);
  }
}

// ============================================
// File Related Errors
// ============================================

/**
 * File Too Large Error
 */
class FileTooLargeError extends BadRequestError {
  constructor(maxSize = null) {
    super(`File too large. Max size: ${maxSize}MB`, { maxSize }, ERROR_CODES.FILE_TOO_LARGE);
  }
}

/**
 * Invalid File Type Error
 */
class InvalidFileTypeError extends BadRequestError {
  constructor(allowedTypes = null) {
    super('Invalid file type', { allowedTypes }, ERROR_CODES.FILE_INVALID_TYPE);
  }
}

/**
 * Virus Detected Error
 */
class VirusDetectedError extends BadRequestError {
  constructor(message = 'File contains virus or malware') {
    super(message, null, ERROR_CODES.FILE_VIRUS_DETECTED);
  }
}

// ============================================
// External Service Errors
// ============================================

/**
 * Payment Gateway Error
 */
class PaymentGatewayError extends InternalServerError {
  constructor(gateway = null, message = null) {
    super(message || 'Payment gateway error', { gateway }, ERROR_CODES.PAYMENT_GATEWAY_ERROR);
  }
}

/**
 * Email Service Error
 */
class EmailServiceError extends InternalServerError {
  constructor(message = 'Email service error') {
    super(message, null, ERROR_CODES.EMAIL_SERVICE_ERROR);
  }
}

/**
 * SMS Service Error
 */
class SMSServiceError extends InternalServerError {
  constructor(message = 'SMS service error') {
    super(message, null, ERROR_CODES.SMS_SERVICE_ERROR);
  }
}

// ============================================
// Create error from status code
// ============================================

/**
 * Factory function to create appropriate error based on status code
 */
ApiError.create = (statusCode, message, details = null) => {
  switch (statusCode) {
    case HTTP_STATUS.BAD_REQUEST:
      return new BadRequestError(message, details);
    case HTTP_STATUS.UNAUTHORIZED:
      return new UnauthorizedError(message, details);
    case HTTP_STATUS.FORBIDDEN:
      return new ForbiddenError(message, details);
    case HTTP_STATUS.NOT_FOUND:
      return new NotFoundError(message, details);
    case HTTP_STATUS.CONFLICT:
      return new ConflictError(message, details);
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return new UnprocessableEntityError(message, details);
    case HTTP_STATUS.TOO_MANY_REQUESTS:
      return new TooManyRequestsError(message, 60, details);
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return new InternalServerError(message, details);
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      return new ServiceUnavailableError(message, details);
    default:
      return new ApiError(message, statusCode, null, details);
  }
};

// ============================================
// Export all error classes
// ============================================

module.exports = {
  ApiError,
  
  // 4xx errors
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  MethodNotAllowedError,
  ConflictError,
  UnprocessableEntityError,
  TooManyRequestsError,
  
  // 5xx errors
  InternalServerError,
  ServiceUnavailableError,
  GatewayTimeoutError,
  
  // Auth errors
  InvalidCredentialsError,
  TokenExpiredError,
  InvalidTokenError,
  AccountLockedError,
  AccountDisabledError,
  EmailNotVerifiedError,
  TwoFactorRequiredError,
  InvalidTwoFactorTokenError,
  
  // User errors
  UserNotFoundError,
  UserAlreadyExistsError,
  
  // Affiliate errors
  AffiliateNotFoundError,
  AffiliateNotActiveError,
  AffiliatePendingError,
  AffiliateSuspendedError,
  
  // Referral errors
  ReferralNotFoundError,
  ReferralAlreadyExistsError,
  InvalidReferralCodeError,
  SelfReferralError,
  
  // Commission errors
  CommissionNotFoundError,
  InvalidCommissionAmountError,
  CommissionAlreadyPaidError,
  
  // Payout errors
  PayoutNotFoundError,
  InsufficientBalanceError,
  MinimumPayoutError,
  MaximumPayoutError,
  InvalidPayoutMethodError,
  
  // Wallet errors
  WalletNotFoundError,
  WalletFrozenError,
  WalletLimitExceededError,
  
  // Ticket errors
  TicketNotFoundError,
  TicketClosedError,
  
  // File errors
  FileTooLargeError,
  InvalidFileTypeError,
  VirusDetectedError,
  
  // External service errors
  PaymentGatewayError,
  EmailServiceError,
  SMSServiceError
};
