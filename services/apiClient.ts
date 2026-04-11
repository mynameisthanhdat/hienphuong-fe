import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL?.trim() || undefined,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

export default apiClient;
