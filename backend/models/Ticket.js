const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  // Ticket number (unique identifier)
  ticketNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // User who created the ticket
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Ticket subject/title
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },

  // Ticket category
  category: {
    type: String,
    enum: [
      'general',
      'technical',
      'billing',
      'account',
      'affiliate',
      'commission',
      'withdrawal',
      'referral',
      'bug_report',
      'feature_request',
      'security',
      'compliance',
      'other'
    ],
    required: true,
    index: true
  },

  // Priority level
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent', 'critical'],
    default: 'normal',
    index: true
  },

  // Current status
  status: {
    type: String,
    enum: [
      'open',           // New ticket, not yet assigned
      'assigned',       // Assigned to support agent
      'in_progress',    // Being worked on
      'pending',        // Waiting for user response
      'resolved',       // Marked as resolved
      'closed',         // Closed (final)
      'reopened',       // Reopened after resolution
      'escalated',      // Escalated to senior team
      'on_hold',        // Temporarily on hold
      'spam',           // Marked as spam
      'duplicate'       // Duplicate ticket
    ],
    default: 'open',
    index: true
  },

  // Assigned agent
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },

  // Department
  department: {
    type: String,
    enum: [
      'support',
      'billing',
      'technical',
      'affiliate',
      'compliance',
      'security',
      'management'
    ],
    default: 'support'
  },

  // Tags for categorization
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],

  // Description/content
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },

  // Messages/replies
  messages: [{
    messageNumber: {
      type: Number,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isStaff: {
      type: Boolean,
      default: false
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000
    },
    attachments: [{
      fileName: String,
      fileUrl: String,
      fileType: String,
      fileSize: Number,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    isInternal: {
      type: Boolean,
      default: false  // Internal notes for staff only
    },
    isAutomated: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Activity log
  activityLog: [{
    action: {
      type: String,
      enum: [
        'created',
        'assigned',
        'status_changed',
        'priority_changed',
        'category_changed',
        'message_added',
        'attachment_added',
        'note_added',
        'escalated',
        'reopened',
        'closed',
        'resolved',
        'pending',
        'merged',
        'duplicate_marked'
      ],
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    description: String,
    ipAddress: String,
    userAgent: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Time tracking
  timeTracking: {
    firstResponseAt: Date,
    firstResponseBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    firstResponseTime: Number, // in minutes
    
    lastResponseAt: Date,
    lastResponseBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolutionTime: Number, // in minutes
    
    closedAt: Date,
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    totalTimeOpen: Number, // total time in minutes
    timeSpent: [{
      agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      minutes: Number,
      description: String,
      loggedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },

  // SLA (Service Level Agreement)
  sla: {
    priority: {
      type: String,
      enum: ['standard', 'premium', 'enterprise']
    },
    firstResponseDue: Date,
    resolutionDue: Date,
    breached: {
      firstResponse: {
        type: Boolean,
        default: false
      },
      resolution: {
        type: Boolean,
        default: false
      },
      breachedAt: Date,
      reason: String
    },
    escalatedAt: Date,
    escalationReason: String,
    escalationLevel: {
      type: Number,
      min: 1,
      max: 5
    }
  },

  // Satisfaction survey
  satisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    surveyedAt: Date,
    surveyedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  // Related tickets
  relatedTickets: [{
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket'
    },
    relationship: {
      type: String,
      enum: ['parent', 'child', 'duplicate', 'merged', 'related']
    }
  }],

  // Duplicate of
  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  },

  // Merged tickets
  mergedTickets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  }],

  // References to other models
  references: {
    commission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commission'
    },
    payout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payout'
    },
    withdrawal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Withdrawal'
    },
    affiliate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Affiliate'
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }
  },

  // Custom fields (for different ticket types)
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },

  // Settings
  settings: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    autoReply: {
      type: Boolean,
      default: true
    },
    priority: {
      autoEscalate: {
        type: Boolean,
        default: true
      },
      escalateAfter: Number, // hours
      maxEscalationLevel: {
        type: Number,
        default: 3
      }
    }
  },

  // Flags
  isReadByUser: {
    type: Boolean,
    default: false
  },
  isReadByStaff: {
    type: Boolean,
    default: false
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  isEscalated: {
    type: Boolean,
    default: false
  },
  isSatisfactionSurveySent: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isSpam: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },

  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
