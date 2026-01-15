import { create } from 'zustand';
import { AuthState, User } from '@/types';
import { authService } from '@/features/auth/services/authService';

interface AuthStore extends AuthState {
  login: (user: User) => void;
  logout: () => void;
  checkLoginStatus: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,

  login: (user) => {
    set({ isAuthenticated: true, user, error: null });
  },

  logout: async () => {
    await authService.logout();
    set({ isAuthenticated: false, user: null, error: null });
  },

  checkLoginStatus: async () => {
    try {
      const user = await authService.checkSession();
      if (user) {
        set({ isAuthenticated: true, user, isLoading: false });
      } else {
        set({ isAuthenticated: false, user: null, isLoading: false });
      }
    } catch (error) {
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));
