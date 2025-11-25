const fs = require('fs');
const path = require('path');
const config = require('./server-config');

// Ensure data directory exists
const dataDir = path.dirname(config.DB.FILE_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize DB file if not exists
if (!fs.existsSync(config.DB.FILE_PATH)) {
  fs.writeFileSync(config.DB.FILE_PATH, JSON.stringify({}), 'utf8');
}

const db = {
  readUsers: () => {
    try {
      const data = fs.readFileSync(config.DB.FILE_PATH, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('DB Read Error:', error);
      return {};
    }
  },

  writeUsers: (users) => {
    try {
      fs.writeFileSync(config.DB.FILE_PATH, JSON.stringify(users, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('DB Write Error:', error);
      return false;
    }
  },

  findUserById: (id) => {
    const users = db.readUsers();
    return users[id.toLowerCase()] || null;
  },

  saveUser: (user) => {
    const users = db.readUsers();
    if (users[user.id.toLowerCase()]) {
      throw new Error('User already exists');
    }
    users[user.id.toLowerCase()] = user;
    return db.writeUsers(users);
  },

  resetUsers: () => {
    return db.writeUsers({});
  },

  findBossByCode: (code) => {
    const users = db.readUsers();
    for (const key in users) {
      const user = users[key];
      if (user.role === 'boss' && user.companyCode === code) {
        return user;
      }
    }
    return null;
  }
};

module.exports = db;
