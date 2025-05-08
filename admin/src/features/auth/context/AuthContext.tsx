// filepath: /home/zbib/Development/projects/htech-assesment/admin/src/features/auth/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginCredentials, User, ApiError } from '../types/auth';
import { authService } from '../services/authService';

// Define auth context types
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthenticating: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAuthenticating: false,
  error: null,
  login: async () => {},
  logout: async () => {},
});

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Auth Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
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
  const login = async (email: string, password: string) => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      console.log('Attempting login with:', { email, password });
      const response = await authService.login({ email, password });
      console.log('Login response received:', response);
      console.log('Token from response:', response.token);
      
      // Store tokens in sessionStorage (cleared when browser is closed)
      sessionStorage.setItem('accessToken', response.token.accessToken);
      sessionStorage.setItem('refreshToken', response.token.refreshToken);
      sessionStorage.setItem('tokenExpiry', (Date.now() + response.token.expiresIn * 1000).toString());
      
      // Log the stored values to confirm
      console.log('Stored in sessionStorage:', {
        accessToken: sessionStorage.getItem('accessToken'),
        refreshToken: sessionStorage.getItem('refreshToken'),
        tokenExpiry: sessionStorage.getItem('tokenExpiry')
      });
      
      // Store user data in localStorage for persistence
      localStorage.setItem('userData', JSON.stringify(response.user));
      
      // Update state
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Navigate to dashboard
      navigate('/admin/dashboard');
      
      return response;
    } catch (err: any) {
      console.error('Login error:', err);
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
      
      // Clear all stored authentication data
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('tokenExpiry');
      localStorage.removeItem('userData');
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      
      // Navigate to login
      navigate('/login');
      return Promise.resolve();
    } catch (err) {
      console.error('Logout failed:', err);
      return Promise.resolve();
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      isAuthenticated, 
      isLoading, 
      isAuthenticating, 
      error,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};