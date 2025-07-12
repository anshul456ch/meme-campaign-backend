const Execution = require("../models/Execution");
const ExecutionPage = require("../models/ExecutionPage");
const { getSheetData } = require("../utils/sheets"); // We'll stub this
const Page = require("../models/Page");
const USE_CACHE = process.env.USE_CACHE === "true";

exports.addExecutionPages = async (req, res) => {
  try {
    const { id: executionId } = req.params;
    const { pages = [] } = req.body;

    // Validate execution belongs to current user
    const execution = await Execution.findById(executionId);
    if (!execution)
      return res.status(404).json({ message: "Execution not found" });

    if (execution.executionPerson.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your execution round" });
    }

    // 1. Get Google Sheet (or local DB) data
    const sheetPages = await getPageSource(); // [{ pageName, category, groupName }, ...]

    const found = [];
    const notFound = [];

    for (const name of pages) {
      const match = sheetPages.find(
        (pg) => pg.pageName.trim().toLowerCase() === name.trim().toLowerCase()
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

async function getPageSource() {
  if (USE_CACHE) {
    const pages = await Page.find({});
    return pages.map((pg) => ({
      pageName: pg.pageName,
      groupLink: pg.groupLink,
      category: pg.category,
    }));
  } else {
    const { getSheetData } = require("../utils/sheets");
    return await getSheetData();
  }
}

exports.updateExecutionPage = async (req, res) => {
  try {
    const { id } = req.params;
    const { pageName, status, category, groupName } = req.body;

    const page = await ExecutionPage.findById(id);
    if (!page) return res.status(404).json({ message: "Page not found" });

    const execution = await Execution.findById(page.executionId);
    if (!execution)
      return res.status(404).json({ message: "Execution not found" });

    // 🔒 Only executionPerson who created this round can update
    if (
      req.user.role !== "executionPerson" ||
      execution.executionPerson.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ Apply updates (only if present)
    if (pageName) page.pageName = pageName;
    if (status) page.status = status;
    if (category) page.category = category;
    if (groupName) page.groupName = groupName;

    await page.save();

    res.json({ message: "Page updated", page });
  } catch (err) {
    console.error("Edit page error:", err);
    res.status(500).json({ message: "Failed to update page" });
  }
};

exports.deleteExecutionPage = async (req, res) => {
  try {
    const { id } = req.params;

    const page = await ExecutionPage.findById(id);
    if (!page) return res.status(404).json({ message: "Page not found" });

    const execution = await Execution.findById(page.executionId);
    if (!execution)
      return res.status(404).json({ message: "Execution not found" });

    // 🔒 Permissions check
    const isOwner =
      req.user.role === "executionPerson" &&
      execution.executionPerson.toString() === req.user._id.toString();

    const isPrivileged = ["admin", "campaignManager"].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: "Access denied" });
    }

    await page.deleteOne();

    res.json({ message: "Execution page deleted successfully" });
  } catch (err) {
    console.error("Delete execution page error:", err);
    res.status(500).json({ message: "Failed to delete page" });
  }
};

exports.updatePageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const page = await ExecutionPage.findById(id);
    if (!page) {
      return res.status(404).json({ message: "Execution page not found" });
    }

    // 🛡 Only Admin or CampaignManager can update status
    if (!["admin", "campaignManager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    page.status = status;
    await page.save();

    res.json({ message: "Page status updated", page });
  } catch (err) {
    console.error("Update page status error:", err);
    res.status(500).json({ message: "Failed to update page status" });
  }
};
exports.replacePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPageName } = req.body;

    if (!newPageName || newPageName.trim() === "") {
      return res.status(400).json({ message: "New page name is required" });
    }

    const page = await ExecutionPage.findById(id);
    if (!page) return res.status(404).json({ message: "Page not found" });

    const execution = await Execution.findById(page.executionId);
    if (!execution)
      return res.status(404).json({ message: "Execution not found" });

    // 🔒 Only Admin / CampaignManager can replace
    if (!["admin", "campaignManager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ Mark original as replaced
    page.status = "replaced";
    await page.save();

    // ✅ Add new page
    const newPage = new ExecutionPage({
      executionId: execution._id,
      pageName: newPageName,
      status: "found", // You can add validation here if needed
      category: "",
      groupName: "",
    });

    await newPage.save();

    res.json({
      message: "Page replaced successfully",
      replacedPageId: page._id,
      newPage,
    });
  } catch (err) {
    console.error("Replace page error:", err);
    res.status(500).json({ message: "Failed to replace page" });
  }
};
