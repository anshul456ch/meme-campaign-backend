const express = require('express');
const router = express.Router();
const { addExecution, getExecutionsByCampaign, submitExecution } = require('../controllers/executionController');
const { requireLogin, checkRole } = require('../middleware/auth');

// Add execution round - by execution person or campaign manager or admin
router.post('/', requireLogin, checkRole(['executionPerson', 'campaignManager','admin']), addExecution);
// Get all executions for a campaign
router.get('/:campaignId', requireLogin, checkRole(['admin', 'campaignManager']), getExecutionsByCampaign);

// Mark as submitted (execution person only)
router.put('/:id/submit', requireLogin, checkRole(['executionPerson']), submitExecution);

router.get('/campaign/:campaignId', requireLogin, checkRole(['admin', 'campaignManager']), getExecutionsByCampaign);
module.exports = router;
