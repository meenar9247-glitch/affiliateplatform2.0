import axios from 'axios';
import { authApi } from '../hooks/useAuth';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Payment gateways
export const PAYMENT_GATEWAYS = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  RAZORPAY: 'razorpay',
  CASHFREE: 'cashfree',
  PAYU: 'payu',
  INSTAMOJO: 'instamojo',
  CCAVENUE: 'ccavenue',
  BILLDESK: 'billdesk',
  PHONEPE: 'phonepe',
  GOOGLE_PAY: 'google_pay',
  APPLE_PAY: 'apple_pay',
  AMAZON_PAY: 'amazon_pay',
  CRYPTO: 'crypto',
  BANK_TRANSFER: 'bank_transfer',
  WIRE_TRANSFER: 'wire_transfer'
};

// Payment methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  NET_BANKING: 'net_banking',
  UPI: 'upi',
  WALLET: 'wallet',
  PAYPAL: 'paypal',
  CRYPTO: 'crypto',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash',
  CHECK: 'check',
  GIFT_CARD: 'gift_card'
};

// Payment statuses
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
  CHARGEBACK: 'chargeback',
  ON_HOLD: 'on_hold',
  AUTHORIZED: 'authorized',
  CAPTURED: 'captured'
};

// Transaction types
export const TRANSACTION_TYPES = {
  PAYMENT: 'payment',
  REFUND: 'refund',
  WITHDRAWAL: 'withdrawal',
  DEPOSIT: 'deposit',
  COMMISSION: 'commission',
  BONUS: 'bonus',
  ADJUSTMENT: 'adjustment',
  FEE: 'fee',
  CHARGEBACK: 'chargeback'
};

// Currency codes
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  INR: 'INR',
  JPY: 'JPY',
  CNY: 'CNY',
  AUD: 'AUD',
  CAD: 'CAD',
  SGD: 'SGD',
  AED: 'AED',
  SAR: 'SAR',
  CHF: 'CHF',
  NZD: 'NZD',
  HKD: 'HKD',
  KRW: 'KRW',
  RUB: 'RUB',
  BRL: 'BRL',
  ZAR: 'ZAR'
};

// Withdrawal methods
export const WITHDRAWAL_METHODS = {
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  UPI: 'upi',
  PAYONEER: 'payoneer',
  WISE: 'wise',
  CRYPTO: 'crypto',
  STRIPE: 'stripe',
  RAZORPAY: 'razorpay'
};

// Withdrawal statuses
export const WITHDRAWAL_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  ON_HOLD: 'on_hold'
};

// Card types
export const CARD_TYPES = {
  VISA: 'visa',
  MASTERCARD: 'mastercard',
  AMEX: 'amex',
  DISCOVER: 'discover',
  DINERS: 'diners',
  JCB: 'jcb',
  RUPAY: 'rupay'
};

// UPI apps
export const UPI_APPS = {
  GOOGLE_PAY: 'google_pay',
  PHONEPE: 'phonepe',
  PAYTM: 'paytm',
  BHIM: 'bhim',
  AMAZON_PAY: 'amazon_pay'
};

// Crypto networks
export const CRYPTO_NETWORKS = {
  BITCOIN: 'bitcoin',
  ETHEREUM: 'ethereum',
  BSC: 'bsc',
  POLYGON: 'polygon',
  SOLANA: 'solana',
  RIPPLE: 'ripple',
  LITECOIN: 'litecoin',
  DOGECOIN: 'dogecoin',
  USDT: 'usdt',
  USDC: 'usdc'
};

// Fee structures
export const FEE_STRUCTURES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  TIERED: 'tiered',
  CUSTOM: 'custom'
};

