const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bhushand620:bhushand620@milk.9obgflc.mongodb.net/Milk_Management?appName=Milk';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');
    console.log('Database: Milk_Management');
    console.log('Collection: Milk_data');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  connectDB();
});

// Milk Data Schema
const milkDataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'Milk_data',
  timestamps: false
});

// Create index for email uniqueness
milkDataSchema.index({ email: 1 }, { unique: true });

const MilkData = mongoose.model('MilkData', milkDataSchema, 'Milk_data');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const subscriptionRoutes = require('./routes/subscriptions');
const franchiseRoutes = require('./routes/franchises');
const analyticsRoutes = require('./routes/analytics');
const questionRoutes = require('./routes/questions');

// Routes
// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'White Craft Milk Management API is running',
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/franchises', franchiseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/questions', questionRoutes);

// Register new user
app.post('/api/register', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not established. Please try again in a moment.'
      });
    }

    const { name, email, phone, address } = req.body;

    // Validation
    if (!name || !email || !phone || !address) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Trim whitespace
    const trimmedData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim()
    };

    // Create new registration
    const newRegistration = new MilkData(trimmedData);

    await newRegistration.save();

    console.log('✅ New registration saved:', trimmedData.email);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: newRegistration
    });
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get all registrations
app.get('/api/registrations', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not established'
      });
    }

    const registrations = await MilkData.find().sort({ registrationDate: -1 });
    res.json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    console.error('❌ Get registrations error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Start server after database connection
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 API endpoint: http://localhost:${PORT}/api/register`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

