const { google } = require('googleapis');
const credentials = require('../config/credentials.json');

const SHEET_ID = process.env.SHEET_ID;
const RANGE = process.env.SHEET_RANGE || 'Sheet1!A2:F';

if (!SHEET_ID) {
  throw new Error('❌ SHEET_ID is missing in .env');
}

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

exports.getSheetData = async () => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = res.data.values;

    if (!rows || rows.length === 0) {
      console.warn('⚠️ No data found in the spreadsheet');
      return [];
    }

    return rows.map((row, i) => ({
      pageName: row[0]?.trim() || `Unnamed_${i}`,
      pageLink: row[1] || '',
      groupLink: row[2] || '',
      category: row[3] || '',
      adminMobile: row[4] || '',
      bigPage: (row[5] || '').toLowerCase() === 'true'
    }));
  } catch (err) {
    console.error('❌ Google Sheet Fetch Failed:', err.message);
    throw err;
  }
};
