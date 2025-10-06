const { User } = require('../models');
const { connectDB } = require('../config/database');
require('dotenv').config();

const createCustomAdmin = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.log('❌ Usage: node createCustomAdmin.js <firstName> <lastName> <email> [password] [phone]');
      console.log('📝 Example: node createCustomAdmin.js John Doe john@trasealla.com MyPassword123! +1234567890');
      process.exit(1);
    }

    const [firstName, lastName, email, password = 'Admin123!', phone = '+1234567890'] = args;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format');
      process.exit(1);
    }

    // Validate password strength
    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters long');
      process.exit(1);
    }

    // Admin user data
    const adminData = {
      firstName,
      lastName,
      email,
      password,
      phone,
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email } });
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists with email:', email);
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.getFullName());
      console.log('🔑 Role:', existingAdmin.role);
      console.log('✅ Status:', existingAdmin.isActive ? 'Active' : 'Inactive');
      return;
    }

    // Create admin user
    const admin = await User.create(adminData);
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.getFullName());
    console.log('🔑 Role:', admin.role);
    console.log('🆔 ID:', admin.id);
    console.log('✅ Status:', admin.isActive ? 'Active' : 'Inactive');
    console.log('\n🔐 Login Credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\n⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    process.exit(0);
  }
};

// Run the script
createCustomAdmin();
