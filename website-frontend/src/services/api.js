import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://swaramayi-real-estate-marketing.onrender.com/api/v1/public',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('swarnamayi_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default API;