ticketSchema.index({ user: 1, status: 1, createdAt: -1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ category: 1, priority: 1 });
ticketSchema.index({ ticketNumber: 1 });
ticketSchema.index({ tags: 1 });
ticketSchema.index({ 'sla.firstResponseDue': 1 });
ticketSchema.index({ 'sla.resolutionDue': 1 });
ticketSchema.index({ isUrgent: 1, isEscalated: 1 });
ticketSchema.index({ isDeleted: 1, isArchived: 1 });
ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ updatedAt: -1 });

// Update the updatedAt field on save
ticketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate ticket number before saving
ticketSchema.pre('validate', async function(next) {
  if (!this.ticketNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Get count of tickets today to generate sequential number
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    const sequence = (count + 1).toString().padStart(4, '0');
    this.ticketNumber = `TKT-${year}${month}${day}-${sequence}`;
  }
  next();
});

// Virtual for time since created
ticketSchema.virtual('timeSinceCreated').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60));
});

// Virtual for time since last response
ticketSchema.virtual('timeSinceLastResponse').get(function() {
  if (!this.timeTracking.lastResponseAt) return null;
  return Math.floor((Date.now() - this.timeTracking.lastResponseAt) / (1000 * 60 * 60));
});

// Virtual for response count
ticketSchema.virtual('responseCount').get(function() {
  return this.messages.length;
});

// Virtual for staff response count
ticketSchema.virtual('staffResponseCount').get(function() {
  return this.messages.filter(m => m.isStaff && !m.isInternal).length;
});

// Virtual for user response count
ticketSchema.virtual('userResponseCount').get(function() {
  return this.messages.filter(m => !m.isStaff && !m.isInternal).length;
});

// Virtual for internal note count
ticketSchema.virtual('internalNoteCount').get(function() {
  return this.messages.filter(m => m.isInternal).length;
});

// Virtual for status color (for UI)
ticketSchema.virtual('statusColor').get(function() {
  const colors = {
    'open': '#28a745',
    'assigned': '#17a2b8',
    'in_progress': '#ffc107',
    'pending': '#6c757d',
    'resolved': '#007bff',
    'closed': '#343a40',
    'reopened': '#dc3545',
    'escalated': '#fd7e14',
    'on_hold': '#ffc107',
    'spam': '#dc3545',
    'duplicate': '#6c757d'
  };
  return colors[this.status] || '#6c757d';
});

// Virtual for priority color (for UI)
ticketSchema.virtual('priorityColor').get(function() {
  const colors = {
    'low': '#28a745',
    'normal': '#17a2b8',
    'high': '#ffc107',
    'urgent': '#fd7e14',
    'critical': '#dc3545'
  };
  return colors[this.priority] || '#6c757d';
});

