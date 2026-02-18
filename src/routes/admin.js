const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard stats
router.get('/dashboard', adminController.getDashboardStats);

// User management - सिर्फ यही functions हैं तुम्हारे पास
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Affiliate management - सिर्फ यही functions हैं
router.get('/affiliates', adminController.getAllAffiliateLinks);
router.get('/affiliates/:id', adminController.getAffiliateLink);
router.post('/affiliates', adminController.createAffiliateLink);
router.put('/affiliates/:id', adminController.updateAffiliateLink);
router.delete('/affiliates/:id', adminController.deleteAffiliateLink);

module.exports = router;
