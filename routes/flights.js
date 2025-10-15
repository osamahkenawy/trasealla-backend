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
  getFlightOrderStats,
  downloadTicket,
  emailTicket,
  sendBookingConfirmation,
  getAncillaryServices,
  addAncillaryServices,
  getOrderChangeOptions,
  confirmOrderChange,
  getRefundQuote,
  processRefund,
  getOrderDocuments,
  downloadDuffelETicket
} = require('../controllers/comprehensiveFlightController');

const router = express.Router();

/**
 * @swagger
 * /api/flights/search:
 *   get:
 *     tags: [Flights]
 *     summary: Search flights via Amadeus
 *     description: Search for available flights between origin and destination. No authentication required.
 *     parameters:
 *       - in: query
 *         name: origin
 *         required: true
 *         schema:
 *           type: string
 *         description: Origin airport code (IATA)
 *         example: JFK
 *       - in: query
 *         name: destination
 *         required: true
 *         schema:
 *           type: string
 *         description: Destination airport code (IATA)
 *         example: DXB
 *       - in: query
 *         name: departureDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Departure date (YYYY-MM-DD)
 *         example: 2025-12-15
 *       - in: query
 *         name: returnDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Return date for round trip
 *         example: 2025-12-22
 *       - in: query
 *         name: adults
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Number of adult passengers
 *       - in: query
 *         name: travelClass
 *         schema:
 *           type: string
 *           enum: [ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST]
 *           default: ECONOMY
 *       - in: query
 *         name: currencyCode
 *         schema:
 *           type: string
 *           default: AED
 *         description: Currency code (ISO 3-letter)
 *         example: AED
 *     responses:
 *       200:
 *         description: List of available flights
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FlightOffer'
 */

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

// Step 7: Tickets (Download & Email)
router.get('/orders/:orderId/ticket/download', protect, downloadTicket);
router.post('/orders/:orderId/ticket/email', protect, emailTicket);
router.post('/orders/:orderId/send-confirmation', protect, sendBookingConfirmation);

// Duffel Documents (Tickets, Itineraries)
router.get('/orders/:orderId/documents', protect, getOrderDocuments);

// Duffel E-Ticket Download (Real airline ticket)
router.get('/orders/:orderId/duffel-ticket', protect, downloadDuffelETicket);
router.get('/orders/:orderId/duffel-eticket', protect, downloadDuffelETicket);

// Step 8: Ancillary Services (Baggage, Meals, etc.)
router.post('/offers/services', protect, getAncillaryServices);
router.post('/orders/:orderId/add-services', protect, addAncillaryServices);

// Step 9: Order Changes (Date/Flight modifications)
router.post('/orders/:orderId/change-options', protect, getOrderChangeOptions);
router.post('/orders/:orderId/change', protect, confirmOrderChange);

// Step 10: Refunds & Cancellations
router.get('/orders/:orderId/refund-quote', protect, getRefundQuote);
router.post('/orders/:orderId/refund', protect, processRefund);

// Admin/Agent only routes
router.get('/orders', protect, authorize('admin', 'agent'), getAllFlightOrders);
router.get('/stats', protect, authorize('admin'), getFlightOrderStats);

module.exports = router;
