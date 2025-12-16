const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io setup
const io = new Server(server, {
  cors: corsOptions,
  pingTimeout: 60000
});

// Socket.io authentication middleware
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return next(new Error('Authentication error: Invalid or inactive user'));
    }

    socket.userId = user._id.toString();
    socket.userRole = user.role;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error: ' + error.message));
  }
});

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

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.userId} (${socket.userRole})`);

  // Join user-specific room
  socket.join(`user:${socket.userId}`);

  // Join role-specific rooms
  if (socket.userRole === 'admin') {
    socket.join('admin');
  }
  if (socket.userRole === 'delivery_boy') {
    socket.join(`delivery:${socket.userId}`);
    socket.join('delivery');
  }

  // Handle joining order room
  socket.on('track_order', (orderId) => {
    socket.join(`order:${orderId}`);
    console.log(`User ${socket.userId} tracking order ${orderId}`);
  });

  // Handle leaving order room
  socket.on('untrack_order', (orderId) => {
    socket.leave(`order:${orderId}`);
  });

  // Handle delivery location updates
  socket.on('update_location', (data) => {
    if (socket.userRole === 'delivery_boy') {
      // Broadcast location to admin and order room
      io.to('admin').emit('delivery_location_update', {
        deliveryBoyId: socket.userId,
        orderId: data.orderId,
        location: data.location,
        timestamp: new Date()
      });
      if (data.orderId) {
        io.to(`order:${data.orderId}`).emit('delivery_location_update', {
          deliveryBoyId: socket.userId,
          location: data.location,
          timestamp: new Date()
        });
      }
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.userId}`);
  });
});

// Make io available to routes
app.set('io', io);

// Start server after database connection
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 API endpoint: http://localhost:${PORT}/api/register`);
      console.log(`🔌 Socket.io server ready`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

