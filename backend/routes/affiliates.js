const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// =========================================
// Affiliate Routes
// =========================================

// Get all affiliate links (public)
router.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'All affiliate links',
    data: []
  });
});

// Get single affiliate link by ID (public)
router.get('/:id', (req, res) => {
  res.json({ 
    success: true,
    message: `Affiliate link with ID: ${req.params.id}`,
    data: null
  });
});

// Create new affiliate link (admin only)
router.post('/', protect, (req, res) => {
  res.json({ 
    success: true,
    message: 'Affiliate link created successfully',
    data: req.body
  });
});

// Update affiliate link (admin only)
router.put('/:id', protect, (req, res) => {
  res.json({ 
    success: true,
    message: `Affiliate link ${req.params.id} updated successfully`,
    data: req.body
  });
});

// Delete affiliate link (admin only)
router.delete('/:id', protect, (req, res) => {
  res.json({ 
    success: true,
    message: `Affiliate link ${req.params.id} deleted successfully`
  });
});

// Track click on affiliate link (protected)
router.post('/:id/click', protect, (req, res) => {
  res.json({ 
    success: true,
    message: `Click tracked for link ${req.params.id}`,
    data: {
      linkId: req.params.id,
      userId: req.user.id,
      timestamp: new Date()
    }
  });
});

module.exports = router;
