const express = require('express');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/blog', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Get blog posts - to be implemented'
  });
});

router.get('/blog/:id', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Get blog post by ID - to be implemented'
  });
});

router.get('/team', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Get team members - to be implemented'
  });
});

router.get('/testimonials', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Get testimonials - to be implemented'
  });
});

// Protected routes (admin only)
router.use(protect);
router.use(authorize('admin'));

router.post('/blog', (req, res) => {
  res.json({
    success: true,
    message: 'Create blog post - to be implemented'
  });
});

router.put('/blog/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Update blog post - to be implemented'
  });
});

router.delete('/blog/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Delete blog post - to be implemented'
  });
});

module.exports = router;
