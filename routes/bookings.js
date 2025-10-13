const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getAllBookings,
  getBookingById,
  getAllTravelers,
  getTravelerById,
  getBookingFlights,
  getFlightSegmentById
} = require('../controllers/bookingController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Booking routes
router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.get('/:bookingId/flights', getBookingFlights);

// Traveler routes
router.get('/travelers', getAllTravelers);
router.get('/travelers/:id', getTravelerById);

// Flight segment routes
router.get('/flights/segments/:id', getFlightSegmentById);

module.exports = router;