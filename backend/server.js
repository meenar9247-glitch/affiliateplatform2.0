const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// Load env vars
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const affiliateRoutes = require('./routes/affiliates');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS with frontend URL
app.use(cors({
  origin: true,    
  credentials: true
}));

// ✅ ROOT ROUTE
app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});

// ✅ API TEST ROUTE (Frontend ke liye)
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend API is working!',
    timestamp: new Date()
  });
});

// Database connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/affiliate-platform';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected successfully');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.warn('⚠️ Server running without database. Set MONGODB_URI env var to connect to MongoDB.');
  // process.exit(1) ← HATAYA! Server crash nahi hoga
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/affiliates', affiliateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
