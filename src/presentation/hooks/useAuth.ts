import { useState, useEffect, useCallback } from 'react';
import { User } from '../../domain/models/User';
import { AuthCredentials, UserDetails } from '../../domain/repositories/AuthRepository';
import { AuthService } from '../../application/services/AuthService';
import { navigateTo } from '../../infrastructure/navigation/RouterService'; // Import for navigation

// Instantiate the service. In a larger app, consider context or a service locator.
const authService = new AuthService();

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkUserSession = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const user = await authService.getProfile();
      setCurrentUser(user);
      if (user) {
        const details = await authService.getUserDetails();
        setUserDetails(details);
      } else {
        setUserDetails(null);
      }
    } catch (error: any) {
      console.error("useAuth: Error during checkUserSession", error);
      setAuthError(error.message || 'Failed to check user session.');
      setCurrentUser(null);
      setUserDetails(null);
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
    setUserDetails(null);
    try {
      const user = await authService.login(credentials);
      setCurrentUser(user);
      if (user) {
        const details = await authService.getUserDetails();
        setUserDetails(details);
      }
      // Removed 'else' block: if 'user' is null, authService.login would have thrown,
      // and execution would be in the catch block.
    } catch (error: any) {
      console.error("useAuth: Error during login", error);
      setAuthError(error.message || 'An unexpected error occurred during login.');
      setCurrentUser(null);
      setUserDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthError(null);
    try {
      await authService.logout();
      setCurrentUser(null);
      setUserDetails(null);
    } catch (error: any) {
      console.error("useAuth: Error during logout", error);
      setAuthError(error.message || 'Logout failed.');
      // Ensure states are cleared even if authService.logout() had an issue
      setCurrentUser(null);
      setUserDetails(null);
    }
    // isLoading is not managed here as logout is primarily a state clearing action.
    // App.tsx will react to currentUser being null.
  }, []);

  return {
    currentUser,
    isLoading,
    authError,
    userDetails,
    login,
    logout,
    checkUserSession
  };
};
