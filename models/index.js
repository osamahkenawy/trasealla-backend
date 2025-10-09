const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Destination = require('./Destination');
const Tour = require('./Tour');
const Activity = require('./Activity');
const Flight = require('./Flight');
const Hotel = require('./Hotel');
const Booking = require('./Booking');
const Payment = require('./Payment');
const Review = require('./Review');
const VisaApplication = require('./VisaApplication');
const Contact = require('./Contact');
const Newsletter = require('./Newsletter');
const Blog = require('./Blog');

// Phase 1 - Core Foundation Models
const Agency = require('./Agency');
const Branch = require('./Branch');
const Role = require('./Role');
const AuditLog = require('./AuditLog');
const Page = require('./Page');
const MediaLibrary = require('./MediaLibrary');
const Currency = require('./Currency');
const Translation = require('./Translation');

// Phase 3 - Lead Management
const Lead = require('./Lead');
const LeadActivity = require('./LeadActivity');

// Phase 7 - Flight Orders
const FlightOrder = require('./FlightOrder');

// Define associations

// Agency & Branch associations
Agency.hasMany(Branch, { foreignKey: 'agencyId', as: 'branches' });
Branch.belongsTo(Agency, { foreignKey: 'agencyId', as: 'agency' });

// User associations
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
User.hasMany(VisaApplication, { foreignKey: 'userId', as: 'visaApplications' });
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
User.hasMany(Blog, { foreignKey: 'authorId', as: 'blogs' });
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'roleDetails' });
User.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });

// Destination associations
Destination.hasMany(Activity, { foreignKey: 'destinationId', as: 'activityList' });
Destination.hasMany(Hotel, { foreignKey: 'destinationId', as: 'hotelList' });

// Activity associations
Activity.belongsTo(Destination, { foreignKey: 'destinationId', as: 'destination' });

// Hotel associations
Hotel.belongsTo(Destination, { foreignKey: 'destinationId', as: 'destination' });

// Booking associations
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Booking.hasMany(Payment, { foreignKey: 'bookingId', as: 'payments' });

// Payment associations
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

// Review associations
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Visa Application associations
VisaApplication.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Contact associations
Contact.belongsTo(User, { foreignKey: 'userId', as: 'user', constraints: false });

// Blog associations
Blog.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Page associations
Page.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Page.belongsTo(Page, { foreignKey: 'parentId', as: 'parent' });
Page.hasMany(Page, { foreignKey: 'parentId', as: 'children' });

// Media Library associations
MediaLibrary.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

// Audit Log associations
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
AuditLog.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });

// Role associations
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

// Translation associations
Translation.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

// Lead associations
Lead.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
Lead.belongsTo(User, { foreignKey: 'assignedBy', as: 'assigner' });
Lead.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });
Lead.hasMany(LeadActivity, { foreignKey: 'leadId', as: 'activities' });

// Lead Activity associations
LeadActivity.belongsTo(Lead, { foreignKey: 'leadId', as: 'lead' });
LeadActivity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Flight Order associations
FlightOrder.belongsTo(User, { foreignKey: 'userId', as: 'user' });
FlightOrder.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });
FlightOrder.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
Booking.hasMany(FlightOrder, { foreignKey: 'bookingId', as: 'flightOrders' });

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  Destination,
  Tour,
  Activity,
  Flight,
  Hotel,
  Booking,
  Payment,
  Review,
  VisaApplication,
  Contact,
  Newsletter,
  Blog,
  // Phase 1 Models
  Agency,
  Branch,
  Role,
  AuditLog,
  Page,
  MediaLibrary,
  Currency,
  Translation,
  // Phase 3 Models
  Lead,
  LeadActivity,
  // Phase 7 Models
  FlightOrder
};
