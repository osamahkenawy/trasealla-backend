const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  refreshToken,
  logout,
  createAdmin,
  updateUserRole,
  getAllUsers
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  refreshTokenValidation,
  createAdminValidation,
  updateRoleValidation
} = require('../validators/authValidator');

const router = express.Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refreshTokenValidation, refreshToken);

// Protected routes
router.use(protect); // All routes below this middleware are protected

router.get('/me', getMe);
router.put('/profile', updateProfileValidation, updateProfile);
router.put('/change-password', changePasswordValidation, changePassword);
router.post('/logout', logout);

// Admin only routes
router.post('/create-admin', authorize('admin'), createAdminValidation, createAdmin);
router.get('/users', authorize('admin'), getAllUsers);
router.put('/update-role/:userId', authorize('admin'), updateRoleValidation, updateUserRole);

module.exports = router;
