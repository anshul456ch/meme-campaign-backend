// routes/dashboard.js
const express = require("express");
const router = express.Router();
const { getAdminDashboard } = require("../controllers/dashboardController");
const { requireLogin, checkRole } = require("../middleware/auth");

router.get(
  "/summary",
  requireLogin,
  checkRole(["admin"]), // 🔐 Admin only
  getAdminDashboard
);

module.exports = router;
