const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const Page = sequelize.define('Page', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  title: {
    type: DataTypes.JSON, // { en: 'About Us', ar: 'من نحن' }
    allowNull: false
  },
  content: {
    type: DataTypes.JSON, // { en: '<html content>', ar: '<html content>' }
    allowNull: false
  },
  metaTitle: {
    type: DataTypes.JSON
  },
  metaDescription: {
    type: DataTypes.JSON
  },
  metaKeywords: {
    type: DataTypes.JSON
  },
  ogImage: {
    type: DataTypes.STRING
  },
  template: {
    type: DataTypes.STRING,
    defaultValue: 'default'
  },
  sections: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft'
  },
  publishedAt: {
    type: DataTypes.DATE
  },
  authorId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  isHomePage: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  showInMenu: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  menuOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  parentId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'pages',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'pages',
  underscored: true
});

module.exports = Page;
