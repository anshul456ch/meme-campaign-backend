const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const Page = require('../models/Page');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to MongoDB');

    const pages = [];

    fs.createReadStream('data/pages.csv')
      .pipe(csv())
      .on('data', (row) => {
        pages.push({
          pageName: row.pageName?.trim(),
          pageLink: row.pageLink,
          groupLink: row.groupLink,
          category: row.category,
          adminMobile: row.adminMobile,
          bigPage: row.bigPage?.toLowerCase() === 'true'
        });
      })
      .on('end', async () => {
        await Page.deleteMany({});
        await Page.insertMany(pages);
        console.log(`✅ Loaded ${pages.length} pages into MongoDB`);
        process.exit(0);
      });
  } catch (err) {
    console.error('❌ CSV import failed:', err.message);
    process.exit(1);
  }
})();
