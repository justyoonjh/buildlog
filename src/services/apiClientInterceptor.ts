import apiClient from './apiClient';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

let isSetup = false;

export const setupInterceptors = () => {
  if (isSetup) return;
  isSetup = true;

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status === 401) {
        // Skip session expiry alert for login attempts (wrong password)
        if (error.config?.url?.includes('/login')) {
          return Promise.reject(error);
        }

        // Automatically logout on 401
        const { logout } = useAuthStore.getState();
        await logout();

        // Clear local storage or session state here if needed
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};
