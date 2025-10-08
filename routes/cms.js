const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Page routes
router.get('/pages', cmsController.getPages);
router.get('/pages/:slug', cmsController.getPageBySlug);
router.post('/pages', protect, authorize('admin', 'agent'), cmsController.createPage);
router.put('/pages/:id', protect, authorize('admin', 'agent'), cmsController.updatePage);
router.put('/pages/:id/publish', protect, authorize('admin'), cmsController.publishPage);
router.delete('/pages/:id', protect, authorize('admin'), cmsController.deletePage);

// Media library routes
router.get('/media', protect, cmsController.getMediaLibrary);
router.post('/media/upload', protect, cmsController.uploadMedia, cmsController.uploadMediaFile);
router.delete('/media/:id', protect, authorize('admin', 'agent'), cmsController.deleteMediaFile);

// Translation routes
router.get('/translations', cmsController.getTranslations);
router.put('/translations', protect, authorize('admin'), cmsController.updateTranslation);

module.exports = router;
