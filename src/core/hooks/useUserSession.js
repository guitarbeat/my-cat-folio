/**
 * @module useUserSession
 * @description A custom React hook that handles user authentication using Supabase Auth.
 * Manages authentication state and integrates with useAppStore.
 *
 * @example
 * const { login, signup, logout, error } = useUserSession();
 * await login('user@example.com', 'password');
 * await signup('user@example.com', 'password', 'Display Name');
 * await logout();
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../backend/api/supabaseClient';
import { devLog } from '../../shared/utils/coreUtils';
import useAppStore from '../store/useAppStore';

function useUserSession() {
  const [error, setError] = useState(null);
  const { user, userActions } = useAppStore();

  // Initialize auth state from Supabase
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          userActions.login(session.user.id);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          userActions.login(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          userActions.logout();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [userActions]);

  /**
   * Logs in a user with email and password
   * @param {string} email - The user's email
   * @param {string} password - The user's password
   */
  const login = useCallback(async (email, password) => {
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }

    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;

      if (data.user) {
        userActions.login(data.user.id);
      }

      devLog('Login successful');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please try again.');
    }
  }, [userActions]);

  /**
   * Signs up a new user
   * @param {string} email - The user's email
   * @param {string} password - The user's password
   * @param {string} displayName - Optional display name
   */
  const signup = useCallback(async (email, password, displayName) => {
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }

    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0]
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        userActions.login(data.user.id);
      }

      devLog('Signup successful');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to sign up. Please try again.');
    }
  }, [userActions]);

  /**
   * Logs out the current user
   */
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      userActions.logout();
      setError(null);
      devLog('Logout complete');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout');
    }
  }, [userActions]);

  return {
    userName: user.name,
    isLoggedIn: user.isLoggedIn,
    error,
    login,
    signup,
    logout,
    isInitialized: true
  };
}

export default useUserSession;
