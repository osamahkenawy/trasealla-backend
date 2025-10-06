const express = require('express');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Get reviews - to be implemented',
    note: 'Filter by type (tour, activity, destination, hotel) and referenceId'
  });
});

router.get('/:type/:referenceId', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Get reviews for specific item - to be implemented',
    params: {
      type: req.params.type,
      referenceId: req.params.referenceId
    }
  });
});

// Protected routes
router.use(protect);

router.post('/', (req, res) => {
  res.json({
    success: true,
    message: 'Create review - to be implemented',
    note: 'User can review tours, activities, destinations, hotels they have booked'
  });
});

router.put('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Update review - to be implemented',
    note: 'User can only update their own reviews'
  });
});

router.delete('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Delete review - to be implemented',
    note: 'User can delete their own reviews'
  });
});

router.post('/:id/helpful', (req, res) => {
  res.json({
    success: true,
    message: 'Mark review as helpful - to be implemented'
  });
});

// Admin routes
router.post('/:id/respond', authorize('admin', 'agent'), (req, res) => {
  res.json({
    success: true,
    message: 'Respond to review - to be implemented'
  });
});

router.put('/:id/approve', authorize('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Approve/reject review - to be implemented'
  });
});

module.exports = router;
