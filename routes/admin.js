const express = require("express");
const router = express.Router();
const { getAdminSummary } = require("../controllers/adminController");
const { requireLogin, checkRole } = require("../middleware/auth");

router.get("/summary", requireLogin, checkRole(["admin"]), getAdminSummary);

module.exports = router;
