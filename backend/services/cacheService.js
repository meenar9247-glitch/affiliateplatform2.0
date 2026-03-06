// ==============================================
// backend/services/cacheService.js
// कैश सर्विस - पार्ट 1: सेटअप और कंस्ट्रक्टर
// ==============================================

const redis = require('redis');
const NodeCache = require('node-cache');
const crypto = require('crypto');

class CacheService {
    constructor() {
        // रेडिस कॉन्फ़िगरेशन (प्रोडक्शन के लिए)
        this.redisEnabled = process.env.REDIS_ENABLED === 'true';
        this.redisClient = null;
        
        if (this.redisEnabled) {
            this.redisClient = redis.createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379',
                password: process.env.REDIS_PASSWORD,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 10) {
                            console.error('❌ Redis max retries reached');
                            return new Error('Redis max retries reached');
                        }
                        return Math.min(retries * 100, 3000);
                    }
                }
            });

            this.redisClient.on('error', (err) => {
                console.error('❌ Redis Client Error:', err);
                this.redisEnabled = false;
                this.fallbackToMemory();
            });

            this.redisClient.on('connect', () => {
                console.log('✅ Redis connected successfully');
            });

            this.redisClient.connect().catch(err => {
                console.error('❌ Redis connection failed:', err);
                this.redisEnabled = false;
                this.fallbackToMemory();
            });
        }

        // इन-मेमोरी कैश (फॉलबैक और डेवलपमेंट के लिए)
        this.memoryCache = new NodeCache({
            stdTTL: process.env.CACHE_TTL || 300, // 5 minutes default
            checkperiod: 60,
            useClones: false,
            maxKeys: process.env.MAX_CACHE_KEYS || 10000
        });

        // कैश स्टेटिस्टिक्स
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            memoryHits: 0,
            redisHits: 0,
            totalKeys: 0
        };

        // कैश प्रीफिक्स (के लिए)
        this.prefixes = {
            user: 'user:',
            affiliate: 'aff:',
            campaign: 'camp:',
            commission: 'comm:',
            payment: 'pay:',
            click: 'click:',
            conversion: 'conv:',
            session: 'sess:',
            api: 'api:',
            report: 'rpt:',
            settings: 'set:',
            token: 'token:'
        };

        // डिफॉल्ट TTL सेटिंग्स (सेकंड में)
        this.ttl = {
            user: 3600,           // 1 घंटा
            affiliate: 3600,       // 1 घंटा
            campaign: 1800,        // 30 मिनट
            commission: 900,       // 15 मिनट
            payment: 1800,         // 30 मिनट
            click: 300,           // 5 मिनट
            conversion: 600,       // 10 मिनट
            session: 86400,        // 24 घंटे
            api: 60,              // 1 मिनट
            report: 3600,          // 1 घंटा
            settings: 86400,       // 24 घंटे
            token: 300             // 5 मिनट
        };

        console.log('✅ CacheService initialized');
        console.log(`   Redis: ${this.redisEnabled ? 'Enabled' : 'Disabled'}`);
        console.log(`   Memory Cache: Enabled`);
    }

    // फॉलबैक टू मेमोरी कैश
    fallbackToMemory() {
        console.log('⚠️ Falling back to memory cache');
        this.redisEnabled = false;
    }

    // कैश की फॉर्मेट करें
    formatKey(prefix, identifier) {
        return `${prefix}${identifier}`;
    }

    // की जनरेट करें (कॉम्प्लेक्स ऑब्जेक्ट के लिए)
    generateKey(prefix, data) {
        const hash = crypto
            .createHash('md5')
            .update(JSON.stringify(data))
            .digest('hex');
        return `${prefix}${hash}`;
    }

    // TTL गेट करें
    getTTL(type) {
        return this.ttl[type] || process.env.CACHE_TTL || 300;
    }
  // ==============================================
