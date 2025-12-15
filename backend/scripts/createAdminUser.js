const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bhushand620:bhushand620@milk.9obgflc.mongodb.net/Milk_Management?appName=Milk';

// Admin user details - Change these as needed
const adminUser = {
  name: 'Admin User',
  email: 'admin@whitecraft.com',
  password: 'Admin@123', // Change this password after first login
  phone: '9999999999',
  address: 'Admin Address',
  role: 'admin',
  isB2B: false,
  isActive: true
};

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', adminUser.email);
      
      // Update existing user to admin role if not already admin
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        existingAdmin.isActive = true;
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role');
        console.log('📧 Email:', adminUser.email);
        console.log('🔑 Password: (use existing password or reset)');
      } else {
        console.log('✅ User is already an admin');
        console.log('📧 Email:', adminUser.email);
      }
      return;
    }

    // Check if any admin exists
    const anyAdmin = await User.findOne({ role: 'admin' });
    if (anyAdmin) {
      console.log('⚠️  An admin user already exists in the database');
      console.log('📧 Existing admin email:', anyAdmin.email);
      console.log('\nTo create this admin user anyway, delete the existing admin or use a different email.');
      return;
    }

    // Create new admin user
    const admin = new User(adminUser);
    await admin.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password:', adminUser.password);
    console.log('👤 Name:', adminUser.name);
    console.log('📱 Phone:', adminUser.phone);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('⚠️  You can modify admin details in: backend/scripts/createAdminUser.js\n');
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 11000) {
      console.error('   Email already exists. Use a different email or update existing user.');
    }
  }
};

const main = async () => {
  await connectDB();
  await createAdminUser();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
  process.exit(0);
};

main().catch((error) => {
  console.error('❌ Script error:', error);
  process.exit(1);
});

