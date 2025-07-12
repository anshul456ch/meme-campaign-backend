const { getSheetData } = require('../utils/sheets');

(async () => {
  try {
    const rows = await getSheetData();
    console.log('✅ Sheet fetched:', rows.length, 'rows');
    console.table(rows.slice(0, 5));
  } catch (err) {
    console.error('❌ Sheet fetch test failed:', err.message);
  }
})();
