import { useState, useEffect, useCallback } from 'react';
import { User } from '../../domain/models/User';
import { AuthCredentials } from '../../domain/repositories/AuthRepository';
import { AuthService } from '../../application/services/AuthService';
import { navigateTo } from '../../infrastructure/navigation/RouterService'; // Import for navigation

// Instantiate the service. In a larger app, consider context or a service locator.
const authService = new AuthService();

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkUserSession = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const user = await authService.getProfile();
      setCurrentUser(user);
    } catch (error: any) {
      console.error("useAuth - checkUserSession error:", error);
      setAuthError(error.message || 'Failed to check session');
      setCurrentUser(null); // Ensure user is null on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  const login = useCallback(async (credentials: AuthCredentials) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const user = await authService.login(credentials);
      setCurrentUser(user);
      if (user) {
        navigateTo('/dashboard'); // Navigate on successful login
      } else {
        setAuthError('Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      console.error("useAuth - login error:", error);
      setAuthError(error.message || 'An unexpected error occurred during login.');
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await authService.logout();
      setCurrentUser(null);
      navigateTo('/'); // Navigate to login page on logout
    } catch (error: any) {
      console.error("useAuth - logout error:", error);
      setAuthError(error.message || 'Logout failed.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    currentUser,
    isLoading,
    authError,
    login,
    logout,
    checkUserSession // Expose if manual refresh is needed
  };
};
