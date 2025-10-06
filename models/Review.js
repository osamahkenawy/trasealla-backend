const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewType: {
    type: DataTypes.ENUM('tour', 'activity', 'destination', 'hotel'),
    allowNull: false
  },
  referenceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID of the reviewed item'
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  helpfulCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Verified purchase/booking'
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  adminResponse: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  respondedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'reviews',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['review_type', 'reference_id'] },
    { fields: ['rating'] }
  ]
});

module.exports = Review;
