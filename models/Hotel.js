const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Hotel = sequelize.define('Hotel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(220),
    allowNull: false,
    unique: true
  },
  destinationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'destinations',
      key: 'id'
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  shortDescription: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  starRating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  coordinates: {
    type: DataTypes.JSON,
    allowNull: true
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
  amenities: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  facilities: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  roomTypes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  checkInTime: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  checkOutTime: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  policies: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancellationPolicy: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contactPhone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  contactEmail: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isFeatured: {
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
  }
}, {
  tableName: 'hotels',
  indexes: [
    { fields: ['destination_id'] },
    { fields: ['star_rating'] },
    { fields: ['is_featured'] }
  ]
});

module.exports = Hotel;
