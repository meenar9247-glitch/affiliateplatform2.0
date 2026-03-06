// ==============================================
// backend/services/smsService.js
// SMS सर्विस - पार्ट 1: सेटअप और कंस्ट्रक्टर
// ==============================================

const twilio = require('twilio');
const axios = require('axios');
const crypto = require('crypto');

class SMSService {
    constructor() {
        // Twilio कॉन्फ़िगरेशन
        this.twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
        this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

        // MSG91 कॉन्फ़िगरेशन (भारत के लिए)
        this.msg91Config = {
            authKey: process.env.MSG91_AUTH_KEY,
            senderId: process.env.MSG91_SENDER_ID || 'AFFPLT',
            route: process.env.MSG91_ROUTE || '4', // 4 = Transactional, 1 = Promotional
            country: process.env.MSG91_COUNTRY || '91' // 91 = India
        };

        // Fast2SMS कॉन्फ़िगरेशन (भारत के लिए वैकल्पिक)
        this.fast2smsConfig = {
            apiKey: process.env.FAST2SMS_API_KEY,
            senderId: process.env.FAST2SMS_SENDER_ID || 'AFFPLT'
        };

        // AWS SNS कॉन्फ़िगरेशन (इंटरनेशनल)
        this.awsConfig = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION || 'ap-south-1'
        };

        // डिफॉल्ट प्रोवाइडर
        this.defaultProvider = process.env.DEFAULT_SMS_PROVIDER || 'twilio';
        
        // SMS टेम्प्लेट
        this.templates = {
            // वेरिफिकेशन
            otp: {
                message: 'Your verification code is {otp}. Valid for 10 minutes.',
                type: 'transactional'
            },
            login_alert: {
                message: 'New login detected from {device} at {time}. If this wasn\'t you, contact support.',
                type: 'alert'
            },
            
            // अफिलिएट नोटिफिकेशन
            commission_earned: {
                message: '💰 You earned ₹{amount} commission from {campaign}!',
                type: 'promotional'
            },
            withdrawal_processed: {
                message: '💵 Your withdrawal of ₹{amount} has been processed. It will reflect in 2-3 days.',
                type: 'transactional'
            },
            withdrawal_completed: {
                message: '✅ Withdrawal of ₹{amount} has been sent to your account.',
                type: 'transactional'
            },
            
            // एडमिन नोटिफिकेशन
            new_affiliate: {
                message: '🆕 New affiliate joined: {name} ({email})',
                type: 'alert'
            },
            new_withdrawal: {
                message: '💰 New withdrawal request: ₹{amount} from {name}',
                type: 'alert'
            },
            low_balance: {
                message: '⚠️ Low balance alert: Current balance is ₹{amount}',
                type: 'alert'
            },
            
            // प्रमोशनल
            campaign_launch: {
                message: '🚀 New campaign launched: {campaign}! Earn up to {commission}% commission.',
                type: 'promotional'
            },
            special_offer: {
                message: '🎉 Special offer: {offer}. Valid until {date}.',
                type: 'promotional'
            },
            
            // सिस्टम
            system_alert: {
                message: '🔧 System alert: {message}',
                type: 'alert'
            },
            maintenance: {
                message: '🛠️ System maintenance scheduled at {time}. Expected downtime: {duration}',
                type: 'alert'
            }
        };

        // रेट लिमिटिंग
        this.rateLimits = {
            perPhone: {
                hourly: 10,    // प्रति घंटे 10 SMS
                daily: 50,      // प्रति दिन 50 SMS
                monthly: 1000   // प्रति महीने 1000 SMS
            }
        };

        // काउंटर (सिंपल इन-मेमोरी - प्रोडक्शन में Redis इस्तेमाल करें)
        this.smsCounters = {
            hourly: new Map(),
            daily: new Map(),
            monthly: new Map()
        };

