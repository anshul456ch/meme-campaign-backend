const { getSheetData } = require('./sheets'); // <-- comes from sheets.js
const Page = require('../models/Page');

exports.getPageSource = async () => {
  try {
    const useCache = process.env.USE_CACHE === 'true';

    if (useCache) {
      // ✅ Fetch from DB cache
      const cached = await Page.find({});
      return cached;
    } else {
      // ✅ Fetch live from Google Sheets
      return await getSheetData();
    }
  } catch (err) {
    console.error('❌ Failed to load page source:', err);
    throw new Error('Page source fetch failed');
  }
};
