const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  leadNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  service: {
    type: DataTypes.ENUM('visa', 'flight', 'hotel', 'tour', 'package', 'insurance', 'transfer', 'general'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'),
    defaultValue: 'new'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  source: {
    type: DataTypes.ENUM('website', 'phone', 'email', 'whatsapp', 'social_media', 'referral', 'walk_in', 'other'),
    defaultValue: 'website'
  },
  campaign: {
    type: DataTypes.STRING
  },
  // Contact Information
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  alternatePhone: {
    type: DataTypes.STRING
  },
  preferredContactMethod: {
    type: DataTypes.ENUM('email', 'phone', 'whatsapp'),
    defaultValue: 'phone'
  },
  // Lead Details
  formData: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  requirements: {
    type: DataTypes.TEXT
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2)
  },
  budgetCurrency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  travelDate: {
    type: DataTypes.DATE
  },
  numberOfPeople: {
    type: DataTypes.INTEGER
  },
  destination: {
    type: DataTypes.STRING
  },
  // Assignment & Tracking
  assignedTo: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  assignedAt: {
    type: DataTypes.DATE
  },
  assignedBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  branchId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'branches',
      key: 'id'
    }
  },
  // Follow-up
  lastContactedAt: {
    type: DataTypes.DATE
  },
  nextFollowUpDate: {
    type: DataTypes.DATE
  },
  followUpCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Conversion
  convertedAt: {
    type: DataTypes.DATE
  },
  convertedTo: {
    type: DataTypes.ENUM('customer', 'booking', 'quote'),
  },
  convertedReferenceId: {
    type: DataTypes.INTEGER
  },
  lostReason: {
    type: DataTypes.STRING
  },
  // Tags & Notes
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  notes: {
    type: DataTypes.TEXT
  },
  internalNotes: {
    type: DataTypes.TEXT
  },
  // Quality Score
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  scoreFactors: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  // UTM Parameters
  utmSource: {
    type: DataTypes.STRING
  },
  utmMedium: {
    type: DataTypes.STRING
  },
  utmCampaign: {
    type: DataTypes.STRING
  },
  utmTerm: {
    type: DataTypes.STRING
  },
  utmContent: {
    type: DataTypes.STRING
  },
  // Metadata
  ipAddress: {
    type: DataTypes.STRING
  },
  userAgent: {
    type: DataTypes.TEXT
  },
  referrerUrl: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'leads',
  underscored: true,
  hooks: {
    beforeCreate: async (lead) => {
      // Generate lead number
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      
      // Find the last lead of the month
      const lastLead = await Lead.findOne({
        where: {
          leadNumber: {
            [Op.like]: `LEAD-${year}${month}-%`
          }
        },
        order: [['leadNumber', 'DESC']]
      });

      let sequence = 1;
      if (lastLead) {
        const lastSequence = parseInt(lastLead.leadNumber.split('-')[2]);
        sequence = lastSequence + 1;
      }

      lead.leadNumber = `LEAD-${year}${month}-${String(sequence).padStart(4, '0')}`;
    },
    beforeUpdate: (lead) => {
      // Update follow-up count when contacted
      if (lead.changed('lastContactedAt')) {
        lead.followUpCount = (lead.followUpCount || 0) + 1;
      }
    }
  }
});

module.exports = Lead;
