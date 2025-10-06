const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Destination = sequelize.define('Destination', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  slug: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  country: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  region: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  shortDescription: {
    type: DataTypes.STRING(500),
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
  coordinates: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Latitude and longitude coordinates'
  },
  bestTimeToVisit: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  climate: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  language: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  timezone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  visaRequirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attractions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  activities: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  accommodation: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  transportation: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  safety: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tips: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isPopular: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  metaTitle: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  metaDescription: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 5
    }
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'destinations',
  indexes: [
    {
      fields: ['country', 'region']
    },
    {
      fields: ['is_popular', 'is_active']
    },
    {
      fields: ['slug']
    }
  ]
});

module.exports = Destination;
