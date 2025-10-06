const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Flight = sequelize.define('Flight', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  flightNumber: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  airline: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  airlineCode: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  departureAirport: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  departureAirportCode: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  arrivalAirport: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  arrivalAirportCode: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  departureTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  arrivalTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duration in minutes'
  },
  stops: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  stopoverAirports: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  class: {
    type: DataTypes.ENUM('economy', 'premium_economy', 'business', 'first'),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  availableSeats: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalSeats: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  baggageAllowance: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Checked and carry-on baggage details'
  },
  amenities: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  aircraft: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  isRefundable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  cancellationFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'flights',
  indexes: [
    { fields: ['departure_airport_code', 'arrival_airport_code'] },
    { fields: ['departure_time'] },
    { fields: ['airline'] },
    { fields: ['price'] }
  ]
});

module.exports = Flight;
