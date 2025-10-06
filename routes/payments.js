const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/create-payment-intent', (req, res) => {
  res.json({
    success: true,
    message: 'Create payment intent - to be implemented'
  });
});

router.post('/confirm-payment', (req, res) => {
  res.json({
    success: true,
    message: 'Confirm payment - to be implemented'
  });
});

router.get('/history', (req, res) => {
  res.json({
    success: true,
    message: 'Get payment history - to be implemented'
  });
});

module.exports = router;
