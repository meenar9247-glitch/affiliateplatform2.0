// ==============================================
// backend/services/paymentService.js
// पेमेंट सर्विस - पार्ट 1: सेटअप और कंस्ट्रक्टर
// ==============================================

const axios = require('axios');
const crypto = require('crypto');

class PaymentService {
    constructor() {
        // पेमेंट गेटवे कॉन्फ़िगरेशन
        this.razorpayConfig = {
            keyId: process.env.RAZORPAY_KEY_ID,
            keySecret: process.env.RAZORPAY_KEY_SECRET,
            webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET
        };

        this.stripeConfig = {
            secretKey: process.env.STRIPE_SECRET_KEY,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
        };

        this.paypalConfig = {
            clientId: process.env.PAYPAL_CLIENT_ID,
            clientSecret: process.env.PAYPAL_CLIENT_SECRET,
            environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox' // sandbox या production
        };

        // डिफॉल्ट करेंसी
        this.currency = process.env.DEFAULT_CURRENCY || 'INR';
        
        // मिनिमम पेमेंट अमाउंट
        this.minPayoutAmount = process.env.MIN_PAYOUT_AMOUNT || 100;
        
        // कमीशन कैलकुलेशन सेटिंग्स
        this.commissionRates = {
            basic: 5,    // 5%
            premium: 10,  // 10%
            elite: 15     // 15%
        };

        console.log('✅ PaymentService initialized');
    }

    // हेल्पर फंक्शन: Razorpay हेडर्स जनरेट करें
    getRazorpayHeaders() {
        const auth = Buffer.from(
            `${this.razorpayConfig.keyId}:${this.razorpayConfig.keySecret}`
        ).toString('base64');
        
        return {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        };
    }

    // हेल्पर फंक्शन: यूनिक आईडी जनरेट करें
    generateTransactionId(prefix = 'TXN') {
        const timestamp = Date.now().toString(36);
        const random = crypto.randomBytes(4).toString('hex').toUpperCase();
        return `${prefix}_${timestamp}_${random}`;
    }

    // हेल्पर फंक्शन: अमाउंट वैलिडेशन
    validateAmount(amount, currency = this.currency) {
        if (!amount || amount <= 0) {
            throw new Error('Invalid amount: Amount must be greater than 0');
        }
        
        if (amount < this.minPayoutAmount) {
            throw new Error(`Amount must be at least ${this.minPayoutAmount} ${currency}`);
        }
        
        return {
            amount: Math.round(amount * 100) / 100, // 2 decimal places तक राउंड करें
            currency: currency
        };
  }
  // ==============================================
// पार्ट 2: मुख्य पेमेंट फंक्शन
// ==============================================

    // ========== Razorpay फंक्शन ==========
    
    // Razorpay से पेमेंट ऑर्डर बनाएं
    async createRazorpayOrder(amount, receiptId, notes = {}) {
        try {
            const validated = this.validateAmount(amount);
            
            const orderData = {
                amount: validated.amount * 100, // Razorpay में पैसे में (₹1 = 100 पैसे)
                currency: validated.currency,
                receipt: receiptId || this.generateTransactionId('RCPT'),
                notes: {
                    ...notes,
                    created_at: new Date().toISOString()
                }
            };

            const response = await axios.post(
                'https://api.razorpay.com/v1/orders',
                orderData,
                { headers: this.getRazorpayHeaders() }
            );

            console.log('✅ Razorpay order created:', response.data.id);
            
            return {
                success: true,
                orderId: response.data.id,
                amount: response.data.amount / 100,
                currency: response.data.currency,
                receipt: response.data.receipt,
                status: response.data.status
            };

        } catch (error) {
            console.error('❌ Razorpay order creation failed:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.description || error.message
            };
        }
    }

    // Razorpay पेमेंट वेरिफाई करें
    async verifyRazorpayPayment(orderId, paymentId, signature) {
        try {
            const body = orderId + '|' + paymentId;
            const expectedSignature = crypto
                .createHmac('sha256', this.razorpayConfig.keySecret)
                .update(body.toString())
                .digest('hex');

            const isValid = expectedSignature === signature;

            if (isValid) {
                console.log('✅ Razorpay payment verified:', paymentId);
                
                // पेमेंट डिटेल्स फेच करें
                const paymentDetails = await this.getRazorpayPaymentDetails(paymentId);
                
                return {
                    success: true,
                    verified: true,
                    orderId,
                    paymentId,
                    paymentDetails
                };
            } else {
                throw new Error('Invalid signature');
            }

        } catch (error) {
            console.error('❌ Razorpay verification failed:', error.message);
            return {
                success: false,
                verified: false,
                error: error.message
            };
        }
    }

