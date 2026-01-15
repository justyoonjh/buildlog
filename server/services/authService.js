const argon2 = require('argon2');
const db = require('../server-db');
const ApiError = require('../utils/ApiError');

class AuthService {
  /**
   * Hash a plain password using Argon2
   */
  async hashPassword(password) {
    try {
      return await argon2.hash(password);
    } catch (err) {
      console.error('Hashing failed:', err);
      throw new ApiError(500, '비밀번호 암호화 실패', 'HASH_FAILED');
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
      throw new ApiError(409, '이미 존재하는 아이디입니다.', 'USER_EXISTS');
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
    // 1. Database User Check
    const user = await this.findUserById(id);
    if (!user) {
      throw new ApiError(401, '아이디 또는 비밀번호가 올바르지 않습니다.', 'AUTH_FAILED');
    }

    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new ApiError(401, '아이디 또는 비밀번호가 올바르지 않습니다.', 'AUTH_FAILED');
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