// Virtual for readable status
ticketSchema.virtual('statusText').get(function() {
  const statusMap = {
    'open': '🟢 Open',
    'assigned': '🔵 Assigned',
    'in_progress': '🟡 In Progress',
    'pending': '⚪ Pending',
    'resolved': '✅ Resolved',
    'closed': '🔒 Closed',
    'reopened': '🔄 Reopened',
    'escalated': '⚠️ Escalated',
    'on_hold': '⏸️ On Hold',
    'spam': '🚫 Spam',
    'duplicate': '📑 Duplicate'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for priority text
ticketSchema.virtual('priorityText').get(function() {
  const priorityMap = {
    'low': '🟢 Low',
    'normal': '🔵 Normal',
    'high': '🟡 High',
    'urgent': '🟠 Urgent',
    'critical': '🔴 Critical'
  };
  return priorityMap[this.priority] || this.priority;
});

// Method to add message
ticketSchema.methods.addMessage = async function(messageData, userId) {
  const messageNumber = this.messages.length + 1;
  
  const newMessage = {
    messageNumber,
    user: userId,
    isStaff: messageData.isStaff || false,
    content: messageData.content,
    attachments: messageData.attachments || [],
    isInternal: messageData.isInternal || false,
    isAutomated: messageData.isAutomated || false,
    createdAt: Date.now()
  };
  
  this.messages.push(newMessage);
  
  // Update response tracking
  if (!messageData.isInternal) {
    if (!this.timeTracking.firstResponseAt && messageData.isStaff) {
      this.timeTracking.firstResponseAt = Date.now();
      this.timeTracking.firstResponseBy = userId;
      this.timeTracking.firstResponseTime = Math.floor((Date.now() - this.createdAt) / (1000 * 60));
    }
    
    this.timeTracking.lastResponseAt = Date.now();
    this.timeTracking.lastResponseBy = userId;
    
    // Update read status
    if (messageData.isStaff) {
      this.isReadByStaff = true;
      this.isReadByUser = false;
    } else {
      this.isReadByUser = true;
      this.isReadByStaff = false;
    }
  }
  
  // Add to activity log
  this.activityLog.push({
    action: 'message_added',
    performedBy: userId,
    description: `Message #${messageNumber} added`,
    ipAddress: messageData.ipAddress,
    userAgent: messageData.userAgent,
    createdAt: Date.now()
  });
  
  return this.save();
};

// Method to change status
ticketSchema.methods.changeStatus = async function(newStatus, userId, reason = '') {
  const oldStatus = this.status;
  
  this.status = newStatus;
  
  // Update time tracking based on status
  if (newStatus === 'resolved' && !this.timeTracking.resolvedAt) {
    this.timeTracking.resolvedAt = Date.now();
    this.timeTracking.resolvedBy = userId;
    this.timeTracking.resolutionTime = Math.floor((Date.now() - this.createdAt) / (1000 * 60));
  }
  
  if (newStatus === 'closed' && !this.timeTracking.closedAt) {
    this.timeTracking.closedAt = Date.now();
    this.timeTracking.closedBy = userId;
    this.timeTracking.totalTimeOpen = Math.floor((Date.now() - this.createdAt) / (1000 * 60));
  }
  
  // Add to activity log
  this.activityLog.push({
    action: 'status_changed',
    performedBy: userId,
    oldValue: oldStatus,
    newValue: newStatus,
    description: reason,
    createdAt: Date.now()
  });
  
  return this.save();
};

// Method to assign ticket
ticketSchema.methods.assign = async function(agentId, assignedBy) {
  const oldAssignee = this.assignedTo;
  
  this.assignedTo = agentId;
  this.status = 'assigned';
  
  this.activityLog.push({
    action: 'assigned',
    performedBy: assignedBy,
    oldValue: oldAssignee,
    newValue: agentId,
    description: `Ticket assigned to agent`,
    createdAt: Date.now()
  });
  
  return this.save();
};

// Method to change priority
ticketSchema.methods.changePriority = async function(newPriority, userId, reason = '') {
  const oldPriority = this.priority;
  
  this.priority = newPriority;
  
  this.activityLog.push({
    action: 'priority_changed',
    performedBy: userId,
    oldValue: oldPriority,
    newValue: newPriority,
    description: reason,
    createdAt: Date.now()
  });
  
  return this.save();
};

// Method to change category
ticketSchema.methods.changeCategory = async function(newCategory, userId, reason = '') {
  const oldCategory = this.category;
  
  this.category = newCategory;
  
  this.activityLog.push({
    action: 'category_changed',
    performedBy: userId,
    oldValue: oldCategory,
    newValue: newCategory,
    description: reason,
    createdAt: Date.now()
  });
  
  return this.save();
};

// Method to escalate ticket
ticketSchema.methods.escalate = async function(reason, escalatedBy, level = 1) {
  this.isEscalated = true;
  this.status = 'escalated';
  this.sla.escalatedAt = Date.now();
  this.sla.escalationReason = reason;
  this.sla.escalationLevel = (this.sla.escalationLevel || 0) + level;
  
  this.activityLog.push({
    action: 'escalated',
    performedBy: escalatedBy,
    description: `Ticket escalated: ${reason}`,
    newValue: level,
    createdAt: Date.now()
  });
  
  return this.save();
};

// Method to reopen ticket
ticketSchema.methods.reopen = async function(userId, reason = '') {
  this.status = 'reopened';
  this.timeTracking.resolvedAt = null;
  this.timeTracking.resolvedBy = null;
  this.timeTracking.closedAt = null;
  this.timeTracking.closedBy = null;
  
  this.activityLog.push({
    action: 'reopened',
    performedBy: userId,
    description: reason,
    createdAt: Date.now()
  });
  
  return this.save();
};

// Method to add time spent
ticketSchema.methods.addTimeSpent = async function(agentId, minutes, description = '') {
  this.timeTracking.timeSpent.push({
    agent: agentId,
    minutes,
    description,
    loggedAt: Date.now()
  });
  
  return this.save();
};

// Method to mark as spam
ticketSchema.methods.markAsSpam = async function(userId, reason = '') {
  this.isSpam = true;
  this.status = 'spam';
  
  this.activityLog.push({
    action: 'status_changed',
    performedBy: userId,
    newValue: 'spam',
    description: `Marked as spam: ${reason}`,
    createdAt: Date.now()
  });
  
  return this.save();
};

// Method to mark as duplicate
ticketSchema.methods.markAsDuplicate = async function(originalTicketId, userId) {
  this.status = 'duplicate';
  this.duplicateOf = originalTicketId;
  
  this.activityLog.push({
    action: 'duplicate_marked',
    performedBy: userId,
    newValue: originalTicketId,
    description: `Marked as duplicate of ${originalTicketId}`,
    createdAt: Date.now()
  });
  
  return this.save();
};

// Method to merge tickets
ticketSchema.methods.merge = async function(ticketIds, userId) {
  this.mergedTickets = ticketIds;
  
  // Update status of merged tickets
  await this.constructor.updateMany(
    { _id: { $in: ticketIds } },
    { status: 'merged' }
  );
  
  this.activityLog.push({
    action: 'merged',
    performedBy: userId,
    description: `Merged ${ticketIds.length} tickets`,
    createdAt: Date.now()
  });
  
  return this.save();
};

// Method to add satisfaction rating
ticketSchema.methods.addSatisfaction = async function(rating, feedback = '') {
  this.satisfaction = {
    rating,
    feedback,
    surveyedAt: Date.now()
  };
  this.isSatisfactionSurveySent = true;
  
  return this.save();
};

// Method to check SLA breach
ticketSchema.methods.checkSLA = async function() {
  const now = Date.now();
  let breached = false;
  
  if (this.sla.firstResponseDue && now > this.sla.firstResponseDue && !this.timeTracking.firstResponseAt) {
    this.sla.breached.firstResponse = true;
    this.sla.breached.breachedAt = now;
    this.sla.breached.reason = 'First response SLA breached';
    breached = true;
  }
  
  if (this.sla.resolutionDue && now > this.sla.resolutionDue && this.status !== 'resolved' && this.status !== 'closed') {
    this.sla.breached.resolution = true;
    this.sla.breached.breachedAt = now;
    this.sla.breached.reason = 'Resolution SLA breached';
    breached = true;
  }
  
  if (breached) {
    await this.save();
  }
  
  return breached;
};

// Method to add note (internal)
ticketSchema.methods.addNote = async function(note, userId, isPrivate = true) {
  return this.addMessage({
    content: note,
    isInternal: true,
    isPrivate
  }, userId);
};

// Method to add attachment to last message
ticketSchema.methods.addAttachmentToLastMessage = async function(attachment) {
  if (this.messages.length > 0) {
    this.messages[this.messages.length - 1].attachments.push(attachment);
  }
  return this.save();
};

// Method to soft delete
ticketSchema.methods.softDelete = async function(userId, reason = '') {
  this.isDeleted = true;
  
  this.activityLog.push({
    action: 'status_changed',
    performedBy: userId,
    newValue: 'deleted',
    description: `Ticket deleted: ${reason}`,
    createdAt: Date.now()
  });
  
  return this.save();
};

// Method to archive ticket
ticketSchema.methods.archive = async function(userId) {
  this.isArchived = true;
  
  this.activityLog.push({
    action: 'status_changed',
    performedBy: userId,
    newValue: 'archived',
    description: 'Ticket archived',
    createdAt: Date.now()
  });
  
  return this.save();
};

// Static method to get open tickets count
ticketSchema.statics.getOpenCount = async function() {
  return this.countDocuments({
    status: { $in: ['open', 'assigned', 'in_progress', 'reopened'] },
    isDeleted: false,
    isArchived: false
  });
};

// Static method to get pending tickets
ticketSchema.statics.getPendingTickets = async function() {
  return this.find({
    status: 'pending',
    isDeleted: false,
    isArchived: false
  })
  .populate('user', 'name email')
  .populate('assignedTo', 'name email')
  .sort({ updatedAt: 1 });
};

// Static method to get tickets by user
ticketSchema.statics.getUserTickets = async function(userId, status = null) {
  const query = { user: userId, isDeleted: false, isArchived: false };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get tickets by agent
ticketSchema.statics.getAgentTickets = async function(agentId, status = null) {
  const query = { assignedTo: agentId, isDeleted: false, isArchived: false };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('user', 'name email')
    .sort({ priority: -1, createdAt: 1 });
};

// Static method to get escalated tickets
ticketSchema.statics.getEscalatedTickets = async function() {
  return this.find({
    isEscalated: true,
    status: 'escalated',
    isDeleted: false,
    isArchived: false
  })
  .populate('user', 'name email')
  .populate('assignedTo', 'name email')
  .sort({ 'sla.escalatedAt': -1 });
};

// Static method to get urgent tickets
ticketSchema.statics.getUrgentTickets = async function() {
  return this.find({
    priority: { $in: ['urgent', 'critical'] },
    status: { $in: ['open', 'assigned', 'in_progress', 'reopened'] },
    isDeleted: false,
    isArchived: false
  })
  .populate('user', 'name email')
  .populate('assignedTo', 'name email')
  .sort({ priority: -1, createdAt: 1 });
};

// Static method to get tickets by date range
ticketSchema.statics.getByDateRange = async function(startDate, endDate) {
  return this.find({
    createdAt: { $gte: startDate, $lte: endDate },
    isDeleted: false
  })
  .populate('user', 'name email')
  .populate('assignedTo', 'name email')
  .sort({ createdAt: -1 });
};

// Static method to get ticket statistics
ticketSchema.statics.getStats = async function() {
  const total = await this.countDocuments({ isDeleted: false, isArchived: false });
  
  const byStatus = await this.aggregate([
    { $match: { isDeleted: false, isArchived: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  const byPriority = await this.aggregate([
    { $match: { isDeleted: false, isArchived: false } },
    { $group: { _id: '$priority', count: { $sum: 1 } } }
  ]);
  
  const byCategory = await this.aggregate([
    { $match: { isDeleted: false, isArchived: false } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  
  const avgResponseTime = await this.aggregate([
    { $match: { 'timeTracking.firstResponseTime': { $exists: true, $ne: null } } },
    { $group: { _id: null, avg: { $avg: '$timeTracking.firstResponseTime' } } }
  ]);
  
  const avgResolutionTime = await this.aggregate([
    { $match: { 'timeTracking.resolutionTime': { $exists: true, $ne: null } } },
    { $group: { _id: null, avg: { $avg: '$timeTracking.resolutionTime' } } }
  ]);
  
  const satisfactionAvg = await this.aggregate([
    { $match: { 'satisfaction.rating': { $exists: true } } },
    { $group: { _id: null, avg: { $avg: '$satisfaction.rating' } } }
  ]);
  
  return {
    total,
    byStatus,
    byPriority,
    byCategory,
    avgResponseTime: avgResponseTime[0]?.avg || 0,
    avgResolutionTime: avgResolutionTime[0]?.avg || 0,
    satisfactionAvg: satisfactionAvg[0]?.avg || 0
  };
};

// Static method to get monthly report
ticketSchema.statics.getMonthlyReport = async function(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  const created = await this.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    isDeleted: false
  });
  
  const resolved = await this.countDocuments({
    'timeTracking.resolvedAt': { $gte: startDate, $lte: endDate },
    isDeleted: false
  });
  
  const byCategory = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        isDeleted: false
      }
    },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  
  const avgResponseTime = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        'timeTracking.firstResponseTime': { $exists: true }
      }
    },
    { $group: { _id: null, avg: { $avg: '$timeTracking.firstResponseTime' } } }
  ]);
  
  return {
    month: `${year}-${month}`,
    created,
    resolved,
    open: created - resolved,
    byCategory,
    avgResponseTime: avgResponseTime[0]?.avg || 0
  };
};

// Static method to search tickets
ticketSchema.statics.search = async function(query, options = {}) {
  const searchQuery = {
    isDeleted: false,
    isArchived: false,
    $or: [
      { ticketNumber: new RegExp(query, 'i') },
      { subject: new RegExp(query, 'i') },
      { description: new RegExp(query, 'i') },
      { 'messages.content': new RegExp(query, 'i') },
      { tags: new RegExp(query, 'i') }
    ]
  };
  
  if (options.userId) searchQuery.user = options.userId;
  if (options.status) searchQuery.status = options.status;
  if (options.priority) searchQuery.priority = options.priority;
  if (options.category) searchQuery.category = options.category;
  
  return this.find(searchQuery)
    .populate('user', 'name email')
    .populate('assignedTo', 'name email')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

// Static method to create ticket from email
ticketSchema.statics.createFromEmail = async function(emailData) {
  // Find or create user based on email
  const User = mongoose.model('User');
  let user = await User.findOne({ email: emailData.from });
  
  if (!user) {
    // Create new user if not exists
    user = new User({
      name: emailData.fromName || emailData.from,
      email: emailData.from,
      role: 'user'
    });
    await user.save();
  }
  
  const ticket = new this({
    user: user._id,
    subject: emailData.subject,
    category: emailData.category || 'general',
    description: emailData.body,
    messages: [{
      messageNumber: 1,
      user: user._id,
      content: emailData.body,
      attachments: emailData.attachments || [],
      isAutomated: true,
      createdAt: emailData.receivedAt || Date.now()
    }]
  });
  
  return ticket.save();
};

// Create and export model
const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
