const express = require('express');
const router = express.Router();
const { requireLogin, checkRole } = require('../middleware/auth');

// Protected: Any logged-in user
router.get('/profile', requireLogin, (req, res) => {
  res.json({
    message: 'Your profile',
    user: req.user
  });
});

// Protected: Admin only
router.get('/admin-only', requireLogin, checkRole(['admin']), (req, res) => {
  res.json({
    message: 'Welcome Admin!'
  });
});

module.exports = router;
