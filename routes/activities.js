const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Get activities - to be implemented'
  });
});

router.get('/:id', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Get activity by ID - to be implemented'
  });
});

// Protected routes
router.use(protect);

router.post('/book', (req, res) => {
  res.json({
    success: true,
    message: 'Book activity - to be implemented'
  });
});

module.exports = router;
