const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const Currency = sequelize.define('Currency', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(3),
    unique: true,
    allowNull: false // ISO 4217 code
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  symbol: {
    type: DataTypes.STRING(5)
  },
  exchangeRate: {
    type: DataTypes.DECIMAL(10, 6),
    defaultValue: 1.0 // Rate against base currency (USD)
  },
  decimals: {
    type: DataTypes.INTEGER,
    defaultValue: 2
  },
  isBaseCurrency: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastUpdated: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  tableName: 'currencies',
  underscored: true
});

module.exports = Currency;
