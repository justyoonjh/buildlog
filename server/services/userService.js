const db = require('../server-db');
const ApiError = require('../utils/ApiError');
const { STATUS } = require('../constants/auth');

class UserService {
  /**
   * Find a user by their ID
   */
  async findUserById(id) {
    return await db.findUserById(id);
  }

  /**
   * Verify Company Code and return boss info
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
   * Get all members of a company (Same Company Code)
   */
  async getCompanyMembers(companyCode) {
    if (!companyCode) return [];
    return await db.findAllByCompanyCode(companyCode);
  }

  /**
   * Approve a user (Update status to approved)
   */
  async approveUser(userId) {
    const user = await this.findUserById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    user.status = STATUS.APPROVED;
    await db.saveUser(user);
    return user;
  }

  /**
   * Reject a user (Update status to rejected)
   */
  async rejectUser(userId) {
    const user = await this.findUserById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    user.status = STATUS.REJECTED;
    await db.saveUser(user);
    return user;
  }

  /**
   * Delete a user
   */
  async deleteUser(userId) {
    const user = await this.findUserById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    await db.db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  }
}

module.exports = new UserService();
