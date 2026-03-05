/**
 * ============================================
 * EMAIL CONFIGURATION
 * Comprehensive email configuration with multiple providers,
 * templates, queues, and monitoring
 * ============================================
 */

const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');
const juice = require('juice');
const logger = require('../utils/logger');

// ============================================
// Email Providers Configuration
// ============================================

const emailProviders = {
  // SMTP Provider (default)
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5
  },

  // SendGrid
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@affiliate.com',
    fromName: process.env.SENDGRID_FROM_NAME || 'AffiliatePro'
  },

  // Mailgun
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    from: process.env.MAILGUN_FROM_EMAIL || 'noreply@affiliate.com',
    fromName: process.env.MAILGUN_FROM_NAME || 'AffiliatePro'
  },

  // AWS SES
  ses: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    from: process.env.SES_FROM_EMAIL || 'noreply@affiliate.com',
    fromName: process.env.SES_FROM_NAME || 'AffiliatePro'
  },

  // Postmark
  postmark: {
    apiKey: process.env.POSTMARK_API_KEY,
    from: process.env.POSTMARK_FROM_EMAIL || 'noreply@affiliate.com',
    fromName: process.env.POSTMARK_FROM_NAME || 'AffiliatePro'
  }
};

// ============================================
// Email Templates
// ============================================

const emailTemplates = {
  // Welcome email
  welcome: {
    subject: 'Welcome to AffiliatePro!',
    template: 'welcome.html',
    variables: ['name', 'email', 'loginUrl']
  },

  // Email verification
  verifyEmail: {
    subject: 'Verify Your Email Address',
    template: 'verify-email.html',
    variables: ['name', 'verificationUrl', 'expiryHours']
  },

  // Password reset
  resetPassword: {
    subject: 'Reset Your Password',
    template: 'reset-password.html',
    variables: ['name', 'resetUrl', 'expiryHours']
  },

  // Password changed
  passwordChanged: {
    subject: 'Your Password Has Been Changed',
    template: 'password-changed.html',
    variables: ['name', 'loginUrl', 'supportUrl']
  },

  // Account locked
  accountLocked: {
    subject: 'Account Temporarily Locked',
    template: 'account-locked.html',
    variables: ['name', 'unlockTime', 'supportUrl']
  },

  // Welcome affiliate
  welcomeAffiliate: {
    subject: 'Welcome to AffiliatePro Affiliate Program!',
    template: 'welcome-affiliate.html',
    variables: ['name', 'dashboardUrl', 'referralCode', 'commissionRate']
  },

  // Commission earned
  commissionEarned: {
    subject: 'You\'ve Earned a Commission!',
    template: 'commission-earned.html',
    variables: ['name', 'amount', 'type', 'detailsUrl']
  },

  // Payout processed
  payoutProcessed: {
    subject: 'Payout Processed Successfully',
    template: 'payout-processed.html',
    variables: ['name', 'amount', 'method', 'transactionId', 'date']
  },

  // Payout failed
  payoutFailed: {
    subject: 'Payout Failed - Action Required',
    template: 'payout-failed.html',
    variables: ['name', 'amount', 'reason', 'updatePaymentUrl']
  },

  // New referral
  newReferral: {
    subject: 'You Have a New Referral!',
    template: 'new-referral.html',
    variables: ['name', 'referredName', 'referredEmail', 'commissionRate']
  },

  // Referral converted
  referralConverted: {
    subject: 'Your Referral Made a Conversion!',
    template: 'referral-converted.html',
    variables: ['name', 'referredName', 'amount', 'commission']
  },

  // Monthly report
  monthlyReport: {
    subject: 'Your Monthly Performance Report',
    template: 'monthly-report.html',
    variables: ['name', 'month', 'year', 'earnings', 'referrals', 'clicks', 'conversions']
  },

  // Ticket created
  ticketCreated: {
    subject: 'Support Ticket Created',
    template: 'ticket-created.html',
    variables: ['name', 'ticketNumber', 'subject', 'priority', 'ticketUrl']
  },

  // Ticket updated
  ticketUpdated: {
    subject: 'Support Ticket Updated',
    template: 'ticket-updated.html',
    variables: ['name', 'ticketNumber', 'status', 'message', 'ticketUrl']
  },

  // Ticket resolved
  ticketResolved: {
    subject: 'Support Ticket Resolved',
    template: 'ticket-resolved.html',
    variables: ['name', 'ticketNumber', 'resolution', 'feedbackUrl']
  },

  // Newsletter
  newsletter: {
    subject: 'AffiliatePro Newsletter',
    template: 'newsletter.html',
    variables: ['name', 'content', 'unsubscribeUrl']
  },

  // Security alert
  securityAlert: {
    subject: 'Security Alert - New Login Detected',
    template: 'security-alert.html',
    variables: ['name', 'ipAddress', 'location', 'device', 'time', 'supportUrl']
  },

  // Two-factor enabled
  twoFactorEnabled: {
    subject: 'Two-Factor Authentication Enabled',
    template: 'two-factor-enabled.html',
    variables: ['name', 'backupCodesUrl']
  },

  // Two-factor disabled
  twoFactorDisabled: {
    subject: 'Two-Factor Authentication Disabled',
    template: 'two-factor-disabled.html',
    variables: ['name', 'supportUrl']
  },

  // Account deleted
  accountDeleted: {
    subject: 'Account Deleted Confirmation',
    template: 'account-deleted.html',
    variables: ['name', 'supportUrl']
  },

  // Birthday greeting
  birthday: {
    subject: 'Happy Birthday from AffiliatePro! 🎉',
    template: 'birthday.html',
    variables: ['name', 'specialOffer']
  },

  // Anniversary
  anniversary: {
    subject: 'Happy Anniversary with AffiliatePro!',
    template: 'anniversary.html',
    variables: ['name', 'years', 'achievements']
  }
};

