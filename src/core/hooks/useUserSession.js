/**
 * @module useUserSession
 * @description Hook for managing user sessions with username-based authentication (no email/password)
 * @example
 * const { login, logout, error, userName, isLoggedIn } = useUserSession({ showToast });
 * await login('MyUsername');
 * await logout();
 */

import { useState, useCallback, useEffect } from 'react';
import { resolveSupabaseClient } from '../../integrations/supabase/client';
import useAppStore from '../store/useAppStore';
import { isUserAdmin } from '@/shared/utils/authUtils';

let canUseSetUserContext = true;

const isRpcUnavailableError = (error) => {
  if (!error) return false;

  const statusCode = typeof error.status === 'number' ? error.status : null;
  const errorCode = typeof error.code === 'string' ? error.code.toUpperCase() : '';
  const message = error.message?.toLowerCase?.() ?? '';

  return (
    statusCode === 404 ||
    errorCode === '404' ||
    errorCode === 'PGRST301' ||
    errorCode === 'PGRST303' ||
    message.includes('not found') ||
    message.includes('does not exist')
  );
};

const setSupabaseUserContext = async (activeSupabase, userName) => {
  if (!canUseSetUserContext || !activeSupabase || !userName) {
    return;
  }

  try {
    const trimmedName = userName.trim?.() ?? userName;
    if (!trimmedName) return;

    await activeSupabase.rpc('set_user_context', { user_name_param: trimmedName });
  } catch (error) {
    if (isRpcUnavailableError(error)) {
      canUseSetUserContext = false;
      if (process.env.NODE_ENV === 'development') {
        console.info(
          'Supabase set_user_context RPC is unavailable. Skipping future context calls.'
        );
      }
    } else if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to set Supabase user context:', error);
    }
  }
};

function useUserSession({ showToast } = {}) {
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, userActions } = useAppStore();

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUserName = localStorage.getItem('catNamesUser');
    if (storedUserName && storedUserName.trim()) {
      userActions.login(storedUserName);

      // Set username context for RLS policies (username-based auth)
      (async () => {
        try {
          const activeSupabase = await resolveSupabaseClient();
          await setSupabaseUserContext(activeSupabase, storedUserName);
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Failed to initialize Supabase user context:', error);
          }
        }
      })();

      // Check admin status server-side
      isUserAdmin(storedUserName).then(adminStatus => {
        userActions.setAdminStatus(adminStatus);
      }).catch(() => {
        userActions.setAdminStatus(false);
      });
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

      const activeSupabase = await resolveSupabaseClient();

      if (!activeSupabase) {
        console.warn(
          'Supabase client is not configured. Proceeding with local-only login.'
        );

        localStorage.setItem('catNamesUser', trimmedName);
        userActions.login(trimmedName);
        return true;
      }

      // Ensure the RLS session uses the current username
      await setSupabaseUserContext(activeSupabase, trimmedName);

      // Check if user exists in database
      const { data: existingUser, error: fetchError } = await activeSupabase
        .from('cat_app_users')
        .select('user_name, preferences, user_role')
        .eq('user_name', trimmedName)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching user:', fetchError);
        const errorMessage = fetchError.message || 'Cannot verify existing user';
        showToast?.({ message: errorMessage, type: 'error' });
        throw fetchError;
      }

      // Create user if doesn't exist
      if (!existingUser) {
        const { error: insertError } = await activeSupabase
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
          // Handle 409 conflict (user already exists) as success
          if (insertError.code === '23505') {
            showToast?.({ message: 'Logging in...', type: 'info' });
            // User exists, continue with login
          } else {
            console.error('Error creating user:', insertError);
            const errorMessage = insertError.message || 'Failed to create user account';
            showToast?.({ message: errorMessage, type: 'error' });
            throw insertError;
          }
        } else {
          showToast?.({ message: 'Account created successfully!', type: 'success' });
        }
      } else {
        showToast?.({ message: 'Logging in...', type: 'info' });
      }

      // Store username and update state
      localStorage.setItem('catNamesUser', trimmedName);
      userActions.login(trimmedName);

      // Check admin status server-side
      const adminStatus = await isUserAdmin(trimmedName);
      userActions.setAdminStatus(adminStatus);

      return true;
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Failed to login';

      // Handle specific error types
      if (err.message?.includes('fetch')) {
        errorMessage = 'Cannot connect to database. Please check your connection.';
      } else if (err.message?.includes('JWT')) {
        errorMessage = 'Authentication error. Please try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      showToast?.({ message: errorMessage, type: 'error' });
      return false;
    }
  }, [userActions, showToast]);

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
