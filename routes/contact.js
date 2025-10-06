const express = require('express');
const {
  submitContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  respondToContact,
  deleteContact,
  getContactStats
} = require('../controllers/contactController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

// Validation middleware
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  
  body('inquiryType')
    .optional()
    .isIn(['general', 'booking', 'visa', 'support', 'feedback', 'complaint'])
    .withMessage('Invalid inquiry type')
];

// Public route
router.post('/', optionalAuth, contactValidation, submitContact);

// Protected routes (Admin only)
router.get('/', protect, authorize('admin', 'agent'), getAllContacts);
router.get('/stats', protect, authorize('admin'), getContactStats);
router.get('/:id', protect, getContactById);
router.put('/:id/status', protect, authorize('admin', 'agent'), updateContactStatus);
router.post('/:id/respond', protect, authorize('admin', 'agent'), respondToContact);
router.delete('/:id', protect, authorize('admin'), deleteContact);

module.exports = router;
