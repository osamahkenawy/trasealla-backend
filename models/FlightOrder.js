const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const FlightOrder = sequelize.define('FlightOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
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
    references: {
      model: 'bookings',
      key: 'id'
    }
  },
  // Amadeus References
  amadeusOrderId: {
    type: DataTypes.STRING,
    unique: true
  },
  pnr: {
    type: DataTypes.STRING
  },
  gdsRecordLocator: {
    type: DataTypes.STRING
  },
  // Order Status
  status: {
    type: DataTypes.ENUM(
      'pending',
      'confirmed',
      'ticketed',
      'cancelled',
      'refunded',
      'partially_refunded',
      'expired',
      'failed'
    ),
    defaultValue: 'pending'
  },
  ticketingStatus: {
    type: DataTypes.ENUM('not_issued', 'issued', 'voided', 'refunded'),
    defaultValue: 'not_issued'
  },
  // Flight Details
  flightOfferData: {
    type: DataTypes.JSON,
    allowNull: false
  },
  itineraries: {
    type: DataTypes.JSON,
    allowNull: false
  },
  // Pricing
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  baseAmount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  // Travelers
  travelers: {
    type: DataTypes.JSON,
    allowNull: false
  },
  numberOfTravelers: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Contact Information
  contactEmail: {
    type: DataTypes.STRING
  },
  contactPhone: {
    type: DataTypes.STRING
  },
  // Ticketing
  tickets: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  eTicketNumbers: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  // Timestamps
  ticketedAt: {
    type: DataTypes.DATE
  },
  cancelledAt: {
    type: DataTypes.DATE
  },
  expiresAt: {
    type: DataTypes.DATE
  },
  // Airline/Flight Info
  validatingAirline: {
    type: DataTypes.STRING
  },
  operatingAirlines: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  // Ancillary Services
  ancillaryServices: {
    type: DataTypes.JSON,
    defaultValue: {
      seats: [],
      baggage: [],
      meals: [],
      other: []
    }
  },
  // Fare Rules & Policies
  fareRules: {
    type: DataTypes.JSON
  },
  cancellationPolicy: {
    type: DataTypes.TEXT
  },
  changePolicy: {
    type: DataTypes.TEXT
  },
  // Payment
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'partially_paid', 'refunded'),
    defaultValue: 'pending'
  },
  amountPaid: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  // Metadata
  sourceMarket: {
    type: DataTypes.STRING
  },
  bookingChannel: {
    type: DataTypes.ENUM('web', 'mobile', 'api', 'agent'),
    defaultValue: 'web'
  },
  agentId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT
  },
  internalNotes: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'flight_orders',
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['amadeus_order_id']
    },
    {
      fields: ['pnr']
    },
    {
      fields: ['status']
    },
    {
      fields: ['ticketing_status']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = FlightOrder;
