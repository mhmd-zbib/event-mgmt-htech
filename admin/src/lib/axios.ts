// filepath: /home/zbib/Development/projects/htech-assesment/admin/src/lib/axios.ts
import axios from 'axios';
import { authService } from '@/features/auth/services/authService';

// Create an axios instance with default configuration
const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = authService.getRefreshToken();
        
        if (refreshToken) {
          // You would implement token refresh logic here
          // For now, we'll just redirect to login
          window.location.href = '/login';
        }
      } catch (refreshError) {
        // Clear tokens and redirect to login on refresh failure
        authService.logout();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;