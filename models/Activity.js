const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  slug: {
    type: DataTypes.STRING(220),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  shortDescription: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Adventure, Cultural, Nature, Water Sports, etc.'
  },
  destinationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'destinations',
      key: 'id'
    }
  },
  mainImage: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duration in hours'
  },
  basePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  discountPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  maxParticipants: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  minAge: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'moderate', 'challenging', 'expert'),
    allowNull: true
  },
  includes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  excludes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  requirements: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  meetingPoint: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  coordinates: {
    type: DataTypes.JSON,
    allowNull: true
  },
  availableDays: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  timeSlots: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  cancellationPolicy: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isPopular: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  bookingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'activities',
  indexes: [
    { fields: ['destination_id'] },
    { fields: ['category'] },
    { fields: ['is_popular'] }
  ]
});

module.exports = Activity;
