const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');
const {
  searchFlights,
  getFlightOffer,
  repriceFlightOffer,
  createFlightOrder,
  getFlightOrder,
  cancelFlightOrder,
  getSeatMaps,
  searchLocations,
  getFlightPriceAnalysis,
  getUserFlightBookings
} = require('../controllers/flightController');

const router = express.Router();

// Public routes (optional auth for personalization)
router.get('/search', optionalAuth, searchFlights);
router.get('/locations/search', searchLocations);
router.get('/price-analysis', getFlightPriceAnalysis);
router.get('/offers/:offerId', optionalAuth, getFlightOffer);

// Protected routes
router.post('/reprice', protect, repriceFlightOffer);
router.post('/book', protect, createFlightOrder);
router.post('/seat-maps', protect, getSeatMaps);
router.get('/orders/:orderId', protect, getFlightOrder);
router.delete('/orders/:orderId', protect, cancelFlightOrder);
router.get('/my-bookings', protect, getUserFlightBookings);

module.exports = router;
