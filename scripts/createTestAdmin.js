require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../models');

async function createTestAdmin() {
  try {
    console.log('🔧 Creating test admin user...');

    // Check if admin exists
    let admin = await User.findOne({ 
      where: { email: 'admin@trasealla.com' } 
    });

    if (admin) {
      console.log('ℹ️  Admin user already exists');
      console.log('📧 Email: admin@trasealla.com');
      console.log('🔑 Updating password to: Admin123456!');
      
      // Update password (User model hook will hash it)
      await admin.update({ 
        password: 'Admin123456!',
        role: 'admin',
        isActive: true 
      });
      
      console.log('✅ Admin password updated!');
    } else {
      // Create new admin (User model hook will hash password)
      admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@trasealla.com',
        password: 'Admin123456!',
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      });
      
      console.log('✅ New admin user created!');
    }

    console.log('\n📋 Admin Credentials:');
    console.log('   Email: admin@trasealla.com');
    console.log('   Password: Admin123456!');
    console.log('   Role: admin');
    console.log('\n🚀 You can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  createTestAdmin();
}

module.exports = createTestAdmin;
