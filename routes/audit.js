const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/auth');

// All audit routes require admin access
router.use(protect, authorize('admin'));

// Audit log routes
router.get('/', auditController.getAuditLogs);
router.get('/stats', auditController.getAuditStats);
router.get('/export', auditController.exportAuditLogs);
router.get('/:id', auditController.getAuditLogById);
router.post('/clean', auditController.cleanAuditLogs);

module.exports = router;