// ============================================
// Email Queue Configuration
// ============================================

const emailQueueConfig = {
  enabled: process.env.EMAIL_QUEUE_ENABLED === 'true',
  maxConcurrent: 5,
  retryAttempts: 3,
  retryDelay: 5000, // 5 seconds
  retryBackoff: true,
  timeout: 30000, // 30 seconds
  rateLimit: {
    enabled: true,
    maxPerSecond: 10,
    maxPerMinute: 100,
    maxPerHour: 1000
  }
};

// ============================================
// Email Templates Directory
// ============================================

const TEMPLATES_DIR = path.join(__dirname, '../../templates/email');

// Ensure templates directory exists
if (!fs.existsSync(TEMPLATES_DIR)) {
  fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
  logger.info(`Created email templates directory: ${TEMPLATES_DIR}`);
}

// ============================================
// Email Class
// ============================================

class EmailService {
  constructor(provider = 'smtp') {
    this.provider = provider;
    this.transporter = null;
    this.templates = new Map();
    this.queue = [];
    this.isProcessing = false;
    this.stats = {
      sent: 0,
      failed: 0,
      queued: 0,
      lastSent: null
    };
  }

  /**
   * Initialize email service
   */
  async initialize() {
    logger.info(`Initializing email service with provider: ${this.provider}`);

    try {
      switch(this.provider) {
        case 'smtp':
          await this.initSMTP();
          break;
        case 'sendgrid':
          await this.initSendGrid();
          break;
        case 'mailgun':
          await this.initMailgun();
          break;
        case 'ses':
          await this.initSES();
          break;
        case 'postmark':
          await this.initPostmark();
          break;
        default:
          throw new Error(`Unknown email provider: ${this.provider}`);
      }

      await this.loadTemplates();
      
      logger.info(`Email service initialized successfully with ${this.templates.size} templates`);
      
      // Start queue processor
      if (emailQueueConfig.enabled) {
        this.processQueue();
      }
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      throw error;
    }
  }

  /**
   * Initialize SMTP transporter
   */
  async initSMTP() {
    this.transporter = nodemailer.createTransport(emailProviders.smtp);
    
    // Verify connection
    await this.transporter.verify();
    logger.info('SMTP connection verified');
  }

  /**
   * Initialize SendGrid
   */
  async initSendGrid() {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(emailProviders.sendgrid.apiKey);
    
    this.transporter = {
      send: async (options) => {
        const msg = {
          to: options.to,
          from: {
            email: options.from || emailProviders.sendgrid.from,
            name: options.fromName || emailProviders.sendgrid.fromName
          },
          subject: options.subject,
          html: options.html,
          attachments: options.attachments
        };
        
        return sgMail.send(msg);
      }
    };
  }

