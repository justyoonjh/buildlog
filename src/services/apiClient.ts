import axios from 'axios';
import toast from 'react-hot-toast';
import { getEnv } from '@/config/env';

const getBaseUrl = () => {
  const env = getEnv();

  if (env.PROD) {
    return '/api';
  }

  if (env.DEV) {
    return `${window.location.protocol}//${window.location.hostname}:3001/api`;
  }

  if (env.VITE_API_URL) {
    const url = env.VITE_API_URL;
    return url.endsWith('/api') ? url : `${url}/api`;
  }

  return '/api';
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';

    // Prevent toast on 401 (handled by auth check mostly) unless specific action
    if (error.response?.status === 401) {
      // Ignore 401 on login endpoint so the component can handle "Wrong Password"
      if (error.config?.url?.includes('/login')) {
        return Promise.reject(error);
      }
      // For other 401s, we might want to redirect or show session expired
      // But only if we have a global handler. For now, silence is better than wrong alert.
    } else if (error.response?.status === 403) {
      toast.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      // For general 400 errors, we might let the component handle it or show it here
      // Let's show it if it's a specific API error message
      if (message && message !== 'Something went wrong') {
        toast.error(message);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
