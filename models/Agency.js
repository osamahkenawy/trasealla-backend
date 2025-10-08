const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const Agency = sequelize.define('Agency', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  legalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  registrationNumber: {
    type: DataTypes.STRING,
    unique: true
  },
  taxNumber: {
    type: DataTypes.STRING,
    unique: true
  },
  defaultCurrency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  supportedCurrencies: {
    type: DataTypes.JSON,
    defaultValue: ['USD', 'EUR', 'GBP', 'AED', 'SAR']
  },
  taxRates: {
    type: DataTypes.JSON,
    defaultValue: {
      default: 15,
      services: {
        visa: 5,
        flight: 0,
        hotel: 15,
        tour: 15
      }
    }
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      bookingPrefix: 'TRA',
      invoicePrefix: 'INV',
      quotePrefix: 'QUO',
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'ar'],
      timezone: 'UTC',
      dateFormat: 'DD/MM/YYYY',
      workingHours: {
        sunday: { open: '09:00', close: '18:00' },
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { closed: true },
        saturday: { open: '10:00', close: '16:00' }
      }
    }
  },
  contactInfo: {
    type: DataTypes.JSON,
    defaultValue: {
      phone: '',
      email: '',
      address: '',
      socialMedia: {}
    }
  },
  logo: {
    type: DataTypes.STRING
  },
  favicon: {
    type: DataTypes.STRING
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'agencies',
  underscored: true
});

module.exports = Agency;
