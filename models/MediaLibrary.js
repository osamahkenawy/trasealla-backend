const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const MediaLibrary = sequelize.define('MediaLibrary', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mimetype: {
    type: DataTypes.STRING,
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER // in bytes
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  thumbnailUrl: {
    type: DataTypes.STRING
  },
  type: {
    type: DataTypes.ENUM('image', 'video', 'document', 'other'),
    defaultValue: 'other'
  },
  altText: {
    type: DataTypes.JSON // { en: 'Description', ar: 'وصف' }
  },
  caption: {
    type: DataTypes.JSON
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {
      width: null,
      height: null,
      duration: null,
      format: null
    }
  },
  folder: {
    type: DataTypes.STRING,
    defaultValue: 'general'
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'media_library',
  underscored: true,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['folder']
    }
  ]
});

module.exports = MediaLibrary;
