import api, { get, post, put, del } from './axios';

// ============================================
// Payment API Endpoints
// ============================================

/**
 * Get wallet information
 * @returns {Promise<Object>} Wallet data
 */
export const getWalletInfo = async () => {
  try {
    const response = await get('/payments/wallet');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch wallet info',
      status: error.status
    };
  }
};

/**
 * Get transaction history
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number
 * @param {number} [params.limit] - Items per page
 * @param {string} [params.startDate] - Start date
 * @param {string} [params.endDate] - End date
 * @param {string} [params.type] - Transaction type
 * @param {string} [params.status] - Transaction status
 * @returns {Promise<Object>} Transaction history
 */
export const getTransactionHistory = async (params = {}) => {
  try {
    const response = await get('/payments/transactions', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch transaction history',
      status: error.status
    };
  }
};

/**
 * Get transaction by ID
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} Transaction details
 */
export const getTransactionById = async (transactionId) => {
  try {
    const response = await get(`/payments/transactions/${transactionId}`);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch transaction',
      status: error.status
    };
  }
};

/**
 * Get current balance
 * @returns {Promise<Object>} Balance data
 */
export const getBalance = async () => {
  try {
    const response = await get('/payments/balance');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch balance',
      status: error.status
    };
  }
};

/**
 * Get all withdrawals
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number
 * @param {number} [params.limit] - Items per page
 * @param {string} [params.status] - Withdrawal status
 * @returns {Promise<Object>} Withdrawals list
 */
export const getWithdrawals = async (params = {}) => {
  try {
    const response = await get('/payments/withdrawals', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch withdrawals',
      status: error.status
    };
  }
};

/**
 * Get withdrawal by ID
 * @param {string} withdrawalId - Withdrawal ID
 * @returns {Promise<Object>} Withdrawal details
 */
export const getWithdrawalById = async (withdrawalId) => {
  try {
    const response = await get(`/payments/withdrawals/${withdrawalId}`);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch withdrawal',
      status: error.status
    };
  }
};

/**
 * Request withdrawal
 * @param {Object} withdrawalData - Withdrawal request data
 * @param {number} withdrawalData.amount - Amount to withdraw
 * @param {string} withdrawalData.method - Payment method
 * @param {Object} withdrawalData.paymentDetails - Payment details
 * @param {string} [withdrawalData.notes] - Additional notes
 * @returns {Promise<Object>} Withdrawal request response
 */
export const requestWithdrawal = async (withdrawalData) => {
  try {
    const response = await post('/payments/withdrawals/request', withdrawalData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Withdrawal request submitted'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to request withdrawal',
      status: error.status
    };
  }
};

/**
 * Cancel withdrawal request
 * @param {string} withdrawalId - Withdrawal ID
 * @returns {Promise<Object>} Cancellation response
 */
export const cancelWithdrawal = async (withdrawalId) => {
  try {
    const response = await del(`/payments/withdrawals/${withdrawalId}/cancel`);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Withdrawal cancelled'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to cancel withdrawal',
      status: error.status
    };
  }
};

/**
 * Get all payment methods
 * @returns {Promise<Object>} Payment methods list
 */
export const getPaymentMethods = async () => {
  try {
    const response = await get('/payments/payment-methods');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch payment methods',
      status: error.status
    };
  }
};

/**
 * Get payment method by ID
 * @param {string} methodId - Payment method ID
 * @returns {Promise<Object>} Payment method details
 */
export const getPaymentMethodById = async (methodId) => {
  try {
    const response = await get(`/payments/payment-methods/${methodId}`);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch payment method',
      status: error.status
    };
  }
};

/**
 * Add payment method
 * @param {Object} methodData - Payment method data
 * @param {string} methodData.type - Payment method type (paypal, bank, upi, card)
 * @param {Object} methodData.details - Payment method details
 * @param {boolean} [methodData.setDefault] - Set as default method
 * @returns {Promise<Object>} Added payment method
 */
export const addPaymentMethod = async (methodData) => {
  try {
    const response = await post('/payments/payment-methods', methodData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Payment method added'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to add payment method',
      status: error.status
    };
  }
};

/**
 * Update payment method
 * @param {string} methodId - Payment method ID
 * @param {Object} methodData - Updated payment method data
 * @returns {Promise<Object>} Updated payment method
 */
export const updatePaymentMethod = async (methodId, methodData) => {
  try {
    const response = await put(`/payments/payment-methods/${methodId}`, methodData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Payment method updated'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to update payment method',
      status: error.status
    };
  }
};

/**
 * Delete payment method
 * @param {string} methodId - Payment method ID
 * @returns {Promise<Object>} Deletion response
 */
export const deletePaymentMethod = async (methodId) => {
  try {
    const response = await del(`/payments/payment-methods/${methodId}`);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Payment method deleted'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to delete payment method',
      status: error.status
    };
  }
};

/**
 * Set default payment method
 * @param {string} methodId - Payment method ID
 * @returns {Promise<Object>} Update response
 */
