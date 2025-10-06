const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transactionId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'bookings',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'credit_card, debit_card, paypal, stripe, etc.'
  },
  paymentGateway: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  gatewayTransactionId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'),
    defaultValue: 'pending'
  },
  paymentType: {
    type: DataTypes.ENUM('full', 'partial', 'deposit', 'refund'),
    defaultValue: 'full'
  },
  cardLast4: {
    type: DataTypes.STRING(4),
    allowNull: true
  },
  cardBrand: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  billingAddress: {
    type: DataTypes.JSON,
    allowNull: true
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  failureReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  refundReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'payments',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['booking_id'] },
    { fields: ['transaction_id'] },
    { fields: ['status'] }
  ]
});

module.exports = Payment;
