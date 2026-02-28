import axios from 'axios';

import { authApi } from '../hooks/useAuth';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  EARNING: 'earning',
  REFERRAL: 'referral',
  COMMISSION: 'commission',
  WITHDRAWAL: 'withdrawal',
  PAYMENT: 'payment',
  ACHIEVEMENT: 'achievement',
  MILESTONE: 'milestone',
  REMINDER: 'reminder',
  PROMOTION: 'promotion',
  UPDATE: 'update',
  MAINTENANCE: 'maintenance',
  SECURITY: 'security',
  SYSTEM: 'system',
  MESSAGE: 'message',
  ALERT: 'alert',
};

// Notification priorities
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical',
};

// Notification statuses
export const NOTIFICATION_STATUSES = {
  UNREAD: 'unread',
  READ: 'read',
  ARCHIVED: 'archived',
  DELETED: 'deleted',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  SCHEDULED: 'scheduled',
};

// Notification channels
export const NOTIFICATION_CHANNELS = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  WHATSAPP: 'whatsapp',
  TELEGRAM: 'telegram',
  SLACK: 'slack',
  DISCORD: 'discord',
  WEBHOOK: 'webhook',
};

// Delivery methods
export const DELIVERY_METHODS = {
  IMMEDIATE: 'immediate',
  SCHEDULED: 'scheduled',
  BATCH: 'batch',
  TRIGGERED: 'triggered',
};

// Template types
export const TEMPLATE_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app',
  WHATSAPP: 'whatsapp',
};

// Default notification settings
export const DEFAULT_SETTINGS = {
  [NOTIFICATION_CHANNELS.IN_APP]: {
    enabled: true,
    sound: true,
    vibration: true,
    desktop: true,
    position: 'top-right',
    duration: 5000,
    maxStack: 5,
  },
  [NOTIFICATION_CHANNELS.EMAIL]: {
    enabled: true,
    digest: false,
    digestFrequency: 'daily',
    importantOnly: false,
  },
  [NOTIFICATION_CHANNELS.SMS]: {
    enabled: false,
    importantOnly: true,
    quietHours: false,
  },
  [NOTIFICATION_CHANNELS.PUSH]: {
    enabled: true,
    sound: true,
    badge: true,
    requireInteraction: false,
  },
  [NOTIFICATION_CHANNELS.WHATSAPP]: {
    enabled: false,
    importantOnly: true,
  },
  [NOTIFICATION_CHANNELS.TELEGRAM]: {
    enabled: false,
    botToken: null,
    chatId: null,
  },
  [NOTIFICATION_CHANNELS.SLACK]: {
    enabled: false,
    webhook: null,
    channel: null,
  },
  [NOTIFICATION_CHANNELS.DISCORD]: {
    enabled: false,
    webhook: null,
  },
};

// Quiet hours configuration
export const QUIET_HOURS = {
  enabled: false,
  start: '22:00',
  end: '08:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  allowUrgent: true,
};

// Rate limits (per channel)
export const RATE_LIMITS = {
  [NOTIFICATION_CHANNELS.EMAIL]: { perMinute: 10, perHour: 100, perDay: 1000 },
  [NOTIFICATION_CHANNELS.SMS]: { perMinute: 1, perHour: 10, perDay: 50 },
  [NOTIFICATION_CHANNELS.PUSH]: { perMinute: 30, perHour: 300, perDay: 3000 },
  [NOTIFICATION_CHANNELS.WHATSAPP]: { perMinute: 5, perHour: 50, perDay: 500 },
};

// Default templates
export const DEFAULT_TEMPLATES = {
  [NOTIFICATION_TYPES.INFO]: {
    title: 'Information',
    icon: 'ℹ️',
    color: '#17a2b8',
  },
  [NOTIFICATION_TYPES.SUCCESS]: {
    title: 'Success',
    icon: '✅',
    color: '#28a745',
  },
  [NOTIFICATION_TYPES.WARNING]: {
    title: 'Warning',
    icon: '⚠️',
    color: '#ffc107',
  },
  [NOTIFICATION_TYPES.ERROR]: {
    title: 'Error',
    icon: '❌',
    color: '#dc3545',
  },
  [NOTIFICATION_TYPES.EARNING]: {
    title: 'New Earnings',
    icon: '💰',
    color: '#28a745',
  },
  [NOTIFICATION_TYPES.REFERRAL]: {
    title: 'New Referral',
    icon: '👥',
    color: '#667eea',
  },
  [NOTIFICATION_TYPES.COMMISSION]: {
    title: 'Commission Earned',
    icon: '💵',
    color: '#4ecdc4',
  },
  [NOTIFICATION_TYPES.WITHDRAWAL]: {
    title: 'Withdrawal Update',
    icon: '💳',
    color: '#ff6b6b',
  },
  [NOTIFICATION_TYPES.ACHIEVEMENT]: {
    title: 'Achievement Unlocked',
    icon: '🏆',
    color: '#ffd93d',
  },
  [NOTIFICATION_TYPES.SECURITY]: {
    title: 'Security Alert',
    icon: '🔒',
    color: '#6c5ce7',
  },
  [NOTIFICATION_TYPES.MAINTENANCE]: {
    title: 'Maintenance',
    icon: '🔧',
    color: '#95a5a6',
  },
};

