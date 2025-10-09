const Amadeus = require('amadeus');

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID || 'test',
  clientSecret: process.env.AMADEUS_CLIENT_SECRET || 'test',
  hostname: process.env.AMADEUS_ENV === 'production' ? 'production' : 'test',
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'silent'
});

module.exports = amadeus;
