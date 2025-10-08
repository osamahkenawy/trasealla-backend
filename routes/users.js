const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUser,
  deleteUser,
  getUserStats,
  getUserActivity,
  assignToBranch,
  getDashboardStats
} = require('../controllers/userController');

const router = express.Router();

// All routes are protected and require admin access
router.use(protect, authorize('admin'));

// User management routes
router.get('/', getAllUsers);
router.get('/dashboard-stats', getDashboardStats);
router.get('/:id', getUserById);
router.get('/:id/stats', getUserStats);
router.get('/:id/activity', getUserActivity);
router.put('/:id', updateUser);
router.put('/:id/status', updateUserStatus);
router.put('/:id/assign-branch', assignToBranch);
router.delete('/:id', deleteUser);

module.exports = router;
