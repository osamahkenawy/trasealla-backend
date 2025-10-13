const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Airport = sequelize.define('Airport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(3),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 3],
      isUppercase: true
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  country_code: {
    type: DataTypes.STRING(2),
    allowNull: true,
    validate: {
      len: [2, 2],
      isUppercase: true
    }
  },
  timezone: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'airports',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const AirportGroup = sequelize.define('AirportGroup', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  country: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  country_code: {
    type: DataTypes.STRING(2),
    allowNull: true,
    validate: {
      len: [2, 2],
      isUppercase: true
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'airport_groups',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = { Airport, AirportGroup };

