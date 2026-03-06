// ==============================================
// backend/services/notificationService.js
// नोटिफिकेशन सर्विस - पार्ट 1: सेटअप और कंस्ट्रक्टर
// ==============================================

const nodemailer = require('nodemailer');
const twilio = require('twilio');
const webpush = require('web-push');
const socketIo = require('socket.io');

class NotificationService {
    constructor() {
        // ईमेल कॉन्फ़िगरेशन
        this.emailTransporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // SMS कॉन्फ़िगरेशन (Twilio)
        this.twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
        this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

        // पुश नोटिफिकेशन कॉन्फ़िगरेशन (Web Push)
        webpush.setVapidDetails(
            process.env.VAPID_SUBJECT || 'mailto:admin@affiliateplatform.com',
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );

        // Socket.io सेटअप
        this.io = null;
        this.userSockets = new Map(); // userId -> socketId
        this.userNotifications = new Map(); // userId -> notifications[]

        // नोटिफिकेशन टेम्प्लेट
        this.templates = {
            // अफिलिएट नोटिफिकेशन
            commission_earned: {
                title: '💰 Commission Earned!',
                message: 'You earned ₹{amount} commission from {campaign}',
                type: 'success',
                icon: '💰'
            },
            payment_processed: {
                title: '💵 Payment Processed',
                message: 'Your payment of ₹{amount} has been processed',
                type: 'info',
                icon: '💵'
            },
            payment_completed: {
                title: '✅ Payment Completed',
                message: 'Payment of ₹{amount} has been sent to your account',
                type: 'success',
                icon: '✅'
            },
            withdrawal_requested: {
                title: '💰 Withdrawal Requested',
                message: 'Your withdrawal request of ₹{amount} is being processed',
                type: 'info',
                icon: '💰'
            },
            
            // एडमिन नोटिफिकेशन
            new_affiliate: {
                title: '🆕 New Affiliate',
                message: '{name} ({email}) just joined as an affiliate',
                type: 'info',
                icon: '🆕'
            },
            new_withdrawal_request: {
                title: '💰 New Withdrawal Request',
                message: '{name} requested withdrawal of ₹{amount}',
                type: 'warning',
                icon: '💰'
            },
            low_balance: {
                title: '⚠️ Low Balance Alert',
                message: 'Your wallet balance is below ₹{amount}',
                type: 'warning',
                icon: '⚠️'
            },
            
            // सिस्टम नोटिफिकेशन
            system_alert: {
                title: '🔧 System Alert',
                message: '{message}',
                type: 'error',
                icon: '🔧'
            },
            maintenance: {
                title: '🛠️ Maintenance',
                message: 'System will be down for maintenance at {time}',
                type: 'warning',
                icon: '🛠️'
            }
        };

        console.log('✅ NotificationService initialized');
    }

