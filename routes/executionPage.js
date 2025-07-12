const express = require('express');
const router = express.Router();
const { requireLogin, checkRole } = require('../middleware/auth');
const { addExecutionPages } = require('../controllers/executionPageController');

router.post('/:id/pages', requireLogin, checkRole(['executionPerson']), addExecutionPages);

module.exports = router;
