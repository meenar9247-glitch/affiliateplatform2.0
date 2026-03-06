// ==============================================
// backend/services/emailService.js
// ईमेल सर्विस - कम्पलीट कोड
// ==============================================

const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // ईमेल ट्रांसपोर्टर कॉन्फ़िगरेशन
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true' ? true : false,
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
        
        // एडमिन ईमेल
        this.adminEmail = process.env.ADMIN_EMAIL || 'admin@affiliateplatform.com';
        
        // फ्रंटएंड URL
        this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        
        console.log('✅ EmailService initialized');
    }

    // ========== मुख्य ईमेल फंक्शन ==========
    
    async sendEmail(to, subject, html, from = null) {
        try {
            if (!to || !subject || !html) {
                throw new Error('Missing required fields: to, subject, or html');
            }

            const mailOptions = {
                from: from || this.defaultFrom,
                to: Array.isArray(to) ? to.join(', ') : to,
                subject,
                html,
                text: html.replace(/<[^>]*>/g, '')
            };

            const info = await this.transporter.sendMail(mailOptions);
            
            console.log(`📧 Email sent successfully: ${info.messageId}`);
            
            return {
                success: true,
                messageId: info.messageId,
                to: to,
                subject: subject
            };

        } catch (error) {
            console.error('❌ Email sending failed:', error.message);
            
            return {
                success: false,
                error: error.message,
                to: to,
                subject: subject
            };
        }
    }

    // ========== वेलकम ईमेल ==========
    
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
                        <p>We're excited to have you as part of our affiliate community.</p>
                        <p>
                            <a href="${this.frontendUrl}/dashboard" class="button">
                                Go to Dashboard
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
        
        return this.sendEmail(userEmail, subject, html);
    }

    // ========== पासवर्ड रीसेट ईमेल ==========
    
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
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <p>Click the button below to reset your password:</p>
                        <p style="text-align: center;">
                            <a href="${resetLink}" class="button">Reset Password</a>
                        </p>
                        <p>This link will expire in 1 hour.</p>
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

    // ========== ईमेल वेरिफिकेशन ==========
    
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
                        <p>Please verify your email address to get started:</p>
                        <p style="text-align: center;">
                            <a href="${verificationLink}" class="button">Verify Email</a>
                        </p>
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

    // ========== कमीशन अर्निंग ईमेल ==========
    
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
                        <p>You've earned a new commission:</p>
                        <div class="amount">$${amount}</div>
                        <p>Campaign: <strong>${campaignName}</strong></p>
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

    // ========== नया अफिलिएट नोटिफिकेशन (एडमिन को) ==========
    
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
                    .info-box { background: #e1f5fe; padding: 15px; border-radius: 5px; }
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
                        <div class="info-box">
                            <p><strong>Name:</strong> ${affiliateData.name}</p>
                            <p><strong>Email:</strong> ${affiliateData.email}</p>
                            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
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

    // ========== विदड्रॉल रिक्वेस्ट नोटिफिकेशन ==========
    
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
                    .info-box { background: #fff3e0; padding: 15px; border-radius: 5px; }
                    .amount { font-size: 24px; color: #ff9800; font-weight: bold; }
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
                        <div class="info-box">
                            <p><strong>Affiliate:</strong> ${withdrawalData.affiliateName}</p>
                            <p><strong>Amount:</strong> <span class="amount">$${withdrawalData.amount}</span></p>
                            <p><strong>Payment Method:</strong> ${withdrawalData.paymentMethod}</p>
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

    // ========== पेमेंट कम्प्लीटेड ईमेल ==========
    
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
                        <div class="amount">$${amount}</div>
                        <div class="details">
                            <p><strong>Transaction ID:</strong> ${transactionId}</p>
                            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>
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
}

// ========== एक्सपोर्ट ==========
module.exports = new EmailService();
