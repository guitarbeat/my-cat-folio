/**
 * @module authUtils
 * @description Utilities for authentication and authorization checks with role-based access control
 */

import { supabase } from '../../../backend/api/supabaseClient';

/**
 * User roles hierarchy (higher number = more permissions)
 */
export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
};


/**
 * Checks if a user has admin privileges using role-based authentication
 * @param {string} userId - The user ID to check
 * @returns {Promise<boolean>} True if user is an admin
 */
export async function isUserAdmin(userId) {
  if (!userId) return false;

  if (!supabase) {
    console.warn('Supabase client is not configured. Admin check will default to false.');
    return false;
  }

  try {
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: USER_ROLES.ADMIN
    });

    if (error) throw error;
    return data === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Checks if a user has a specific role or higher
 * @param {string} userId - The user ID to check
 * @param {string} requiredRole - The minimum role required
 * @returns {Promise<boolean>} True if user has the required role or higher
 */
export async function hasRole(userId, requiredRole) {
  if (!userId || !requiredRole) return false;

  if (!supabase) {
    console.warn('Supabase client is not configured. Role check will default to false.');
    return false;
  }

  try {
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: requiredRole
    });

    if (error) throw error;
    return data === true;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

/**
 * Gets the current user's role
 * @param {string} userId - The user ID to check
 * @returns {Promise<string|null>} The user's role or null if not found
 */
export async function getUserRole(userId) {
  if (!userId) return null;

  if (!supabase) {
    console.warn('Supabase client is not configured. Using default user role.');
    return USER_ROLES.USER;
  }

  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .order('role', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data?.role || USER_ROLES.USER;
  } catch (error) {
    console.error('Error getting user role:', error);
    return USER_ROLES.USER;
  }
}

/**
 * Gets the current authentication configuration
 * @returns {Object} Authentication configuration object
 */
export function getAuthConfig() {
  return {
    isRoleBased: true,
    supportedRoles: Object.values(USER_ROLES),
    version: '3.0.0',
    usesSupabaseAuth: true
  };
}

export default {
  isUserAdmin,
  hasRole,
  getUserRole,
  getAuthConfig
};