// Default fees by gateway
export const DEFAULT_FEES = {
  [PAYMENT_GATEWAYS.STRIPE]: { percentage: 2.9, fixed: 0.3 },
  [PAYMENT_GATEWAYS.PAYPAL]: { percentage: 3.5, fixed: 0.49 },
  [PAYMENT_GATEWAYS.RAZORPAY]: { percentage: 2.0, fixed: 0 },
  [PAYMENT_GATEWAYS.CASHFREE]: { percentage: 1.9, fixed: 0 },
  [PAYMENT_GATEWAYS.PAYU]: { percentage: 2.0, fixed: 0 },
  [PAYMENT_GATEWAYS.INSTAMOJO]: { percentage: 2.0, fixed: 0 },
  [PAYMENT_GATEWAYS.CCAVENUE]: { percentage: 2.5, fixed: 0 },
  [PAYMENT_GATEWAYS.BILLDESK]: { percentage: 2.0, fixed: 0 },
  [PAYMENT_GATEWAYS.PHONEPE]: { percentage: 1.9, fixed: 0 },
  [PAYMENT_GATEWAYS.CRYPTO]: { percentage: 1.0, fixed: 0 }
};

// Minimum withdrawal amounts
export const MINIMUM_WITHDRAWALS = {
  [WITHDRAWAL_METHODS.PAYPAL]: 10,
  [WITHDRAWAL_METHODS.BANK_TRANSFER]: 25,
  [WITHDRAWAL_METHODS.UPI]: 10,
  [WITHDRAWAL_METHODS.PAYONEER]: 20,
  [WITHDRAWAL_METHODS.WISE]: 20,
  [WITHDRAWAL_METHODS.CRYPTO]: 50,
  [WITHDRAWAL_METHODS.STRIPE]: 10,
  [WITHDRAWAL_METHODS.RAZORPAY]: 10
};

// Maximum withdrawal amounts
export const MAXIMUM_WITHDRAWALS = {
  [WITHDRAWAL_METHODS.PAYPAL]: 50000,
  [WITHDRAWAL_METHODS.BANK_TRANSFER]: 1000000,
  [WITHDRAWAL_METHODS.UPI]: 100000,
  [WITHDRAWAL_METHODS.PAYONEER]: 50000,
  [WITHDRAWAL_METHODS.WISE]: 50000,
  [WITHDRAWAL_METHODS.CRYPTO]: 100000,
  [WITHDRAWAL_METHODS.STRIPE]: 50000,
  [WITHDRAWAL_METHODS.RAZORPAY]: 50000
};

// Processing times (in hours)
export const PROCESSING_TIMES = {
  [WITHDRAWAL_METHODS.PAYPAL]: 24,
  [WITHDRAWAL_METHODS.BANK_TRANSFER]: 72,
  [WITHDRAWAL_METHODS.UPI]: 24,
  [WITHDRAWAL_METHODS.PAYONEER]: 48,
  [WITHDRAWAL_METHODS.WISE]: 48,
  [WITHDRAWAL_METHODS.CRYPTO]: 1,
  [WITHDRAWAL_METHODS.STRIPE]: 24,
  [WITHDRAWAL_METHODS.RAZORPAY]: 24
};

// Create axios instance for payment service
const paymentApi = axios.create({
  baseURL: `${API_URL}/payments`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
paymentApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
paymentApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        });

        if (response.data.success) {
          localStorage.setItem('auth_token', response.data.token);
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return paymentApi(originalRequest);
        }
      } catch (refreshError) {
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to handle API errors
const handleError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    const message = data.message || data.error || 'Payment processing error';
    
    switch (status) {
      case 400:
        throw new Error(`Invalid Request: ${message}`);
      case 401:
        throw new Error('Unauthorized: Please login again');
      case 403:
        throw new Error('Forbidden: You don\'t have permission');
      case 404:
        throw new Error('Not Found: Payment data not found');
      case 409:
        throw new Error(`Conflict: ${message}`);
      case 422:
        throw new Error(`Validation Error: ${message}`);
      case 429:
        throw new Error('Too Many Requests: Please try again later');
      case 500:
        throw new Error('Server Error: Please try again later');
      default:
        throw new Error(message);
    }
  } else if (error.request) {
    throw new Error('Network Error: Please check your internet connection');
  } else {
    throw new Error(error.message || 'An unexpected error occurred');
  }
};

