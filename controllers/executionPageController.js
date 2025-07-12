const Execution = require('../models/Execution');
const ExecutionPage = require('../models/ExecutionPage');
const { getSheetData } = require('../utils/sheets'); // We'll stub this
const Page = require('../models/Page');
const USE_CACHE = process.env.USE_CACHE === 'true';

exports.addExecutionPages = async (req, res) => {
  try {
    const { id: executionId } = req.params;
    const { pages = [] } = req.body;

    // Validate execution belongs to current user
    const execution = await Execution.findById(executionId);
    if (!execution) return res.status(404).json({ message: 'Execution not found' });

    if (execution.executionPerson.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your execution round' });
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
          category: match.category || '',
          groupName: match.groupName || '',
          status: 'found'
        });
        await page.save();
        found.push(page);
      } else {
        const page = new ExecutionPage({
          executionId,
          pageName: name,
          status: 'not found'
        });
        await page.save();
        notFound.push(page);
      }
    }

    res.status(201).json({
      message: 'Pages processed',
      foundCount: found.length,
      notFoundCount: notFound.length,
      found,
      notFound
    });
  } catch (err) {
    console.error('Page match error:', err);
    res.status(500).json({ message: 'Failed to process pages' });
  }
};

async function getPageSource() {
  if (USE_CACHE) {
    const pages = await Page.find({});
    return pages.map(pg => ({
      pageName: pg.pageName,
      groupLink: pg.groupLink,
      category: pg.category
    }));
  } else {
    const { getSheetData } = require('../utils/sheets');
    return await getSheetData();
  }
}