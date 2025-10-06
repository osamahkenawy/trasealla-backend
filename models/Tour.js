const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tour = sequelize.define('Tour', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 200]
    }
  },
  slug: {
    type: DataTypes.STRING(220),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
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
    comment: 'Duration in days',
    validate: {
      min: 1
    }
  },
  durationType: {
    type: DataTypes.ENUM('days', 'hours'),
    defaultValue: 'days',
    allowNull: false
  },
  maxGroupSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  minGroupSize: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  basePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
    allowNull: false
  },
  discountPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  discountPercentage: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'moderate', 'challenging', 'expert'),
    allowNull: true
  },
  ageRestriction: {
    type: DataTypes.STRING(50),
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
  itinerary: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  highlights: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  requirements: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  cancellationPolicy: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  refundPolicy: {
    type: DataTypes.TEXT,
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
  isPopular: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  },
  bookingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  startLocation: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  endLocation: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  departureTimes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  availableDates: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
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
  }
}, {
  tableName: 'tours',
  indexes: [
    {
      fields: ['category', 'is_active']
    },
    {
      fields: ['is_featured', 'is_popular']
    },
    {
      fields: ['slug']
    },
    {
      fields: ['base_price']
    }
  ]
});

module.exports = Tour;
