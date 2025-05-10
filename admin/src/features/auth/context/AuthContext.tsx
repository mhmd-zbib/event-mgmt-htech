// filepath: /home/zbib/Development/projects/htech-assesment/admin/src/features/auth/context/AuthContext.tsx
import { createContext, useReducer, useContext, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, AuthState } from '../types/auth';
import { authService } from '../services/authService';

// Auth action types
type AuthAction =
  | { type: 'AUTH_INIT' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_RESET_ERROR' }
  | { type: 'AUTH_START_REQUEST' }
  | { type: 'AUTH_END_REQUEST' };

// Initial auth state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAuthenticating: false,
  error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_INIT':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        isAuthenticating: false,
        user: action.payload,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        isAuthenticating: false,
        user: null,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: null,
      };
    case 'AUTH_RESET_ERROR':
      return { ...state, error: null };
    case 'AUTH_START_REQUEST':
      return { ...state, isAuthenticating: true, error: null };
    case 'AUTH_END_REQUEST':
      return { ...state, isAuthenticating: false };
    default:
      return state;
  }
};

// Create auth context
type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      dispatch({ type: 'AUTH_INIT' });
      try {
        if (authService.isAuthenticated()) {
          const userData = authService.getUserData();
          if (userData) {
            dispatch({ type: 'AUTH_SUCCESS', payload: userData });
          } else {
            dispatch({ type: 'AUTH_FAILURE', payload: 'User data not found' });
          }
        } else {
          dispatch({ type: 'AUTH_FAILURE', payload: '' });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch({ type: 'AUTH_FAILURE', payload: 'Authentication check failed' });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START_REQUEST' });
    try {
      const response = await authService.login({ email, password });
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
      // Navigation is now handled in the useAuthHook
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Login failed' });
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Clear all auth data from localStorage
      await authService.logout();
      
      // Reset application state
      dispatch({ type: 'AUTH_LOGOUT' });
      
      // Clear any in-memory cache or state that might contain user data
      // This ensures no user data remains in the application
      window.sessionStorage.clear();
      
      // Redirect to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, we should still clear local state and redirect
      dispatch({ type: 'AUTH_LOGOUT' });
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Reset error function
  const resetError = useCallback(() => {
    dispatch({ type: 'AUTH_RESET_ERROR' });
  }, []);

  // Provide auth context value
  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    resetError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};