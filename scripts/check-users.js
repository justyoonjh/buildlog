import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/database.sqlite');

console.log('Checking database at:', dbPath);

if (!fs.existsSync(dbPath)) {
  console.log('Database file does not exist.');
  process.exit(0);
}

try {
  const db = new Database(dbPath, { readonly: true });
  const users = db.prepare('SELECT * FROM users').all();
  console.log('Total Users:', users.length);
  if (users.length > 0) {
    console.log(JSON.stringify(users, null, 2));
  } else {
    console.log('No users found.');
  }
} catch (error) {
  console.error('Error reading database:', error.message);
}
