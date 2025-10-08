require('dotenv').config();
const { sequelize } = require('../models');

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database schema issues...');

    // Drop users table to fix index issues
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.query('DROP TABLE IF EXISTS `users`');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Dropped users table');

    // Now sync all models
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Database schema recreated');

    console.log('\n✅ Database fixed successfully!');
    console.log('👉 Now run: npm run init');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  fixDatabase();
}

module.exports = fixDatabase;
