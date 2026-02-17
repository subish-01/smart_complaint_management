const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const complaintRoutes = require('./routes/complaints');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth');
const chatbotRoutes = require('./routes/chatbot');

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:8000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SCMS Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scms';

// Start server first (even if MongoDB isn't connected yet)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log('⏳ Attempting to connect to MongoDB...');
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('⚠️  Server is running but MongoDB is not connected.');
    console.error('⚠️  Please start MongoDB or update MONGODB_URI in .env file');
    console.error('⚠️  API endpoints will not work until MongoDB is connected.');
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});