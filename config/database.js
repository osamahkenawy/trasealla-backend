const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'trasealla_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'RootPassword123!',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

// Test database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync database in development
    if (process.env.NODE_ENV === 'development') {
      // Use alter: false to avoid index accumulation issues
      // Run npm run init to properly initialize tables
      await sequelize.sync({ alter: false });
      console.log('🔄 Database synchronized');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  connectDB
};
