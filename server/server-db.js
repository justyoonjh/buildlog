const { initDatabase, db } = require('./db-init');
const User = require('./models/userModel');

// Initialize DB on module load
initDatabase();

module.exports = {
  findUserById: User.findById,
  saveUser: User.save,
  findBossByCode: User.findBossByCode,
  resetUsers: User.reset,
  // Expose raw db if needed, or other models
  db
};
