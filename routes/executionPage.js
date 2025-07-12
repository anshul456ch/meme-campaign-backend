const express = require("express");
const router = express.Router();
const { requireLogin, checkRole } = require("../middleware/auth");
const {
  addExecutionPages,
  updateExecutionPage,
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

module.exports = router;