  /**
   * Initialize Mailgun
   */
  async initMailgun() {
    const mg = require('mailgun-js')({
      apiKey: emailProviders.mailgun.apiKey,
      domain: emailProviders.mailgun.domain
    });
    
    this.transporter = {
      send: (options) => {
        const data = {
          from: `${options.fromName || emailProviders.mailgun.fromName} <${options.from || emailProviders.mailgun.from}>`,
          to: options.to,
          subject: options.subject,
          html: options.html,
          attachments: options.attachments?.map(a => ({
            filename: a.filename,
            content: a.content,
            contentType: a.contentType
          }))
        };
        
        return mg.messages().send(data);
      }
    };
  }

  /**
   * Initialize AWS SES
   */
  async initSES() {
    const aws = require('aws-sdk');
    const ses = new aws.SES({
      accessKeyId: emailProviders.ses.accessKeyId,
      secretAccessKey: emailProviders.ses.secretAccessKey,
      region: emailProviders.ses.region
    });
    
    this.transporter = nodemailer.createTransport({
      SES: { ses, aws }
    });
  }

  /**
   * Initialize Postmark
   */
  async initPostmark() {
    const postmark = require('postmark');
    const client = new postmark.ServerClient(emailProviders.postmark.apiKey);
    
    this.transporter = {
      send: async (options) => {
        return client.sendEmail({
          From: options.from || emailProviders.postmark.from,
          To: options.to,
          Subject: options.subject,
          HtmlBody: options.html,
          Attachments: options.attachments?.map(a => ({
            Name: a.filename,
            Content: a.content.toString('base64'),
            ContentType: a.contentType
          }))
        });
      }
    };
  }

  /**
   * Load email templates
   */
  async loadTemplates() {
    for (const [name, config] of Object.entries(emailTemplates)) {
      try {
        const templatePath = path.join(TEMPLATES_DIR, config.template);
        
        // Create default template if not exists
        if (!fs.existsSync(templatePath)) {
          await this.createDefaultTemplate(name, config);
        }

        const source = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(source);
        
        this.templates.set(name, {
          template,
          config
        });
      } catch (error) {
        logger.error(`Failed to load template ${name}:`, error);
      }
    }
  }

