require('dotenv').config();
const { sequelize } = require('../models');

async function addUserStatusColumn() {
  try {
    console.log('🔧 Adding status column to users table...');

    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'trasealla_db'}' 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'status'
    `);

    if (results.length > 0) {
      console.log('ℹ️  Status column already exists');
    } else {
      // Add the status column
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN status ENUM('active', 'inactive', 'suspended') 
        NOT NULL DEFAULT 'active' 
        AFTER is_active
      `);
      console.log('✅ Status column added successfully');
    }

    // Sync existing users: set status based on isActive
    await sequelize.query(`
      UPDATE users 
      SET status = CASE 
        WHEN is_active = 1 THEN 'active'
        ELSE 'inactive'
      END
      WHERE status IS NULL OR status = 'active'
    `);
    console.log('✅ Existing users synced with status values');

    console.log('\n✅ Migration completed successfully!');
    console.log('👉 Server will restart automatically (nodemon)');
    
  } catch (error) {
    console.error('❌ Error adding status column:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  addUserStatusColumn();
}

module.exports = addUserStatusColumn;
