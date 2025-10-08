const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  branchId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'branches',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false // e.g., 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT'
  },
  entity: {
    type: DataTypes.STRING,
    allowNull: false // e.g., 'booking', 'user', 'payment'
  },
  entityId: {
    type: DataTypes.INTEGER
  },
  changes: {
    type: DataTypes.JSON // Store old and new values
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {
      ip: null,
      userAgent: null,
      requestId: null,
      duration: null
    }
  },
  status: {
    type: DataTypes.ENUM('success', 'failed', 'error'),
    defaultValue: 'success'
  },
  errorMessage: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'audit_logs',
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['entity', 'entity_id']
    },
    {
      fields: ['action']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = AuditLog;
