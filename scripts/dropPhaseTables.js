require('dotenv').config();
const { sequelize } = require('../models');

async function dropPhaseTables() {
  try {
    console.log('🗑️  Dropping Phase 1 tables...');

    // Drop tables in reverse order to respect foreign key constraints
    const tablesToDrop = [
      'lead_activities',
      'leads',
      'translations',
      'media_library',
      'pages',
      'audit_logs',
      'currencies',
      'branches',
      'agencies',
      'roles'
    ];

    for (const table of tablesToDrop) {
      try {
        await sequelize.query(`DROP TABLE IF EXISTS \`${table}\``);
        console.log(`✅ Dropped table: ${table}`);
      } catch (err) {
        console.log(`ℹ️  Table ${table} doesn't exist or already dropped`);
      }
    }

    console.log('\n✅ All Phase 1 tables dropped successfully!');
    console.log('👉 Now run: npm run init');
    
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  dropPhaseTables();
}

module.exports = dropPhaseTables;
