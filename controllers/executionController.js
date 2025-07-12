const Execution = require("../models/Execution");
const Campaign = require("../models/Campaign");
const ExecutionPage = require("../models/ExecutionPage");
const { getPageSource } = require("../utils/getPageSource"); // ✅ Import

// 🔹 Step 1: Create execution round
exports.addExecution = async (req, res) => {
  try {
    const { campaignId, roundNumber, date } = req.body;
    const executionPersonId = req.user._id;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const execution = new Execution({
      campaignId,
      executionPerson: executionPersonId,
      roundNumber,
      date,
      addedBy: req.user._id,
      status: "draft",
    });

    await execution.save();

    res.status(201).json({
      message: "Execution round created successfully",
      execution,
    });
  } catch (err) {
    console.error("Add execution error:", err);
    res.status(500).json({ message: "Failed to create execution round" });
  }
};

// 🔹 Step 2: Add execution pages (with lock check)
exports.addExecutionPages = async (req, res) => {
  try {
    const { id: executionId } = req.params;
    const { pages = [] } = req.body;

    if (!Array.isArray(pages) || pages.length === 0) {
      return res.status(400).json({ message: "Pages array is required" });
    }

    const execution = await Execution.findById(executionId);
    if (!execution)
      return res.status(404).json({ message: "Execution not found" });

    if (execution.executionPerson.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your execution round" });
    }

    // ✅ Block adding pages if execution is already submitted
    if (execution.status === "submitted") {
      return res.status(400).json({
        message: "Execution is already submitted and cannot be modified",
      });
    }

    const sheetPages = await getPageSource(); // ✅ Dynamic source (sheets or DB)

    const found = [];
    const notFound = [];

    for (const name of pages) {
      const match = sheetPages.find(
        (pg) => pg.pageName?.toLowerCase().trim() === name.toLowerCase().trim()
      );

      if (match) {
        const page = new ExecutionPage({
          executionId,
          pageName: match.pageName,
          category: match.category || "",
          groupName: match.groupName || "",
          status: "found",
        });
        await page.save();
        found.push(page);
      } else {
        const page = new ExecutionPage({
          executionId,
          pageName: name,
          status: "not found",
        });
        await page.save();
        notFound.push(page);
      }
    }

    res.status(201).json({
      message: "Pages processed",
      foundCount: found.length,
      notFoundCount: notFound.length,
      found,
      notFound,
    });
  } catch (err) {
    console.error("Page match error:", err);
    res.status(500).json({ message: "Failed to process pages" });
  }
};

// 🔹 Step 3: View all executions under a campaign
exports.getExecutionsByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const executions = await Execution.find({ campaignId, isArchived: false })
      .populate("executionPerson", "name email")
      .sort({ roundNumber: 1 });

    const results = [];

    for (const exe of executions) {
      const pageStats = await ExecutionPage.aggregate([
        { $match: { executionId: exe._id } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const stats = pageStats.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        { found: 0, "not found": 0, replaced: 0, deleted: 0 }
      );

      results.push({
        _id: exe._id,
        roundNumber: exe.roundNumber,
        date: exe.date,
        executionPerson: exe.executionPerson,
        status: exe.status,
        totalPages:
          stats.found + stats["not found"] + stats.replaced + stats.deleted,
        pageStats: stats,
      });
    }

    res.json({ executions: results });
  } catch (err) {
    console.error("Fetch execution summary error:", err);
    res.status(500).json({ message: "Failed to fetch executions" });
  }
};

// 🔹 Step 4: Submit (lock) execution
exports.submitExecution = async (req, res) => {
  try {
    const { id } = req.params;

    const execution = await Execution.findById(id);
    if (!execution) {
      return res.status(404).json({ message: "Execution not found" });
    }

    if (execution.executionPerson.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your execution round" });
    }

    if (execution.status === "submitted") {
      return res.status(400).json({ message: "Execution already submitted" });
    }

    execution.status = "submitted";
    await execution.save();

    res.json({ message: "Execution submitted successfully", execution });
  } catch (err) {
    console.error("Submit execution error:", err);
    res.status(500).json({ message: "Failed to submit execution" });
  }
};

exports.getExecutionById = async (req, res) => {
  try {
    const { id } = req.params;

    const execution = await Execution.findById(id).populate(
      "executionPerson",
      "name email"
    );

    if (!execution) {
      return res.status(404).json({ message: "Execution not found" });
    }

    // Only allow view if:
    // - Admin
    // - CampaignManager
    // - ExecutionPerson who created it
    if (
      req.user.role === "executionPerson" &&
      execution.executionPerson._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You are not allowed to view this execution" });
    }

    const pages = await ExecutionPage.find({ executionId: id });

    res.json({
      execution: {
        _id: execution._id,
        roundNumber: execution.roundNumber,
        date: execution.date,
        status: execution.status,
        executionPerson: execution.executionPerson,
        pages,
      },
    });
  } catch (err) {
    console.error("Get execution error:", err);
    res.status(500).json({ message: "Failed to fetch execution details" });
  }
};

exports.deleteExecution = async (req, res) => {
  try {
    const { id } = req.params;

    const execution = await Execution.findById(id);
    if (!execution) {
      return res.status(404).json({ message: "Execution not found" });
    }

    // ✅ Delete all associated pages
    await ExecutionPage.deleteMany({ executionId: id });

    // ✅ Delete the execution
    await Execution.findByIdAndDelete(id);

    res.json({ message: "Execution round deleted successfully" });
  } catch (err) {
    console.error("Delete execution error:", err);
    res.status(500).json({ message: "Failed to delete execution round" });
  }
};

// 🔹 Soft delete execution
exports.archiveExecution = async (req, res) => {
  try {
    const { id } = req.params;

    const execution = await Execution.findById(id);
    if (!execution)
      return res.status(404).json({ message: "Execution not found" });

    // Access control: allow admin or owner
    const isOwner =
      req.user.role === "admin" ||
      execution.executionPerson.toString() === req.user._id.toString();

    if (!isOwner) return res.status(403).json({ message: "Access denied" });

    execution.isArchived = true;
    await execution.save();

    res.json({ message: "Execution archived successfully", execution });
  } catch (err) {
    console.error("Archive execution error:", err);
    res.status(500).json({ message: "Failed to archive execution" });
  }
};
