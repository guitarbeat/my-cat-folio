/**
 * @module useUserSession
 * @description Hook for managing user sessions with username-based authentication (no email/password)
 * @example
 * const { login, logout, error, userName, isLoggedIn } = useUserSession();
 * await login('MyUsername');
 * await logout();
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../backend/api/supabaseClient';
import useAppStore from '../store/useAppStore';

function useUserSession() {
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, userActions } = useAppStore();

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUserName = localStorage.getItem('catNamesUser');
    if (storedUserName && storedUserName.trim()) {
      userActions.login(storedUserName);
    }
    setIsInitialized(true);
  }, [userActions]);

  /**
   * Login with username only (no password required)
   * Creates user in database if doesn't exist
   * @param {string} userName - The user's chosen username
   */
  const login = useCallback(async (userName) => {
    if (!userName || !userName.trim()) {
      setError('Username is required');
      return false;
    }

    try {
      setError(null);
      const trimmedName = userName.trim();

      // Check if user exists in database
      const { data: existingUser, error: fetchError } = await supabase
        .from('cat_app_users')
        .select('user_name, preferences, user_role')
        .eq('user_name', trimmedName)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      // Create user if doesn't exist
      if (!existingUser) {
        const { error: insertError } = await supabase
          .from('cat_app_users')
          .insert({
            user_name: trimmedName,
            preferences: {
              sound_enabled: true,
              theme_preference: 'dark'
            },
            user_role: 'user'
          });

        if (insertError) {
          throw insertError;
        }
      }

      // Store username and update state
      localStorage.setItem('catNamesUser', trimmedName);
      userActions.login(trimmedName);
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login');
      return false;
    }
  }, [userActions]);

  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    try {
      setError(null);
      localStorage.removeItem('catNamesUser');
      userActions.logout();
      return true;
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to logout');
      return false;
    }
  }, [userActions]);

  return {
    userName: user.name,
    isLoggedIn: user.isLoggedIn,
    error,
    login,
    logout,
    isInitialized
  };
}

export default useUserSession;
