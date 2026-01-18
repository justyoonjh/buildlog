const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const jsonPath = path.join(__dirname, '../data/users.json');

console.log('🔥 Starting complete data wipe...');

try {
  // 1. Delete Database File
  try {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('✅ Database file deleted.');
    } else {
      console.log('ℹ️ Database file not found.');
    }
  } catch (err) {
    if (err.code === 'EBUSY') {
      console.error('⚠️ Could not delete database.sqlite (File currently in use). Please SOTP the server first.');
    } else {
      console.error('❌ Error deleting database.sqlite:', err.message);
    }
  }

  // 2. Delete Users Backup (JSON)
  try {
    if (fs.existsSync(jsonPath)) {
      fs.unlinkSync(jsonPath);
      console.log('✅ Backup users.json deleted.');
    } else {
      console.log('ℹ️ Backup users.json not found.');
    }
  } catch (err) {
    console.error('❌ Error deleting users.json:', err.message);
  }

  console.log('---------------------------------------------------');
  console.log('✨ Data cleanup process finished.');
  console.log('If database.sqlite was locked, STOP the server (Ctrl+C) and run this script again.');
} catch (error) {
  console.error('❌ Unexpected script error:', error);
}
