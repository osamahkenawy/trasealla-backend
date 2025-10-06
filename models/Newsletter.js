const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Newsletter = sequelize.define('Newsletter', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  subscriptionSource: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'footer, popup, checkout, etc.'
  },
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Email preferences and interests'
  },
  unsubscribedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  unsubscribeReason: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'newsletters',
  indexes: [
    { fields: ['email'] },
    { fields: ['is_active'] }
  ]
});

module.exports = Newsletter;
