const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const supportController = require('../controllers/supportController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// ============================================
// Validation Rules
// ============================================

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['open', 'assigned', 'in_progress', 'pending', 'resolved', 'closed', 'reopened', 'escalated', 'on_hold', 'spam', 'duplicate'])
    .withMessage('Invalid status filter'),
  query('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent', 'critical'])
    .withMessage('Invalid priority filter'),
  query('category')
    .optional()
    .isIn(['general', 'technical', 'billing', 'account', 'affiliate', 'commission', 'withdrawal', 'referral', 'bug_report', 'feature_request', 'security', 'compliance', 'other'])
    .withMessage('Invalid category'),
  query('sortBy')
    .optional()
    .isString()
    .withMessage('Invalid sort field')
];

const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ticket ID format')
];

const ticketIdValidation = [
  param('ticketId')
    .isMongoId()
    .withMessage('Invalid ticket ID format')
];

const messageIdValidation = [
  param('messageId')
    .isMongoId()
    .withMessage('Invalid message ID format')
];

const createTicketValidation = [
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isString()
    .withMessage('Subject must be a string')
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['general', 'technical', 'billing', 'account', 'affiliate', 'commission', 'withdrawal', 'referral', 'bug_report', 'feature_request', 'security', 'compliance', 'other'])
    .withMessage('Invalid category'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent', 'critical'])
    .withMessage('Invalid priority'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array')
];

const addMessageValidation = [
  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .isString()
    .withMessage('Content must be a string')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message must be between 1 and 5000 characters'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),
  body('isInternal')
    .optional()
    .isBoolean()
    .withMessage('isInternal must be a boolean')
];

const updateStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['open', 'assigned', 'in_progress', 'pending', 'resolved', 'closed', 'reopened', 'escalated', 'on_hold', 'spam', 'duplicate'])
    .withMessage('Invalid status'),
  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string')
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
];

const assignTicketValidation = [
  body('agentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid agent ID format')
];

const updatePriorityValidation = [
  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(['low', 'normal', 'high', 'urgent', 'critical'])
    .withMessage('Invalid priority'),
  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string')
];

const escalateTicketValidation = [
  body('reason')
    .notEmpty()
    .withMessage('Escalation reason is required')
    .isString()
    .withMessage('Reason must be a string')
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters')
];

const rateTicketValidation = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback')
    .optional()
    .isString()
    .withMessage('Feedback must be a string')
    .isLength({ max: 1000 })
    .withMessage('Feedback cannot exceed 1000 characters')
];

const reopenTicketValidation = [
  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string')
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
];

