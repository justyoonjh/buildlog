const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new Database(dbPath);

try {
  const users = db.prepare('SELECT id, name, role, companyCode, status FROM users').all();
  console.log('--- Current Users ---');
  if (users.length === 0) {
    console.log('No users found.');
  } else {
    console.table(users);
  }
} catch (error) {
  console.error('Error listing users:', error);
}