        console.log('✅ SMSService initialized with provider:', this.defaultProvider);
    }

    // रेट लिमिट चेक करें
    checkRateLimit(phoneNumber) {
        const now = new Date();
        const hourKey = `${phoneNumber}_${now.getHours()}_${now.toDateString()}`;
        const dayKey = `${phoneNumber}_${now.toDateString()}`;
        const monthKey = `${phoneNumber}_${now.getMonth()}_${now.getFullYear()}`;

        // हर घंटे काउंटर रीसेट करें
        if (!this.smsCounters.hourly.has(hourKey)) {
            this.smsCounters.hourly.set(hourKey, 0);
        }
        if (!this.smsCounters.daily.has(dayKey)) {
            this.smsCounters.daily.set(dayKey, 0);
        }
        if (!this.smsCounters.monthly.has(monthKey)) {
            this.smsCounters.monthly.set(monthKey, 0);
        }

        const hourlyCount = this.smsCounters.hourly.get(hourKey);
        const dailyCount = this.smsCounters.daily.get(dayKey);
        const monthlyCount = this.smsCounters.monthly.get(monthKey);

        if (hourlyCount >= this.rateLimits.perPhone.hourly) {
            return { allowed: false, reason: 'Hourly limit exceeded' };
        }
        if (dailyCount >= this.rateLimits.perPhone.daily) {
            return { allowed: false, reason: 'Daily limit exceeded' };
        }
        if (monthlyCount >= this.rateLimits.perPhone.monthly) {
            return { allowed: false, reason: 'Monthly limit exceeded' };
        }

        return { allowed: true };
    }

    // रेट लिमिट काउंटर अपडेट करें
    updateRateLimit(phoneNumber) {
        const now = new Date();
        const hourKey = `${phoneNumber}_${now.getHours()}_${now.toDateString()}`;
        const dayKey = `${phoneNumber}_${now.toDateString()}`;
        const monthKey = `${phoneNumber}_${now.getMonth()}_${now.getFullYear()}`;

        this.smsCounters.hourly.set(hourKey, (this.smsCounters.hourly.get(hourKey) || 0) + 1);
        this.smsCounters.daily.set(dayKey, (this.smsCounters.daily.get(dayKey) || 0) + 1);
        this.smsCounters.monthly.set(monthKey, (this.smsCounters.monthly.get(monthKey) || 0) + 1);

        // पुराने काउंटर हटाएं
        this.cleanupOldCounters();
    }

    // पुराने काउंटर हटाएं
    cleanupOldCounters() {
        const now = new Date();
        
        for (let [key, value] of this.smsCounters.hourly) {
            const [phone, hour, date] = key.split('_');
            if (date !== now.toDateString() || parseInt(hour) !== now.getHours()) {
                this.smsCounters.hourly.delete(key);
            }
        }

        for (let [key, value] of this.smsCounters.daily) {
            const [phone, date] = key.split('_');
            if (date !== now.toDateString()) {
                this.smsCounters.daily.delete(key);
            }
        }

        for (let [key, value] of this.smsCounters.monthly) {
            const [phone, month, year] = key.split('_');
            if (parseInt(month) !== now.getMonth() || parseInt(year) !== now.getFullYear()) {
                this.smsCounters.monthly.delete(key);
            }
        }
    }

    // फोन नंबर वैलिडेट करें
    validatePhoneNumber(phoneNumber) {
        // बेसिक वैलिडेशन
        const cleaned = phoneNumber.replace(/\D/g, '');
        
        // भारतीय नंबर के लिए
        if (cleaned.length === 10) {
            return { valid: true, formatted: `+91${cleaned}` };
        }
        // +91 के साथ
        else if (cleaned.length === 12 && cleaned.startsWith('91')) {
            return { valid: true, formatted: `+${cleaned}` };
        }
        // इंटरनेशनल फॉर्मेट
        else if (cleaned.length > 10 && cleaned.length < 15) {
            return { valid: true, formatted: `+${cleaned}` };
        }
        
        return { valid: false, reason: 'Invalid phone number format' };
    }
