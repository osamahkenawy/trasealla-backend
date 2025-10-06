const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VisaApplication = sequelize.define('VisaApplication', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  applicationNumber: {
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
  visaType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Tourist, Business, Student, etc.'
  },
  destinationCountry: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nationality: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  applicantName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  passportNumber: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  passportExpiryDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  travelPurpose: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  intendedTravelDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  returnDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  durationOfStay: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Days'
  },
  occupation: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  employerName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  documents: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Uploaded document URLs'
  },
  requiredDocuments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'completed'),
    defaultValue: 'draft'
  },
  applicationFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  processingFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending'
  },
  processingTime: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  estimatedCompletionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reviewNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'visa_applications',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['application_number'] },
    { fields: ['status'] },
    { fields: ['destination_country'] }
  ]
});

module.exports = VisaApplication;
