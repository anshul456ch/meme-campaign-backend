const mongoose = require('mongoose');
require('dotenv').config();

const Page = require('../models/Page');
const { getSheetData } = require('../utils/sheets');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const data = await getSheetData();

    await Page.deleteMany({});
    await Page.insertMany(data);

    console.log(`✅ Synced ${data.length} pages`);
  } catch (err) {
    console.error('❌ Sync failed:', err);
  } finally {
    mongoose.disconnect();
  }
});
