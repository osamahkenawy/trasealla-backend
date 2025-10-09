const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createPayTabsPayment,
  payTabsCallback,
  verifyPayTabsPayment,
  processPayTabsRefund
} = require('../controllers/payTabsController');

const {
  bookFlightAndPay,
  payThenBook,
  payThenBookCallback
} = require('../controllers/integratedPaymentController');

const router = express.Router();

// Webhooks (no auth - verified by PayTabs)
router.post('/callback', payTabsCallback);
router.post('/pay-then-book-callback', payThenBookCallback);

// Protected routes - Standard payments
router.post('/create', protect, createPayTabsPayment);
router.get('/verify/:transactionRef', protect, verifyPayTabsPayment);
router.post('/refund', protect, authorize('admin'), processPayTabsRefund);

// Protected routes - Integrated flight booking + payment
router.post('/book-and-pay', protect, bookFlightAndPay);
router.post('/pay-then-book', protect, payThenBook);

module.exports = router;
