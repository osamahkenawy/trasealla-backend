const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const FlightSegment = sequelize.define('FlightSegment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  flightOrderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'flight_orders',
      key: 'id'
    }
  },
  segmentNumber: {
    type: DataTypes.INTEGER, // 1, 2, 3 for multi-segment flights
    allowNull: false
  },
  // Departure
  departureAirport: {
    type: DataTypes.STRING(3), // IATA code
    allowNull: false
  },
  departureCity: {
    type: DataTypes.STRING(100)
  },
  departureTerminal: {
    type: DataTypes.STRING(10)
  },
  departureTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  // Arrival
  arrivalAirport: {
    type: DataTypes.STRING(3), // IATA code
    allowNull: false
  },
  arrivalCity: {
    type: DataTypes.STRING(100)
  },
  arrivalTerminal: {
    type: DataTypes.STRING(10)
  },
  arrivalTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  // Flight Details
  marketingCarrier: {
    type: DataTypes.STRING(3) // Airline code (EK, AA, etc.)
  },
  marketingCarrierName: {
    type: DataTypes.STRING(100)
  },
  marketingFlightNumber: {
    type: DataTypes.STRING(10)
  },
  operatingCarrier: {
    type: DataTypes.STRING(3)
  },
  operatingCarrierName: {
    type: DataTypes.STRING(100)
  },
  operatingFlightNumber: {
    type: DataTypes.STRING(10)
  },
  // Aircraft
  aircraftCode: {
    type: DataTypes.STRING(10)
  },
  aircraftName: {
    type: DataTypes.STRING(100)
  },
  // Duration & Distance
  duration: {
    type: DataTypes.STRING(20) // PT3H48M
  },
  durationMinutes: {
    type: DataTypes.INTEGER // 228 minutes
  },
  distance: {
    type: DataTypes.DECIMAL(10, 2) // in kilometers
  },
  // Cabin & Class
  cabinClass: {
    type: DataTypes.ENUM('economy', 'premium_economy', 'business', 'first'),
    defaultValue: 'economy'
  },
  bookingClass: {
    type: DataTypes.STRING(20) // Y, J, F, economy, etc.
  },
  fareBasis: {
    type: DataTypes.STRING(20)
  },
  // Baggage
  checkedBagsIncluded: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  cabinBagsIncluded: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  // Status
  numberOfStops: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isCodeshare: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Environmental
  co2Emissions: {
    type: DataTypes.INTEGER // in kg
  }
}, {
  timestamps: true,
  tableName: 'flight_segments',
  underscored: true,
  indexes: [
    {
      fields: ['flight_order_id']
    },
    {
      fields: ['departure_airport', 'arrival_airport']
    },
    {
      fields: ['departure_time']
    }
  ]
});

module.exports = FlightSegment;
