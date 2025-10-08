const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agencyController');
const { protect, authorize } = require('../middleware/auth');

// Agency settings routes
router.get('/settings', protect, agencyController.getAgencySettings);
router.put('/settings', protect, authorize('admin'), agencyController.updateAgencySettings);

// Branch routes
router.get('/branches', protect, agencyController.getBranches);
router.get('/branches/:id', protect, agencyController.getBranchById);
router.post('/branches', protect, authorize('admin'), agencyController.createBranch);
router.put('/branches/:id', protect, authorize('admin'), agencyController.updateBranch);
router.delete('/branches/:id', protect, authorize('admin'), agencyController.deleteBranch);

// Currency routes
router.get('/currencies', agencyController.getCurrencies);
router.put('/currencies/rates', protect, authorize('admin'), agencyController.updateCurrencyRates);

module.exports = router;
