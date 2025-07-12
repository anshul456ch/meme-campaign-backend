// controllers/dashboardController.js
const User = require("../models/User");
const Campaign = require("../models/Campaign");
const Execution = require("../models/Execution");
const ExecutionPage = require("../models/ExecutionPage");

exports.getAdminDashboard = async (req, res) => {
  try {
    const [totalUsers, campaigns, executions, pages] = await Promise.all([
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Campaign.countDocuments(),
      Execution.countDocuments(),
      ExecutionPage.countDocuments(),
    ]);

    const userCount = {
      admin: 0,
      campaignManager: 0,
      executionPerson: 0,
      reccoPerson: 0,
    };

    totalUsers.forEach((u) => {
      userCount[u._id] = u.count;
    });

    res.json({
      userCount,
      totalCampaigns: campaigns,
      totalExecutions: executions,
      totalPagesLogged: pages,
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ message: "Failed to load dashboard summary" });
  }
};
