// ==============================================
// backend/services/emailService.js
// ईमेल सर्विस - पार्ट 1: सेटअप और कंस्ट्रक्टर
// ==============================================

const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // ईमेल ट्रांसपोर्टर कॉन्फ़िगरेशन
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true' ? true : false, // true for 465, false for 587
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false
            }
        });

        // डिफॉल्ट फ्रॉम एड्रेस
        this.defaultFrom = process.env.EMAIL_FROM || 'noreply@affiliateplatform.com';
        
        // एडमिन ईमेल (नोटिफिकेशन के लिए)
        this.adminEmail = process.env.ADMIN_EMAIL || 'admin@affiliateplatform.com';
        
        // फ्रंटएंड URL
        this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        
        console.log('✅ EmailService initialized');
    }
  // ==============================================
// पार्ट 2: मुख्य ईमेल भेजने के फंक्शन
// ==============================================

    // बेस ईमेल भेजने का फंक्शन
    async sendEmail(to, subject, html, from = null) {
        try {
            // इनपुट वैलिडेशन
            if (!to || !subject || !html) {
                throw new Error('Missing required fields: to, subject, or html');
            }

            const mailOptions = {
                from: from || this.defaultFrom,
                to: Array.isArray(to) ? to.join(', ') : to,
                subject,
                html,
                // टेक्स्ट वर्जन (HTML सपोर्ट न करने वाले क्लाइंट के लिए)
                text: html.replace(/<[^>]*>/g, '')
            };

            // ईमेल भेजें
            const info = await this.transporter.sendMail(mailOptions);
            
            console.log(`📧 Email sent successfully: ${info.messageId}`);
            console.log(`   To: ${to}`);
            console.log(`   Subject: ${subject}`);
            
            return {
                success: true,
                messageId: info.messageId,
                to: to,
                subject: subject
            };

        } catch (error) {
            console.error('❌ Email sending failed:', error.message);
            console.error('   Error details:', error);
            
            return {
                success: false,
                error: error.message,
                to: to,
                subject: subject
            };
        }
    }

    // बल्क ईमेल भेजने का फंक्शन (एक साथ कई लोगों को)
    async sendBulkEmails(recipients, subject, html) {
        const results = [];
        
        for (const recipient of recipients) {
            try {
                const result = await this.sendEmail(
                    recipient.email,
                    subject,
                    this.personalizeHtml(html, recipient)
                );
                results.push({ ...result, email: recipient.email });
                
                // थ्रॉटलिंग - हर ईमेल के बीच 100ms का गैप
                await this.sleep(100);
                
            } catch (error) {
                results.push({
                    success: false,
                    email: recipient.email,
                    error: error.message
                });
            }
        }
        
        return {
            total: recipients.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            details: results
        };
    }

    // हेल्पर फंक्शन: HTML को पर्सनलाइज़ करें
    personalizeHtml(html, recipient) {
        let personalizedHtml = html;
        
        // रिसीवर के डेटा से वेरिएबल रिप्लेस करें
        Object.keys(recipient).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            personalizedHtml = personalizedHtml.replace(regex, recipient[key]);
        });
        
        return personalizedHtml;
    }

    // हेल्पर फंक्शन: स्लीप/डिले
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
                              }
  // ==============================================
