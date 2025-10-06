const { User } = require('../models');
const { connectDB } = require('../config/database');
require('dotenv').config();

const createFirstAdmin = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Check if any admin already exists
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.getFullName());
      console.log('🔑 Role:', existingAdmin.role);
      console.log('✅ Status:', existingAdmin.isActive ? 'Active' : 'Inactive');
      return;
    }

    // Create first admin user
    const adminData = {
      firstName: 'Super',
      lastName: 'Admin',
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

    const admin = await User.create(adminData);
    
    console.log('🎉 First admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.getFullName());
    console.log('🔑 Role:', admin.role);
    console.log('🆔 ID:', admin.id);
    console.log('✅ Status:', admin.isActive ? 'Active' : 'Inactive');
    console.log('\n🔐 Login Credentials:');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('\n📝 You can now use this admin account to:');
    console.log('1. Login via POST /api/auth/login');
    console.log('2. Create more admin users via POST /api/auth/create-admin');
    console.log('3. Manage all users via GET /api/auth/users');
    console.log('\n⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating first admin user:', error.message);
  } finally {
    process.exit(0);
  }
};

// Run the script
createFirstAdmin();
