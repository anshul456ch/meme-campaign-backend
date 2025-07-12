const Campaign = require("../models/Campaign");
const Execution = require("../models/Execution");
const ExecutionPage = require("../models/ExecutionPage");

exports.getAdminSummary = async (req, res) => {
  try {
    const campaignCount = await Campaign.countDocuments();
    const executionCount = await Execution.countDocuments();
    const pageCount = await ExecutionPage.countDocuments();

    const statusStats = await ExecutionPage.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const pageStats = statusStats.reduce(
      (acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      },
      { found: 0, "not found": 0, replaced: 0, deleted: 0 }
    );

    res.json({
      campaigns: campaignCount,
      executions: executionCount,
      pages: pageCount,
      pageStats,
    });
  } catch (err) {
    console.error("Admin summary error:", err);
    res.status(500).json({ message: "Failed to load summary" });
  }
};
