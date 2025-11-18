import axios from 'axios';
import { API_BASE_URL } from '@/constants/api';

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - only redirect to login if not on a public page
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        
        const currentPath = window.location.pathname;
        const publicPages = ['/courses', '/tuition-jobs', '/tutor-hub', '/premium-tutors', '/all-tutors', '/new-tutors', '/verified-tutors', '/tutor-request', '/'];
        const isPublicPage = publicPages.some(page => currentPath.startsWith(page));
        
        if (!isPublicPage) {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
