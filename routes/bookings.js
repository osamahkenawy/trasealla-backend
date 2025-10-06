const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Get user bookings - to be implemented'
  });
});

router.get('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Get booking by ID - to be implemented'
  });
});

router.post('/', (req, res) => {
  res.json({
    success: true,
    message: 'Create booking - to be implemented'
  });
});

router.put('/:id/cancel', (req, res) => {
  res.json({
    success: true,
    message: 'Cancel booking - to be implemented'
  });
});

module.exports = router;
