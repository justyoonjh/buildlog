import apiClient from '@/services/apiClient';
import { User, BusinessInfo } from '@/types';

export const authService = {
  async login(id: string, password: string): Promise<User> {
    try {
      const response = await apiClient.post('/auth/login', { id, password });
      if (response.data.success) {
        return response.data.user;
      }
      throw new Error(response.data.message || '로그인 실패');
    } catch (error: any) {
      console.error('Login error:', error);
      // Pass the error object correctly to the component
      if (error.response && error.response.data) {
        throw error.response.data; // { success: false, message: '...', code: '...' }
      }
      throw error;
    }
  },

  async register(user: any): Promise<{ success: boolean; companyCode?: string; message?: string }> {
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
      return { success: false, message: response.data.message };
    } catch (error: any) {
      console.error('Register error:', error);
      const msg = error.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
      return { success: false, message: msg };
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
