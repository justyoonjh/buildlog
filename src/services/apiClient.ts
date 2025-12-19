import axios from 'axios';

const getBaseUrl = () => {
  // 1. Environment Variable (Highest Priority)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 2. Production Fallback
  // In Vercel or other prod builds, default to relative path.
  // This avoids "Mixed Content" errors (http://...:3001) and allows usage of strict proxies/rewrites.
  if (import.meta.env.PROD) {
    return '/api';
  }

  // 3. Development Fallback
  // Ensure we use the correct protocol to match the current page (though usually dev is http)
  // and bind to the expected backend port.
  return `${window.location.protocol}//${window.location.hostname}:3001/api`;
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