export const setDefaultPaymentMethod = async (methodId) => {
  try {
    const response = await put(`/payments/payment-methods/${methodId}/default`);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Default payment method updated'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to set default payment method',
      status: error.status
    };
  }
};

/**
 * Create Stripe account
 * @returns {Promise<Object>} Stripe account creation response
 */
export const createStripeAccount = async () => {
  try {
    const response = await post('/payments/create-stripe-account');
    return {
      success: true,
      data: response.data,
      message: response.message || 'Stripe account created'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to create Stripe account',
      status: error.status
    };
  }
};

/**
 * Get Stripe dashboard link
 * @returns {Promise<Object>} Stripe dashboard URL
 */
export const getStripeDashboard = async () => {
  try {
    const response = await get('/payments/stripe-dashboard');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to get Stripe dashboard',
      status: error.status
    };
  }
};

/**
 * Create Stripe payment intent
 * @param {Object} paymentData - Payment data
 * @param {number} paymentData.amount - Payment amount
 * @param {string} paymentData.currency - Currency code
 * @returns {Promise<Object>} Payment intent
 */
export const createStripePaymentIntent = async (paymentData) => {
  try {
    const response = await post('/payments/stripe/create-intent', paymentData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Payment intent created'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to create payment intent',
      status: error.status
    };
  }
};

/**
 * Create Stripe checkout session
 * @param {Object} sessionData - Checkout session data
 * @returns {Promise<Object>} Checkout session
 */
export const createStripeCheckoutSession = async (sessionData) => {
  try {
    const response = await post('/payments/stripe/create-checkout', sessionData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Checkout session created'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to create checkout session',
      status: error.status
    };
  }
};

/**
 * Create PayPal payout
 * @param {Object} payoutData - Payout data
 * @param {number} payoutData.amount - Payout amount
 * @param {string} payoutData.email - PayPal email
 * @returns {Promise<Object>} Payout response
 */
export const createPaypalPayout = async (payoutData) => {
  try {
    const response = await post('/payments/create-paypal-payout', payoutData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'PayPal payout created'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to create PayPal payout',
      status: error.status
    };
  }
};

/**
 * Create PayPal order
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} Order response
 */
export const createPaypalOrder = async (orderData) => {
  try {
    const response = await post('/payments/paypal/create-order', orderData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'PayPal order created'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to create PayPal order',
      status: error.status
    };
  }
};

/**
 * Capture PayPal order
 * @param {string} orderId - PayPal order ID
 * @returns {Promise<Object>} Capture response
 */
export const capturePaypalOrder = async (orderId) => {
  try {
    const response = await post(`/payments/paypal/capture-order/${orderId}`);
    return {
      success: true,
      data: response.data,
      message: response.message || 'PayPal order captured'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to capture PayPal order',
      status: error.status
    };
  }
};

/**
 * Get payout settings
 * @returns {Promise<Object>} Payout settings
 */
export const getPayoutSettings = async () => {
  try {
    const response = await get('/payments/payout-settings');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch payout settings',
      status: error.status
    };
  }
};

/**
 * Update payout settings
 * @param {Object} settingsData - Payout settings
 * @returns {Promise<Object>} Updated settings
 */
export const updatePayoutSettings = async (settingsData) => {
  try {
    const response = await put('/payments/payout-settings', settingsData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Payout settings updated'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to update payout settings',
      status: error.status
    };
  }
};

/**
 * Get payment statistics
 * @param {Object} params - Query parameters
 * @param {string} [params.period] - Time period
 * @returns {Promise<Object>} Payment statistics
 */
export const getPaymentStats = async (params = {}) => {
  try {
    const response = await get('/payments/stats', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch payment stats',
      status: error.status
    };
  }
};

/**
 * Get earnings summary
 * @param {Object} params - Query parameters
 * @param {string} [params.period] - Time period
 * @returns {Promise<Object>} Earnings summary
 */
export const getEarningsSummary = async (params = {}) => {
  try {
    const response = await get('/payments/earnings/summary', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch earnings summary',
      status: error.status
    };
  }
};

/**
 * Get commission breakdown
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Commission breakdown
 */
export const getCommissionBreakdown = async (params = {}) => {
  try {
    const response = await get('/payments/commissions/breakdown', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch commission breakdown',
      status: error.status
    };
  }
};

/**
 * Get pending commissions
 * @returns {Promise<Object>} Pending commissions
 */
export const getPendingCommissions = async () => {
  try {
    const response = await get('/payments/commissions/pending');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch pending commissions',
      status: error.status
    };
  }
};

/**
 * Get withdrawal limits
 * @returns {Promise<Object>} Withdrawal limits
 */
export const getWithdrawalLimits = async () => {
  try {
    const response = await get('/payments/withdrawals/limits');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch withdrawal limits',
      status: error.status
    };
  }
};

/**
 * Calculate withdrawal fee
 * @param {number} amount - Withdrawal amount
 * @param {string} method - Payment method
 * @returns {Promise<Object>} Fee calculation
 */
