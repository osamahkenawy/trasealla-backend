const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createPaymentIntent,
  processPayment,
  getPaymentHistory,
  getPaymentById,
  requestRefund,
  quickPay,
  paymentWebhook
} = require('../controllers/paymentController');

const router = express.Router();

// Webhook (no auth - verified by signature)
router.post('/webhook', paymentWebhook);

// All other routes require authentication
router.use(protect);

// Quick payment (simplified for testing)
router.post('/quick-pay', quickPay);

// Payment flow
router.post('/create-intent', createPaymentIntent);
router.post('/process', processPayment);

// Payment management
router.get('/history', getPaymentHistory);
router.get('/:id', getPaymentById);

// Refunds
router.post('/refund', requestRefund);

module.exports = router;
