const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const LeadActivity = sequelize.define('LeadActivity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  leadId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'leads',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM(
      'created',
      'assigned',
      'status_changed',
      'contacted',
      'email_sent',
      'call_made',
      'meeting_scheduled',
      'quote_sent',
      'note_added',
      'converted',
      'lost'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  // Communication details
  communicationType: {
    type: DataTypes.ENUM('email', 'phone', 'whatsapp', 'sms', 'meeting', 'other')
  },
  communicationDuration: {
    type: DataTypes.INTEGER // in seconds for calls
  },
  communicationOutcome: {
    type: DataTypes.ENUM('successful', 'no_answer', 'busy', 'wrong_number', 'scheduled_callback')
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  timestamps: true,
  tableName: 'lead_activities',
  underscored: true
});

module.exports = LeadActivity;
