const Ticket = require('../models/Ticket');
const User = require('../models/User');
const FAQ = require('../models/FAQ');
const Announcement = require('../models/Announcement');
const Log = require('../models/Log');
const { validationResult } = require('express-validator');
const { sendEmail } = require('../services/emailService');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// ============================================
// Helper Functions
// ============================================

// Log support activity
const logActivity = async (userId, action, details = {}, req = null) => {
  try {
    await Log.create({
      level: 'info',
      category: 'support',
      message: `Support ${action}`,
      user: userId,
      ipAddress: req?.ip,
      userAgent: req?.get('user-agent'),
      audit: {
        action,
        resource: { type: 'support' },
        changes: details,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    logger.error('Error logging support activity:', error);
  }
};

// Generate ticket number
const generateTicketNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // Get count of tickets today
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  const count = await Ticket.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });
  
  const sequence = (count + 1).toString().padStart(4, '0');
  return `TKT-${year}${month}${day}-${sequence}`;
};

// Send ticket notification
const sendTicketNotification = async (user, ticket, type = 'created') => {
  try {
    let subject, message;
    
    switch(type) {
      case 'created':
        subject = `Ticket Created: ${ticket.ticketNumber}`;
        message = `
          <h1>Support Ticket Created</h1>
          <p>Your ticket has been created successfully.</p>
          <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
          <p><strong>Subject:</strong> ${ticket.subject}</p>
          <p><strong>Category:</strong> ${ticket.category}</p>
          <p><strong>Priority:</strong> ${ticket.priority}</p>
          <p>We'll get back to you as soon as possible.</p>
        `;
        break;
      case 'updated':
        subject = `Ticket Updated: ${ticket.ticketNumber}`;
        message = `
          <h1>Ticket Status Updated</h1>
          <p>Your ticket has been updated.</p>
          <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
          <p><strong>New Status:</strong> ${ticket.status}</p>
          <p>Please check your ticket for more details.</p>
        `;
        break;
      case 'message':
        subject = `New Message: ${ticket.ticketNumber}`;
        message = `
          <h1>New Message on Your Ticket</h1>
          <p>There's a new message on your ticket.</p>
          <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
          <p>Please check your ticket to view the message.</p>
        `;
        break;
      case 'resolved':
        subject = `Ticket Resolved: ${ticket.ticketNumber}`;
        message = `
          <h1>Ticket Marked as Resolved</h1>
          <p>Your ticket has been marked as resolved.</p>
          <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
          <p>If you're not satisfied with the resolution, you can reopen the ticket.</p>
        `;
        break;
    }
    
    await sendEmail({
      email: user.email,
      subject,
      html: message
    });
  } catch (error) {
    logger.error('Error sending ticket notification:', error);
  }
};

