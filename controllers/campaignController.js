const Campaign = require("../models/Campaign");
const Execution = require("../models/Execution");
const ExecutionPage = require("../models/ExecutionPage");

exports.createCampaign = async (req, res) => {
  try {
    const {
      brandName,
      campaignName,
      campaignManager,
      salesPerson,
      startDate,
      pageCount,
    } = req.body;

    const campaign = new Campaign({
      brandName,
      campaignName,
      campaignManager,
      salesPerson,
      startDate,
      pageCount,
      createdBy: req.user._id,
    });

    await campaign.save();

    res
      .status(201)
      .json({ message: "Campaign created successfully", campaign });
  } catch (err) {
    console.error("Create campaign error:", err);
    res.status(500).json({ message: "Campaign creation failed" });
  }
};

exports.getCampaigns = async (req, res) => {
  try {
    const { role, _id } = req.user;

    let filter = {};

    if (role === "campaignManager") {
      filter = {
        $or: [{ campaignManager: _id }, { createdBy: _id }],
      };
    }

    const campaigns = await Campaign.find({
      ...filter,
      isArchived: false, // ✅ exclude archived ones
    })
      .populate("campaignManager", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ campaigns });
  } catch (err) {
    console.error("Get campaigns error:", err);
    res.status(500).json({ message: "Failed to fetch campaigns" });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      brandName,
      campaignName,
      campaignManager,
      salesPerson,
      startDate,
      pageCount,
    } = req.body;

    const campaign = await Campaign.findById(id);
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });

    const isOwner =
      req.user.role === "admin" ||
      campaign.createdBy.toString() === req.user._id ||
      campaign.campaignManager.toString() === req.user._id;

    if (!isOwner) return res.status(403).json({ message: "Access denied" });

    campaign.brandName = brandName;
    campaign.campaignName = campaignName;
    campaign.campaignManager = campaignManager;
    campaign.salesPerson = salesPerson;
    campaign.startDate = startDate;
    campaign.pageCount = pageCount;

    await campaign.save();

    res.json({ message: "Campaign updated successfully", campaign });
  } catch (err) {
    console.error("Update campaign error:", err);
    res.status(500).json({ message: "Campaign update failed" });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findById(id);
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });

    const isOwner =
      req.user.role === "admin" ||
      campaign.createdBy.toString() === req.user._id ||
      campaign.campaignManager.toString() === req.user._id;

    if (!isOwner) return res.status(403).json({ message: "Access denied" });

    await campaign.deleteOne();

    res.json({ message: "Campaign deleted successfully" });
  } catch (err) {
    console.error("Delete campaign error:", err);
    res.status(500).json({ message: "Campaign deletion failed" });
  }
};

exports.getCampaignSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findById(id).populate(
      "campaignManager executionPerson"
    );
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const executions = await Execution.find({ campaignId: id });
    const executionIds = executions.map((e) => e._id);

    const pageCount = await ExecutionPage.countDocuments({
      executionId: { $in: executionIds },
    });

    res.json({
      campaign: {
        brandName: campaign.brandName,
        campaignName: campaign.campaignName,
        salesPerson: campaign.salesPerson,
        startDate: campaign.startDate,
        campaignManager: campaign.campaignManager?.name,
        executionPerson: campaign.executionPerson?.name,
      },
      totalExecutions: executions.length,
      totalPagesSubmitted: pageCount,
      rounds: executions.map((e) => ({
        id: e._id,
        roundNumber: e.roundNumber,
        date: e.date,
        status: e.status,
      })),
    });
  } catch (err) {
    console.error("Campaign summary error:", err);
    res.status(500).json({ message: "Failed to load campaign summary" });
  }
};

// 🔹 Archive (Soft Delete) a Campaign
exports.archiveCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const isOwner =
      req.user.role === 'admin' ||
      campaign.createdBy.toString() === req.user._id.toString() ||
      campaign.campaignManager.toString() === req.user._id.toString();

    if (!isOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }

    campaign.isArchived = true;
    await campaign.save();

    res.json({ message: 'Campaign archived successfully', campaign });
  } catch (err) {
    console.error('Archive campaign error:', err);
    res.status(500).json({ message: 'Failed to archive campaign' });
  }
};
