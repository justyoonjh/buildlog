import axios from 'axios';

const getBaseUrl = () => {
  // 1. Production Fallback (Highest Priority for Build)
  if (import.meta.env.PROD) {
    return '/api';
  }

  // 2. Environment Variable
  // Only use if explicitly set and we are NOT in standard local dev where dynamic handling is better.
  // Or just trust the user knows what they are doing.
  // PROBLEM: User has .env with localhost, but visits via IP.
  // FIX: In DEV, always prefer dynamic hostname to support network testing (Mobile/Tablet)
  if (import.meta.env.DEV) {
    return `${window.location.protocol}//${window.location.hostname}:3001/api`;
  }

  // Fallback for others
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL;
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

export default apiClient;
