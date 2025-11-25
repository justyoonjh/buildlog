import { User } from '../types';
import { verifyPassword } from '../utils/security';

// Define the shape of the user stored in DB (includes secrets)
interface StoredUser extends User {
  passwordHash: string;
  passwordSalt: string;
}

const STORAGE_KEY = 'demo_users';

export const mockAuthService = {
  // Simulate finding a user by ID
  async findUserById(id: string): Promise<StoredUser | null> {
    try {
      const storedUsersJSON = localStorage.getItem(STORAGE_KEY);
      if (!storedUsersJSON) return null;
      const users = JSON.parse(storedUsersJSON);
      return users[id.toLowerCase()] || null;
    } catch (error) {
      console.error('Mock DB Error:', error);
      return null;
    }
  },

  // Find boss by company code
  async findBossByCompanyCode(code: string): Promise<StoredUser | null> {
    try {
      const storedUsersJSON = localStorage.getItem(STORAGE_KEY);
      if (!storedUsersJSON) return null;
      const users = JSON.parse(storedUsersJSON);

      // Iterate to find a boss with this code
      for (const key in users) {
        const user = users[key];
        if (user.role === 'boss' && user.companyCode === code) {
          return user;
        }
      }
      return null;
    } catch (error) {
      console.error('Mock DB Error:', error);
      return null;
    }
  },

  // Simulate Login: Verifies password and returns SAFE user object (no secrets)
  async login(id: string, password: string): Promise<User | null> {
    // 1. Hardcoded Admin Check
    if (id === 'admin' && password === 'password123!') {
      return { id: 'admin', name: '현장 관리자', role: 'admin' };
    }

    // 2. DB Check
    const user = await this.findUserById(id);
    if (!user) return null;

    const isValid = await verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!isValid) return null;

    // Return user without secrets
    const { passwordHash, passwordSalt, ...safeUser } = user;
    return safeUser;
  },

  // Simulate Registration
  async register(user: StoredUser): Promise<boolean> {
    try {
      const storedUsersJSON = localStorage.getItem(STORAGE_KEY) || '{}';
      const users = JSON.parse(storedUsersJSON);

      if (users[user.id.toLowerCase()]) {
        throw new Error('이미 존재하는 아이디입니다.');
      }

      users[user.id.toLowerCase()] = user;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Registration Error:', error);
      return false;
    }
  },

  // Reset Data
  resetData() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }
};
