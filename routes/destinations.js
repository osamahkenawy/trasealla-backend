const express = require('express');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes (with optional auth for personalized content)
router.get('/', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Get destinations - to be implemented'
  });
});

router.get('/:id', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Get destination by ID - to be implemented'
  });
});

// Protected routes (admin/agent only)
router.use(protect);
router.use(authorize('admin', 'agent'));

router.post('/', (req, res) => {
  res.json({
    success: true,
    message: 'Create destination - to be implemented'
  });
});

router.put('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Update destination - to be implemented'
  });
});

router.delete('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Delete destination - to be implemented'
  });
});

module.exports = router;
