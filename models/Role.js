const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: {
      // Agency Management
      agency: {
        view: false,
        create: false,
        update: false,
        delete: false
      },
      // Branch Management
      branches: {
        view: false,
        create: false,
        update: false,
        delete: false
      },
      // User Management
      users: {
        view: false,
        create: false,
        update: false,
        delete: false,
        assignRoles: false
      },
      // Service Catalog
      services: {
        tours: {
          view: true,
          create: false,
          update: false,
          delete: false,
          publish: false
        },
        flights: {
          view: true,
          search: true,
          book: false,
          issue: false,
          cancel: false
        },
        hotels: {
          view: true,
          search: true,
          book: false,
          cancel: false
        },
        visas: {
          view: true,
          apply: false,
          process: false,
          approve: false
        },
        activities: {
          view: true,
          create: false,
          update: false,
          delete: false,
          book: false
        }
      },
      // Bookings
      bookings: {
        viewOwn: true,
        viewAll: false,
        create: false,
        update: false,
        cancel: false,
        process: false
      },
      // Payments
      payments: {
        viewOwn: true,
        viewAll: false,
        process: false,
        refund: false,
        reports: false
      },
      // CRM
      leads: {
        view: false,
        create: false,
        update: false,
        delete: false,
        assign: false
      },
      // CMS
      cms: {
        pages: {
          view: true,
          create: false,
          update: false,
          delete: false,
          publish: false
        },
        blog: {
          view: true,
          create: false,
          update: false,
          delete: false,
          publish: false
        }
      },
      // Reports
      reports: {
        sales: false,
        financial: false,
        operational: false,
        analytics: false
      },
      // Settings
      settings: {
        general: false,
        payment: false,
        email: false,
        integrations: false
      }
    }
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // Higher level = more permissions
  },
  isSystem: {
    type: DataTypes.BOOLEAN,
    defaultValue: false // System roles cannot be deleted
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'roles',
  underscored: true
});

module.exports = Role;
