const express = require('express');
const router = express.Router();
const affiliateController = require('../controllers/affiliateController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/links', affiliateController.getAllLinks);
router.get('/links/:id', affiliateController.getLinkById);
router.get('/categories', affiliateController.getCategories);
router.get('/featured', affiliateController.getFeaturedLinks);

// Protected routes
router.use(protect);

router.get('/my-links', affiliateController.getMyLinks);
router.get('/clicks', affiliateController.getMyClicks);
router.get('/conversions', affiliateController.getMyConversions);
router.get('/stats', affiliateController.getStats);
router.get('/generate-link/:linkId', affiliateController.generateReferralLink);
router.post('/track-click', affiliateController.trackClick);
router.post('/simulate-conversion', affiliateController.simulateConversion);

// Admin routes
router.post('/links', authorize('admin'), affiliateController.createLink);
router.put('/links/:id', authorize('admin'), affiliateController.updateLink);
router.delete('/links/:id', authorize('admin'), affiliateController.deleteLink);
router.post('/bulk-upload', authorize('admin'), affiliateController.bulkUpload);

module.exports = router;
