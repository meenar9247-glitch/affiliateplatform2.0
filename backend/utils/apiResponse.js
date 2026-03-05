/**
 * ============================================
 * API RESPONSE UTILITY
 * Standardized response formatting for the entire API
 * Consistent structure with metadata, pagination, and caching
 * ============================================
 */

const { HTTP_STATUS } = require('./constants');

/**
 * Base API Response class
 * All responses follow this structure
 */
class ApiResponse {
  constructor(success = true, message = null, data = null, meta = null) {
    this.success = success;
    this.timestamp = new Date().toISOString();
    
    if (message) {
      this.message = message;
    }
    
    if (data !== null && data !== undefined) {
      this.data = data;
    }
    
    if (meta) {
      this.meta = meta;
    }
  }

  /**
   * Add pagination metadata
   */
  withPagination(page, limit, total, totalPages) {
    this.meta = {
      ...this.meta,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
    return this;
  }

  /**
   * Add cache control headers
   */
  withCache(ttl = 60, tags = []) {
    this.meta = {
      ...this.meta,
      cache: {
        ttl,
        tags,
        timestamp: new Date().toISOString()
      }
    };
    return this;
  }

  /**
   * Add request metadata
   */
  withRequest(requestId, path, method) {
    this.meta = {
      ...this.meta,
      request: {
        id: requestId,
        path,
        method
      }
    };
    return this;
  }

  /**
   * Add version info
   */
  withVersion(version) {
    this.meta = {
      ...this.meta,
      version
    };
    return this;
  }

  /**
   * Convert to JSON for response
   */
  toJSON() {
    const json = {
      success: this.success,
      timestamp: this.timestamp
    };

    if (this.message) {
      json.message = this.message;
    }

    if (this.data !== undefined) {
      json.data = this.data;
    }

    if (this.meta) {
      json.meta = this.meta;
    }

    return json;
  }
}

// ============================================
// Success Response Classes
// ============================================

/**
 * 200 OK Response
 */
class OkResponse extends ApiResponse {
  constructor(data = null, message = 'Request successful', meta = null) {
    super(true, message, data, meta);
    this.statusCode = HTTP_STATUS.OK;
  }
}

/**
 * 201 Created Response
 */
class CreatedResponse extends ApiResponse {
  constructor(data = null, message = 'Resource created successfully', meta = null) {
    super(true, message, data, meta);
    this.statusCode = HTTP_STATUS.CREATED;
  }
}

/**
 * 202 Accepted Response
 */
class AcceptedResponse extends ApiResponse {
  constructor(data = null, message = 'Request accepted', meta = null) {
    super(true, message, data, meta);
    this.statusCode = HTTP_STATUS.ACCEPTED;
  }
}

/**
 * 204 No Content Response
 */
class NoContentResponse {
  constructor() {
    this.success = true;
    this.statusCode = HTTP_STATUS.NO_CONTENT;
  }

  toJSON() {
    return null;
  }
}

// ============================================
// Collection Response (with pagination)
// ============================================

/**
 * Paginated collection response
 */
class CollectionResponse extends ApiResponse {
  constructor(items, total, page = 1, limit = 20, message = 'Data retrieved successfully') {
    super(true, message, items);
    
    const totalPages = Math.ceil(total / limit);
    
    this.meta = {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
    
    this.statusCode = HTTP_STATUS.OK;
  }
}

// ============================================
// Specialized Response Builders
// ============================================

/**
 * Response builder with fluent interface
 */
class ResponseBuilder {
  constructor() {
    this.response = {
      success: true,
      timestamp: new Date().toISOString()
    };
    this.statusCode = HTTP_STATUS.OK;
  }

  /**
   * Set success status
   */
  setSuccess(success = true) {
    this.response.success = success;
    return this;
  }

  /**
   * Set message
   */
  setMessage(message) {
    this.response.message = message;
    return this;
  }

  /**
   * Set data
   */
  setData(data) {
    this.response.data = data;
    return this;
  }

  /**
   * Set metadata
   */
  setMeta(meta) {
    this.response.meta = meta;
    return this;
  }

  /**
   * Add pagination
   */
  withPagination(page, limit, total, totalPages) {
    this.response.meta = {
      ...this.response.meta,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
    return this;
  }

  /**
   * Add cache info
   */
  withCache(ttl = 60, tags = []) {
    this.response.meta = {
      ...this.response.meta,
      cache: {
        ttl,
        tags,
        timestamp: new Date().toISOString()
      }
    };
    return this;
  }

  /**
   * Set status code
   */
  setStatusCode(statusCode) {
    this.statusCode = statusCode;
    return this;
  }

  /**
   * Build response object
   */
  build() {
    return {
      statusCode: this.statusCode,
      json: this.response
    };
  }
}

// ============================================
// Response Factory
// ============================================

/**
 * Factory function to create appropriate response
 */
const createResponse = (data = null, message = null, statusCode = HTTP_STATUS.OK, meta = null) => {
  switch (statusCode) {
    case HTTP_STATUS.CREATED:
      return new CreatedResponse(data, message, meta);
    case HTTP_STATUS.ACCEPTED:
      return new AcceptedResponse(data, message, meta);
    case HTTP_STATUS.NO_CONTENT:
      return new NoContentResponse();
    default:
      return new OkResponse(data, message, meta);
  }
};

// ============================================
// Response Formatters
// ============================================

/**
 * Format single item response
 */
const formatItem = (item, transformer = null) => {
  if (transformer && typeof transformer === 'function') {
    return transformer(item);
  }
  return item;
};

/**
 * Format collection response
 */
const formatCollection = (items, total, page, limit, transformer = null) => {
  const formattedItems = transformer 
    ? items.map(item => transformer(item))
    : items;
  
  return new CollectionResponse(formattedItems, total, page, limit);
};

// ============================================
// Response Middleware
// ============================================

/**
 * Response middleware to attach response methods to res object
 */
const responseMiddleware = (req, res, next) => {
  // Success responses
  res.ok = (data = null, message = 'Request successful', meta = null) => {
    const response = new OkResponse(data, message, meta);
    return res.status(response.statusCode).json(response);
  };

  res.created = (data = null, message = 'Resource created successfully', meta = null) => {
    const response = new CreatedResponse(data, message, meta);
    return res.status(response.statusCode).json(response);
  };

  res.accepted = (data = null, message = 'Request accepted', meta = null) => {
    const response = new AcceptedResponse(data, message, meta);
    return res.status(response.statusCode).json(response);
  };

  res.noContent = () => {
    const response = new NoContentResponse();
    return res.status(response.statusCode).json(response.toJSON());
  };

  // Collection responses
  res.collection = (items, total, page = 1, limit = 20, message = 'Data retrieved successfully') => {
    const response = new CollectionResponse(items, total, page, limit, message);
    return res.status(response.statusCode).json(response);
  };

  // Builder
  res.build = () => new ResponseBuilder();

  // Custom response
  res.custom = (data = null, message = null, statusCode = HTTP_STATUS.OK, meta = null) => {
    const response = createResponse(data, message, statusCode, meta);
    return res.status(response.statusCode || statusCode).json(response);
  };

  next();
};

// ============================================
// Export all response classes and utilities
// ============================================

module.exports = {
  ApiResponse,
  OkResponse,
  CreatedResponse,
  AcceptedResponse,
  NoContentResponse,
  CollectionResponse,
  ResponseBuilder,
  createResponse,
  formatItem,
  formatCollection,
  responseMiddleware
};
