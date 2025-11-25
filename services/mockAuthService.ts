import { User } from '../types';

const API_URL = 'http://localhost:3001/api/auth';

export const mockAuthService = {
  // Check if ID exists
  async findUserById(id: string): Promise<User | null> {
    try {
      const res = await fetch(`${API_URL}/check-id?id=${encodeURIComponent(id)}`);
      const data = await res.json();
      // Note: This endpoint currently only returns { exists: boolean }
      // To fully mimic previous behavior, we might need a full user fetch, 
      // but for "duplicate check" this is enough.
      // However, the UI expects a User object sometimes.
      // Let's assume for duplicate check we just need existence.
      // BUT, login uses this? No, login has its own endpoint.
      // Duplicate check uses this. 
      if (data.exists) {
        return { id, name: 'Unknown', role: 'employee' } as User; // Dummy return for existence check
      }
      return null;
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  // Find boss by company code (for employee signup)
  async findBossByCompanyCode(code: string): Promise<{ businessInfo: any } | null> {
    try {
      const res = await fetch(`${API_URL}/verify-code?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.valid) {
        return { businessInfo: data.businessInfo };
      }
      return null;
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  // Login
  async login(id: string, password: string): Promise<User | null> {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password })
      });

      if (!res.ok) return null;

      const data = await res.json();
      return data.user;
    } catch (error) {
      console.error('Login Error:', error);
      return null;
    }
  },

  // Register (Now accepts plain password)
  async register(userData: any): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      return res.ok;
    } catch (error) {
      console.error('Registration Error:', error);
      return false;
    }
  },

  // Reset Data (Call server to clear DB)
  async resetData() {
    try {
      await fetch(`${API_URL}/reset`, { method: 'POST' });
      window.location.reload();
    } catch (error) {
      console.error('Reset Failed:', error);
      alert('데이터 초기화 실패');
    }
  }
};
