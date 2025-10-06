const express = require('express');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Get hotels - to be implemented',
    note: 'Search hotels by destination, dates, rating, price range'
  });
});

router.get('/:id', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Get hotel by ID - to be implemented'
  });
});

router.get('/:id/rooms', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Get hotel rooms - to be implemented'
  });
});

router.get('/:id/availability', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Check hotel availability - to be implemented'
  });
});

// Protected routes
router.use(protect);

router.post('/book', (req, res) => {
  res.json({
    success: true,
    message: 'Book hotel - to be implemented'
  });
});

// Admin/Agent routes
router.use(authorize('admin', 'agent'));

router.post('/', (req, res) => {
  res.json({
    success: true,
    message: 'Create hotel - to be implemented'
  });
});

router.put('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Update hotel - to be implemented'
  });
});

router.delete('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Delete hotel - to be implemented'
  });
});

module.exports = router;
