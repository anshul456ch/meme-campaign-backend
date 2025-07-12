const express = require("express");
const router = express.Router();
const { requireLogin, checkRole } = require("../middleware/auth");
const {
  addExecutionPages,
  updateExecutionPage,
  deleteExecutionPage,
  updatePageStatus,
  replacePage,
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

// 🔄 Replace execution page (Admin or CampaignManager only)
router.put(
  "/:id/replace",
  requireLogin,
  checkRole(["admin", "campaignManager"]),
  replacePage
);

module.exports = router;
