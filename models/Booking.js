const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bookingNumber: {
    type: DataTypes.STRING(50),
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
  bookingType: {
    type: DataTypes.ENUM('tour', 'activity', 'flight', 'hotel', 'package'),
    allowNull: false
  },
  referenceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID of the booked item (tour, activity, etc.)'
  },
  bookingDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  travelDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  numberOfPeople: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  travelers: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of traveler details'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'partially_paid', 'refunded', 'failed'),
    defaultValue: 'pending'
  },
  bookingStatus: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contactName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  contactEmail: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  contactPhone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'bookings',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['booking_number'] },
    { fields: ['booking_type', 'reference_id'] },
    { fields: ['booking_status'] },
    { fields: ['payment_status'] }
  ]
});

module.exports = Booking;
