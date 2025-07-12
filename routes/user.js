const express = require('express');
const router = express.Router();
const { createUser, getAllUsers, updateUser, deleteUser } = require('../controllers/userController');
const { requireLogin, checkRole } = require('../middleware/auth');

// Admin only: create user
router.post('/', requireLogin, checkRole(['admin']), createUser);


// Get all users (Admin only)
router.get('/', requireLogin, checkRole(['admin']), getAllUsers);

// Update user (Admin only)
router.put('/:id', requireLogin, checkRole(['admin']), updateUser);

// Delete user (Admin only)
router.delete('/:id', requireLogin, checkRole(['admin']), deleteUser);

module.exports = router;
