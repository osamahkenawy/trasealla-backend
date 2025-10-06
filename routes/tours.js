const express = require('express');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes (with optional auth for personalized content)
router.get('/', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Get tours - to be implemented'
  });
});

router.get('/:id', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Get tour by ID - to be implemented'
  });
});

router.get('/featured', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Get featured tours - to be implemented'
  });
});

router.get('/popular', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Get popular tours - to be implemented'
  });
});

// Protected routes (admin/agent only)
router.use(protect);
router.use(authorize('admin', 'agent'));

router.post('/', (req, res) => {
  res.json({
    success: true,
    message: 'Create tour - to be implemented'
  });
});

router.put('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Update tour - to be implemented'
  });
});

router.delete('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Delete tour - to be implemented'
  });
});

module.exports = router;