// पार्ट 2: मुख्य कैश फंक्शन
// ==============================================

    // ========== बेसिक कैश ऑपरेशन ==========
    
    // कैश में डेटा सेट करें
    async set(key, value, ttl = null) {
        try {
            const ttlValue = ttl || this.getTTL('default');
            
            // रेडिस में सेट करें (अगर उपलब्ध हो)
            if (this.redisEnabled && this.redisClient?.isReady) {
                await this.redisClient.setEx(key, ttlValue, JSON.stringify(value));
                this.stats.sets++;
                return { success: true, provider: 'redis' };
            }
            
            // मेमोरी कैश में सेट करें
            this.memoryCache.set(key, value, ttlValue);
            this.stats.sets++;
            this.stats.totalKeys = this.memoryCache.keys().length;
            
            return { success: true, provider: 'memory' };

        } catch (error) {
            console.error('❌ Cache set failed:', error.message);
            
            // फॉलबैक टू मेमोरी
            try {
                this.memoryCache.set(key, value, ttl || this.getTTL('default'));
                return { success: true, provider: 'memory', fallback: true };
            } catch (fallbackError) {
                return { success: false, error: error.message };
            }
        }
    }

    // कैश से डेटा गेट करें
    async get(key) {
        try {
            // रेडिस से गेट करें (अगर उपलब्ध हो)
            if (this.redisEnabled && this.redisClient?.isReady) {
                const value = await this.redisClient.get(key);
                
                if (value) {
                    this.stats.hits++;
                    this.stats.redisHits++;
                    return {
                        success: true,
                        data: JSON.parse(value),
                        provider: 'redis',
                        hit: true
                    };
                }
            }

            // मेमोरी कैश से गेट करें
            const memoryValue = this.memoryCache.get(key);
            
            if (memoryValue !== undefined) {
                this.stats.hits++;
                this.stats.memoryHits++;
                return {
                    success: true,
                    data: memoryValue,
                    provider: 'memory',
                    hit: true
                };
            }

            // कैश मिस
            this.stats.misses++;
            return {
                success: true,
                data: null,
                hit: false
            };

        } catch (error) {
            console.error('❌ Cache get failed:', error.message);
            
            // फॉलबैक टू मेमोरी
            try {
                const memoryValue = this.memoryCache.get(key);
                if (memoryValue !== undefined) {
                    return {
                        success: true,
                        data: memoryValue,
                        provider: 'memory',
                        hit: true,
                        fallback: true
                    };
                }
            } catch (fallbackError) {
                // ignore
            }
            
            return {
                success: false,
                error: error.message,
                hit: false
            };
        }
    }

    // कैश से डेटा डिलीट करें
    async del(key) {
        try {
            // रेडिस से डिलीट करें
            if (this.redisEnabled && this.redisClient?.isReady) {
                await this.redisClient.del(key);
            }
            
            // मेमोरी कैश से डिलीट करें
            this.memoryCache.del(key);
            
            this.stats.deletes++;
            this.stats.totalKeys = this.memoryCache.keys().length;
            
            return { success: true };

        } catch (error) {
            console.error('❌ Cache delete failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    // कैश में डेटा है या नहीं चेक करें
    async has(key) {
        try {
            if (this.redisEnabled && this.redisClient?.isReady) {
                const exists = await this.redisClient.exists(key);
                if (exists) return { success: true, exists: true };
            }
            
            const exists = this.memoryCache.has(key);
            return { success: true, exists };

        } catch (error) {
            console.error('❌ Cache check failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    // ========== बल्क ऑपरेशन ==========
    
    // एक साथ कई की वैल्यू गेट करें
    async getMany(keys) {
        const results = {};
        
        for (const key of keys) {
            const result = await this.get(key);
            results[key] = result;
        }
        
        return {
            success: true,
            results,
            total: keys.length,
            hits: Object.values(results).filter(r => r.hit).length
        };
    }

    // एक साथ कई वैल्यू सेट करें
    async setMany(items) {
        const results = [];
        
        for (const item of items) {
            const result = await this.set(item.key, item.value, item.ttl);
            results.push({ ...result, key: item.key });
        }
        
        return {
            success: true,
            results,
            total: items.length,
            successful: results.filter(r => r.success).length
        };
    }

    // एक साथ कई की डिलीट करें
    async delMany(keys) {
        const results = [];
        
        for (const key of keys) {
            const result = await this.del(key);
            results.push({ ...result, key });
        }
        
        return {
            success: true,
            results,
            total: keys.length,
            successful: results.filter(r => r.success).length
        };
    }

    // ========== कैश में/या फंक्शन ==========
    
    // कैश में डेटा नहीं है तो फंक्शन कॉल करें
    async remember(key, ttl, callback) {
        try {
            // कैश से चेक करें
            const cached = await this.get(key);
            
            if (cached.hit && cached.data) {
                return {
                    success: true,
                    data: cached.data,
                    fromCache: true,
                    provider: cached.provider
                };
            }

            // कैश मिस - फंक्शन कॉल करें
            const freshData = await callback();
            
            // कैश में सेव करें
            await this.set(key, freshData, ttl);
            
            return {
                success: true,
                data: freshData,
                fromCache: false
            };

        } catch (error) {
            console.error('❌ Cache remember failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // कैश में डेटा नहीं है तो फंक्शन कॉल करें (फॉरएवर)
    async rememberForever(key, callback) {
        return this.remember(key, 0, callback);
    }

    // ========== कैश टैगिंग ==========
    
    // टैग के साथ डेटा सेट करें
    async setWithTags(key, value, tags = [], ttl = null) {
        const result = await this.set(key, value, ttl);
        
        if (result.success) {
            // टैग्स के लिए इंडेक्स बनाएं
            for (const tag of tags) {
                const tagKey = `tag:${tag}`;
                const tagData = await this.get(tagKey);
                
                let keys = tagData.hit ? tagData.data : [];
                if (!keys.includes(key)) {
                    keys.push(key);
                    await this.set(tagKey, keys, 86400); // 24 घंटे TTL
                }
            }
        }
        
        return result;
    }

    // टैग के हिसाब से की डिलीट करें
    async flushByTag(tag) {
        try {
            const tagKey = `tag:${tag}`;
            const tagData = await this.get(tagKey);
            
            if (tagData.hit && tagData.data) {
                // सभी संबंधित की डिलीट करें
                for (const key of tagData.data) {
                    await this.del(key);
                }
                
                // टैग की डिलीट करें
                await this.del(tagKey);
                
                return {
                    success: true,
                    deletedKeys: tagData.data.length,
                    tag
                };
            }
            
            return {
                success: true,
                deletedKeys: 0,
                tag
            };

        } catch (error) {
            console.error('❌ Tag flush failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // एक साथ कई टैग फ्लश करें
    async flushByTags(tags) {
        const results = [];
        
        for (const tag of tags) {
            const result = await this.flushByTag(tag);
            results.push(result);
        }
        
        return {
            success: true,
            results,
            totalTags: tags.length
        };
        }
  // ==============================================
// पार्ट 3: स्पेशलाइज्ड कैश फंक्शन
// ==============================================

    // ========== यूजर कैश ==========
    
    // यूजर डेटा कैश करें
    async cacheUser(userId, userData) {
        const key = this.formatKey(this.prefixes.user, userId);
        return this.set(key, userData, this.ttl.user);
    }

    // यूजर डेटा गेट करें
    async getUser(userId) {
        const key = this.formatKey(this.prefixes.user, userId);
        return this.get(key);
    }

    // यूजर कैश इनवैलिडेट करें
    async invalidateUser(userId) {
        const key = this.formatKey(this.prefixes.user, userId);
        return this.del(key);
    }

    // ========== अफिलिएट कैश ==========
    
    // अफिलिएट डेटा कैश करें
    async cacheAffiliate(affiliateId, affiliateData) {
        const key = this.formatKey(this.prefixes.affiliate, affiliateId);
        return this.set(key, affiliateData, this.ttl.affiliate);
    }

    // अफिलिएट डेटा गेट करें
    async getAffiliate(affiliateId) {
        const key = this.formatKey(this.prefixes.affiliate, affiliateId);
        return this.get(key);
    }

    // अफिलिएट स्टैट्स कैश करें
    async cacheAffiliateStats(affiliateId, stats) {
        const key = this.formatKey(`${this.prefixes.affiliate}stats:`, affiliateId);
        return this.set(key, stats, this.ttl.affiliate);
    }

    // ========== कैंपेन कैश ==========
    
    // कैंपेन डेटा कैश करें
    async cacheCampaign(campaignId, campaignData) {
        const key = this.formatKey(this.prefixes.campaign, campaignId);
        return this.setWithTags(key, campaignData, ['campaigns'], this.ttl.campaign);
    }

    // कैंपेन डेटा गेट करें
    async getCampaign(campaignId) {
        const key = this.formatKey(this.prefixes.campaign, campaignId);
        return this.get(key);
    }

    // सभी कैंपेन कैश करें
    async cacheAllCampaigns(campaigns) {
        const key = this.formatKey(this.prefixes.campaign, 'all');
        return this.setWithTags(key, campaigns, ['campaigns'], this.ttl.campaign);
    }

    // कैंपेन कैश इनवैलिडेट करें
    async invalidateCampaigns() {
        return this.flushByTag('campaigns');
    }

    // ========== कमीशन कैश ==========
    
    // कमीशन डेटा कैश करें
    async cacheCommission(commissionId, commissionData) {
        const key = this.formatKey(this.prefixes.commission, commissionId);
        return this.set(key, commissionData, this.ttl.commission);
    }

    // अफिलिएट के कमीशन कैश करें
    async cacheAffiliateCommissions(affiliateId, commissions, period = 'monthly') {
        const key = this.formatKey(
            `${this.prefixes.commission}${affiliateId}:`,
            period
        );
        return this.set(key, commissions, this.ttl.commission);
    }

    // ========== पेमेंट कैश ==========
    
    // पेमेंट डेटा कैश करें
    async cachePayment(paymentId, paymentData) {
        const key = this.formatKey(this.prefixes.payment, paymentId);
        return this.set(key, paymentData, this.ttl.payment);
    }

    // अफिलिएट के पेमेंट हिस्ट्री कैश करें
    async cachePaymentHistory(affiliateId, history) {
        const key = this.formatKey(`${this.prefixes.payment}history:`, affiliateId);
        return this.set(key, history, this.ttl.payment);
    }

    // ========== क्लिक और कन्वर्जन कैश ==========
    
    // क्लिक डेटा कैश करें (टेम्परेरी)
    async cacheClick(clickId, clickData) {
        const key = this.formatKey(this.prefixes.click, clickId);
        return this.set(key, clickData, this.ttl.click);
    }

    // कन्वर्जन डेटा कैश करें
    async cacheConversion(conversionId, conversionData) {
        const key = this.formatKey(this.prefixes.conversion, conversionId);
        return this.set(key, conversionData, this.ttl.conversion);
    }

    // क्लिक काउंट इन्क्रीमेंट करें
    async incrementClickCount(campaignId, affiliateId) {
        const key = this.formatKey(
            `${this.prefixes.click}count:${campaignId}:`,
            affiliateId
        );
        
        try {
            if (this.redisEnabled && this.redisClient?.isReady) {
                const count = await this.redisClient.incr(key);
                await this.redisClient.expire(key, 86400); // 24 घंटे
                return { success: true, count };
            } else {
                let count = this.memoryCache.get(key) || 0;
                count++;
                this.memoryCache.set(key, count, 86400);
                return { success: true, count };
            }
        } catch (error) {
            console.error('❌ Increment failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    // ========== सेशन कैश ==========
    
    // सेशन डेटा कैश करें
    async cacheSession(sessionId, sessionData) {
        const key = this.formatKey(this.prefixes.session, sessionId);
        return this.set(key, sessionData, this.ttl.session);
    }

    // सेशन डेटा गेट करें
    async getSession(sessionId) {
        const key = this.formatKey(this.prefixes.session, sessionId);
        return this.get(key);
    }

    // सेशन डिलीट करें
    async deleteSession(sessionId) {
        const key = this.formatKey(this.prefixes.session, sessionId);
        return this.del(key);
    }

    // ========== API रिस्पॉन्स कैश ==========
    
    // API रिस्पॉन्स कैश करें
    async cacheAPIResponse(endpoint, params, response) {
        const key = this.generateKey(this.prefixes.api, { endpoint, params });
        return this.set(key, response, this.ttl.api);
    }

    // कैश्ड API रिस्पॉन्स गेट करें
    async getAPIResponse(endpoint, params) {
        const key = this.generateKey(this.prefixes.api, { endpoint, params });
        return this.get(key);
    }

    // ========== रिपोर्ट कैश ==========
    
    // रिपोर्ट डेटा कैश करें
    async cacheReport(reportType, params, reportData) {
        const key = this.generateKey(this.prefixes.report, { reportType, params });
        return this.set(key, reportData, this.ttl.report);
    }

    // कैश्ड रिपोर्ट गेट करें
    async getReport(reportType, params) {
        const key = this.generateKey(this.prefixes.report, { reportType, params });
        return this.get(key);
    }

    // ========== सेटिंग्स कैश ==========
    
    // सेटिंग्स कैश करें
    async cacheSettings(settings) {
        const key = this.formatKey(this.prefixes.settings, 'all');
        return this.set(key, settings, this.ttl.settings);
    }

    // सेटिंग्स गेट करें
    async getSettings() {
        const key = this.formatKey(this.prefixes.settings, 'all');
        return this.get(key);
    }

    // ========== टोकन कैश ==========
    
    // टोकन कैश करें (ब्लैकलिस्ट के लिए)
    async cacheToken(token, userId, expiry = null) {
        const key = this.formatKey(this.prefixes.token, token);
        return this.set(key, { userId, blacklisted: true }, expiry || this.ttl.token);
    }

    // टोकन चेक करें (ब्लैकलिस्टेड है या नहीं)
    async isTokenBlacklisted(token) {
        const key = this.formatKey(this.prefixes.token, token);
        const result = await this.get(key);
        return result.hit && result.data?.blacklisted;
    }

    // ========== कैश मैनेजमेंट ==========
    
    // सभी कैश क्लियर करें
    async flushAll() {
        try {
            // रेडिस क्लियर करें
            if (this.redisEnabled && this.redisClient?.isReady) {
                await this.redisClient.flushAll();
            }
            
            // मेमोरी कैश क्लियर करें
            this.memoryCache.flushAll();
            
            // स्टैट्स रीसेट करें
            this.stats = {
                hits: 0,
                misses: 0,
                sets: 0,
                deletes: 0,
                memoryHits: 0,
                redisHits: 0,
                totalKeys: 0
            };
            
            return { success: true };

        } catch (error) {
            console.error('❌ Flush all failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    // पैटर्न के हिसाब से की डिलीट करें
    async deletePattern(pattern) {
        try {
            let deletedCount = 0;
            
            // रेडिस से डिलीट करें
            if (this.redisEnabled && this.redisClient?.isReady) {
                const keys = await this.redisClient.keys(pattern);
                if (keys.length > 0) {
                    await this.redisClient.del(keys);
                    deletedCount += keys.length;
                }
            }
            
            // मेमोरी कैश से डिलीट करें (सिंपल पैटर्न मैचिंग)
            const memoryKeys = this.memoryCache.keys();
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            
            for (const key of memoryKeys) {
                if (regex.test(key)) {
                    this.memoryCache.del(key);
                    deletedCount++;
                }
            }
            
            return {
                success: true,
                deletedCount
            };

        } catch (error) {
            console.error('❌ Delete pattern failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    // ========== स्टैटिस्टिक्स ==========
    
    // कैश स्टैटिस्टिक्स गेट करें
    getStats() {
        const memoryKeys = this.memoryCache.keys();
        
        return {
            ...this.stats,
            current: {
                memoryKeys: memoryKeys.length,
                redisConnected: this.redisEnabled && this.redisClient?.isReady,
                memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB में
                uptime: process.uptime()
            },
            ratios: {
                hitRate: this.stats.hits + this.stats.misses > 0
                    ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
                    : 0,
                redisHitRate: this.stats.redisHits > 0
                    ? (this.stats.redisHits / this.stats.hits * 100).toFixed(2)
                    : 0,
                memoryHitRate: this.stats.memoryHits > 0
                    ? (this.stats.memoryHits / this.stats.hits * 100).toFixed(2)
                    : 0
            }
        };
    }

    // कैश हेल्थ चेक करें
    async healthCheck() {
        const status = {
            memory: {
                status: 'healthy',
                keys: this.memoryCache.keys().length,
                memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024
            },
            redis: {
                status: 'disabled',
                connected: false
            }
        };

        // रेडिस हेल्थ चेक
        if (this.redisEnabled && this.redisClient?.isReady) {
            try {
                const ping = await this.redisClient.ping();
                status.redis = {
                    status: ping === 'PONG' ? 'healthy' : 'unhealthy',
                    connected: true,
                    ping
                };
            } catch (error) {
                status.redis = {
                    status: 'unhealthy',
                    connected: true,
                    error: error.message
                };
            }
        }

        return status;
    }

    // ========== हेल्पर फंक्शन ==========
    
    // कैश वार्म-अप करें (अक्सर इस्तेमाल होने वाला डेटा)
    async warmUp(cacheData) {
        const results = [];
        
        for (const item of cacheData) {
            const result = await this.set(item.key, item.value, item.ttl);
            results.push(result);
        }
        
        return {
            success: true,
            warmedUp: results.filter(r => r.success).length,
            total: cacheData.length
        };
    }

    // कैश की TTL अपडेट करें
    async updateTTL(key, ttl) {
        try {
            const value = await this.get(key);
            
            if (value.hit && value.data) {
                await this.set(key, value.data, ttl);
                return { success: true };
            }
            
            return { success: false, reason: 'Key not found' };

        } catch (error) {
            console.error('❌ TTL update failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    // कैश स्नैपशॉट लें (बैकअप के लिए)
    async snapshot() {
        const snapshot = {
            timestamp: new Date().toISOString(),
            stats: this.getStats(),
            memoryKeys: this.memoryCache.keys(),
            memoryData: {}
        };

        // मेमोरी कैश का डेटा सेव करें
        for (const key of snapshot.memoryKeys) {
            snapshot.memoryData[key] = this.memoryCache.get(key);
        }

        return snapshot;
    }
}

// एक्सपोर्ट करें
module.exports = new CacheService();
