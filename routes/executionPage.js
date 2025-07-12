const express = require("express");
const router = express.Router();
const { requireLogin, checkRole } = require("../middleware/auth");
const {
  addExecutionPages,
  updateExecutionPage,
  deleteExecutionPage,
  updatePageStatus,
} = require("../controllers/executionPageController");

router.post(
  "/:id/pages",
  requireLogin,
  checkRole(["executionPerson"]),
  addExecutionPages
);

// 🔧 PUT /api/execution-pages/:id
router.put(
  "/:id",
  requireLogin,
  checkRole(["executionPerson"]),
  updateExecutionPage
);

// 🔥 Admin-only delete execution page
router.delete(
  "/:id",
  requireLogin,
  checkRole(["admin", "campaignManager", "executionPerson"]),
  deleteExecutionPage
);

// 🔄 Update page status (Admin or CampaignManager only)
router.put(
  "/:id/status",
  requireLogin,
  checkRole(["admin", "campaignManager"]),
  updatePageStatus
);

module.exports = router;
