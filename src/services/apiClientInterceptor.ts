import apiClient from './apiClient';
import { useAuthStore } from '../stores/useAuthStore';

let isSetup = false;

export const setupInterceptors = () => {
  if (isSetup) return;
  isSetup = true;

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status === 401) {
        // Automatically logout on 401
        const { logout } = useAuthStore.getState();
        await logout();
        // Optional: Alert user
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
      }
      return Promise.reject(error);
    }
  );
};
