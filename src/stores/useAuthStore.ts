import { create } from 'zustand';
import { AuthState, User } from '../types';
import { authService } from '../services/authService';

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
    localStorage.setItem('user', JSON.stringify(user));
    set({ isAuthenticated: true, user, error: null });
  },

  logout: () => {
    localStorage.removeItem('user');
    set({ isAuthenticated: false, user: null, error: null });
  },

  checkLoginStatus: () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        set({ isAuthenticated: true, user, isLoading: false });
      } catch (e) {
        localStorage.removeItem('user');
        set({ isAuthenticated: false, user: null, isLoading: false });
      }
    } else {
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));
