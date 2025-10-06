const express = require('express');
const {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  getNewsletterStats,
  deleteSubscriber
} = require('../controllers/newsletterController');
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

// Validation middleware
const subscribeValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
];

// Public routes
router.post('/subscribe', subscribeValidation, subscribe);
router.post('/unsubscribe', unsubscribe);

// Protected routes (Admin only)
router.get('/subscribers', protect, authorize('admin'), getAllSubscribers);
router.get('/stats', protect, authorize('admin'), getNewsletterStats);
router.delete('/subscribers/:id', protect, authorize('admin'), deleteSubscriber);

module.exports = router;
