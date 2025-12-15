const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bhushand620:bhushand620@milk.9obgflc.mongodb.net/Milk_Management?appName=Milk';

// Default admin user details (used if no command-line arguments provided)
const defaultAdminUser = {
  name: 'Admin User',
  email: 'admin@whitecraft.com',
  password: 'Admin@123', // Change this password after first login
  phone: '9999999999',
  address: 'Admin Address',
  role: 'admin',
  isB2B: false,
  isActive: true
};

// Parse command-line arguments
const parseArgs = () => {
  const args = {};
  const argv = process.argv.slice(2);
  
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    
    if (arg === '--help' || arg === '-h') {
      return { help: true };
    }
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1];
      
      if (value && !value.startsWith('--')) {
        args[key] = value;
        i++; // Skip next argument as it's the value
      } else {
        args[key] = true; // Boolean flag
      }
    }
  }
  
  return args;
};

// Show help message
const showHelp = () => {
  console.log('\n📖 Admin User Creation Script Help\n');
  console.log('Usage:');
  console.log('  npm run create:admin -- [options]\n');
  console.log('Options:');
  console.log('  --name <name>        Admin name (required)');
  console.log('  --email <email>      Admin email (required)');
  console.log('  --password <pass>    Admin password, min 6 chars (required)');
  console.log('  --phone <phone>      Admin phone number (required)');
  console.log('  --address <address>  Admin address (optional)');
  console.log('  --help, -h           Show this help message\n');
  console.log('Examples:');
  console.log('  npm run create:admin -- --name "John Admin" --email "john@example.com" --password "SecurePass123" --phone "9876543210"');
  console.log('  npm run create:admin -- --name "Jane Admin" --email "jane@example.com" --password "Pass123" --phone "9876543211" --address "Admin Address"\n');
  console.log('Note: If no arguments provided, default admin will be created.');
  console.log('      Default: admin@whitecraft.com / Admin@123\n');
};

// Validate admin user data
const validateAdminUser = (adminUser) => {
  const errors = [];
  
  if (!adminUser.name || adminUser.name.trim() === '') {
    errors.push('Name is required');
  }
  
  if (!adminUser.email || adminUser.email.trim() === '') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(adminUser.email)) {
      errors.push('Please enter a valid email address');
    }
  }
  
  if (!adminUser.password || adminUser.password.length < 6) {
    errors.push('Password is required and must be at least 6 characters');
  }
  
  if (!adminUser.phone || adminUser.phone.trim() === '') {
    errors.push('Phone number is required');
  }
  
  return errors;
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

const createAdminUser = async (adminUserData) => {
  try {
    // Validate admin user data
    const validationErrors = validateAdminUser(adminUserData);
    if (validationErrors.length > 0) {
      console.error('❌ Validation errors:');
      validationErrors.forEach(error => console.error(`   - ${error}`));
      return;
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: adminUserData.email.toLowerCase().trim() });
    
    if (existingUser) {
      // If user exists and is already admin, inform user
      if (existingUser.role === 'admin') {
        console.log('⚠️  Admin user already exists with email:', adminUserData.email);
        console.log('✅ User is already an admin');
        console.log('📧 Email:', adminUserData.email);
        return;
      }
      
      // If user exists but is not admin, update to admin role
      existingUser.role = 'admin';
      existingUser.isActive = true;
      if (adminUserData.name) existingUser.name = adminUserData.name;
      if (adminUserData.phone) existingUser.phone = adminUserData.phone;
      if (adminUserData.address !== undefined) existingUser.address = adminUserData.address;
      // Note: Password update would require rehashing, so we skip it here
      await existingUser.save();
      
      console.log('✅ Updated existing user to admin role');
      console.log('📧 Email:', adminUserData.email);
      console.log('🔑 Password: (use existing password or reset)');
      return;
    }

    // Create new admin user
    const admin = new User({
      name: adminUserData.name.trim(),
      email: adminUserData.email.toLowerCase().trim(),
      password: adminUserData.password,
      phone: adminUserData.phone.trim(),
      address: adminUserData.address || '',
      role: 'admin',
      isB2B: false,
      isActive: true
    });
    
    await admin.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', adminUserData.email);
    console.log('🔑 Password:', adminUserData.password);
    console.log('👤 Name:', adminUserData.name);
    console.log('📱 Phone:', adminUserData.phone);
    if (adminUserData.address) {
      console.log('📍 Address:', adminUserData.address);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('💡 Tip: Use command-line arguments to create multiple admins easily.\n');
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 11000) {
      console.error('   Email already exists. Use a different email.');
    }
  }
};

const main = async () => {
  const args = parseArgs();
  
  // Show help if requested
  if (args.help) {
    showHelp();
    process.exit(0);
  }
  
  // Build admin user object from arguments or use defaults
  let adminUser;
  
  if (args.name || args.email || args.password || args.phone) {
    // Use command-line arguments
    adminUser = {
      name: args.name || '',
      email: args.email || '',
      password: args.password || '',
      phone: args.phone || '',
      address: args.address || ''
    };
  } else {
    // Use default values (backward compatibility)
    adminUser = defaultAdminUser;
  }
  
  await connectDB();
  await createAdminUser(adminUser);
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
  process.exit(0);
};

main().catch((error) => {
  console.error('❌ Script error:', error);
  process.exit(1);
});