    // Razorpay पेमेंट डिटेल्स फेच करें
    async getRazorpayPaymentDetails(paymentId) {
        try {
            const response = await axios.get(
                `https://api.razorpay.com/v1/payments/${paymentId}`,
                { headers: this.getRazorpayHeaders() }
            );

            return {
                id: response.data.id,
                amount: response.data.amount / 100,
                currency: response.data.currency,
                status: response.data.status,
                method: response.data.method,
                email: response.data.email,
                contact: response.data.contact,
                createdAt: new Date(response.data.created_at * 1000).toISOString()
            };

        } catch (error) {
            console.error('Failed to fetch payment details:', error.message);
            return null;
        }
    }

    // ========== Stripe फंक्शन ==========
    
    // Stripe पेमेंट इंटेंट बनाएं
    async createStripePaymentIntent(amount, metadata = {}) {
        try {
            const validated = this.validateAmount(amount);
            
            const paymentIntentData = {
                amount: Math.round(validated.amount * 100), // सेंट में (1$ = 100 सेंट)
                currency: validated.currency.toLowerCase(),
                metadata: {
                    ...metadata,
                    created_at: new Date().toISOString()
                },
                automatic_payment_methods: {
                    enabled: true
                }
            };

            const response = await axios.post(
                'https://api.stripe.com/v1/payment_intents',
                paymentIntentData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.stripeConfig.secretKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            console.log('✅ Stripe payment intent created:', response.data.id);

            return {
                success: true,
                clientSecret: response.data.client_secret,
                paymentIntentId: response.data.id,
                amount: response.data.amount / 100,
                currency: response.data.currency,
                status: response.data.status
            };

        } catch (error) {
            console.error('❌ Stripe payment intent creation failed:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message
            };
        }
    }

    // Stripe पेमेंट कन्फर्म करें
    async confirmStripePayment(paymentIntentId) {
        try {
            const response = await axios.post(
                `https://api.stripe.com/v1/payment_intents/${paymentIntentId}/confirm`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${this.stripeConfig.secretKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            return {
                success: true,
                paymentIntentId: response.data.id,
                status: response.data.status,
                amount: response.data.amount / 100,
                currency: response.data.currency
            };

        } catch (error) {
            console.error('❌ Stripe payment confirmation failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ========== PayPal फंक्शन ==========
    
    // PayPal एक्सेस टोकन प्राप्त करें
    async getPayPalAccessToken() {
        try {
            const auth = Buffer.from(
                `${this.paypalConfig.clientId}:${this.paypalConfig.clientSecret}`
            ).toString('base64');

            const baseUrl = this.paypalConfig.environment === 'production'
                ? 'https://api.paypal.com'
                : 'https://api.sandbox.paypal.com';

            const response = await axios.post(
                `${baseUrl}/v1/oauth2/token`,
                'grant_type=client_credentials',
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            return {
                success: true,
                accessToken: response.data.access_token,
                expiresIn: response.data.expires_in
            };

        } catch (error) {
            console.error('❌ PayPal token generation failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // PayPal ऑर्डर बनाएं
    async createPayPalOrder(amount, customId = null) {
        try {
            const validated = this.validateAmount(amount);
            
            const tokenResult = await this.getPayPalAccessToken();
            if (!tokenResult.success) {
                throw new Error(tokenResult.error);
            }

            const baseUrl = this.paypalConfig.environment === 'production'
                ? 'https://api.paypal.com'
                : 'https://api.sandbox.paypal.com';

            const orderData = {
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: validated.currency,
                        value: validated.amount.toString()
                    },
                    custom_id: customId || this.generateTransactionId('PP')
                }],
                application_context: {
                    brand_name: 'Affiliate Platform',
                    shipping_preference: 'NO_SHIPPING',
                    user_action: 'PAY_NOW'
                }
            };

            const response = await axios.post(
                `${baseUrl}/v2/checkout/orders`,
                orderData,
                {
                    headers: {
                        'Authorization': `Bearer ${tokenResult.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ PayPal order created:', response.data.id);

            return {
                success: true,
                orderId: response.data.id,
                status: response.data.status,
                links: response.data.links,
                amount: validated.amount,
                currency: validated.currency
            };

        } catch (error) {
            console.error('❌ PayPal order creation failed:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    // PayPal पेमेंट कैप्चर करें
    async capturePayPalOrder(orderId) {
        try {
            const tokenResult = await this.getPayPalAccessToken();
            if (!tokenResult.success) {
                throw new Error(tokenResult.error);
            }

            const baseUrl = this.paypalConfig.environment === 'production'
                ? 'https://api.paypal.com'
                : 'https://api.sandbox.paypal.com';

            const response = await axios.post(
                `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${tokenResult.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ PayPal payment captured:', orderId);

            return {
                success: true,
                orderId: response.data.id,
                status: response.data.status,
                captureId: response.data.purchase_units[0].payments.captures[0].id,
                amount: response.data.purchase_units[0].payments.captures[0].amount.value,
                currency: response.data.purchase_units[0].payments.captures[0].amount.currency_code
            };

        } catch (error) {
            console.error('❌ PayPal capture failed:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
              }
  // ==============================================
// पार्ट 3: कमीशन और पेमेंट प्रोसेसिंग फंक्शन
// ==============================================

    // ========== कमीशन कैलकुलेशन ==========
    
    // कमीशन कैलकुलेट करें
    calculateCommission(amount, affiliateTier = 'basic', customRate = null) {
        try {
            const validated = this.validateAmount(amount);
            
            // कस्टम रेट या टियर के हिसाब से रेट चुनें
            const rate = customRate || this.commissionRates[affiliateTier] || this.commissionRates.basic;
            
            // कमीशन कैलकुलेट करें
            const commission = (validated.amount * rate) / 100;
            
            // 2 decimal places तक राउंड करें
            const roundedCommission = Math.round(commission * 100) / 100;
            
            return {
                success: true,
                originalAmount: validated.amount,
                commissionRate: rate,
                commissionAmount: roundedCommission,
                affiliateTier: affiliateTier,
                currency: validated.currency
            };

        } catch (error) {
            console.error('❌ Commission calculation failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // बल्क कमीशन कैलकुलेशन (एक साथ कई ट्रांजैक्शन के लिए)
    calculateBulkCommission(transactions) {
        const results = [];
        let totalCommission = 0;

        for (const txn of transactions) {
            const result = this.calculateCommission(
                txn.amount,
                txn.affiliateTier,
                txn.customRate
            );
            
            if (result.success) {
                totalCommission += result.commissionAmount;
                results.push({
                    ...result,
                    transactionId: txn.id,
                    affiliateId: txn.affiliateId
                });
            }
        }

        return {
            success: true,
            totalTransactions: transactions.length,
            successfulCalculations: results.length,
            totalCommission: Math.round(totalCommission * 100) / 100,
            currency: this.currency,
            details: results
        };
    }

    // ========== विदड्रॉल प्रोसेसिंग ==========
    
    // विदड्रॉल रिक्वेस्ट प्रोसेस करें
    async processWithdrawal(withdrawalData) {
        try {
            const {
                affiliateId,
                amount,
                paymentMethod,
                paymentDetails,
                userId
            } = withdrawalData;

            // अमाउंट वैलिडेट करें
            const validated = this.validateAmount(amount);
            
            // पेमेंट मेथड के हिसाब से प्रोसेस करें
            let paymentResult;
            
            switch (paymentMethod.toLowerCase()) {
                case 'razorpay':
                    paymentResult = await this.createRazorpayOrder(
                        validated.amount,
                        `WDL_${affiliateId}`,
                        { type: 'withdrawal', affiliateId, userId }
                    );
                    break;
                    
                case 'stripe':
                    paymentResult = await this.createStripePaymentIntent(
                        validated.amount,
                        { type: 'withdrawal', affiliateId, userId }
                    );
                    break;
                    
                case 'paypal':
                    paymentResult = await this.createPayPalOrder(
                        validated.amount,
                        `WDL_${affiliateId}`
                    );
                    break;
                    
                case 'bank_transfer':
                    paymentResult = await this.processBankTransfer(
                        validated.amount,
                        paymentDetails,
                        affiliateId
                    );
                    break;
                    
                default:
                    throw new Error(`Unsupported payment method: ${paymentMethod}`);
            }

            if (!paymentResult.success) {
                throw new Error(paymentResult.error);
            }

            // ट्रांजैक्शन रिकॉर्ड बनाएं
            const transaction = {
                transactionId: this.generateTransactionId('WDL'),
                affiliateId,
                amount: validated.amount,
                currency: validated.currency,
                paymentMethod,
                status: 'processing',
                paymentDetails: paymentResult,
                requestedAt: new Date().toISOString(),
                requestedBy: userId
            };

            console.log('✅ Withdrawal request processed:', transaction.transactionId);

            return {
                success: true,
                transaction
            };

        } catch (error) {
            console.error('❌ Withdrawal processing failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // बैंक ट्रांसफर प्रोसेस करें
    async processBankTransfer(amount, bankDetails, affiliateId) {
        try {
            // बैंक डिटेल्स वैलिडेट करें
            if (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountHolder) {
                throw new Error('Incomplete bank details');
            }

            // यहाँ बैंक ट्रांसफर API इंटीग्रेशन होगा
            // फिलहाल डमी रिस्पॉन्स
            
            console.log('Bank transfer initiated for amount:', amount);
            
            return {
                success: true,
                message: 'Bank transfer initiated',
                reference: this.generateTransactionId('BANK'),
                amount,
                bankDetails: {
                    bankName: bankDetails.bankName || 'Not specified',
                    accountLast4: bankDetails.accountNumber.slice(-4),
                    ifscCode: bankDetails.ifscCode
                }
            };

        } catch (error) {
            console.error('Bank transfer failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ========== पेमेंट हिस्ट्री और रिपोर्ट ==========
    
    // अफिलिएट की पेमेंट हिस्ट्री
    async getAffiliatePaymentHistory(affiliateId, filters = {}) {
        try {
            // यहाँ डेटाबेस से पेमेंट हिस्ट्री फेच करें
            // फिलहाल डमी डेटा
            
            const payments = [
                {
                    transactionId: 'TXN_001',
                    amount: 500,
                    currency: 'INR',
                    status: 'completed',
                    date: '2026-02-15T10:30:00Z',
                    method: 'razorpay'
                },
                {
                    transactionId: 'TXN_002',
                    amount: 750,
                    currency: 'INR',
                    status: 'processing',
                    date: '2026-02-20T14:45:00Z',
                    method: 'bank_transfer'
                }
            ];

            // फिल्टर अप्लाई करें
            let filteredPayments = payments;
            
            if (filters.status) {
                filteredPayments = filteredPayments.filter(p => p.status === filters.status);
            }
            
            if (filters.fromDate) {
                filteredPayments = filteredPayments.filter(p => p.date >= filters.fromDate);
            }
            
            if (filters.toDate) {
                filteredPayments = filteredPayments.filter(p => p.date <= filters.toDate);
            }

            // स्टेटिस्टिक्स कैलकुलेट करें
            const stats = {
                totalPayments: filteredPayments.length,
                totalAmount: filteredPayments.reduce((sum, p) => sum + p.amount, 0),
                completedAmount: filteredPayments
                    .filter(p => p.status === 'completed')
                    .reduce((sum, p) => sum + p.amount, 0),
                pendingAmount: filteredPayments
                    .filter(p => p.status === 'processing' || p.status === 'pending')
                    .reduce((sum, p) => sum + p.amount, 0)
            };

            return {
                success: true,
                affiliateId,
                filters,
                stats,
                payments: filteredPayments
            };

        } catch (error) {
            console.error('Failed to fetch payment history:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // पेमेंट रिपोर्ट जनरेट करें
    async generatePaymentReport(startDate, endDate, options = {}) {
        try {
            // यहाँ डेटाबेस से रिपोर्ट डेटा फेच करें
            // फिलहाल डमी डेटा
            
            const report = {
                period: {
                    start: startDate,
                    end: endDate
                },
                summary: {
                    totalTransactions: 150,
                    totalAmount: 75000,
                    successfulPayments: 145,
                    failedPayments: 5,
                    averageTransaction: 500
                },
                breakdownByMethod: {
                    razorpay: { count: 80, amount: 40000 },
                    stripe: { count: 40, amount: 20000 },
                    paypal: { count: 20, amount: 10000 },
                    bank_transfer: { count: 10, amount: 5000 }
                },
                breakdownByStatus: {
                    completed: { count: 140, amount: 70000 },
                    processing: { count: 5, amount: 2500 },
                    failed: { count: 5, amount: 2500 }
                },
                topAffiliates: [
                    { id: 'AFF001', name: 'John Doe', amount: 5000 },
                    { id: 'AFF002', name: 'Jane Smith', amount: 4500 },
                    { id: 'AFF003', name: 'Bob Johnson', amount: 4000 }
                ]
            };

            // रिपोर्ट फॉर्मेट के हिसाब से डेटा तैयार करें
            if (options.format === 'csv') {
                return this.convertToCSV(report);
            } else if (options.format === 'pdf') {
                return this.convertToPDF(report);
            }

            return {
                success: true,
                report
            };

        } catch (error) {
            console.error('Failed to generate payment report:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // CSV कन्वर्जन
    convertToCSV(report) {
        let csv = 'Date,Transaction ID,Affiliate,Amount,Status,Method\n';
        
        // यहाँ CSV डेटा जेनरेट करें
        // फिलहाल डमी डेटा
        
        csv += '2026-02-20,TXN001,John Doe,500,Completed,Razorpay\n';
        csv += '2026-02-20,TXN002,Jane Smith,750,Processing,Stripe\n';
        
        return csv;
    }

    // PDF कन्वर्जन (डमी)
    convertToPDF(report) {
        // यहाँ PDF जेनरेशन लॉजिक होगा
        return {
            success: true,
            message: 'PDF report generated',
            url: '/reports/payment_report_feb2026.pdf'
        };
    }

    // ========== वेबहुक हैंडलिंग ==========
    
    // Razorpay वेबहुक हैंडल करें
    async handleRazorpayWebhook(event, signature) {
        try {
            // सिग्नेचर वेरिफाई करें
            const expectedSignature = crypto
                .createHmac('sha256', this.razorpayConfig.webhookSecret)
                .update(JSON.stringify(event))
                .digest('hex');

            if (expectedSignature !== signature) {
                throw new Error('Invalid webhook signature');
            }

            console.log('✅ Razorpay webhook verified:', event.event);

            // इवेंट टाइप के हिसाब से प्रोसेस करें
            switch (event.event) {
                case 'payment.captured':
                    await this.processPaymentCaptured(event.payload.payment.entity);
                    break;
                    
                case 'payment.failed':
                    await this.processPaymentFailed(event.payload.payment.entity);
                    break;
                    
                case 'order.paid':
                    await this.processOrderPaid(event.payload.order.entity);
                    break;
                    
                default:
                    console.log('Unhandled webhook event:', event.event);
            }

            return {
                success: true,
                event: event.event,
                processed: true
            };

        } catch (error) {
            console.error('❌ Webhook handling failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // पेमेंट कैप्चर्ड प्रोसेस करें
    async processPaymentCaptured(payment) {
        console.log('Processing captured payment:', payment.id);
        // यहाँ डेटाबेस अपडेट करें, कमीशन कैलकुलेट करें, आदि
    }

    // पेमेंट फेल प्रोसेस करें
    async processPaymentFailed(payment) {
        console.log('Processing failed payment:', payment.id);
        // यहाँ फेल हुए पेमेंट को हैंडल करें
    }

    // ऑर्डर पेड प्रोसेस करें
    async processOrderPaid(order) {
        console.log('Processing paid order:', order.id);
        // यहाँ ऑर्डर कम्प्लीट करें
    }

    // ========== रेफंड प्रोसेसिंग ==========
    
    // रेफंड प्रोसेस करें
    async processRefund(transactionId, amount, reason) {
        try {
            // ट्रांजैक्शन वैलिडेट करें
            if (!transactionId) {
                throw new Error('Transaction ID is required');
            }

            const validated = this.validateAmount(amount);
            
            // यहाँ पेमेंट गेटवे के हिसाब से रेफंड प्रोसेस करें
            // फिलहाल डमी रिस्पॉन्स
            
            const refund = {
                refundId: this.generateTransactionId('REF'),
                transactionId,
                amount: validated.amount,
                currency: validated.currency,
                reason: reason || 'Customer requested refund',
                status: 'processing',
                requestedAt: new Date().toISOString()
            };

            console.log('✅ Refund processed:', refund.refundId);

            return {
                success: true,
                refund
            };

        } catch (error) {
            console.error('❌ Refund processing failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // रेफंड स्टेटस चेक करें
    async checkRefundStatus(refundId) {
        try {
            // यहाँ रेफंड स्टेटस चेक करें
            // फिलहाल डमी डेटा
            
            return {
                success: true,
                refundId,
                status: 'completed',
                completedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('Failed to check refund status:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// एक्सपोर्ट करें
module.exports = new PaymentService();
