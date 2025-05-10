// filepath: /home/zbib/Development/projects/htech-assesment/admin/src/features/auth/services/authService.ts
import axios from 'axios';
import type { LoginCredentials, LoginResponse, ApiError, User } from '../types/auth';
import { apiClient } from '@/lib/axios';

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  TOKEN_EXPIRY: 'auth_token_expiry',
  USER_DATA: 'auth_user_data'
};

/**
 * Service for handling authentication-related API requests
 */
class AuthService {
  /**
   * Login with email and password
   * @param credentials - The login credentials
   * @returns Login response with user and token info
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Make a real API call to the backend for authentication
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      
      // Store auth data
      this.setSession(response.data);
      
      return response.data;
    } catch (error: any) {
      // Handle errors
      throw {
        message: error.response?.data?.message || 'Login failed',
        statusCode: error.response?.status || 500
      } as ApiError;
    }
  }

  /**
   * Set the session data in local storage
   */
  private setSession(authResponse: LoginResponse): void {
    const { token, user } = authResponse;
    const expiryTime = Date.now() + token.expiresIn * 1000;
    
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token.refreshToken);
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        // Call the API to invalidate the token on the server
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Error during logout API call:', error);
      // Continue with logout even if the API call fails
    } finally {
      // Always clear the local session data
      this.clearSession();
    }
  }
  
  /**
   * Clear all session data
   */
  private clearSession(): void {
    // Remove all auth-related items from localStorage
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    
    // Clear any other user-related data that might be stored
    // This ensures all user data is completely removed
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('auth_') || key.startsWith('user_') || key.includes('token'))) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all identified keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
  
  /**
   * Check if the user is authenticated
   * @returns True if the user is authenticated
   */
  isAuthenticated(): boolean {
    return !this.isTokenExpired();
  }
  
  /**
   * Check if the token is expired
   * @returns True if the token is expired or not present
   */
  private isTokenExpired(): boolean {
    const token = this.getAccessToken();
    const expiryStr = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    
    if (!token || !expiryStr) {
      return true;
    }
    
    const expiry = parseInt(expiryStr, 10);
    const now = Date.now();
    
    return now > expiry;
  }
  
  /**
   * Get the current access token
   * @returns The access token or null if not authenticated
   */
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }
  
  /**
   * Get the current refresh token
   * @returns The refresh token or null if not authenticated
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }
  
  /**
   * Get the current user data
   * @returns The user data or null if not authenticated
   */
  getUserData(): User | null {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData) as User;
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  }
  
  /**
   * Refresh the access token using the refresh token
   * @returns A promise that resolves to the new token
   */
  async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return null;
    }
    
    try {
      // Call the real API endpoint to refresh the token
      const response = await axios.post<{ accessToken: string; expiresIn: number }>(
        `${apiClient.defaults.baseURL}/auth/refresh-token`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      const { accessToken, expiresIn } = response.data;
      const expiryTime = Date.now() + expiresIn * 1000;
      
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
      
      return accessToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      this.clearSession();
      return null;
    }
  }
}

export const authService = new AuthService();