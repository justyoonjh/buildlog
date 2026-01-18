const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new Database(dbPath);

try {
  const users = db.prepare('SELECT id, passwordHash FROM users').all();
  console.log('--- User Credential Check ---');
  users.forEach(u => {
    console.log(`User: ${u.id}`);
    console.log(`Hash (${u.passwordHash ? u.passwordHash.length : 0} chars): ${u.passwordHash}`);
  });
} catch (error) {
  console.error('Error:', error);
}
