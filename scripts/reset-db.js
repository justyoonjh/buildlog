const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../data/database.sqlite');

if (!fs.existsSync(dbPath)) {
  console.log('Database file does not exist. Nothing to reset.');
  process.exit(0);
}

const db = new Database(dbPath);

console.log('🔥 Resetting database directly...');

try {
  // Disable Foreign Keys to allow clearing tables in any order
  db.pragma('foreign_keys = OFF');

  const update = db.transaction(() => {
    db.prepare('DELETE FROM construction_stages').run();
    db.prepare('DELETE FROM estimate_items').run();
    db.prepare('DELETE FROM estimates').run();
    db.prepare('DELETE FROM users').run();
  });

  update();

  db.pragma('foreign_keys = ON');

  console.log('✅ Database cleared successfully.');
} catch (error) {
  console.error('❌ Failed to reset database:', error);
  process.exit(1);
}