// ============================================
// @desc    Get support dashboard
// @route   GET /api/support/dashboard
// @access  Private
// ============================================
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    // Get user's tickets
    const userTickets = await Ticket.find({ 
      user: userId, 
      isDeleted: false 
    })
    .sort('-createdAt')
    .limit(5);
    
    // Get ticket statistics
    const ticketStats = await Ticket.aggregate([
      { $match: { user: userId, isDeleted: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get unread messages count
    const unreadMessages = await Ticket.aggregate([
      { $match: { user: userId, isDeleted: false } },
      { $unwind: '$messages' },
      {
        $match: {
          'messages.isStaff': true,
          'messages.isReadByUser': false
        }
      },
      { $count: 'total' }
    ]);
    
    // Get recent announcements
    const recentAnnouncements = await Announcement.find({ 
      isActive: true,
      publishedAt: { $lte: Date.now() }
    })
    .sort('-publishedAt')
    .limit(3);
    
    // Get FAQs by category
    const faqsByCategory = await FAQ.aggregate([
      { $match: { isActive: true, isDeleted: false } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      dashboard: {
        recentTickets: userTickets,
        ticketStats,
        unreadMessages: unreadMessages[0]?.total || 0,
        announcements: recentAnnouncements,
        faqCategories: faqsByCategory
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_dashboard', {}, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get all tickets
// @route   GET /api/support/tickets
// @access  Private
// ============================================
exports.getTickets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const { 
      page = 1, 
      limit = 20, 
      status, 
      priority, 
      category,
      search,
      sortBy = '-createdAt' 
    } = req.query;
    
    const query = { isDeleted: false };
    
    // Non-admin users can only see their own tickets
    if (!isAdmin) {
      query.user = userId;
    }
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    
    if (search) {
      query.$or = [
        { ticketNumber: new RegExp(search, 'i') },
        { subject: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortBy,
      populate: [
        { path: 'user', select: 'name email' },
        { path: 'assignedTo', select: 'name email' }
      ]
    };
    
    const tickets = await Ticket.paginate(query, options);
    
    res.status(200).json({
      success: true,
      tickets: tickets.docs,
      totalPages: tickets.totalPages,
      totalDocs: tickets.totalDocs,
      page: tickets.page,
      limit: tickets.limit
    });
    
    // Log activity
    await logActivity(userId, 'view_tickets', { page, limit }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get ticket by ID
// @route   GET /api/support/tickets/:id
// @access  Private
// ============================================
exports.getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    const query = { _id: id, isDeleted: false };
    if (!isAdmin) query.user = userId;
    
    const ticket = await Ticket.findOne(query)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email')
      .populate('messages.user', 'name email role');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // Mark messages as read
    const userField = isAdmin ? 'isReadByStaff' : 'isReadByUser';
    let updated = false;
    
    ticket.messages.forEach(msg => {
      if (!msg[userField]) {
        msg[userField] = true;
        updated = true;
      }
    });
    
    if (updated) {
      await ticket.save();
    }
    
    res.status(200).json({
      success: true,
      ticket
    });
    
    // Log activity
    await logActivity(userId, 'view_ticket_details', { ticketId: id }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Create new ticket
// @route   POST /api/support/tickets
// @access  Private
// ============================================
exports.createTicket = async (req, res, next) => {
  try {
    const { subject, category, description, priority = 'normal', attachments } = req.body;
    const userId = req.user.id;
    
    // Generate ticket number
    const ticketNumber = await generateTicketNumber();
    
    // Create ticket
    const ticket = await Ticket.create({
      ticketNumber,
      user: userId,
      subject,
      category,
      description,
      priority,
      status: 'open',
      messages: [{
        messageNumber: 1,
        user: userId,
        content: description,
        attachments: attachments || [],
        isAutomated: false
      }],
      activityLog: [{
        action: 'created',
        performedBy: userId,
        description: 'Ticket created',
        createdAt: Date.now()
      }]
    });
    
    // Send notification
    await sendTicketNotification(req.user, ticket, 'created');
    
    // Log activity
    await logActivity(userId, 'create_ticket', { ticketId: ticket._id }, req);
    
    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      ticket
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Add message to ticket
// @route   POST /api/support/tickets/:id/messages
// @access  Private
// ============================================
exports.addMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, attachments, isInternal = false } = req.body;
    const userId = req.user.id;
    const isStaff = req.user.role === 'admin' || req.user.role === 'support';
    
    const ticket = await Ticket.findOne({ 
      _id: id, 
      isDeleted: false 
    }).populate('user');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // Check permissions
    if (ticket.user.toString() !== userId && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add messages to this ticket'
      });
    }
    
    // Add message
    const messageNumber = ticket.messages.length + 1;
    
    const newMessage = {
      messageNumber,
      user: userId,
      isStaff,
      content,
      attachments: attachments || [],
      isInternal: isInternal && isStaff,
      createdAt: Date.now()
    };
    
    ticket.messages.push(newMessage);
    
    // Update ticket status if opened by user
    if (!isStaff && ticket.status === 'resolved') {
      ticket.status = 'reopened';
    }
    
    // Update read status
    if (isStaff) {
      ticket.isReadByStaff = true;
      ticket.isReadByUser = false;
    } else {
      ticket.isReadByUser = true;
      ticket.isReadByStaff = false;
    }
    
    // Update last response
    if (isStaff) {
      ticket.timeTracking.lastResponseAt = Date.now();
      ticket.timeTracking.lastResponseBy = userId;
      
      if (!ticket.timeTracking.firstResponseAt) {
        ticket.timeTracking.firstResponseAt = Date.now();
        ticket.timeTracking.firstResponseBy = userId;
        ticket.timeTracking.firstResponseTime = Math.floor((Date.now() - ticket.createdAt) / (1000 * 60));
      }
    }
    
    await ticket.save();
    
    // Send notification
    await sendTicketNotification(
      isStaff ? ticket.user : { email: req.user.email }, 
      ticket, 
      'message'
    );
    
    // Log activity
    await logActivity(userId, 'add_message', { ticketId: id, messageNumber }, req);
    
    res.status(200).json({
      success: true,
      message: 'Message added successfully',
      ticket
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update ticket status
// @route   PUT /api/support/tickets/:id/status
// @access  Private
// ============================================
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const userId = req.user.id;
    const isStaff = req.user.role === 'admin' || req.user.role === 'support';
    
    const ticket = await Ticket.findOne({ 
      _id: id, 
      isDeleted: false 
    }).populate('user');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // Check permissions
    if (ticket.user.toString() !== userId && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this ticket'
      });
    }
    
    const oldStatus = ticket.status;
    ticket.status = status;
    
    // Update timestamps
    if (status === 'resolved') {
      ticket.timeTracking.resolvedAt = Date.now();
      ticket.timeTracking.resolvedBy = userId;
      ticket.timeTracking.resolutionTime = Math.floor((Date.now() - ticket.createdAt) / (1000 * 60));
    } else if (status === 'closed') {
      ticket.timeTracking.closedAt = Date.now();
      ticket.timeTracking.closedBy = userId;
      ticket.timeTracking.totalTimeOpen = Math.floor((Date.now() - ticket.createdAt) / (1000 * 60));
    }
    
    // Add to activity log
    ticket.activityLog.push({
      action: 'status_changed',
      performedBy: userId,
      oldValue: oldStatus,
      newValue: status,
      description: reason || `Status changed from ${oldStatus} to ${status}`,
      createdAt: Date.now()
    });
    
    await ticket.save();
    
    // Send notification
    if (status === 'resolved') {
      await sendTicketNotification(ticket.user, ticket, 'resolved');
    } else {
      await sendTicketNotification(ticket.user, ticket, 'updated');
    }
    
    // Log activity
    await logActivity(userId, 'update_status', { ticketId: id, oldStatus, newStatus: status }, req);
    
    res.status(200).json({
      success: true,
      message: 'Ticket status updated successfully',
      ticket
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Assign ticket (Staff only)
// @route   PUT /api/support/tickets/:id/assign
// @access  Private (Staff only)
// ============================================
exports.assignTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;
    const userId = req.user.id;
    
    const ticket = await Ticket.findOne({ 
      _id: id, 
      isDeleted: false 
    });
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    const oldAssignee = ticket.assignedTo;
    ticket.assignedTo = agentId || userId;
    ticket.status = 'assigned';
    
    // Add to activity log
    ticket.activityLog.push({
      action: 'assigned',
      performedBy: userId,
      oldValue: oldAssignee,
      newValue: ticket.assignedTo,
      description: `Ticket assigned to ${agentId ? 'agent' : 'you'}`,
      createdAt: Date.now()
    });
    
    await ticket.save();
    
    // Log activity
    await logActivity(userId, 'assign_ticket', { ticketId: id, agentId: ticket.assignedTo }, req);
    
    res.status(200).json({
      success: true,
      message: 'Ticket assigned successfully',
      ticket
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update priority (Staff only)
// @route   PUT /api/support/tickets/:id/priority
// @access  Private (Staff only)
// ============================================
exports.updatePriority = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { priority, reason } = req.body;
    const userId = req.user.id;
    
    const ticket = await Ticket.findOne({ 
      _id: id, 
      isDeleted: false 
    });
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    const oldPriority = ticket.priority;
    ticket.priority = priority;
    
    // Add to activity log
    ticket.activityLog.push({
      action: 'priority_changed',
      performedBy: userId,
      oldValue: oldPriority,
      newValue: priority,
      description: reason || `Priority changed from ${oldPriority} to ${priority}`,
      createdAt: Date.now()
    });
    
    await ticket.save();
    
    // Log activity
    await logActivity(userId, 'update_priority', { ticketId: id, oldPriority, newPriority: priority }, req);
    
    res.status(200).json({
      success: true,
      message: 'Ticket priority updated successfully',
      ticket
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Escalate ticket (Staff only)
// @route   POST /api/support/tickets/:id/escalate
// @access  Private (Staff only)
// ============================================
exports.escalateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    
    const ticket = await Ticket.findOne({ 
      _id: id, 
      isDeleted: false 
    });
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    await ticket.escalate(reason, userId);
    
    // Log activity
    await logActivity(userId, 'escalate_ticket', { ticketId: id, reason }, req);
    
    res.status(200).json({
      success: true,
      message: 'Ticket escalated successfully',
      ticket
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get FAQs
// @route   GET /api/support/faqs
// @access  Public
// ============================================
exports.getFAQs = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    
    const query = { isActive: true, isDeleted: false };
    
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { question: new RegExp(search, 'i') },
        { answer: new RegExp(search, 'i') }
      ];
    }
    
    const faqs = await FAQ.find(query).sort('-order');
    
    res.status(200).json({
      success: true,
      faqs
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get announcements
// @route   GET /api/support/announcements
// @access  Public
// ============================================
exports.getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find({ 
      isActive: true,
      publishedAt: { $lte: Date.now() },
      isDeleted: false 
    })
    .sort('-publishedAt')
    .limit(10);
    
    res.status(200).json({
      success: true,
      announcements
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get support statistics (Admin only)
// @route   GET /api/support/stats
// @access  Private (Admin only)
// ============================================
exports.getSupportStats = async (req, res, next) => {
  try {
    const stats = await Ticket.aggregate([
      { $match: { isDeleted: false } },
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          byPriority: [
            { $group: { _id: '$priority', count: { $sum: 1 } } }
          ],
          byCategory: [
            { $group: { _id: '$category', count: { $sum: 1 } } }
          ],
          responseTimes: [
            {
              $match: {
                'timeTracking.firstResponseTime': { $exists: true }
              }
            },
            {
              $group: {
                _id: null,
                avgResponseTime: { $avg: '$timeTracking.firstResponseTime' },
                minResponseTime: { $min: '$timeTracking.firstResponseTime' },
                maxResponseTime: { $max: '$timeTracking.firstResponseTime' }
              }
            }
          ],
          resolutionTimes: [
            {
              $match: {
                'timeTracking.resolutionTime': { $exists: true }
              }
            },
            {
              $group: {
                _id: null,
                avgResolutionTime: { $avg: '$timeTracking.resolutionTime' },
                minResolutionTime: { $min: '$timeTracking.resolutionTime' },
                maxResolutionTime: { $max: '$timeTracking.resolutionTime' }
              }
            }
          ],
          satisfaction: [
            {
              $match: {
                'satisfaction.rating': { $exists: true }
              }
            },
            {
              $group: {
                _id: null,
                avgRating: { $avg: '$satisfaction.rating' },
                totalRatings: { $sum: 1 }
              }
            }
          ],
          daily: [
            {
              $group: {
                _id: {
                  date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.date': -1 } },
            { $limit: 30 }
          ]
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      stats: stats[0]
    });
    
    // Log activity
    await logActivity(req.user.id, 'view_support_stats', {}, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Add satisfaction rating
// @route   POST /api/support/tickets/:id/rate
// @access  Private
// ============================================
exports.rateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;
    const userId = req.user.id;
    
    const ticket = await Ticket.findOne({ 
      _id: id, 
      user: userId,
      isDeleted: false 
    });
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    await ticket.addSatisfaction(rating, feedback);
    
    // Log activity
    await logActivity(userId, 'rate_ticket', { ticketId: id, rating }, req);
    
    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback!'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Create FAQ (Admin only)
// @route   POST /api/support/faqs
// @access  Private (Admin only)
// ============================================
exports.createFAQ = async (req, res, next) => {
  try {
    const { question, answer, category, order, tags } = req.body;
    
    const faq = await FAQ.create({
      question,
      answer,
      category: category || 'general',
      order: order || 0,
      tags: tags || [],
      createdBy: req.user.id
    });
    
    // Log activity
    await logActivity(req.user.id, 'create_faq', { faqId: faq._id }, req);
    
    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      faq
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update FAQ (Admin only)
// @route   PUT /api/support/faqs/:id
// @access  Private (Admin only)
// ============================================
exports.updateFAQ = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question, answer, category, order, tags, isActive } = req.body;
    
    const faq = await FAQ.findById(id);
    
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }
    
    if (question) faq.question = question;
    if (answer) faq.answer = answer;
    if (category) faq.category = category;
    if (order !== undefined) faq.order = order;
    if (tags) faq.tags = tags;
    if (isActive !== undefined) faq.isActive = isActive;
    
    await faq.save();
    
    // Log activity
    await logActivity(req.user.id, 'update_faq', { faqId: id }, req);
    
    res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      faq
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Delete FAQ (Admin only)
// @route   DELETE /api/support/faqs/:id
// @access  Private (Admin only)
// ============================================
exports.deleteFAQ = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const faq = await FAQ.findById(id);
    
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }
    
    faq.isDeleted = true;
    await faq.save();
    
    // Log activity
    await logActivity(req.user.id, 'delete_faq', { faqId: id }, req);
    
    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Create announcement (Admin only)
// @route   POST /api/support/announcements
// @access  Private (Admin only)
// ============================================
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, type, priority, publishedAt, expiresAt, targetAudience } = req.body;
    
    const announcement = await Announcement.create({
      title,
      content,
      type: type || 'info',
      priority: priority || 'normal',
      publishedAt: publishedAt || Date.now(),
      expiresAt,
      targetAudience: targetAudience || ['all'],
      createdBy: req.user.id
    });
    
    // Log activity
    await logActivity(req.user.id, 'create_announcement', { announcementId: announcement._id }, req);
    
    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      announcement
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update announcement (Admin only)
// @route   PUT /api/support/announcements/:id
// @access  Private (Admin only)
// ============================================
exports.updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, type, priority, publishedAt, expiresAt, targetAudience, isActive } = req.body;
    
    const announcement = await Announcement.findById(id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }
    
    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (type) announcement.type = type;
    if (priority) announcement.priority = priority;
    if (publishedAt) announcement.publishedAt = publishedAt;
    if (expiresAt) announcement.expiresAt = expiresAt;
    if (targetAudience) announcement.targetAudience = targetAudience;
    if (isActive !== undefined) announcement.isActive = isActive;
    
    await announcement.save();
    
    // Log activity
    await logActivity(req.user.id, 'update_announcement', { announcementId: id }, req);
    
    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      announcement
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Delete announcement (Admin only)
// @route   DELETE /api/support/announcements/:id
// @access  Private (Admin only)
// ============================================
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const announcement = await Announcement.findById(id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }
    
    announcement.isDeleted = true;
    await announcement.save();
    
    // Log activity
    await logActivity(req.user.id, 'delete_announcement', { announcementId: id }, req);
    
    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Search knowledge base
// @route   GET /api/support/search
// @access  Public
// ============================================
exports.searchKnowledgeBase = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const [faqs, announcements] = await Promise.all([
      FAQ.find({
        isActive: true,
        isDeleted: false,
        $or: [
          { question: new RegExp(q, 'i') },
          { answer: new RegExp(q, 'i') },
          { tags: new RegExp(q, 'i') }
        ]
      }).limit(10),
      
      Announcement.find({
        isActive: true,
        isDeleted: false,
        publishedAt: { $lte: Date.now() },
        $or: [
          { title: new RegExp(q, 'i') },
          { content: new RegExp(q, 'i') }
        ]
      }).limit(5)
    ]);
    
    res.status(200).json({
      success: true,
      results: {
        faqs,
        announcements
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
