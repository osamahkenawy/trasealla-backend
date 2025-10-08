const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { protect, authorize } = require('../middleware/auth');

// Role management routes (Admin only)
router.get('/', protect, authorize('admin'), roleController.getRoles);
router.get('/:id', protect, authorize('admin'), roleController.getRoleById);
router.post('/', protect, authorize('admin'), roleController.createRole);
router.put('/:id', protect, authorize('admin'), roleController.updateRole);
router.delete('/:id', protect, authorize('admin'), roleController.deleteRole);

// Role assignment
router.post('/assign', protect, authorize('admin'), roleController.assignRole);

// Permission check
router.get('/check/:resource/:action', protect, roleController.checkPermission);

module.exports = router;
