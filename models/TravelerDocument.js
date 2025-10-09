const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const TravelerDocument = sequelize.define('TravelerDocument', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  travelerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'travelers',
      key: 'id'
    }
  },
  documentType: {
    type: DataTypes.ENUM('passport', 'national_id', 'visa', 'drivers_license'),
    defaultValue: 'passport'
  },
  documentNumber: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  issuingCountry: {
    type: DataTypes.STRING(2), // ISO 2-letter code
    allowNull: false
  },
  nationality: {
    type: DataTypes.STRING(2)
  },
  issueDate: {
    type: DataTypes.DATEONLY
  },
  expiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  issuingAuthority: {
    type: DataTypes.STRING(100)
  },
  placeOfIssue: {
    type: DataTypes.STRING(100)
  },
  // Validation
  isValid: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  validatedAt: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  tableName: 'traveler_documents',
  underscored: true,
  indexes: [
    {
      fields: ['traveler_id']
    },
    {
      fields: ['document_number']
    }
  ]
});

module.exports = TravelerDocument;
