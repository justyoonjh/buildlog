const { db, initDatabase } = require('./db-init');

// Initialize DB on module load
initDatabase();

// Helper to parse JSON fields from DB
const parseUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    businessInfo: user.businessInfo ? JSON.parse(user.businessInfo) : undefined,
    address: user.address ? JSON.parse(user.address) : undefined
  };
};

const findUserById = async (id) => {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const user = stmt.get(id);
  return parseUser(user);
};

const saveUser = async (user) => {
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

const findBossByCode = async (code) => {
  const stmt = db.prepare("SELECT * FROM users WHERE role = 'boss' AND companyCode = ?");
  const user = stmt.get(code);
  return parseUser(user);
};

const resetUsers = async () => {
  db.prepare('DELETE FROM users').run();
};

module.exports = {
  findUserById,
  saveUser,
  findBossByCode,
  resetUsers
};
