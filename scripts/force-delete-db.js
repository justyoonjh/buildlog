const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.sqlite');

try {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('✅ Database file deleted successfully:', dbPath);
  } else {
    console.log('ℹ️ Database file not found, nothing to delete.');
  }
} catch (error) {
  console.error('❌ Failed to delete database file:', error);
  process.exit(1);
}
