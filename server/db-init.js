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
    );

    CREATE TABLE IF NOT EXISTS estimates (
      id TEXT PRIMARY KEY,
      userId TEXT,
      clientName TEXT,
      clientPhone TEXT,
      siteAddress TEXT,
      startDate TEXT,
      endDate TEXT,
      totalAmount INTEGER,
      vatIncluded INTEGER DEFAULT 0,
      status TEXT DEFAULT 'negotiating',
      memo TEXT,
      modelImage TEXT,
      generatedImage TEXT,
      styleDescription TEXT,
      createdAt INTEGER,
      updatedAt INTEGER,
      FOREIGN KEY(userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS estimate_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      estimateId TEXT,
      category TEXT,
      description TEXT,
      spec TEXT,
      quantity REAL,
      unit TEXT,
      unitPrice INTEGER,
      amount INTEGER,
      FOREIGN KEY(estimateId) REFERENCES estimates(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_companyCode ON users(companyCode);
  `);

  console.log('Database schema ensured.');

  // --- Schema Migration for Existing Databases ---
  try {
    const columns = db.prepare('PRAGMA table_info(estimates)').all();
    const columnNames = columns.map(c => c.name);

    if (!columnNames.includes('modelImage')) {
      console.log('Migrating: Adding modelImage to estimates table...');
      db.exec('ALTER TABLE estimates ADD COLUMN modelImage TEXT');
    }
    if (!columnNames.includes('generatedImage')) {
      console.log('Migrating: Adding generatedImage to estimates table...');
      db.exec('ALTER TABLE estimates ADD COLUMN generatedImage TEXT');
    }
    if (!columnNames.includes('styleDescription')) {
      console.log('Migrating: Adding styleDescription to estimates table...');
      db.exec('ALTER TABLE estimates ADD COLUMN styleDescription TEXT');
    }
  } catch (err) {
    console.error('Schema migration failed:', err);
  }

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
