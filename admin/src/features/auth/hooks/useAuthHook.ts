import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for authentication operations
 * This separates the authentication logic from components
 */
export const useAuthHook = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  /**
   * Handle user login
   */
  const handleLogin = useCallback(
    async (email: string, password: string) => {
      try {
        auth.resetError();
        await auth.login(email, password);
        // Explicitly navigate to events page after successful login
        navigate('/events', { replace: true });
        return true;
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      }
    },
    [auth, navigate]
  );

  /**
   * Handle user logout
   */
  const handleLogout = useCallback(async () => {
    try {
      await auth.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [auth, navigate]);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback(
    (role: string): boolean => {
      return auth.user?.role === role;
    },
    [auth.user]
  );

  return {
    ...auth,
    handleLogin,
    handleLogout,
    hasRole,
  };
};
