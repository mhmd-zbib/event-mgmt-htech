// filepath: /home/zbib/Development/projects/htech-assesment/admin/src/lib/axios.ts
import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { authService } from '@/features/auth/services/authService';
import { API_URL } from '@/config/constants';

// Create an axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor to handle unauthorized errors and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const newToken = await authService.refreshToken();
        
        if (newToken && originalRequest.headers) {
          // Update the Authorization header with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Retry the original request with the new token
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
      
      // If token refresh failed or no token was returned, logout the user
      await authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export the apiClient instance
export default apiClient;
export { apiClient };