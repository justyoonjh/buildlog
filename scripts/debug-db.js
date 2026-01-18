const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new Database(dbPath);

console.log('--- Users Table Schema ---');
try {
  const columns = db.prepare('PRAGMA table_info(users)').all();
  console.table(columns);
} catch (e) {
  console.error('Error reading users table:', e);
}

console.log('\n--- Estimates Table Schema ---');
try {
  const columns = db.prepare('PRAGMA table_info(estimates)').all();
  console.table(columns);
} catch (e) {
  console.error('Error reading estimates table:', e);
}
