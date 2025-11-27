import axios from 'axios';

const getBaseUrl = () => {
  const hostname = window.location.hostname;
  // If running on localhost, assume backend is on 3001
  // If running on local network IP (e.g. 192.168.x.x), assume backend is on same IP:3001
  return `http://${hostname}:3001/api`;
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
