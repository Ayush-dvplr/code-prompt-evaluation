// src/api/axios.js
import axios from 'axios';

// Create an axios instance with base URL and credentials
const api = axios.create({
  baseURL: '/api/v2', // Vite dev server proxy forwards to backend
  withCredentials: true,
});

// Request interceptor to add JWT access token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 (token expired) globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Optionally trigger token refresh logic here
    }
    return Promise.reject(error);
  }
);

export default api;
