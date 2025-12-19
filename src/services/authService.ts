import apiClient from './apiClient';
import { User, BusinessInfo } from '../types';

export const authService = {
  async login(id: string, password: string): Promise<User | null> {
    try {
      const response = await apiClient.post('/auth/login', { id, password });
      if (response.data.success) {
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(user: any): Promise<{ success: boolean; companyCode?: string }> {
    try {
      const response = await apiClient.post('/auth/register', {
        id: user.id,
        password: user.password,
        name: user.name,
        role: user.role,
        companyCode: user.companyCode,
        phone: user.phone,
        businessInfo: user.businessInfo,
        address: user.address
      });

      if (response.data.success) {
        return {
          success: true,
          companyCode: response.data.companyCode
        };
      }
      return { success: response.data.success };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false };
    }
  },

  async findUserById(id: string): Promise<User | null> {
    try {
      const response = await apiClient.get(`/auth/check-id?id=${id}`);
      return response.data.exists ? { id } as User : null;
    } catch (error) {
      return null;
    }
  },

  async findBossByCompanyCode(code: string): Promise<{ businessInfo: BusinessInfo; companyName?: string } | null> {
    try {
      const response = await apiClient.get(`/auth/verify-code?code=${code}`);
      if (response.data.valid) {
        return {
          businessInfo: response.data.businessInfo,
          companyName: response.data.companyName
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  async checkSession(): Promise<User | null> {
    try {
      const response = await apiClient.get('/auth/me');
      if (response.data.authenticated) {
        return response.data.user;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },

  async resetData() {
    try {
      await apiClient.post('/auth/reset');
      window.location.reload();
    } catch (error) {
      console.error('Reset Failed:', error);
      alert('데이터 초기화 실패');
    }
  }
};