// Helper function to format transaction data
const formatTransaction = (transaction) => {
  return {
    id: transaction._id || transaction.id,
    userId: transaction.userId,
    
    // Transaction details
    amount: transaction.amount || 0,
    currency: transaction.currency || CURRENCIES.USD,
    type: transaction.type || TRANSACTION_TYPES.PAYMENT,
    status: transaction.status || PAYMENT_STATUSES.PENDING,
    
    // Payment info
    gateway: transaction.gateway,
    method: transaction.method,
    gatewayTransactionId: transaction.gatewayTransactionId,
    
    // Customer info
    customerEmail: transaction.customerEmail,
    customerName: transaction.customerName,
    customerPhone: transaction.customerPhone,
    
    // Product info
    productId: transaction.productId,
    productName: transaction.productName,
    quantity: transaction.quantity || 1,
    
    // Fees and net amount
    fees: transaction.fees || 0,
    tax: transaction.tax || 0,
    netAmount: transaction.netAmount || transaction.amount,
    
    // Refund info
    refundedAmount: transaction.refundedAmount || 0,
    refundReason: transaction.refundReason,
    refundedAt: transaction.refundedAt,
    
    // Metadata
    metadata: transaction.metadata || {},
    webhookData: transaction.webhookData,
    
    // Dates
    createdAt: transaction.createdAt || new Date().toISOString(),
    updatedAt: transaction.updatedAt || new Date().toISOString(),
    completedAt: transaction.completedAt
  };
};
// Payment Service Class
class PaymentService {
  // ==================== Payment Processing ====================

