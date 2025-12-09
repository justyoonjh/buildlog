const argon2 = require('argon2');
const db = require('../server-db');

class AuthService {
  /**
   * Hash a plain password using Argon2
   */
  async hashPassword(password) {
    try {
      return await argon2.hash(password);
    } catch (err) {
      console.error('Hashing failed:', err);
      throw new Error('Hashing failed');
    }
  }

  /**
   * Verify a password against a stored hash
   */
  async verifyPassword(password, storedHash) {
    try {
      return await argon2.verify(storedHash, password);
    } catch (err) {
      console.error('Verification failed:', err);
      return false;
    }
  }

  /**
   * Find a user by their ID
   */
  async findUserById(id) {
    return await db.findUserById(id);
  }

  /**
   * Register a new user
   */
  async register(userData) {
    const { id, password, ...rest } = userData;

    // Check duplicate
    if (await this.findUserById(id)) {
      throw new Error('User already exists');
    }

    const hash = await this.hashPassword(password);

    const newUser = {
      id,
      ...rest,
      // Ensure companyName fallback logic
      companyName: rest.companyName || rest.businessInfo?.s_nm || rest.businessInfo?.c_nm || '알 수 없는 업체',
      passwordHash: hash,
      createdAt: Date.now()
    };

    console.log('DEBUG: Registering User:', newUser.id);

    await db.saveUser(newUser);

    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }

  /**
   * Login a user
   */
  async login(id, password) {
    // 1. Hardcoded Admin Check
    if (id === 'admin' && password === 'password123!') {
      return { id: 'admin', name: '현장 관리자', role: 'admin' };
    }

    // 2. Database User Check
    const user = await this.findUserById(id);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Verify Company Code
   */
  async verifyCompanyCode(code) {
    const boss = await db.findBossByCode(code);
    if (boss) {
      return {
        valid: true,
        companyName: boss.companyName,
        businessInfo: boss.businessInfo
      };
    }
    return { valid: false };
  }

  /**
   * Reset Database (Dev Only)
   */
  async resetUsers() {
    return await db.resetUsers();
  }
}

module.exports = new AuthService();
