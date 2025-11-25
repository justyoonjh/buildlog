import { create } from 'zustand';
import { User } from '../types';
import { mockAuthService } from '../services/mockAuthService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (id: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (id, password) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const user = await mockAuthService.login(id, password);

      if (user) {
        set({ user, isLoading: false, error: null });
        return true;
      } else {
        set({ isLoading: false, error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        return false;
      }
    } catch (err) {
      set({ isLoading: false, error: '로그인 중 오류가 발생했습니다.' });
      return false;
    }
  },

  logout: () => {
    set({ user: null });
  },

  clearError: () => {
    set({ error: null });
  }
}));
