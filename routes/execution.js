const express = require("express");
const router = express.Router();
const {
  addExecution,
  getExecutionsByCampaign,
  submitExecution,
  getExecutionById,
  deleteExecution,
  archiveExecution,
} = require("../controllers/executionController");
const { requireLogin, checkRole } = require("../middleware/auth");

// 🔹 1. Add execution round
router.post(
  "/",
  requireLogin,
  checkRole(["executionPerson", "campaignManager", "admin"]),
  addExecution
);

// 🔹 2. Get executions by campaign
router.get(
  "/campaign/:campaignId", // ✅ more specific path
  requireLogin,
  checkRole(["admin", "campaignManager"]),
  getExecutionsByCampaign
);

// 🔹 3. Submit execution
router.put(
  "/:id/submit",
  requireLogin,
  checkRole(["executionPerson"]),
  submitExecution
);

// 🔹 4. Get single execution
router.get(
  "/:id", // ✅ now this works properly
  requireLogin,
  checkRole(["admin", "campaignManager", "executionPerson"]),
  getExecutionById
);

// 🔥 Admin-only delete execution
router.delete("/:id", requireLogin, checkRole(["admin"]), deleteExecution);

// 🔥 Admin-only archive execution
router.put(
  "/:id/archive",
  requireLogin,
  checkRole(["admin", "executionPerson"]),
  archiveExecution
);

module.exports = router;