  // Initialize payment
  async initializePayment(paymentData) {
    try {
      const response = await paymentApi.post('/initialize', paymentData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.paymentIntent,
          gatewayData: response.data.gatewayData,
          clientSecret: response.data.clientSecret
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to initialize payment'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Process payment
  async processPayment(paymentData) {
    try {
      const response = await paymentApi.post('/process', paymentData);
      
      if (response.data.success) {
        return {
          success: true,
          data: formatTransaction(response.data.transaction),
          receipt: response.data.receipt
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Payment processing failed'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Confirm payment
  async confirmPayment(paymentIntentId, gatewayData = {}) {
    try {
      const response = await paymentApi.post('/confirm', {
        paymentIntentId,
        ...gatewayData
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: formatTransaction(response.data.transaction),
          receipt: response.data.receipt
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Payment confirmation failed'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Cancel payment
  async cancelPayment(paymentIntentId) {
    try {
      const response = await paymentApi.post(`/cancel/${paymentIntentId}`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Payment cancelled successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to cancel payment'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get payment status
  async getPaymentStatus(paymentIntentId) {
    try {
      const response = await paymentApi.get(`/status/${paymentIntentId}`);
      
      if (response.data.success) {
        return {
          success: true,
          status: response.data.status,
          transaction: formatTransaction(response.data.transaction)
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get payment status'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Transaction Management ====================

  // Get transactions
  async getTransactions(filters = {}, page = 1, limit = 20) {
    try {
      const response = await paymentApi.get('/transactions', {
        params: { ...filters, page, limit }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.transactions.map(formatTransaction),
          pagination: response.data.pagination,
          total: response.data.total,
          summary: response.data.summary
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get transactions'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get transaction by ID
  async getTransactionById(transactionId) {
    try {
      const response = await paymentApi.get(`/transactions/${transactionId}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: formatTransaction(response.data.transaction)
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get transaction'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get transaction by gateway ID
  async getTransactionByGatewayId(gatewayTransactionId) {
    try {
      const response = await paymentApi.get('/transactions/gateway', {
        params: { gatewayTransactionId }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: formatTransaction(response.data.transaction)
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get transaction'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get transaction statistics
  async getTransactionStats(period = '30days') {
    try {
      const response = await paymentApi.get('/transactions/stats', {
        params: { period }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.stats
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get transaction stats'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get transaction timeline
  async getTransactionTimeline(transactionId) {
    try {
      const response = await paymentApi.get(`/transactions/${transactionId}/timeline`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.timeline
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get transaction timeline'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Refunds ====================

  // Process refund
  async processRefund(transactionId, refundData) {
    try {
      const response = await paymentApi.post(`/refunds/${transactionId}`, refundData);
      
      if (response.data.success) {
        return {
          success: true,
          data: formatTransaction(response.data.refund),
          message: response.data.message || 'Refund processed successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to process refund'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get refunds
  async getRefunds(filters = {}, page = 1, limit = 20) {
    try {
      const response = await paymentApi.get('/refunds', {
        params: { ...filters, page, limit }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.refunds.map(formatTransaction),
          pagination: response.data.pagination,
          total: response.data.total
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get refunds'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get refund by ID
  async getRefundById(refundId) {
    try {
      const response = await paymentApi.get(`/refunds/${refundId}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: formatTransaction(response.data.refund)
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get refund'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Invoices ====================

  // Generate invoice
  async generateInvoice(transactionId, options = {}) {
    try {
      const response = await paymentApi.post(`/invoices/${transactionId}/generate`, options);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.invoice,
          url: response.data.url
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to generate invoice'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get invoices
  async getInvoices(filters = {}, page = 1, limit = 20) {
    try {
      const response = await paymentApi.get('/invoices', {
        params: { ...filters, page, limit }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.invoices,
          pagination: response.data.pagination
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get invoices'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Download invoice
  async downloadInvoice(invoiceId, format = 'pdf') {
    try {
      const response = await paymentApi.get(`/invoices/${invoiceId}/download`, {
        params: { format },
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        filename: response.headers['content-disposition']?.split('filename=')[1] || `invoice-${invoiceId}.${format}`
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Email invoice
  async emailInvoice(invoiceId, email, message = '') {
    try {
      const response = await paymentApi.post(`/invoices/${invoiceId}/email`, {
        email,
        message
      });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Invoice emailed successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to email invoice'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Receipts ====================

  // Generate receipt
  async generateReceipt(transactionId) {
    try {
      const response = await paymentApi.post(`/receipts/${transactionId}/generate`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.receipt,
          url: response.data.url
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to generate receipt'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get receipts
  async getReceipts(filters = {}, page = 1, limit = 20) {
    try {
      const response = await paymentApi.get('/receipts', {
        params: { ...filters, page, limit }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.receipts,
          pagination: response.data.pagination
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get receipts'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Download receipt
  async downloadReceipt(receiptId, format = 'pdf') {
    try {
      const response = await paymentApi.get(`/receipts/${receiptId}/download`, {
        params: { format },
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        filename: response.headers['content-disposition']?.split('filename=')[1] || `receipt-${receiptId}.${format}`
      };
    } catch (error) {
      throw handleError(error);
    }
      // ==================== Withdrawals ====================

  // Request withdrawal
  async requestWithdrawal(withdrawalData) {
    try {
      const response = await paymentApi.post('/withdrawals/request', withdrawalData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.withdrawal,
          message: response.data.message || 'Withdrawal requested successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to request withdrawal'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get withdrawals
  async getWithdrawals(filters = {}, page = 1, limit = 20) {
    try {
      const response = await paymentApi.get('/withdrawals', {
        params: { ...filters, page, limit }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.withdrawals,
          pagination: response.data.pagination,
          total: response.data.total,
          summary: response.data.summary
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get withdrawals'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get withdrawal by ID
  async getWithdrawalById(withdrawalId) {
    try {
      const response = await paymentApi.get(`/withdrawals/${withdrawalId}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.withdrawal
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get withdrawal'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Cancel withdrawal
  async cancelWithdrawal(withdrawalId) {
    try {
      const response = await paymentApi.post(`/withdrawals/${withdrawalId}/cancel`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Withdrawal cancelled successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to cancel withdrawal'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get withdrawal methods
  async getWithdrawalMethods() {
    try {
      const response = await paymentApi.get('/withdrawals/methods');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.methods,
          minimums: response.data.minimums,
          maximums: response.data.maximums,
          processingTimes: response.data.processingTimes
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get withdrawal methods'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get withdrawal limits
  async getWithdrawalLimits() {
    try {
      const response = await paymentApi.get('/withdrawals/limits');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.limits
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get withdrawal limits'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Payment Methods ====================

  // Add payment method
  async addPaymentMethod(methodData) {
    try {
      const response = await paymentApi.post('/methods/add', methodData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.method,
          message: response.data.message || 'Payment method added successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to add payment method'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get payment methods
  async getPaymentMethods() {
    try {
      const response = await paymentApi.get('/methods');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.methods
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get payment methods'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get payment method by ID
  async getPaymentMethodById(methodId) {
    try {
      const response = await paymentApi.get(`/methods/${methodId}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.method
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get payment method'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Update payment method
  async updatePaymentMethod(methodId, methodData) {
    try {
      const response = await paymentApi.put(`/methods/${methodId}`, methodData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.method,
          message: response.data.message || 'Payment method updated successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to update payment method'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Delete payment method
  async deletePaymentMethod(methodId) {
    try {
      const response = await paymentApi.delete(`/methods/${methodId}`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Payment method deleted successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to delete payment method'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Set default payment method
  async setDefaultPaymentMethod(methodId) {
    try {
      const response = await paymentApi.post(`/methods/${methodId}/default`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Default payment method set'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to set default payment method'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Webhook Handling ====================

  // Handle webhook (for server-side)
  async handleWebhook(gateway, payload, signature) {
    try {
      const response = await paymentApi.post('/webhook', {
        gateway,
        payload,
        signature
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Webhook handling failed'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Verify webhook signature
  async verifyWebhookSignature(gateway, payload, signature) {
    try {
      const response = await paymentApi.post('/webhook/verify', {
        gateway,
        payload,
        signature
      });
      
      return {
        success: response.data.valid,
        data: response.data
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Balance Management ====================

  // Get balance
  async getBalance() {
    try {
      const response = await paymentApi.get('/balance');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.balance
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get balance'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get balance history
  async getBalanceHistory(period = '30days') {
    try {
      const response = await paymentApi.get('/balance/history', {
        params: { period }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.history
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get balance history'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Payouts (Admin) ====================

  // Process payout (admin only)
  async processPayout(withdrawalId, transactionData = {}) {
    try {
      const response = await paymentApi.post(`/admin/payouts/${withdrawalId}/process`, transactionData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.payout,
          message: response.data.message || 'Payout processed successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to process payout'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Bulk process payouts (admin only)
  async bulkProcessPayouts(withdrawalIds) {
    try {
      const response = await paymentApi.post('/admin/payouts/bulk-process', { withdrawalIds });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.results,
          message: response.data.message || 'Payouts processed successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to process payouts'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Reject payout (admin only)
  async rejectPayout(withdrawalId, reason) {
    try {
      const response = await paymentApi.post(`/admin/payouts/${withdrawalId}/reject`, { reason });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Payout rejected'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to reject payout'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get payout summary (admin only)
  async getPayoutSummary(period = '30days') {
    try {
      const response = await paymentApi.get('/admin/payouts/summary', {
        params: { period }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.summary
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get payout summary'
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Export transactions (admin only)
  async exportTransactions(format = 'csv', filters = {}) {
    try {
      const response = await paymentApi.get('/admin/export', {
        params: { format, ...filters },
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        filename: response.headers['content-disposition']?.split('filename=')[1] || `transactions.${format}`
      };
    } catch (error) {
      throw handleError(error);
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();

// Export API instance for custom requests
export { paymentApi };

// Helper functions
export const paymentHelpers = {
  // Calculate fees
  calculateFees: (amount, gateway, customFees = null) => {
    const fees = customFees || DEFAULT_FEES[gateway] || { percentage: 2.9, fixed: 0.3 };
    const percentageFee = amount * (fees.percentage / 100);
    const totalFee = percentageFee + fees.fixed;
    return {
      percentage: percentageFee,
      fixed: fees.fixed,
      total: totalFee,
      netAmount: amount - totalFee
    };
  },

  // Format currency
  formatCurrency: (amount, currency = CURRENCIES.USD) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  },

  // Get card type from number
  getCardType: (cardNumber) => {
    const patterns = {
      [CARD_TYPES.VISA]: /^4/,
      [CARD_TYPES.MASTERCARD]: /^5[1-5]/,
      [CARD_TYPES.AMEX]: /^3[47]/,
      [CARD_TYPES.DISCOVER]: /^6(?:011|5)/,
      [CARD_TYPES.DINERS]: /^3(?:0[0-5]|[68])/,
      [CARD_TYPES.JCB]: /^(?:2131|1800|35)/,
      [CARD_TYPES.RUPAY]: /^(?:508[5-9]|6069|607[0-9]|608[0-9]|652[1-9]|653[0-9])/
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cardNumber.replace(/\s/g, ''))) {
        return type;
      }
    }
    return null;
  },

  // Mask card number
  maskCardNumber: (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    const last4 = cleaned.slice(-4);
    const masked = '•'.repeat(cleaned.length - 4) + last4;
    
    // Add spaces every 4 digits
    return masked.match(/.{1,4}/g)?.join(' ') || masked;
  },

  // Format expiry date
  formatExpiryDate: (month, year) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  },

  // Validate expiry date
  validateExpiryDate: (month, year) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    return true;
  },

  // Get payment status color
  getStatusColor: (status) => {
    const colors = {
      [PAYMENT_STATUSES.PENDING]: '#ffc107',
      [PAYMENT_STATUSES.PROCESSING]: '#17a2b8',
      [PAYMENT_STATUSES.COMPLETED]: '#28a745',
      [PAYMENT_STATUSES.FAILED]: '#dc3545',
      [PAYMENT_STATUSES.REFUNDED]: '#6c757d',
      [PAYMENT_STATUSES.PARTIALLY_REFUNDED]: '#ff8c00',
      [PAYMENT_STATUSES.CANCELLED]: '#dc3545',
      [PAYMENT_STATUSES.DISPUTED]: '#dc3545',
      [PAYMENT_STATUSES.CHARGEBACK]: '#dc3545',
      [PAYMENT_STATUSES.ON_HOLD]: '#ffc107',
      [PAYMENT_STATUSES.AUTHORIZED]: '#17a2b8',
      [PAYMENT_STATUSES.CAPTURED]: '#28a745'
    };
    return colors[status] || '#6c757d';
  },

  // Get payment method icon
  getPaymentMethodIcon: (method) => {
    const icons = {
      [PAYMENT_METHODS.CREDIT_CARD]: '💳',
      [PAYMENT_METHODS.DEBIT_CARD]: '💳',
      [PAYMENT_METHODS.NET_BANKING]: '🏦',
      [PAYMENT_METHODS.UPI]: '📱',
      [PAYMENT_METHODS.WALLET]: '👛',
      [PAYMENT_METHODS.PAYPAL]: '🅿️',
      [PAYMENT_METHODS.CRYPTO]: '₿',
      [PAYMENT_METHODS.BANK_TRANSFER]: '🏦',
      [PAYMENT_METHODS.CASH]: '💵',
      [PAYMENT_METHODS.CHECK]: '📝',
      [PAYMENT_METHODS.GIFT_CARD]: '🎁'
    };
    return icons[method] || '💳';
  },

  // Generate UPI QR code
  generateUpiQrCode: (upiId, amount, name, note = '') => {
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;
    return upiUrl;
  },

  // Parse UPI payment response
  parseUpiResponse: (response) => {
    const params = new URLSearchParams(response);
    return {
      transactionId: params.get('txnId'),
      referenceId: params.get('refId'),
      status: params.get('status'),
      amount: parseFloat(params.get('amount')),
      payerName: params.get('payerName'),
      payerAccount: params.get('payerAccount'),
      timestamp: params.get('timestamp')
    };
  },

  // Calculate tax amount
  calculateTax: (amount, taxRate) => {
    return amount * (taxRate / 100);
  },

  // Calculate total with tax
  calculateTotalWithTax: (amount, taxRate) => {
    const tax = amount * (taxRate / 100);
    return amount + tax;
  },

  // Split payment between multiple methods
  splitPayment: (totalAmount, splits) => {
    const remaining = splits.reduce((sum, split) => sum + split.amount, 0);
    if (Math.abs(remaining - totalAmount) > 0.01) {
      throw new Error('Split amounts do not sum to total');
    }
    return splits;
  }
};

// Export constants
export const PAYMENT_CONSTANTS = {
  GATEWAYS: PAYMENT_GATEWAYS,
  METHODS: PAYMENT_METHODS,
  STATUSES: PAYMENT_STATUSES,
  TRANSACTION_TYPES,
  CURRENCIES,
  WITHDRAWAL_METHODS,
  WITHDRAWAL_STATUSES,
  CARD_TYPES,
  UPI_APPS,
  CRYPTO_NETWORKS,
  FEE_STRUCTURES,
  DEFAULT_FEES,
  MINIMUM_WITHDRAWALS,
  MAXIMUM_WITHDRAWALS,
  PROCESSING_TIMES
};

export default paymentService;
        
