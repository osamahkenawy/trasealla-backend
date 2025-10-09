const express = require('express');
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const {
  searchFlights,
  confirmFlightPrice,
  createFlightOrder,
  getFlightOrderDetails,
  cancelFlightOrder,
  getSeatMaps,
  getBrandedFares,
  searchLocations,
  getFlightPriceAnalysis,
  getMyFlightOrders,
  getAllFlightOrders,
  getFlightOrderStats
} = require('../controllers/comprehensiveFlightController');

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

// Step 1: Search flights
router.get('/search', optionalAuth, searchFlights);

// Supporting APIs
router.get('/locations', searchLocations);
router.get('/price-analysis', getFlightPriceAnalysis);

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

// Step 2: Confirm pricing before booking
router.post('/confirm-price', protect, confirmFlightPrice);

// Step 3: Get branded fare options (upsell)
router.post('/branded-fares', protect, getBrandedFares);

// Step 4: Get seat maps for seat selection
router.post('/seat-maps', protect, getSeatMaps);

// Step 5: Create flight order (book flight)
router.post('/create-order', protect, createFlightOrder);

// Step 6: Manage orders
router.get('/my-orders', protect, getMyFlightOrders);
router.get('/orders/:orderId', protect, getFlightOrderDetails);
router.delete('/orders/:orderId', protect, cancelFlightOrder);

// Admin/Agent only routes
router.get('/orders', protect, authorize('admin', 'agent'), getAllFlightOrders);
router.get('/stats', protect, authorize('admin'), getFlightOrderStats);

module.exports = router;