    // Socket.io सेटअप करें
    initializeSocket(server) {
        this.io = socketIo(server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        this.io.on('connection', (socket) => {
            console.log('🔌 New client connected:', socket.id);

            // यूजर को रजिस्टर करें
            socket.on('register', (userId) => {
                this.userSockets.set(userId, socket.id);
                console.log(`📱 User ${userId} registered with socket ${socket.id}`);
                
                // पेंडिंग नोटिफिकेशन भेजें
                this.sendPendingNotifications(userId);
            });

            socket.on('disconnect', () => {
                // डिस्कनेक्ट हुए यूजर को रिमूव करें
                for (let [userId, socketId] of this.userSockets.entries()) {
                    if (socketId === socket.id) {
                        this.userSockets.delete(userId);
                        console.log(`📱 User ${userId} disconnected`);
                        break;
                    }
                }
            });
        });

        return this.io;
              }
  // ==============================================
// पार्ट 2: मुख्य नोटिफिकेशन फंक्शन
// ==============================================

    // ========== रीयल-टाइम नोटिफिकेशन (Socket.io) ==========
    
    // यूजर को रीयल-टाइम नोटिफिकेशन भेजें
    sendRealTimeNotification(userId, notification) {
        try {
            const socketId = this.userSockets.get(userId);
            
            if (socketId && this.io) {
                this.io.to(socketId).emit('notification', notification);
                console.log(`📱 Real-time notification sent to user ${userId}`);
                return { success: true, delivered: true };
            } else {
                // यूजर ऑनलाइन नहीं है - नोटिफिकेशन स्टोर करें
                this.storeNotification(userId, notification);
                console.log(`📱 User ${userId} offline - notification stored`);
                return { success: true, delivered: false, stored: true };
            }
        } catch (error) {
            console.error('❌ Real-time notification failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    // ब्रॉडकास्ट नोटिफिकेशन (सभी ऑनलाइन यूजर्स को)
    broadcastNotification(notification, userType = null) {
        try {
            if (!this.io) return { success: false, error: 'Socket not initialized' };

            if (userType) {
                // स्पेसिफिक यूजर टाइप को भेजें
                for (let [userId, socketId] of this.userSockets.entries()) {
                    // यहाँ यूजर टाइप चेक करें
                    this.io.to(socketId).emit('notification', notification);
                }
            } else {
                // सभी को भेजें
                this.io.emit('notification', notification);
            }

            console.log(`📢 Broadcast notification sent to ${userType || 'all'} users`);
            return { success: true };
        } catch (error) {
            console.error('❌ Broadcast failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    // पेंडिंग नोटिफिकेशन भेजें
    async sendPendingNotifications(userId) {
        const pending = this.userNotifications.get(userId) || [];
        
        for (const notification of pending) {
            await this.sendRealTimeNotification(userId, notification);
        }
        
        // पेंडिंग नोटिफिकेशन क्लियर करें
        this.userNotifications.delete(userId);
        
        return { success: true, count: pending.length };
    }

    // नोटिफिकेशन स्टोर करें (ऑफलाइन यूजर्स के लिए)
    storeNotification(userId, notification) {
        if (!this.userNotifications.has(userId)) {
            this.userNotifications.set(userId, []);
        }
        
        this.userNotifications.get(userId).push({
            ...notification,
            timestamp: new Date().toISOString(),
            read: false
        });

        // मैक्सिमम 50 नोटिफिकेशन स्टोर करें
        const notifications = this.userNotifications.get(userId);
        if (notifications.length > 50) {
            notifications.shift();
        }
    }

    // ========== पुश नोटिफिकेशन (Web Push) ==========
    
    // वेब पुश नोटिफिकेशन भेजें
    async sendPushNotification(subscription, payload) {
        try {
            await webpush.sendNotification(subscription, JSON.stringify(payload));
            console.log('📱 Push notification sent');
            return { success: true };
        } catch (error) {
            console.error('❌ Push notification failed:', error.message);
            
            // सब्सक्रिप्शन एक्सपायर हो गया है
            if (error.statusCode === 410) {
                return { success: false, expired: true, error: error.message };
            }
            
            return { success: false, error: error.message };
        }
    }

    // बल्क पुश नोटिफिकेशन भेजें
    async sendBulkPushNotifications(subscriptions, payload) {
        const results = [];
        
        for (const subscription of subscriptions) {
            const result = await this.sendPushNotification(subscription, payload);
            results.push(result);
            
            // थ्रॉटलिंग - 100ms का गैप
            await this.sleep(100);
        }

        return {
            total: subscriptions.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            expired: results.filter(r => r.expired).length,
            details: results
        };
    }

    // ========== ईमेल नोटिफिकेशन ==========
    
    // ईमेल नोटिफिकेशन भेजें
    async sendEmailNotification(to, subject, html) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || 'noreply@affiliateplatform.com',
                to,
                subject,
                html
            };

            const info = await this.emailTransporter.sendMail(mailOptions);
            console.log(`📧 Email sent to ${to}:`, info.messageId);
            
            return {
                success: true,
                messageId: info.messageId
            };
        } catch (error) {
            console.error('❌ Email notification failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // बल्क ईमेल भेजें
    async sendBulkEmails(recipients, subject, html) {
        const results = [];
        
        for (const recipient of recipients) {
            const result = await this.sendEmailNotification(
                recipient.email,
                this.personalizeText(subject, recipient),
                this.personalizeHtml(html, recipient)
            );
            results.push({ ...result, email: recipient.email });
            
            await this.sleep(200); // थ्रॉटलिंग
        }

        return {
            total: recipients.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            details: results
        };
    }

    // ========== SMS नोटिफिकेशन ==========
    
    // SMS भेजें
    async sendSMS(to, message) {
        try {
            const result = await this.twilioClient.messages.create({
                body: message,
                from: this.twilioPhoneNumber,
                to: to
            });

            console.log(`📱 SMS sent to ${to}:`, result.sid);
            
            return {
                success: true,
                messageId: result.sid,
                status: result.status
            };
        } catch (error) {
            console.error('❌ SMS notification failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // बल्क SMS भेजें
    async sendBulkSMS(recipients, message) {
        const results = [];
        
        for (const recipient of recipients) {
            const personalizedMessage = this.personalizeText(message, recipient);
            const result = await this.sendSMS(recipient.phone, personalizedMessage);
            results.push({ ...result, phone: recipient.phone });
            
            await this.sleep(500); // SMS के लिए ज्यादा थ्रॉटलिंग
        }

        return {
            total: recipients.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            details: results
        };
                                                   }
  // ==============================================
// पार्ट 3: नोटिफिकेशन टेम्प्लेट और हेल्पर फंक्शन
// ==============================================

    // ========== नोटिफिकेशन टेम्प्लेट ==========
    
    // टेम्प्लेट से नोटिफिकेशन बनाएं
    createNotification(type, data = {}, channels = ['realtime']) {
        try {
            const template = this.templates[type];
            if (!template) {
                throw new Error(`Unknown notification type: ${type}`);
            }

            // मैसेज को पर्सनलाइज़ करें
            let message = template.message;
            for (const [key, value] of Object.entries(data)) {
                message = message.replace(`{${key}}`, value);
            }

            const notification = {
                id: this.generateNotificationId(),
                type,
                title: template.title,
                message,
                icon: template.icon,
                data,
                timestamp: new Date().toISOString(),
                read: false,
                channels
            };

            return notification;
        } catch (error) {
            console.error('❌ Notification creation failed:', error.message);
            return null;
        }
    }

    // नोटिफिकेशन आईडी जनरेट करें
    generateNotificationId() {
        return 'NOTIF_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ========== मल्टी-चैनल नोटिफिकेशन ==========
    
    // सभी चैनलों पर नोटिफिकेशन भेजें
    async sendMultiChannelNotification(userId, notification, userData = {}) {
        const results = {};
        const channels = notification.channels || ['realtime'];

        // रीयल-टाइम नोटिफिकेशन
        if (channels.includes('realtime')) {
            results.realtime = this.sendRealTimeNotification(userId, notification);
        }

        // ईमेल नोटिफिकेशन
        if (channels.includes('email') && userData.email) {
            const emailHtml = this.createEmailTemplate(notification);
            results.email = await this.sendEmailNotification(
                userData.email,
                notification.title,
                emailHtml
            );
        }

        // SMS नोटिफिकेशन
        if (channels.includes('sms') && userData.phone) {
            results.sms = await this.sendSMS(
                userData.phone,
                notification.message
            );
        }

        // पुश नोटिफिकेशन
        if (channels.includes('push') && userData.pushSubscription) {
            results.push = await this.sendPushNotification(
                userData.pushSubscription,
                {
                    title: notification.title,
                    body: notification.message,
                    icon: '/icons/notification-icon.png',
                    data: notification.data
                }
            );
        }

        return {
            success: true,
            notificationId: notification.id,
            results
        };
    }

    // ========== ईमेल टेम्प्लेट ==========
    
    // ईमेल टेम्प्लेट बनाएं
    createEmailTemplate(notification) {
        const { title, message, icon, data } = notification;
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 20px; 
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }
                    .content { 
                        padding: 20px; 
                        background: #f9f9f9;
                        border: 1px solid #ddd;
                        border-top: none;
                    }
                    .icon { font-size: 48px; text-align: center; padding: 20px; }
                    .message { font-size: 16px; padding: 20px; background: white; border-radius: 5px; }
                    .button { 
                        display: inline-block; 
                        padding: 10px 20px; 
                        background: #667eea; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 5px;
                        margin: 10px 0;
                    }
                    .footer { 
                        text-align: center; 
                        padding: 20px; 
                        color: #666; 
                        font-size: 12px;
                        border-top: 1px solid #ddd;
                    }
                    .details {
                        background: #e8f4fd;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 10px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>${title}</h1>
                    </div>
                    <div class="content">
                        <div class="icon">${icon}</div>
                        <div class="message">
                            ${message}
                        </div>
                        
                        ${Object.keys(data).length > 0 ? `
                            <div class="details">
                                <h3>Details:</h3>
                                <ul>
                                    ${Object.entries(data).map(([key, value]) => `
                                        <li><strong>${key}:</strong> ${value}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        <div style="text-align: center;">
                            <a href="${process.env.FRONTEND_URL}/notifications" class="button">
                                View Details
                            </a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Affiliate Platform. All rights reserved.</p>
                        <p>
                            <a href="${process.env.FRONTEND_URL}/settings/notifications">Notification Settings</a> | 
                            <a href="${process.env.FRONTEND_URL}/unsubscribe?type=notifications">Unsubscribe</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    // ========== स्पेशलाइज्ड नोटिफिकेशन ==========
    
    // अफिलिएट को कमीशन नोटिफिकेशन
    async sendCommissionNotification(affiliateId, affiliateData, commissionData) {
        const notification = this.createNotification('commission_earned', {
            amount: commissionData.amount,
            campaign: commissionData.campaignName
        });

        return this.sendMultiChannelNotification(affiliateId, notification, {
            email: affiliateData.email,
            phone: affiliateData.phone,
            pushSubscription: affiliateData.pushSubscription
        });
    }

    // एडमिन को नए अफिलिएट का नोटिफिकेशन
    async sendNewAffiliateNotification(adminId, adminEmail, affiliateData) {
        const notification = this.createNotification('new_affiliate', {
            name: affiliateData.name,
            email: affiliateData.email
        });

        return this.sendMultiChannelNotification(adminId, notification, {
            email: adminEmail
        });
    }

    // एडमिन को विदड्रॉल रिक्वेस्ट नोटिफिकेशन
    async sendWithdrawalRequestNotification(adminId, adminEmail, withdrawalData) {
        const notification = this.createNotification('new_withdrawal_request', {
            name: withdrawalData.affiliateName,
            amount: withdrawalData.amount
        });

        return this.sendMultiChannelNotification(adminId, notification, {
            email: adminEmail
        });
    }

    // सिस्टम अलर्ट नोटिफिकेशन (सभी एडमिन को)
    async sendSystemAlert(alertMessage, severity = 'high') {
        const notification = this.createNotification('system_alert', {
            message: alertMessage
        });

        // सभी एडमिन को ब्रॉडकास्ट करें
        return this.broadcastNotification(notification, 'admin');
    }

    // ========== नोटिफिकेशन मैनेजमेंट ==========
    
    // नोटिफिकेशन को रीड मार्क करें
    markAsRead(userId, notificationIds) {
        const notifications = this.userNotifications.get(userId) || [];
        
        for (const notification of notifications) {
            if (notificationIds.includes(notification.id)) {
                notification.read = true;
            }
        }

        return { success: true, marked: notificationIds.length };
    }

    // सभी नोटिफिकेशन रीड मार्क करें
    markAllAsRead(userId) {
        const notifications = this.userNotifications.get(userId) || [];
        
        for (const notification of notifications) {
            notification.read = true;
        }

        return { success: true, count: notifications.length };
    }

    // यूजर के नोटिफिकेशन गेट करें
    getUserNotifications(userId, filter = {}) {
        let notifications = this.userNotifications.get(userId) || [];
        
        if (filter.unreadOnly) {
            notifications = notifications.filter(n => !n.read);
        }
        
        if (filter.type) {
            notifications = notifications.filter(n => n.type === filter.type);
        }
        
        if (filter.limit) {
            notifications = notifications.slice(-filter.limit);
        }

        return {
            success: true,
            total: notifications.length,
            unread: notifications.filter(n => !n.read).length,
            notifications: notifications.reverse() // नए वाले पहले
        };
    }

    // पुराने नोटिफिकेशन डिलीट करें
    cleanupOldNotifications(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        for (let [userId, notifications] of this.userNotifications.entries()) {
            const filtered = notifications.filter(n => 
                new Date(n.timestamp) > cutoffDate
            );
            
            if (filtered.length !== notifications.length) {
                this.userNotifications.set(userId, filtered);
                console.log(`🧹 Cleaned ${notifications.length - filtered.length} old notifications for user ${userId}`);
            }
        }

        return { success: true };
    }

    // ========== हेल्पर फंक्शन ==========
    
    // टेक्स्ट पर्सनलाइज़ करें
    personalizeText(text, data) {
        let personalized = text;
        for (const [key, value] of Object.entries(data)) {
            personalized = personalized.replace(new RegExp(`{${key}}`, 'g'), value);
        }
        return personalized;
    }

    // HTML पर्सनलाइज़ करें
    personalizeHtml(html, data) {
        let personalized = html;
        for (const [key, value] of Object.entries(data)) {
            personalized = personalized.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        return personalized;
    }

    // स्लीप फंक्शन (थ्रॉटलिंग के लिए)
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // नोटिफिकेशन स्टेटस चेक करें
    getNotificationStats() {
        return {
            totalUsers: this.userSockets.size,
            onlineUsers: this.userSockets.size,
            totalStoredNotifications: Array.from(this.userNotifications.values())
                .reduce((acc, curr) => acc + curr.length, 0),
            notificationTypes: Object.keys(this.templates).length
        };
    }
}

// एक्सपोर्ट करें
module.exports = new NotificationService();
