const { db, initDatabase } = require('../db-init');

// Helper to parse JSON fields from DB
const parseUser = (user) => {
  if (!user) return null;

  let businessInfo = undefined;
  let address = undefined;

  try {
    if (user.businessInfo) businessInfo = JSON.parse(user.businessInfo);
  } catch (e) {
    console.error(`Failed to parse businessInfo for user ${user.id}:`, e);
  }

  try {
    if (user.address) address = JSON.parse(user.address);
  } catch (e) {
    console.error(`Failed to parse address for user ${user.id}:`, e);
  }

  return {
    ...user,
    businessInfo,
    address
  };
};

const findById = (id) => {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const user = stmt.get(id);
  return parseUser(user);
};

const save = (user) => {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO users (
      id, passwordHash, name, role, companyCode, phone, 
      companyName, businessNumber, businessInfo, address, createdAt
    ) VALUES (
      @id, @passwordHash, @name, @role, @companyCode, @phone,
      @companyName, @businessNumber, @businessInfo, @address, @createdAt
    )
  `);

  stmt.run({
    id: user.id,
    passwordHash: user.passwordHash,
    name: user.name,
    role: user.role,
    companyCode: user.companyCode || null,
    phone: user.phone || null,
    companyName: user.companyName || null,
    businessNumber: user.businessNumber || null,
    businessInfo: user.businessInfo ? JSON.stringify(user.businessInfo) : null,
    address: user.address ? JSON.stringify(user.address) : null,
    createdAt: user.createdAt || Date.now()
  });
};

const findBossByCode = (code) => {
  const stmt = db.prepare("SELECT * FROM users WHERE role = 'boss' AND companyCode = ?");
  const user = stmt.get(code);
  return parseUser(user);
};

const reset = () => {
  console.log('🔥 Resetting database (clearing users and estimates)...');

  // Disable FKs temporarily to force delete
  db.pragma('foreign_keys = OFF');

  const cleanup = db.transaction(() => {
    // Delete dependent data explicitly to avoid FK issues
    try {
      db.prepare('DELETE FROM construction_stages').run();
      db.prepare('DELETE FROM estimate_items').run();
      db.prepare('DELETE FROM estimates').run();
      db.prepare('DELETE FROM users').run();
    } catch (err) {
      console.error('Error during reset transaction:', err);
      throw err;
    }
  });

  try {
    cleanup();
  } finally {
    db.pragma('foreign_keys = ON');
  }

  console.log('✅ Database cleared.');

  // Reload default data
  if (initDatabase) {
    console.log('🔄 Reloading initial data...');
    initDatabase();
  }
};

module.exports = {
  findById,
  save,
  findBossByCode,
  reset
};