// ==============================================
// पार्ट 2: मुख्य SMS फंक्शन
// ==============================================

    // ========== Twilio SMS ==========
    
    // Twilio से SMS भेजें
    async sendViaTwilio(to, message, options = {}) {
        try {
            const result = await this.twilioClient.messages.create({
                body: message,
                from: options.from || this.twilioPhoneNumber,
                to: to,
                statusCallback: options.statusCallback,
                validityPeriod: options.validityPeriod || 600 // 10 मिनट
            });

            console.log(`✅ Twilio SMS sent to ${to}:`, result.sid);

            return {
                success: true,
                provider: 'twilio',
                messageId: result.sid,
                status: result.status,
                price: result.price,
                priceUnit: result.priceUnit
            };

        } catch (error) {
            console.error('❌ Twilio SMS failed:', error.message);
            return {
                success: false,
                provider: 'twilio',
                error: error.message,
                code: error.code
            };
        }
    }

    // ========== MSG91 SMS ==========
    
    // MSG91 से SMS भेजें
    async sendViaMSG91(to, message, options = {}) {
        try {
            // इंडियन नंबर के लिए फॉर्मेट करें
            let phoneNumber = to.replace(/\D/g, '');
            if (phoneNumber.startsWith('91')) {
                phoneNumber = phoneNumber.substring(2);
            }

            const response = await axios.get('https://api.msg91.com/api/sendhttp.php', {
                params: {
                    authkey: this.msg91Config.authKey,
                    mobiles: phoneNumber,
                    message: message,
                    sender: options.senderId || this.msg91Config.senderId,
                    route: options.route || this.msg91Config.route,
                    country: options.country || this.msg91Config.country,
                    response: 'json'
                }
            });

            if (response.data.type === 'success') {
                console.log(`✅ MSG91 SMS sent to ${to}:`, response.data.message);
                return {
                    success: true,
                    provider: 'msg91',
                    messageId: response.data.message,
                    status: 'sent'
                };
            } else {
                throw new Error(response.data.message);
            }

        } catch (error) {
            console.error('❌ MSG91 SMS failed:', error.response?.data || error.message);
            return {
                success: false,
                provider: 'msg91',
                error: error.response?.data?.message || error.message
            };
        }
    }

    // ========== Fast2SMS ==========
    
    // Fast2SMS से SMS भेजें
    async sendViaFast2SMS(to, message, options = {}) {
        try {
            // इंडियन नंबर के लिए फॉर्मेट करें
            let phoneNumber = to.replace(/\D/g, '');
            if (phoneNumber.startsWith('91')) {
                phoneNumber = phoneNumber.substring(2);
            }

            const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
                sender_id: options.senderId || this.fast2smsConfig.senderId,
                message: message,
                route: options.route || 'v3',
                numbers: phoneNumber
            }, {
                headers: {
                    'authorization': this.fast2smsConfig.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.return === true) {
                console.log(`✅ Fast2SMS sent to ${to}:`, response.data.request_id);
                return {
                    success: true,
                    provider: 'fast2sms',
                    messageId: response.data.request_id,
                    status: 'sent'
                };
            } else {
                throw new Error(response.data.message);
            }

        } catch (error) {
            console.error('❌ Fast2SMS failed:', error.response?.data || error.message);
            return {
                success: false,
                provider: 'fast2sms',
                error: error.response?.data?.message || error.message
            };
        }
    }

    // ========== AWS SNS ==========
    
    // AWS SNS से SMS भेजें
    async sendViaAWS(to, message, options = {}) {
        try {
            // AWS SDK डायनामिकली इम्पोर्ट करें
            const AWS = require('aws-sdk');
            
            AWS.config.update({
                accessKeyId: this.awsConfig.accessKeyId,
                secretAccessKey: this.awsConfig.secretAccessKey,
                region: this.awsConfig.region
            });

            const sns = new AWS.SNS();
            
            const params = {
                Message: message,
                PhoneNumber: to,
                MessageAttributes: {
                    'AWS.SNS.SMS.SenderID': {
                        DataType: 'String',
                        StringValue: options.senderId || 'AFFPLT'
                    },
                    'AWS.SNS.SMS.SMSType': {
                        DataType: 'String',
                        StringValue: options.smsType || 'Transactional'
                    }
                }
            };

            const result = await sns.publish(params).promise();
            
            console.log(`✅ AWS SMS sent to ${to}:`, result.MessageId);
            
            return {
                success: true,
                provider: 'aws',
                messageId: result.MessageId,
                status: 'sent'
            };

        } catch (error) {
            console.error('❌ AWS SMS failed:', error.message);
            return {
                success: false,
                provider: 'aws',
                error: error.message
            };
        }
    }

    // ========== मुख्य SMS भेजने का फंक्शन ==========
    
    // SMS भेजें (ऑटो-प्रोवाइडर सेलेक्शन के साथ)
    async sendSMS(to, message, options = {}) {
        try {
            // फोन नंबर वैलिडेट करें
            const validation = this.validatePhoneNumber(to);
            if (!validation.valid) {
                throw new Error(validation.reason);
            }

            const formattedNumber = validation.formatted;

            // रेट लिमिट चेक करें
            const rateLimit = this.checkRateLimit(formattedNumber);
            if (!rateLimit.allowed) {
                throw new Error(`Rate limit exceeded: ${rateLimit.reason}`);
            }

            // प्रोवाइडर चुनें
            let provider = options.provider || this.defaultProvider;
            
            // नंबर के हिसाब से प्रोवाइडर चुनें
            if (formattedNumber.startsWith('+91')) {
                // भारतीय नंबर के लिए MSG91 या Fast2SMS प्राथमिकता
                if (provider === 'twilio' && this.msg91Config.authKey) {
                    provider = 'msg91';
                }
            }

            // SMS भेजें
            let result;
            switch (provider) {
                case 'twilio':
                    result = await this.sendViaTwilio(formattedNumber, message, options);
                    break;
                case 'msg91':
                    result = await this.sendViaMSG91(formattedNumber, message, options);
                    break;
                case 'fast2sms':
                    result = await this.sendViaFast2SMS(formattedNumber, message, options);
                    break;
                case 'aws':
                    result = await this.sendViaAWS(formattedNumber, message, options);
                    break;
                default:
                    throw new Error(`Unknown provider: ${provider}`);
            }

            // सफल होने पर रेट लिमिट अपडेट करें
            if (result.success) {
                this.updateRateLimit(formattedNumber);
                
                // लॉग में सेव करें
                await this.logSMS({
                    to: formattedNumber,
                    message,
                    provider,
                    result,
                    timestamp: new Date().toISOString()
                });
            }

            return result;

        } catch (error) {
            console.error('❌ SMS sending failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // बल्क SMS भेजें
    async sendBulkSMS(recipients, message, options = {}) {
        const results = [];
        
        for (const recipient of recipients) {
            try {
                const personalizedMessage = options.personalize ? 
                    this.personalizeMessage(message, recipient) : message;
                
                const result = await this.sendSMS(
                    recipient.phone,
                    personalizedMessage,
                    options
                );
                
                results.push({
                    ...result,
                    phone: recipient.phone,
                    name: recipient.name
                });

                // थ्रॉटलिंग - 500ms का गैप
                await this.sleep(500);

            } catch (error) {
                results.push({
                    success: false,
                    phone: recipient.phone,
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
  // ==============================================
// पार्ट 3: OTP, टेम्प्लेट और हेल्पर फंक्शन
// ==============================================

    // ========== OTP फंक्शन ==========
    
    // OTP जनरेट करें
    generateOTP(length = 6) {
        const digits = '0123456789';
        let otp = '';
        
        for (let i = 0; i < length; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
        }
        
        return otp;
    }

    // OTP SMS भेजें
    async sendOTP(phoneNumber, otp = null, options = {}) {
        try {
            // OTP जनरेट करें अगर नहीं दिया गया
            const otpCode = otp || this.generateOTP(options.length || 6);
            
            // OTP हैश बनाएं (वेरिफिकेशन के लिए)
            const hash = this.hashOTP(otpCode);
            
            // मैसेज बनाएं
            const message = options.message || 
                `Your verification code is ${otpCode}. Valid for ${options.expiry || 10} minutes.`;
            
            // SMS भेजें
            const result = await this.sendSMS(phoneNumber, message, {
                ...options,
                provider: options.provider || this.defaultProvider
            });

            if (result.success) {
                // OTP डेटा स्टोर करें (प्रोडक्शन में Redis इस्तेमाल करें)
                const otpData = {
                    otp: otpCode,
                    hash: hash,
                    phone: phoneNumber,
                    expiry: Date.now() + (options.expiry || 10) * 60 * 1000,
                    attempts: 0,
                    verified: false
                };
                
                // यहाँ OTP को डेटाबेस या Redis में सेव करें
                await this.storeOTP(phoneNumber, otpData);

                return {
                    success: true,
                    messageId: result.messageId,
                    otp: otpCode, // डेवलपमेंट में ही भेजें, प्रोडक्शन में नहीं
                    expiry: otpData.expiry
                };
            }

            return result;

        } catch (error) {
            console.error('❌ OTP sending failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // OTP हैश बनाएं
    hashOTP(otp) {
        return crypto
            .createHmac('sha256', process.env.OTP_SECRET || 'your-secret-key')
            .update(otp)
            .digest('hex');
    }

    // OTP वेरिफाई करें
    async verifyOTP(phoneNumber, otp, options = {}) {
        try {
            // OTP डेटा फेच करें
            const otpData = await this.getOTPData(phoneNumber);
            
            if (!otpData) {
                return {
                    success: false,
                    verified: false,
                    reason: 'OTP not found or expired'
                };
            }

            // एक्सपायरी चेक करें
            if (Date.now() > otpData.expiry) {
                return {
                    success: false,
                    verified: false,
                    reason: 'OTP expired'
                };
            }

            // अटेम्प्ट्स चेक करें
            if (otpData.attempts >= (options.maxAttempts || 3)) {
                return {
                    success: false,
                    verified: false,
                    reason: 'Maximum attempts exceeded'
                };
            }

            // OTP वेरिफाई करें
            const isValid = otpData.otp === otp || 
                           (options.useHash && otpData.hash === this.hashOTP(otp));

            if (isValid) {
                otpData.verified = true;
                await this.updateOTPData(phoneNumber, otpData);
                
                return {
                    success: true,
                    verified: true,
                    message: 'OTP verified successfully'
                };
            } else {
                otpData.attempts += 1;
                await this.updateOTPData(phoneNumber, otpData);
                
                return {
                    success: false,
                    verified: false,
                    reason: 'Invalid OTP',
                    attemptsLeft: (options.maxAttempts || 3) - otpData.attempts
                };
            }

        } catch (error) {
            console.error('❌ OTP verification failed:', error.message);
            return {
                success: false,
                verified: false,
                error: error.message
            };
        }
    }

    // OTP स्टोर करें (डमी फंक्शन - प्रोडक्शन में Redis या DB इस्तेमाल करें)
    async storeOTP(phoneNumber, otpData) {
        // यहाँ डेटाबेस या Redis में सेव करें
        console.log(`OTP stored for ${phoneNumber}`);
        return true;
    }

    // OTP डेटा फेच करें (डमी फंक्शन)
    async getOTPData(phoneNumber) {
        // यहाँ डेटाबेस या Redis से फेच करें
        return null;
    }

    // OTP डेटा अपडेट करें (डमी फंक्शन)
    async updateOTPData(phoneNumber, otpData) {
        // यहाँ डेटाबेस या Redis में अपडेट करें
        return true;
    }

    // ========== टेम्प्लेट फंक्शन ==========
    
    // टेम्प्लेट से SMS बनाएं
    createSMSFromTemplate(templateName, data = {}) {
        try {
            const template = this.templates[templateName];
            if (!template) {
                throw new Error(`Unknown template: ${templateName}`);
            }

            let message = template.message;
            for (const [key, value] of Object.entries(data)) {
                message = message.replace(new RegExp(`{${key}}`, 'g'), value);
            }

            return {
                message,
                type: template.type
            };
        } catch (error) {
            console.error('❌ Template creation failed:', error.message);
            return null;
        }
    }

    // टेम्प्लेट से SMS भेजें
    async sendTemplateSMS(phoneNumber, templateName, data = {}, options = {}) {
        const template = this.createSMSFromTemplate(templateName, data);
        
        if (!template) {
            return {
                success: false,
                error: `Template '${templateName}' not found`
            };
        }

        return this.sendSMS(phoneNumber, template.message, {
            ...options,
            smsType: template.type === 'transactional' ? 'Transactional' : 'Promotional'
        });
    }

    // ========== स्पेशलाइज्ड SMS फंक्शन ==========
    
    // कमीशन अर्निंग SMS
    async sendCommissionSMS(phoneNumber, affiliateName, amount, campaignName) {
        return this.sendTemplateSMS(phoneNumber, 'commission_earned', {
            amount,
            campaign: campaignName
        }, {
            smsType: 'Promotional'
        });
    }

    // विदड्रॉल अपडेट SMS
    async sendWithdrawalSMS(phoneNumber, amount, status) {
        const templateName = status === 'processed' ? 'withdrawal_processed' : 
                            status === 'completed' ? 'withdrawal_completed' : null;
        
        if (!templateName) return null;

        return this.sendTemplateSMS(phoneNumber, templateName, {
            amount
        }, {
            smsType: 'Transactional'
        });
    }

    // लॉगिन अलर्ट SMS
    async sendLoginAlertSMS(phoneNumber, device, time) {
        return this.sendTemplateSMS(phoneNumber, 'login_alert', {
            device,
            time
        }, {
            smsType: 'Alert'
        });
    }

    // एडमिन अलर्ट SMS
    async sendAdminAlert(phoneNumber, alertType, data) {
        const templateName = alertType === 'new_affiliate' ? 'new_affiliate' :
                            alertType === 'new_withdrawal' ? 'new_withdrawal' :
                            alertType === 'low_balance' ? 'low_balance' : null;

        if (!templateName) return null;

        return this.sendTemplateSMS(phoneNumber, templateName, data, {
            smsType: 'Alert'
        });
    }

    // कैंपेन लॉन्च SMS (बल्क)
    async sendCampaignLaunchSMS(affiliates, campaignData) {
        const recipients = affiliates.map(aff => ({
            phone: aff.phone,
            name: aff.name
        }));

        return this.sendBulkSMS(recipients, null, {
            personalize: true,
            template: 'campaign_launch',
            templateData: {
                campaign: campaignData.name,
                commission: campaignData.commission
            }
        });
    }

    // ========== हेल्पर फंक्शन ==========
    
    // मैसेज पर्सनलाइज़ करें
    personalizeMessage(message, data) {
        let personalized = message;
        for (const [key, value] of Object.entries(data)) {
            personalized = personalized.replace(new RegExp(`{${key}}`, 'g'), value);
        }
        return personalized;
    }

    // SMS लॉग करें
    async logSMS(smsData) {
        // यहाँ डेटाबेस में लॉग सेव करें
        console.log('SMS logged:', smsData);
        return true;
    }

    // SMS स्टेटस चेक करें
    async checkSMSStatus(messageId, provider) {
        try {
            switch (provider) {
                case 'twilio':
                    const message = await this.twilioClient.messages(messageId).fetch();
                    return {
                        success: true,
                        status: message.status,
                        price: message.price,
                        errorCode: message.errorCode
                    };

                case 'msg91':
                    // MSG91 स्टेटस API
                    const response = await axios.get(`https://api.msg91.com/api/status.php`, {
                        params: {
                            authkey: this.msg91Config.authKey,
                            messageId: messageId
                        }
                    });
                    return {
                        success: true,
                        status: response.data.status
                    };

                default:
                    return {
                        success: false,
                        error: 'Status check not available for this provider'
                    };
            }
        } catch (error) {
            console.error('Failed to check SMS status:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // डिलीवरी रिपोर्ट
    async getDeliveryReport(startDate, endDate, options = {}) {
        // यहाँ डेटाबेस से रिपोर्ट जनरेट करें
        return {
            success: true,
            period: { startDate, endDate },
            total: 150,
            delivered: 145,
            failed: 5,
            pending: 0,
            details: {
                byProvider: {
                    twilio: { sent: 80, delivered: 78 },
                    msg91: { sent: 70, delivered: 67 }
                },
                byType: {
                    transactional: { sent: 100, delivered: 98 },
                    promotional: { sent: 50, delivered: 47 }
                }
            }
        };
    }

    // स्लीप फंक्शन
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // प्रोवाइडर बैलेंस चेक करें
    async checkBalance(provider = null) {
        const providers = provider ? [provider] : ['twilio', 'msg91', 'fast2sms'];
        const balances = {};

        for (const prov of providers) {
            try {
                switch (prov) {
                    case 'twilio':
                        const account = await this.twilioClient.api.accounts(this.twilioClient.accountSid).fetch();
                        balances[prov] = {
                            balance: account.balance,
                            currency: 'USD'
                        };
                        break;

                    case 'msg91':
                        const response = await axios.get('https://api.msg91.com/api/wallet.php', {
                            params: { authkey: this.msg91Config.authKey }
                        });
                        balances[prov] = {
                            balance: response.data.wallet,
                            currency: 'INR'
                        };
                        break;

                    default:
                        balances[prov] = {
                            balance: 'Unknown',
                            currency: 'Unknown'
                        };
                }
            } catch (error) {
                balances[prov] = {
                    error: error.message
                };
            }
        }

        return balances;
    }
}

// एक्सपोर्ट करें
module.exports = new SMSService();
