const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const Branch = sequelize.define('Branch', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  agencyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'agencies',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(10),
    unique: true,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('main', 'branch', 'franchise'),
    defaultValue: 'branch'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING
  },
  country: {
    type: DataTypes.STRING
  },
  phone: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  },
  managerName: {
    type: DataTypes.STRING
  },
  managerEmail: {
    type: DataTypes.STRING
  },
  managerPhone: {
    type: DataTypes.STRING
  },
  workingHours: {
    type: DataTypes.JSON
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      canIssueInvoices: true,
      canProcessPayments: true,
      requiresApproval: false,
      approvalLimit: 5000
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'branches',
  underscored: true
});

module.exports = Branch;
