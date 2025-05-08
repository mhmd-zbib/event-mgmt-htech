// filepath: /home/zbib/Development/projects/htech-assesment/admin/src/features/auth/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { LoginCredentials, User, ApiError } from '../types/auth';

// Default credentials for development/testing
export const DEFAULT_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'Admin123!'
};

/**
 * Custom hook for authentication functionality
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check authentication status on initial load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Check if the user is authenticated
   */
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        // Load user data from localStorage if available
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login with email and password
   */
  const login = async (credentials: LoginCredentials) => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      
      // Store tokens in sessionStorage (cleared when browser is closed)
      sessionStorage.setItem('accessToken', response.token.accessToken);
      sessionStorage.setItem('refreshToken', response.token.refreshToken);
      sessionStorage.setItem('tokenExpiry', (Date.now() + response.token.expiresIn * 1000).toString());
      
      // Store user data in localStorage (persists between sessions)
      localStorage.setItem('userData', JSON.stringify(response.user));
      
      // Update state
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Navigate to dashboard
      navigate('/admin/dashboard');
      
      return response;
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(apiError.message);
      throw apiError;
    } finally {
      setIsAuthenticating(false);
    }
  };

  /**
   * Logout the current user
   */
  const logout = async () => {
    try {
      await authService.logout();
      
      // Clear stored data
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('tokenExpiry');
      localStorage.removeItem('userData');
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      
      // Navigate to login
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    isAuthenticating,
    error,
    login,
    logout,
    DEFAULT_CREDENTIALS
  };
}