const faqValidation = [
  body('question')
    .notEmpty()
    .withMessage('Question is required')
    .isString()
    .withMessage('Question must be a string')
    .isLength({ min: 5, max: 500 })
    .withMessage('Question must be between 5 and 500 characters'),
  body('answer')
    .notEmpty()
    .withMessage('Answer is required')
    .isString()
    .withMessage('Answer must be a string')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Answer must be between 10 and 5000 characters'),
  body('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a positive integer'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

const announcementValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isString()
    .withMessage('Content must be a string')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
  body('type')
    .optional()
    .isIn(['info', 'warning', 'success', 'error', 'maintenance'])
    .withMessage('Invalid announcement type'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('publishedAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid published date'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiry date'),
  body('targetAudience')
    .optional()
    .isArray()
    .withMessage('Target audience must be an array')
];

const searchValidation = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isString()
    .withMessage('Search query must be a string')
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters')
];

const faqCategoryValidation = [
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string')
];

const formatValidation = [
  query('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage('Format must be json or csv')
];

// ============================================
// Public Routes
// ============================================

/**
 * @route   GET /api/support/faqs
 * @desc    Get FAQs
 * @access  Public
 */
router.get(
  '/faqs',
  faqCategoryValidation,
  query('search')
    .optional()
    .isString()
    .withMessage('Search query must be a string'),
  validate,
  supportController.getFAQs
);

/**
 * @route   GET /api/support/faq-categories
 * @desc    Get FAQ categories
 * @access  Public
 */
router.get(
  '/faq-categories',
  supportController.getFAQCategories
);

/**
 * @route   GET /api/support/faqs/popular
 * @desc    Get popular FAQs
 * @access  Public
 */
router.get(
  '/faqs/popular',
  supportController.getPopularFAQs
);

/**
 * @route   GET /api/support/faqs/:id
 * @desc    Get FAQ by ID
 * @access  Public
 */
router.get(
  '/faqs/:id',
  idValidation,
  validate,
  supportController.getFAQById
);

/**
 * @route   POST /api/support/faqs/:id/view
 * @desc    Record FAQ view
 * @access  Public
 */
router.post(
  '/faqs/:id/view',
  idValidation,
  validate,
  supportController.recordFAQView
);

/**
 * @route   GET /api/support/announcements
 * @desc    Get announcements
 * @access  Public
 */
router.get(
  '/announcements',
  supportController.getAnnouncements
);

/**
 * @route   GET /api/support/announcements/recent
 * @desc    Get recent announcements
 * @access  Public
 */
router.get(
  '/announcements/recent',
  supportController.getRecentAnnouncements
);

/**
 * @route   GET /api/support/announcements/:id
 * @desc    Get announcement by ID
 * @access  Public
 */
router.get(
  '/announcements/:id',
  idValidation,
  validate,
  supportController.getAnnouncementById
);

/**
 * @route   GET /api/support/search
 * @desc    Search knowledge base
 * @access  Public
 */
router.get(
  '/search',
  searchValidation,
  validate,
  supportController.searchKnowledgeBase
);

// ============================================
// Protected Routes (All authenticated users)
// ============================================
router.use(protect);

/**
 * @route   GET /api/support/dashboard
 * @desc    Get support dashboard
 * @access  Private
 */
router.get(
  '/dashboard',
  supportController.getDashboard
);

/**
 * @route   GET /api/support/my-tickets
 * @desc    Get user's tickets
 * @access  Private
 */
router.get(
  '/my-tickets',
  paginationValidation,
  validate,
  supportController.getMyTickets
);

/**
 * @route   GET /api/support/my-stats
 * @desc    Get user's ticket statistics
 * @access  Private
 */
router.get(
  '/my-stats',
  supportController.getMyStats
);

/**
 * @route   GET /api/support/tickets
 * @desc    Get all tickets (admin gets all, users get their own)
 * @access  Private
 */
router.get(
  '/tickets',
  paginationValidation,
  dateRangeValidation,
  query('search')
    .optional()
    .isString()
    .withMessage('Search query must be a string'),
  validate,
  supportController.getTickets
);

/**
 * @route   GET /api/support/tickets/:id
 * @desc    Get ticket by ID
 * @access  Private
 */
router.get(
  '/tickets/:id',
  idValidation,
  validate,
  supportController.getTicketById
);

/**
 * @route   POST /api/support/tickets
 * @desc    Create new ticket
 * @access  Private
 */
router.post(
  '/tickets',
  createTicketValidation,
  validate,
  supportController.createTicket
);

/**
 * @route   POST /api/support/tickets/:id/messages
 * @desc    Add message to ticket
 * @access  Private
 */
router.post(
  '/tickets/:id/messages',
  idValidation,
  addMessageValidation,
  validate,
  supportController.addMessage
);

/**
 * @route   PUT /api/support/tickets/:id/status
 * @desc    Update ticket status
 * @access  Private
 */
router.put(
  '/tickets/:id/status',
  idValidation,
  updateStatusValidation,
  validate,
  supportController.updateStatus
);

/**
 * @route   POST /api/support/tickets/:id/reopen
 * @desc    Reopen ticket
 * @access  Private
 */
router.post(
  '/tickets/:id/reopen',
  idValidation,
  reopenTicketValidation,
  validate,
  supportController.reopenTicket
);

/**
 * @route   POST /api/support/tickets/:id/rate
 * @desc    Rate ticket
 * @access  Private
 */
router.post(
  '/tickets/:id/rate',
  idValidation,
  rateTicketValidation,
  validate,
  supportController.rateTicket
);

/**
 * @route   PUT /api/support/tickets/:ticketId/messages/:messageId/read
 * @desc    Mark message as read
 * @access  Private
 */
router.put(
  '/tickets/:ticketId/messages/:messageId/read',
  ticketIdValidation,
  messageIdValidation,
  validate,
  supportController.markMessageRead
);

// ============================================
// Staff/Admin Routes
// ============================================

/**
 * @route   PUT /api/support/tickets/:id/assign
 * @desc    Assign ticket (staff only)
 * @access  Private/Staff
 */
router.put(
  '/tickets/:id/assign',
  authorize('admin', 'support'),
  idValidation,
  assignTicketValidation,
  validate,
  supportController.assignTicket
);

/**
 * @route   PUT /api/support/tickets/:id/priority
 * @desc    Update priority (staff only)
 * @access  Private/Staff
 */
router.put(
  '/tickets/:id/priority',
  authorize('admin', 'support'),
  idValidation,
  updatePriorityValidation,
  validate,
  supportController.updatePriority
);

/**
 * @route   POST /api/support/tickets/:id/escalate
 * @desc    Escalate ticket (staff only)
 * @access  Private/Staff
 */
router.post(
  '/tickets/:id/escalate',
  authorize('admin', 'support'),
  idValidation,
  escalateTicketValidation,
  validate,
  supportController.escalateTicket
);

/**
 * @route   POST /api/support/tickets/:id/notes
 * @desc    Add internal note (staff only)
 * @access  Private/Staff
 */
router.post(
  '/tickets/:id/notes',
  authorize('admin', 'support'),
  idValidation,
  body('content')
    .notEmpty()
    .withMessage('Note content is required')
    .isString()
    .withMessage('Content must be a string'),
  validate,
  supportController.addInternalNote
);

/**
 * @route   GET /api/support/tickets/:id/history
 * @desc    Get ticket history (staff only)
 * @access  Private/Staff
 */
router.get(
  '/tickets/:id/history',
  authorize('admin', 'support'),
  idValidation,
  validate,
  supportController.getTicketHistory
);

/**
 * @route   GET /api/support/stats
 * @desc    Get support statistics (admin only)
 * @access  Private/Admin
 */
router.get(
  '/stats',
  authorize('admin'),
  supportController.getSupportStats
);

/**
 * @route   GET /api/support/performance
 * @desc    Get support performance metrics (admin only)
 * @access  Private/Admin
 */
router.get(
  '/performance',
  authorize('admin'),
  supportController.getPerformanceMetrics
);

/**
 * @route   GET /api/support/templates
 * @desc    Get ticket templates (staff only)
 * @access  Private/Staff
 */
router.get(
  '/templates',
  authorize('admin', 'support'),
  supportController.getTicketTemplates
);

/**
 * @route   GET /api/support/export
 * @desc    Export tickets (admin only)
 * @access  Private/Admin
 */
router.get(
  '/export',
  authorize('admin'),
  formatValidation,
  dateRangeValidation,
  query('status')
    .optional()
    .isIn(['open', 'assigned', 'in_progress', 'pending', 'resolved', 'closed', 'reopened', 'escalated', 'on_hold', 'spam', 'duplicate'])
    .withMessage('Invalid status filter'),
  validate,
  supportController.exportTickets
);

// ============================================
// FAQ Management Routes (Admin only)
// ============================================

/**
 * @route   POST /api/support/faqs
 * @desc    Create FAQ (admin only)
 * @access  Private/Admin
 */
router.post(
  '/faqs',
  authorize('admin'),
  faqValidation,
  validate,
  supportController.createFAQ
);

/**
 * @route   PUT /api/support/faqs/:id
 * @desc    Update FAQ (admin only)
 * @access  Private/Admin
 */
router.put(
  '/faqs/:id',
  authorize('admin'),
  idValidation,
  faqValidation,
  validate,
  supportController.updateFAQ
);

/**
 * @route   DELETE /api/support/faqs/:id
 * @desc    Delete FAQ (admin only)
 * @access  Private/Admin
 */
router.delete(
  '/faqs/:id',
  authorize('admin'),
  idValidation,
  validate,
  supportController.deleteFAQ
);

// ============================================
// Announcement Management Routes (Admin only)
// ============================================

/**
 * @route   POST /api/support/announcements
 * @desc    Create announcement (admin only)
 * @access  Private/Admin
 */
router.post(
  '/announcements',
  authorize('admin'),
  announcementValidation,
  validate,
  supportController.createAnnouncement
);

/**
 * @route   PUT /api/support/announcements/:id
 * @desc    Update announcement (admin only)
 * @access  Private/Admin
 */
router.put(
  '/announcements/:id',
  authorize('admin'),
  idValidation,
  announcementValidation,
  validate,
  supportController.updateAnnouncement
);

/**
 * @route   DELETE /api/support/announcements/:id
 * @desc    Delete announcement (admin only)
 * @access  Private/Admin
 */
router.delete(
  '/announcements/:id',
  authorize('admin'),
  idValidation,
  validate,
  supportController.deleteAnnouncement
);

module.exports = router;