// Create axios instance for notification service
const notificationApi = axios.create({
  baseURL: `${API_URL}/notifications`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
notificationApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
notificationApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        if (response.data.success) {
          localStorage.setItem('auth_token', response.data.token);
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return notificationApi(originalRequest);
        }
      } catch (refreshError) {
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Helper function to handle API errors
const handleError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    const message = data.message || data.error || 'Notification error';
    
    switch (status) {
      case 400:
        throw new Error(`Invalid Request: ${message}`);
      case 401:
        throw new Error('Unauthorized: Please login again');
      case 403:
        throw new Error('Forbidden: You don\'t have permission');
      case 404:
        throw new Error('Not Found: Notification not found');
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

// Helper function to format notification data
const formatNotification = (notification) => {
  return {
    id: notification._id || notification.id,
    userId: notification.userId,
    
    // Core data
    type: notification.type || NOTIFICATION_TYPES.INFO,
    priority: notification.priority || NOTIFICATION_PRIORITIES.MEDIUM,
    status: notification.status || NOTIFICATION_STATUSES.UNREAD,
    
    // Content
    title: notification.title || '',
    message: notification.message || '',
    body: notification.body || notification.message,
    data: notification.data || {},
    
    // Actions
    actions: notification.actions || [],
    primaryAction: notification.primaryAction,
    
    // UI
    icon: notification.icon,
    image: notification.image,
    avatar: notification.avatar,
    
    // Channels
    channels: notification.channels || [NOTIFICATION_CHANNELS.IN_APP],
    deliveredTo: notification.deliveredTo || [],
    
    // Delivery
    scheduledFor: notification.scheduledFor,
    deliveredAt: notification.deliveredAt,
    readAt: notification.readAt,
    expiredAt: notification.expiredAt,
    
    // Metadata
    metadata: notification.metadata || {},
    tags: notification.tags || [],
    
    // Timestamps
    createdAt: notification.createdAt || new Date().toISOString(),
    updatedAt: notification.updatedAt,
  };
};
// Notification Service Class
class NotificationService {
  // ==================== Notification CRUD ====================

  // Get notifications
  async getNotifications(filters = {}, page = 1, limit = 20) {
    try {
      const response = await notificationApi.get('/', {
        params: { ...filters, page, limit },
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.notifications.map(formatNotification),
          pagination: response.data.pagination,
          total: response.data.total,
          unreadCount: response.data.unreadCount,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get notifications',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get notification by ID
  async getNotificationById(notificationId) {
    try {
      const response = await notificationApi.get(`/${notificationId}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: formatNotification(response.data.notification),
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get notification',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Create notification
  async createNotification(notificationData) {
    try {
      const response = await notificationApi.post('/', notificationData);
      
      if (response.data.success) {
        return {
          success: true,
          data: formatNotification(response.data.notification),
          message: response.data.message || 'Notification created',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to create notification',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Update notification
  async updateNotification(notificationId, updates) {
    try {
      const response = await notificationApi.put(`/${notificationId}`, updates);
      
      if (response.data.success) {
        return {
          success: true,
          data: formatNotification(response.data.notification),
          message: response.data.message || 'Notification updated',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to update notification',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await notificationApi.delete(`/${notificationId}`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Notification deleted',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to delete notification',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Bulk delete notifications
  async bulkDeleteNotifications(notificationIds) {
    try {
      const response = await notificationApi.delete('/', {
        data: { notificationIds },
      });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Notifications deleted',
          deleted: response.data.deleted,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to delete notifications',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Notification Status ====================

  // Mark as read
  async markAsRead(notificationId) {
    try {
      const response = await notificationApi.post(`/${notificationId}/read`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Marked as read',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to mark as read',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Mark all as read
  async markAllAsRead() {
    try {
      const response = await notificationApi.post('/read-all');
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'All marked as read',
          count: response.data.count,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to mark all as read',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Mark as unread
  async markAsUnread(notificationId) {
    try {
      const response = await notificationApi.post(`/${notificationId}/unread`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Marked as unread',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to mark as unread',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Archive notification
  async archiveNotification(notificationId) {
    try {
      const response = await notificationApi.post(`/${notificationId}/archive`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Notification archived',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to archive notification',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Unarchive notification
  async unarchiveNotification(notificationId) {
    try {
      const response = await notificationApi.post(`/${notificationId}/unarchive`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Notification unarchived',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to unarchive notification',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get unread count
  async getUnreadCount() {
    try {
      const response = await notificationApi.get('/unread/count');
      
      if (response.data.success) {
        return {
          success: true,
          count: response.data.count,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get unread count',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Delivery ====================

  // Send notification
  async sendNotification(notificationId, channels = null) {
    try {
      const response = await notificationApi.post(`/${notificationId}/send`, { channels });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Notification sent',
          deliveryStatus: response.data.deliveryStatus,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to send notification',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Schedule notification
  async scheduleNotification(notificationId, scheduledTime) {
    try {
      const response = await notificationApi.post(`/${notificationId}/schedule`, {
        scheduledTime,
      });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Notification scheduled',
          scheduledFor: response.data.scheduledFor,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to schedule notification',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Cancel scheduled notification
  async cancelScheduled(notificationId) {
    try {
      const response = await notificationApi.post(`/${notificationId}/cancel`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Scheduled notification cancelled',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to cancel notification',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Resend notification
  async resendNotification(notificationId) {
    try {
      const response = await notificationApi.post(`/${notificationId}/resend`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Notification resent',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to resend notification',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get delivery status
  async getDeliveryStatus(notificationId) {
    try {
      const response = await notificationApi.get(`/${notificationId}/delivery-status`);
      
      if (response.data.success) {
        return {
          success: true,
          status: response.data.status,
          deliveries: response.data.deliveries,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get delivery status',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Bulk Operations ====================

  // Send bulk notifications
  async sendBulkNotifications(notifications) {
    try {
      const response = await notificationApi.post('/bulk/send', { notifications });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Bulk notifications sent',
          results: response.data.results,
          failed: response.data.failed,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to send bulk notifications',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Create bulk notifications
  async createBulkNotifications(notifications) {
    try {
      const response = await notificationApi.post('/bulk', { notifications });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Bulk notifications created',
          data: response.data.notifications,
          count: response.data.count,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to create bulk notifications',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Mark bulk as read
  async markBulkAsRead(notificationIds) {
    try {
      const response = await notificationApi.post('/bulk/read', { notificationIds });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Bulk marked as read',
          count: response.data.count,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to mark bulk as read',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Archive bulk
  async archiveBulk(notificationIds) {
    try {
      const response = await notificationApi.post('/bulk/archive', { notificationIds });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Bulk archived',
          count: response.data.count,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to archive bulk',
      };
    } catch (error) {
      throw handleError(error);
    }
  }
  // ==================== Templates ====================

  // Get templates
  async getTemplates(type = null) {
    try {
      const response = await notificationApi.get('/templates', {
        params: { type },
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.templates,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get templates',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get template by ID
  async getTemplateById(templateId) {
    try {
      const response = await notificationApi.get(`/templates/${templateId}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.template,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get template',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Create template
  async createTemplate(templateData) {
    try {
      const response = await notificationApi.post('/templates', templateData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.template,
          message: response.data.message || 'Template created',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to create template',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Update template
  async updateTemplate(templateId, updates) {
    try {
      const response = await notificationApi.put(`/templates/${templateId}`, updates);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.template,
          message: response.data.message || 'Template updated',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to update template',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Delete template
  async deleteTemplate(templateId) {
    try {
      const response = await notificationApi.delete(`/templates/${templateId}`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Template deleted',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to delete template',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Render template
  async renderTemplate(templateId, data) {
    try {
      const response = await notificationApi.post(`/templates/${templateId}/render`, { data });
      
      if (response.data.success) {
        return {
          success: true,
          rendered: response.data.rendered,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to render template',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Preview template
  async previewTemplate(templateId, data = {}) {
    try {
      const response = await notificationApi.post(`/templates/${templateId}/preview`, { data });
      
      if (response.data.success) {
        return {
          success: true,
          preview: response.data.preview,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to preview template',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Settings ====================

  // Get settings
  async getSettings() {
    try {
      const response = await notificationApi.get('/settings');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.settings,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get settings',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Update settings
  async updateSettings(settings) {
    try {
      const response = await notificationApi.put('/settings', settings);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.settings,
          message: response.data.message || 'Settings updated',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to update settings',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Update channel settings
  async updateChannelSettings(channel, settings) {
    try {
      const response = await notificationApi.put(`/settings/channels/${channel}`, settings);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.settings,
          message: response.data.message || 'Channel settings updated',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to update channel settings',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Update quiet hours
  async updateQuietHours(quietHours) {
    try {
      const response = await notificationApi.put('/settings/quiet-hours', quietHours);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.quietHours,
          message: response.data.message || 'Quiet hours updated',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to update quiet hours',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Reset settings
  async resetSettings() {
    try {
      const response = await notificationApi.post('/settings/reset');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.settings,
          message: response.data.message || 'Settings reset to default',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to reset settings',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Preferences ====================

  // Get preferences
  async getPreferences() {
    try {
      const response = await notificationApi.get('/preferences');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.preferences,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get preferences',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Update preferences
  async updatePreferences(preferences) {
    try {
      const response = await notificationApi.put('/preferences', preferences);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.preferences,
          message: response.data.message || 'Preferences updated',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to update preferences',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get notification type preferences
  async getTypePreferences(type) {
    try {
      const response = await notificationApi.get(`/preferences/types/${type}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.preferences,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get type preferences',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Update notification type preferences
  async updateTypePreferences(type, preferences) {
    try {
      const response = await notificationApi.put(`/preferences/types/${type}`, preferences);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.preferences,
          message: response.data.message || 'Type preferences updated',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to update type preferences',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Subscriptions ====================

  // Subscribe to topic
  async subscribeToTopic(topic, channels = [NOTIFICATION_CHANNELS.IN_APP]) {
    try {
      const response = await notificationApi.post('/subscribe', { topic, channels });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || `Subscribed to ${topic}`,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to subscribe',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Unsubscribe from topic
  async unsubscribeFromTopic(topic) {
    try {
      const response = await notificationApi.post('/unsubscribe', { topic });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || `Unsubscribed from ${topic}`,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to unsubscribe',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get subscriptions
  async getSubscriptions() {
    try {
      const response = await notificationApi.get('/subscriptions');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.subscriptions,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get subscriptions',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Device Registration ====================

  // Register device for push notifications
  async registerDevice(deviceToken, deviceData) {
    try {
      const response = await notificationApi.post('/devices/register', {
        token: deviceToken,
        ...deviceData,
      });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Device registered',
          deviceId: response.data.deviceId,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to register device',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Unregister device
  async unregisterDevice(deviceId) {
    try {
      const response = await notificationApi.delete(`/devices/${deviceId}`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Device unregistered',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to unregister device',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get devices
  async getDevices() {
    try {
      const response = await notificationApi.get('/devices');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.devices,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get devices',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Statistics ====================

  // Get notification statistics
  async getStats(period = '30days') {
    try {
      const response = await notificationApi.get('/stats', {
        params: { period },
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.stats,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get statistics',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get delivery statistics
  async getDeliveryStats(period = '30days') {
    try {
      const response = await notificationApi.get('/stats/delivery', {
        params: { period },
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.stats,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get delivery stats',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get engagement statistics
  async getEngagementStats(period = '30days') {
    try {
      const response = await notificationApi.get('/stats/engagement', {
        params: { period },
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.stats,
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get engagement stats',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // ==================== Test Notifications ====================

  // Send test notification
  async sendTestNotification(channel = NOTIFICATION_CHANNELS.IN_APP) {
    try {
      const response = await notificationApi.post('/test', { channel });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Test notification sent',
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to send test notification',
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  // Send test email
  async sendTestEmail(email) {
    return this.sendTestNotification(NOTIFICATION_CHANNELS.EMAIL);
  }

  // Send test SMS
  async sendTestSMS(phone) {
    return this.sendTestNotification(NOTIFICATION_CHANNELS.SMS);
  }

  // Send test push
  async sendTestPush() {
    return this.sendTestNotification(NOTIFICATION_CHANNELS.PUSH);
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export API instance for custom requests
export { notificationApi };

// Helper functions for notifications
export const notificationHelpers = {
  // Get notification icon based on type
  getNotificationIcon: (type) => {
    return DEFAULT_TEMPLATES[type]?.icon || '🔔';
  },

  // Get notification color based on type
  getNotificationColor: (type) => {
    return DEFAULT_TEMPLATES[type]?.color || '#667eea';
  },

  // Get notification title based on type
  getNotificationTitle: (type) => {
    return DEFAULT_TEMPLATES[type]?.title || 'Notification';
  },

  // Format timestamp
  formatTimestamp: (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
    
    return date.toLocaleDateString();
  },

  // Group notifications by date
  groupByDate: (notifications) => {
    const groups = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });
    
    return groups;
  },

  // Filter notifications by type
  filterByType: (notifications, type) => {
    return notifications.filter(n => n.type === type);
  },

  // Filter notifications by priority
  filterByPriority: (notifications, priority) => {
    return notifications.filter(n => n.priority === priority);
  },

  // Get unread notifications
  getUnread: (notifications) => {
    return notifications.filter(n => n.status === NOTIFICATION_STATUSES.UNREAD);
  },

  // Get read notifications
  getRead: (notifications) => {
    return notifications.filter(n => n.status === NOTIFICATION_STATUSES.READ);
  },

  // Get archived notifications
  getArchived: (notifications) => {
    return notifications.filter(n => n.status === NOTIFICATION_STATUSES.ARCHIVED);
  },

  // Calculate notification statistics
  calculateStats: (notifications) => {
    const total = notifications.length;
    const unread = notifications.filter(n => n.status === NOTIFICATION_STATUSES.UNREAD).length;
    const read = total - unread;
    
    const byType = {};
    const byPriority = {};
    
    notifications.forEach(n => {
      byType[n.type] = (byType[n.type] || 0) + 1;
      byPriority[n.priority] = (byPriority[n.priority] || 0) + 1;
    });
    
    return {
      total,
      unread,
      read,
      byType,
      byPriority,
      readRate: total ? (read / total) * 100 : 0,
    };
  },

  // Check if quiet hours are active
  isQuietHours: (quietHours) => {
    if (!quietHours?.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = quietHours.start.split(':').map(Number);
    const [endHour, endMin] = quietHours.end.split(':').map(Number);
    
    const start = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;
    
    if (start < end) {
      return currentTime >= start && currentTime <= end;
    } else {
      return currentTime >= start || currentTime <= end;
    }
  },

  // Check if notification should be sent based on quiet hours
  shouldSendDuringQuietHours: (priority, quietHours) => {
    if (!quietHours?.enabled) return true;
    if (quietHours.allowUrgent && 
        [NOTIFICATION_PRIORITIES.HIGH, NOTIFICATION_PRIORITIES.URGENT, NOTIFICATION_PRIORITIES.CRITICAL].includes(priority)) {
      return true;
    }
    return !notificationHelpers.isQuietHours(quietHours);
  },

  // Create in-app notification
  createInAppNotification: (type, title, message, data = {}) => {
    return {
      type,
      title: title || notificationHelpers.getNotificationTitle(type),
      message,
      icon: notificationHelpers.getNotificationIcon(type),
      color: notificationHelpers.getNotificationColor(type),
      channels: [NOTIFICATION_CHANNELS.IN_APP],
      data,
      createdAt: new Date().toISOString(),
    };
  },

  // Create email notification
  createEmailNotification: (to, subject, body, data = {}) => {
    return {
      to,
      subject,
      body,
      channels: [NOTIFICATION_CHANNELS.EMAIL],
      data,
      createdAt: new Date().toISOString(),
    };
  },

  // Create push notification
  createPushNotification: (title, body, data = {}) => {
    return {
      title,
      body,
      channels: [NOTIFICATION_CHANNELS.PUSH],
      data,
      createdAt: new Date().toISOString(),
    };
  },

  // Create SMS notification
  createSMSNotification: (to, message, data = {}) => {
    return {
      to,
      message,
      channels: [NOTIFICATION_CHANNELS.SMS],
      data,
      createdAt: new Date().toISOString(),
    };
  },
};

// Export constants
export const NOTIFICATION_CONSTANTS = {
  TYPES: NOTIFICATION_TYPES,
  PRIORITIES: NOTIFICATION_PRIORITIES,
  STATUSES: NOTIFICATION_STATUSES,
  CHANNELS: NOTIFICATION_CHANNELS,
  DELIVERY_METHODS,
  TEMPLATE_TYPES,
  DEFAULT_SETTINGS,
  QUIET_HOURS,
  RATE_LIMITS,
  DEFAULT_TEMPLATES,
};

export default notificationService;
