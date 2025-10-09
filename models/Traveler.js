const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const Traveler = sequelize.define('Traveler', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bookings',
      key: 'id'
    }
  },
  // Personal Information
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(10) // Mr, Mrs, Ms, Dr
  },
  gender: {
    type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
    allowNull: false
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  // Contact
  email: {
    type: DataTypes.STRING(255)
  },
  phoneCountryCode: {
    type: DataTypes.STRING(5)
  },
  phoneNumber: {
    type: DataTypes.STRING(20)
  },
  // Nationality & Address
  nationality: {
    type: DataTypes.STRING(2) // ISO 2-letter code
  },
  countryOfResidence: {
    type: DataTypes.STRING(2)
  },
  // Passenger Type
  passengerType: {
    type: DataTypes.ENUM('adult', 'child', 'infant', 'seated_infant', 'senior'),
    defaultValue: 'adult'
  },
  age: {
    type: DataTypes.INTEGER
  },
  // Provider-specific ID
  providerPassengerId: {
    type: DataTypes.STRING(100) // Duffel: pas_xxx, Amadeus: "1"
  },
  // Special Needs
  specialRequests: {
    type: DataTypes.TEXT
  },
  mealPreference: {
    type: DataTypes.STRING(50) // VGML, KSML, etc.
  },
  seatPreference: {
    type: DataTypes.STRING(50) // Window, Aisle
  },
  // Loyalty Programs
  frequentFlyerPrograms: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  timestamps: true,
  tableName: 'travelers',
  underscored: true,
  indexes: [
    {
      fields: ['booking_id']
    }
  ]
});

module.exports = Traveler;
