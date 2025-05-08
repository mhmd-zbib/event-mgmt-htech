// filepath: /home/zbib/Development/projects/htech-assesment/admin/src/features/auth/services/authService.ts
import apiClient from '@/lib/axios';
import type { LoginCredentials, LoginResponse, ApiError } from '../types/auth';

/**
 * Service for handling authentication-related API requests
 */
export const authService = {
  /**
   * Login with email and password
   * @param credentials - The login credentials
   * @returns Login response with user and token info
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      // Handle validation errors (422)
      if (error.response?.status === 422) {
        throw {
          message: 'Validation error',
          details: error.response.data.details,
          statusCode: 422
        } as ApiError;
      }
      
      // Handle other errors
      throw {
        message: error.response?.data?.message || 'Login failed',
        statusCode: error.response?.status || 500
      } as ApiError;
    }
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    // If your API has a logout endpoint, call it here
    // await apiClient.post('/auth/logout');
    
    // Clear storage
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userData');
  },
  
  /**
   * Check if the user is authenticated
   * @returns True if the user is authenticated
   */
  isAuthenticated(): boolean {
    const token = sessionStorage.getItem('accessToken');
    const expiryStr = sessionStorage.getItem('tokenExpiry');
    
    if (!token || !expiryStr) {
      return false;
    }
    
    // Check if token is expired
    const expiry = parseInt(expiryStr, 10);
    const now = Date.now();
    
    if (now > expiry) {
      // Token is expired, clear it
      this.logout();
      return false;
    }
    
    return true;
  },
  
  /**
   * Get the current access token
   * @returns The access token or null if not authenticated
   */
  getAccessToken(): string | null {
    return sessionStorage.getItem('accessToken');
  },
  
  /**
   * Get the current refresh token
   * @returns The refresh token or null if not authenticated
   */
  getRefreshToken(): string | null {
    return sessionStorage.getItem('refreshToken');
  }
}