// पार्ट 3: ईमेल टेम्प्लेट और एक्सपोर्ट
// ==============================================

    // ========== यूजर ईमेल टेम्प्लेट ==========
    
    // 1. वेलकम ईमेल
    async sendWelcomeEmail(userEmail, userName) {
        const subject = '🎉 Welcome to Affiliate Platform!';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome, ${userName}! 🚀</h1>
                    </div>
                    <div class="content">
                        <h2>Thank you for joining Affiliate Platform!</h2>
                        <p>We're excited to have you as part of our affiliate community. Here's what you can do next:</p>
                        <ul>
                            <li>Complete your profile</li>
                            <li>Browse available campaigns</li>
                            <li>Get your unique affiliate links</li>
                            <li>Start earning commissions</li>
                        </ul>
                        <p>
                            <a href="${this.frontendUrl}/dashboard" class="button">
                                Go to Dashboard
                            </a>
                        </p>
                        <p>If you have any questions, feel free to reply to this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Affiliate Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        return this.sendEmail(userEmail, subject, html);
    }

    // 2. पासवर्ड रीसेट ईमेल
    async sendPasswordResetEmail(userEmail, resetToken) {
        const resetLink = `${this.frontendUrl}/reset-password?token=${resetToken}`;
        const subject = '🔐 Password Reset Request';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #f44336; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .button { display: inline-block; padding: 10px 20px; background: #f44336; color: white; text-decoration: none; border-radius: 5px; }
                    .warning { background: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 10px; border-radius: 5px; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <p>We received a request to reset your password. Click the button below to proceed:</p>
                        <p style="text-align: center;">
                            <a href="${resetLink}" class="button">Reset Password</a>
                        </p>
                        <div class="warning">
                            <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
                        </div>
                        <p>If you didn't request this, please ignore this email and make sure your account is secure.</p>
                        <p>Alternatively, copy and paste this link in your browser:</p>
                        <p style="word-break: break-all; color: #666;">${resetLink}</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Affiliate Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        return this.sendEmail(userEmail, subject, html);
    }

    // 3. ईमेल वेरिफिकेशन
    async sendVerificationEmail(userEmail, verificationToken) {
        const verificationLink = `${this.frontendUrl}/verify-email?token=${verificationToken}`;
        const subject = '✅ Verify Your Email';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .button { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Verify Your Email</h1>
                    </div>
                    <div class="content">
                        <p>Thanks for signing up! Please verify your email address to get started:</p>
                        <p style="text-align: center;">
                            <a href="${verificationLink}" class="button">Verify Email</a>
                        </p>
                        <p>This link will expire in 24 hours.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Affiliate Platform</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        return this.sendEmail(userEmail, subject, html);
    }

    // ========== अफिलिएट ईमेल ==========
    
    // 4. कमीशन अर्निंग नोटिफिकेशन
    async sendCommissionEarnedEmail(affiliateEmail, amount, campaignName, affiliateName) {
        const subject = '💰 Commission Earned!';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #ff9800; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .amount { font-size: 36px; color: #4CAF50; text-align: center; padding: 20px; }
                    .button { display: inline-block; padding: 10px 20px; background: #ff9800; color: white; text-decoration: none; border-radius: 5px; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Congratulations ${affiliateName}! 🎉</h1>
                    </div>
                    <div class="content">
                        <p>Great news! You've earned a new commission:</p>
                        <div class="amount">
                            $${amount}
                        </div>
                        <p>Campaign: <strong>${campaignName}</strong></p>
                        <p>Your balance has been updated. Keep promoting to earn more!</p>
                        <p style="text-align: center;">
                            <a href="${this.frontendUrl}/affiliate/dashboard" class="button">
                                View Dashboard
                            </a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Affiliate Platform</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        return this.sendEmail(affiliateEmail, subject, html);
    }

    // 5. पेमेंट प्रोसेसिंग ईमेल
    async sendPaymentProcessingEmail(affiliateEmail, amount, paymentMethod) {
        const subject = '💵 Payment Processing';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .amount { font-size: 24px; color: #2196F3; text-align: center; padding: 20px; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Payment Processing</h1>
                    </div>
                    <div class="content">
                        <p>Your payment is being processed:</p>
                        <div class="amount">
                            Amount: $${amount}
                        </div>
                        <p>Payment Method: <strong>${paymentMethod}</strong></p>
                        <p>You'll receive another notification once the payment is completed.</p>
                        <p>Processing time: 3-5 business days</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Affiliate Platform</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        return this.sendEmail(affiliateEmail, subject, html);
    }

    // 6. पेमेंट कंप्लीटेड ईमेल
    async sendPaymentCompletedEmail(affiliateEmail, amount, transactionId) {
        const subject = '✅ Payment Completed';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .amount { font-size: 36px; color: #4CAF50; text-align: center; padding: 20px; }
                    .details { background: #f1f1f1; padding: 15px; border-radius: 5px; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Payment Completed! 🎉</h1>
                    </div>
                    <div class="content">
                        <p>Your payment has been successfully processed:</p>
                        <div class="amount">
                            $${amount}
                        </div>
                        <div class="details">
                            <p><strong>Transaction ID:</strong> ${transactionId}</p>
                            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                            <p><strong>Status:</strong> Completed ✅</p>
                        </div>
                        <p>The amount has been sent to your registered payment method.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Affiliate Platform</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        return this.sendEmail(affiliateEmail, subject, html);
    }

    // ========== एडमिन ईमेल ==========
    
    // 7. नए अफिलिएट साइनअप नोटिफिकेशन (एडमिन को)
    async sendNewAffiliateNotification(adminEmail, affiliateData) {
        const subject = '🆕 New Affiliate Signup';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #9c27b0; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .info-box { background: #e1f5fe; padding: 15px; border-radius: 5px; margin: 10px 0; }
                    .button { display: inline-block; padding: 10px 20px; background: #9c27b0; color: white; text-decoration: none; border-radius: 5px; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>New Affiliate Registration</h1>
                    </div>
                    <div class="content">
                        <p>A new affiliate has signed up on the platform:</p>
                        <div class="info-box">
                            <p><strong>Name:</strong> ${affiliateData.name}</p>
                            <p><strong>Email:</strong> ${affiliateData.email}</p>
                            <p><strong>Phone:</strong> ${affiliateData.phone || 'Not provided'}</p>
                            <p><strong>Website:</strong> ${affiliateData.website || 'Not provided'}</p>
                            <p><strong>Signup Date:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                        <p style="text-align: center;">
                            <a href="${this.frontendUrl}/admin/affiliates" class="button">
                                View in Admin Panel
                            </a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Affiliate Platform</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        return this.sendEmail(adminEmail, subject, html);
    }

    // 8. विदड्रॉल रिक्वेस्ट नोटिफिकेशन (एडमिन को)
    async sendWithdrawalRequestNotification(adminEmail, withdrawalData) {
        const subject = '💰 New Withdrawal Request';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #ff9800; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .info-box { background: #fff3e0; padding: 15px; border-radius: 5px; margin: 10px 0; }
                    .amount { font-size: 28px; color: #ff9800; font-weight: bold; }
                    .button { display: inline-block; padding: 10px 20px; background: #ff9800; color: white; text-decoration: none; border-radius: 5px; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>New Withdrawal Request</h1>
                    </div>
                    <div class="content">
                        <p>An affiliate has requested a withdrawal:</p>
                        <div class="info-box">
                            <p><strong>Affiliate:</strong> ${withdrawalData.affiliateName}</p>
                            <p><strong>Email:</strong> ${withdrawalData.affiliateEmail}</p>
                            <p><strong>Amount:</strong> <span class="amount">$${withdrawalData.amount}</span></p>
                            <p><strong>Payment Method:</strong> ${withdrawalData.paymentMethod}</p>
                            <p><strong>Payment Details:</strong> ${withdrawalData.paymentDetails}</p>
                            <p><strong>Request Date:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                        <p style="text-align: center;">
                            <a href="${this.frontendUrl}/admin/withdrawals" class="button">
                                Process Withdrawal
                            </a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Affiliate Platform</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        return this.sendEmail(adminEmail, subject, html);
    }

    // 9. सिस्टम अलर्ट ईमेल (एडमिन को)
    async sendSystemAlertEmail(adminEmail, alertType, message, details = {}) {
        const subject = `⚠️ System Alert: ${alertType}`;
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #f44336; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .alert-box { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 10px 0; }
                    .details { background: #f1f1f1; padding: 15px; border-radius: 5px; font-family: monospace; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⚠️ System Alert</h1>
                    </div>
                    <div class="content">
                        <div class="alert-box">
                            <h2>${alertType}</h2>
                            <p>${message}</p>
                        </div>
                        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                        ${Object.keys(details).length > 0 ? `
                            <div class="details">
                                <h3>Additional Details:</h3>
                                <pre>${JSON.stringify(details, null, 2)}</pre>
                            </div>
                        ` : ''}
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Affiliate Platform</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        return this.sendEmail(adminEmail, subject, html);
    }

    // ========== मार्केटिंग ईमेल ==========
    
    // 10. न्यूज़लेटर ईमेल
    async sendNewsletterEmail(recipients, newsletterData) {
        const subject = newsletterData.subject;
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .campaign { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
                    .campaign:hover { background: #f1f1f1; }
                    .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    .unsubscribe { color: #666; font-size: 11px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>${newsletterData.title}</h1>
                    </div>
                    <div class="content">
                        <p>Hello {{name}}! 👋</p>
                        ${newsletterData.content}
                        
                        <h3>🔥 Featured Campaigns:</h3>
                        ${newsletterData.campaigns.map(campaign => `
                            <div class="campaign">
                                <h4>${campaign.name}</h4>
                                <p>${campaign.description}</p>
                                <p><strong>Commission:</strong> ${campaign.commission}%</p>
                                <p><strong>Ends:</strong> ${campaign.endDate}</p>
                                <p style="text-align: center;">
                                    <a href="${campaign.link}" class="button">Learn More</a>
                                </p>
                            </div>
                        `).join('')}
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Affiliate Platform</p>
                        <p class="unsubscribe">
                            <a href="${this.frontendUrl}/unsubscribe?email={{email}}">Unsubscribe</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        return this.sendBulkEmails(recipients, subject, html);
    }
}

// एक्सपोर्ट करें
module.exports = new EmailService();
```
