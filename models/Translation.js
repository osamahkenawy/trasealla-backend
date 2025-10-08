const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const Translation = sequelize.define('Translation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  namespace: {
    type: DataTypes.STRING,
    defaultValue: 'common'
  },
  language: {
    type: DataTypes.STRING(2),
    allowNull: false
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  context: {
    type: DataTypes.STRING // Additional context for translators
  },
  isReviewed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reviewedBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewedAt: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  tableName: 'translations',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['key', 'namespace', 'language']
    }
  ]
});

module.exports = Translation;