  /**
   * Create default template
   */
  async createDefaultTemplate(name, config) {
    const templatePath = path.join(TEMPLATES_DIR, config.template);
    
    // Default template structure
    const defaultTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AffiliatePro</h1>
    </div>
    
    <div class="content">
      <h2>{{subject}}</h2>
      
      {{#each config.variables}}
        {{#if @root.[this]}}
          <p>{{this}}: {{@root.[this]}}</p>
        {{/if}}
      {{/each}}
      
      <p>This is a default template for {{name}}. Please customize it.</p>
    </div>
    
    <div class="footer">
      <p>&copy; 2026 AffiliatePro. All rights reserved.</p>
      <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="{{privacyUrl}}">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>`;

    fs.writeFileSync(templatePath, defaultTemplate);
    logger.info(`Created default template: ${name}`);
  }

  /**
   * Render email template
   */
  renderTemplate(templateName, variables = {}) {
    const template = this.templates.get(templateName);
    
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    // Add common variables
    const context = {
      ...variables,
      year: new Date().getFullYear(),
      supportUrl: process.env.SUPPORT_URL || 'https://affiliatepro.com/support',
      privacyUrl: process.env.PRIVACY_URL || 'https://affiliatepro.com/privacy',
      termsUrl: process.env.TERMS_URL || 'https://affiliatepro.com/terms',
      unsubscribeUrl: variables.unsubscribeUrl || 'https://affiliatepro.com/unsubscribe'
    };

    return template.template(context);
  }

  /**
   * Send email
   */
  async send(options) {
    const {
      to,
      subject,
      template,
      variables = {},
      from,
      fromName,
      attachments = [],
      priority = 'normal',
      queue = emailQueueConfig.enabled
    } = options;

    // Render template if provided
    let html = options.html;
    if (template) {
      html = this.renderTemplate(template, variables);
    }

    const emailOptions = {
      to,
      subject,
      html,
      from: from || process.env.EMAIL_FROM || 'noreply@affiliate.com',
      fromName: fromName || process.env.EMAIL_FROM_NAME || 'AffiliatePro',
      attachments: attachments.map(a => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType || 'application/octet-stream'
      }))
    };

    // Queue email if enabled
    if (queue) {
      return this.queueEmail(emailOptions, priority);
    }

    return this.sendNow(emailOptions);
  }

  /**
   * Send email immediately
   */
  async sendNow(emailOptions) {
    try {
      const result = await this.transporter.send(emailOptions);
      
      this.stats.sent++;
      this.stats.lastSent = new Date();
      
      logger.info('Email sent successfully', {
        to: emailOptions.to,
        subject: emailOptions.subject
      });

      return {
        success: true,
        messageId: result.messageId || result.id,
        provider: this.provider
      };
    } catch (error) {
      this.stats.failed++;
      
      logger.error('Failed to send email:', {
        error: error.message,
        to: emailOptions.to,
        subject: emailOptions.subject
      });

      throw error;
    }
  }

  /**
   * Queue email
   */
  async queueEmail(emailOptions, priority = 'normal') {
    const queueItem = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      options: emailOptions,
      priority,
      attempts: 0,
      createdAt: new Date(),
      status: 'queued'
    };

    this.queue.push(queueItem);
    this.stats.queued++;

    logger.debug('Email queued', {
      id: queueItem.id,
      to: emailOptions.to,
      priority
    });

    return {
      success: true,
      queued: true,
      emailId: queueItem.id
    };
  }

  /**
   * Process email queue
   */
  async processQueue() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;

    const processNext = async () => {
      if (this.queue.length === 0) {
        this.isProcessing = false;
        return;
      }

      // Sort by priority
      this.queue.sort((a, b) => {
        const priorityWeight = { high: 3, normal: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      });

      const item = this.queue.shift();
      item.attempts++;
      item.status = 'processing';

      try {
        await this.sendNow(item.options);
        item.status = 'sent';
        this.stats.queued--;
      } catch (error) {
        if (item.attempts < emailQueueConfig.retryAttempts) {
          // Requeue with backoff
          const delay = emailQueueConfig.retryBackoff 
            ? emailQueueConfig.retryDelay * Math.pow(2, item.attempts - 1)
            : emailQueueConfig.retryDelay;
          
          item.status = 'retrying';
          item.retryAt = new Date(Date.now() + delay);
          
          setTimeout(() => {
            this.queue.push(item);
          }, delay);
        } else {
          item.status = 'failed';
          logger.error('Email failed after max retries', {
            id: item.id,
            to: item.options.to,
            attempts: item.attempts
          });
        }
      }

      // Rate limiting
      if (emailQueueConfig.rateLimit.enabled) {
        await new Promise(resolve => setTimeout(resolve, 1000 / emailQueueConfig.rateLimit.maxPerSecond));
      }

      // Process next item
      processNext();
    };

    // Start concurrent processors
    const processors = [];
    for (let i = 0; i < emailQueueConfig.maxConcurrent; i++) {
      processors.push(processNext());
    }

    await Promise.all(processors);
  }

  /**
   * Send bulk emails
   */
  async sendBulk(emails) {
    const results = {
      success: [],
      failed: []
    };

    for (const email of emails) {
      try {
        const result = await this.send(email);
        results.success.push({
          to: email.to,
          result
        });
      } catch (error) {
        results.failed.push({
          to: email.to,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Get email statistics
   */
  getStats() {
    return {
      ...this.stats,
      queueSize: this.queue.length,
      provider: this.provider,
      templates: this.templates.size
    };
  }

  /**
   * Verify email configuration
   */
  async verify() {
    try {
      await this.send({
        to: process.env.ADMIN_EMAIL || 'admin@affiliate.com',
        subject: 'Email Configuration Test',
        html: '<h1>Test Email</h1><p>Your email configuration is working correctly.</p>'
      });

      return {
        success: true,
        provider: this.provider,
        message: 'Email configuration verified'
      };
    } catch (error) {
      return {
        success: false,
        provider: this.provider,
        error: error.message
      };
    }
  }
}

// ============================================
// Create and export email service
// ============================================

const emailService = new EmailService(process.env.EMAIL_PROVIDER || 'smtp');

// Initialize email service
if (process.env.NODE_ENV !== 'test') {
  emailService.initialize().catch(error => {
    logger.error('Failed to initialize email service:', error);
  });
}

module.exports = emailService;
