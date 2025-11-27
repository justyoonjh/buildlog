const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const jsonPath = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

const initDatabase = () => {
  console.log('Initializing database...');

  // Create Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      passwordHash TEXT,
      name TEXT,
      role TEXT,
      companyCode TEXT,
      phone TEXT,
      companyName TEXT,
      businessNumber TEXT,
      businessInfo TEXT,
      address TEXT,
      createdAt INTEGER
    )
  `);

  console.log('Database schema ensured.');

  // Migration Logic
  const userCount = db.prepare('SELECT count(*) as count FROM users').get().count;

  if (userCount === 0 && fs.existsSync(jsonPath)) {
    console.log('Migrating data from users.json...');
    try {
      const jsonData = fs.readFileSync(jsonPath, 'utf8');
      const users = JSON.parse(jsonData);

      const insert = db.prepare(`
        INSERT INTO users (
          id, passwordHash, name, role, companyCode, phone, 
          companyName, businessNumber, businessInfo, address, createdAt
        ) VALUES (
          @id, @passwordHash, @name, @role, @companyCode, @phone,
          @companyName, @businessNumber, @businessInfo, @address, @createdAt
        )
      `);

      const insertMany = db.transaction((users) => {
        for (const user of users) {
          insert.run({
            id: user.id,
            passwordHash: user.passwordHash || '',
            name: user.name || '',
            role: user.role || 'employee',
            companyCode: user.companyCode || null,
            phone: user.phone || null,
            companyName: user.companyName || null,
            businessNumber: user.businessNumber || null,
            businessInfo: user.businessInfo ? JSON.stringify(user.businessInfo) : null,
            address: user.address ? JSON.stringify(user.address) : null,
            createdAt: user.createdAt || Date.now()
          });
        }
      });

      insertMany(users);
      console.log(`Successfully migrated ${users.length} users.`);

      // Optional: Rename users.json to users.json.bak after successful migration
      // fs.renameSync(jsonPath, jsonPath + '.bak');

    } catch (error) {
      console.error('Migration failed:', error);
    }
  } else {
    console.log('Skipping migration (Database not empty or users.json missing).');
  }
};

if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase, db };
