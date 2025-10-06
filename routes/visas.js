const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/requirements/:country', (req, res) => {
  res.json({
    success: true,
    message: 'Get visa requirements - to be implemented'
  });
});

// Protected routes
router.use(protect);

router.post('/apply', (req, res) => {
  res.json({
    success: true,
    message: 'Apply for visa - to be implemented'
  });
});

router.get('/applications', (req, res) => {
  res.json({
    success: true,
    message: 'Get visa applications - to be implemented'
  });
});

router.get('/applications/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Get visa application by ID - to be implemented'
  });
});

module.exports = router;
