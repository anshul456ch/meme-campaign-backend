const express = require('express');
const router = express.Router();
const { createCampaign, getCampaigns, updateCampaign, deleteCampaign, getCampaignSummary } = require('../controllers/campaignController');
const { requireLogin, checkRole } = require('../middleware/auth');

// Create campaign (admin or campaign manager)
router.post('/', requireLogin, checkRole(['admin', 'campaignManager']), createCampaign);

// Get campaigns (admin & campaign manager)
router.get('/', requireLogin, checkRole(['admin', 'campaignManager']), getCampaigns);

// Update
router.put('/:id', requireLogin, checkRole(['admin', 'campaignManager']), updateCampaign);

// Delete
router.delete('/:id', requireLogin, checkRole(['admin', 'campaignManager']), deleteCampaign);

// View campaign summary
router.get('/:id/summary', requireLogin, checkRole(['admin', 'campaignManager']), getCampaignSummary);

module.exports = router;
