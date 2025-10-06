const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Admin only routes
router.use(authorize('admin'));

// Placeholder for user management routes
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'User management routes - to be implemented'
  });
});

module.exports = router;
