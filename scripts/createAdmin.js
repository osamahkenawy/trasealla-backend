const { User } = require('../models');
const { connectDB } = require('../config/database');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Admin user data
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@trasealla.com',
      password: 'Admin123!',
      phone: '+1234567890',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      nationality: 'US',
      city: 'New York',
      country: 'United States'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: adminData.email } });
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists with email:', adminData.email);
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
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('\n⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    process.exit(0);
  }
};

// Run the script
createAdminUser();
