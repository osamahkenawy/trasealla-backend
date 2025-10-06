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

// Define associations

// User associations
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
User.hasMany(VisaApplication, { foreignKey: 'userId', as: 'visaApplications' });
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
User.hasMany(Blog, { foreignKey: 'authorId', as: 'blogs' });

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
  Blog
};
