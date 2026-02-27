const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', protect, (req, res) => {
  res.json({ message: 'Get all users - Admin only' });
});

// Get single user by ID
router.get('/:id', protect, (req, res) => {
  res.json({ message: `Get user with ID: ${req.params.id}` });
});

// Update user
router.put('/:id', protect, (req, res) => {
  res.json({ message: `Update user ${req.params.id}` });
});

// Delete user (admin only)
router.delete('/:id', protect, (req, res) => {
  res.json({ message: `Delete user ${req.params.id}` });
});

// Get user profile (logged in user)
router.get('/profile/me', protect, (req, res) => {
  res.json({ 
    message: 'User profile',
    user: req.user 
  });
});

module.exports = router;