export const calculateWithdrawalFee = async (amount, method) => {
  try {
    const response = await get('/payments/withdrawals/calculate-fee', { amount, method });
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to calculate fee',
      status: error.status
    };
  }
};

/**
 * Verify bank account
 * @param {Object} bankData - Bank account details
 * @returns {Promise<Object>} Verification response
 */
export const verifyBankAccount = async (bankData) => {
  try {
    const response = await post('/payments/verify/bank', bankData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Bank account verified'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to verify bank account',
      status: error.status
    };
  }
};

/**
 * Verify UPI ID
 * @param {string} upiId - UPI ID
 * @returns {Promise<Object>} Verification response
 */
export const verifyUPI = async (upiId) => {
  try {
    const response = await post('/payments/verify/upi', { upiId });
    return {
      success: true,
      data: response.data,
      message: response.message || 'UPI ID verified'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to verify UPI ID',
      status: error.status
    };
  }
};

/**
 * Verify PayPal email
 * @param {string} email - PayPal email
 * @returns {Promise<Object>} Verification response
 */
export const verifyPayPal = async (email) => {
  try {
    const response = await post('/payments/verify/paypal', { email });
    return {
      success: true,
      data: response.data,
      message: response.message || 'PayPal email verified'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to verify PayPal email',
      status: error.status
    };
  }
};

/**
 * Generate withdrawal receipt
 * @param {string} withdrawalId - Withdrawal ID
 * @returns {Promise<Object>} Receipt data
 */
export const generateWithdrawalReceipt = async (withdrawalId) => {
  try {
    const response = await get(`/payments/withdrawals/${withdrawalId}/receipt`, {}, { responseType: 'blob' });
    return {
      success: true,
      data: response.data,
      message: response.message || 'Receipt generated'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to generate receipt',
      status: error.status
    };
  }
};

/**
 * Export payment history
 * @param {string} format - Export format (csv, pdf)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Export file
 */
export const exportPaymentHistory = async (format = 'csv', params = {}) => {
  try {
    const response = await get('/payments/export', { ...params, format }, { responseType: 'blob' });
    return {
      success: true,
      data: response.data,
      message: response.message || 'Payment history exported'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to export payment history',
      status: error.status
    };
  }
};

// ============================================
// Admin payment endpoints
// ============================================

/**
 * Get all payments (admin only)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} All payments
 */
export const getAllPayments = async (params = {}) => {
  try {
    const response = awaitget('/admin/payments', params);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch payments',
      status: error.status
    };
  }
};

/**
 * Process withdrawal (admin only)
 * @param {string} withdrawalId - Withdrawal ID
 * @param {Object} processData - Process data
 * @returns {Promise<Object>} Process response
 */
export const processWithdrawal = async (withdrawalId, processData) => {
  try {
    const response = await put(`/admin/payments/withdrawals/${withdrawalId}/process`, processData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Withdrawal processed'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to process withdrawal',
      status: error.status
    };
  }
};

/**
 * Complete withdrawal (admin only)
 * @param {string} withdrawalId - Withdrawal ID
 * @param {Object} completeData - Completion data
 * @returns {Promise<Object>} Completion response
 */
export const completeWithdrawal = async (withdrawalId, completeData) => {
  try {
    const response = await put(`/admin/payments/withdrawals/${withdrawalId}/complete`, completeData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Withdrawal completed'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to complete withdrawal',
      status: error.status
    };
  }
};

/**
 * Reject withdrawal (admin only)
 * @param {string} withdrawalId - Withdrawal ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Rejection response
 */
export const rejectWithdrawal = async (withdrawalId, reason) => {
  try {
    const response = await put(`/admin/payments/withdrawals/${withdrawalId}/reject`, { reason });
    return {
      success: true,
      data: response.data,
      message: response.message || 'Withdrawal rejected'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to reject withdrawal',
      status: error.status
    };
  }
};

// ============================================
// Export all payment functions
// ============================================

const paymentAPI = {
  getWalletInfo,
  getTransactionHistory,
  getTransactionById,
  getBalance,
  getWithdrawals,
  getWithdrawalById,
  requestWithdrawal,
  cancelWithdrawal,
  getPaymentMethods,
  getPaymentMethodById,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  createStripeAccount,
  getStripeDashboard,
  createStripePaymentIntent,
  createStripeCheckoutSession,
  createPaypalPayout,
  createPaypalOrder,
  capturePaypalOrder,
  getPayoutSettings,
  updatePayoutSettings,
  getPaymentStats,
  getEarningsSummary,
  getCommissionBreakdown,
  getPendingCommissions,
  getWithdrawalLimits,
  calculateWithdrawalFee,
  verifyBankAccount,
  verifyUPI,
  verifyPayPal,
  generateWithdrawalReceipt,
  exportPaymentHistory,
  getAllPayments,
  processWithdrawal,
  completeWithdrawal,
  rejectWithdrawal
};

export default paymentAPI;
