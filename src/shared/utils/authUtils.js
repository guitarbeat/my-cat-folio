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
 * Role hierarchy for permission checking
 */
const ROLE_HIERARCHY = {
  [USER_ROLES.USER]: 1,
  [USER_ROLES.MODERATOR]: 2,
  [USER_ROLES.ADMIN]: 3
};

/**
 * Checks if a user has admin privileges using role-based authentication
 * @param {string} userName - The username to check
 * @returns {Promise<boolean>} True if user is an admin
 *
 * @example
 * const isAdmin = await isUserAdmin('Aaron'); // true
 * const isAdmin = await isUserAdmin('john'); // false
 * const isAdmin = await isUserAdmin(''); // false
 * const isAdmin = await isUserAdmin(null); // false
 */
export async function isUserAdmin(userName) {
  if (!userName || typeof userName !== 'string') {
    return false;
  }

  try {
    // If Supabase isn't configured, fall back to simple check
    if (!supabase) {
      const ADMIN_USERS = ['aaron'];
      return ADMIN_USERS.includes(userName.toLowerCase().trim());
    }

    // Check if user has admin role in user_roles table
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_name', userName.trim())
      .eq('role', USER_ROLES.ADMIN)
      .single();

    if (error || !data) {
      return false;
    }

    return data.role === USER_ROLES.ADMIN;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Checks if a user has a specific role or higher
 * @param {string} userName - The username to check
 * @param {string} requiredRole - The minimum role required
 * @returns {Promise<boolean>} True if user has the required role or higher
 *
 * @example
 * const canModerate = await hasRole('Aaron', USER_ROLES.MODERATOR); // true
 * const isAdmin = await hasRole('john', USER_ROLES.ADMIN); // false
 */
export async function hasRole(userName, requiredRole) {
  if (!userName || typeof userName !== 'string' || !requiredRole) {
    return false;
  }

  try {
    // If Supabase isn't configured, fall back to simple admin check
    if (!supabase) {
      if (requiredRole === USER_ROLES.ADMIN) {
        const ADMIN_USERS = ['aaron'];
        return ADMIN_USERS.includes(userName.toLowerCase().trim());
      }
      return requiredRole === USER_ROLES.USER; // Everyone is at least a user
    }

    // Get all roles for the user from user_roles table
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_name', userName.trim());

    if (error || !data || data.length === 0) {
      return false;
    }

    // Find the highest role level
    const userLevel = Math.max(
      ...data.map(roleRecord => ROLE_HIERARCHY[roleRecord.role] || 0)
    );
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;

    return userLevel >= requiredLevel;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

/**
 * Gets the current user's role
 * @param {string} userName - The username to check
 * @returns {Promise<string|null>} The user's role or null if not found
 *
 * @example
 * const role = await getUserRole('Aaron'); // 'admin'
 * const role = await getUserRole('john'); // 'user'
 */
export async function getUserRole(userName) {
  if (!userName || typeof userName !== 'string') {
    return null;
  }

  try {
    // If Supabase isn't configured, return simple role
    if (!supabase) {
      const ADMIN_USERS = ['aaron'];
      return ADMIN_USERS.includes(userName.toLowerCase().trim()) ? USER_ROLES.ADMIN : USER_ROLES.USER;
    }

    // Get all roles for the user and return the highest one
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_name', userName.trim());

    if (error || !data || data.length === 0) {
      return null;
    }

    // Return the highest role
    const roles = data.map(r => r.role);
    if (roles.includes(USER_ROLES.ADMIN)) return USER_ROLES.ADMIN;
    if (roles.includes(USER_ROLES.MODERATOR)) return USER_ROLES.MODERATOR;
    return USER_ROLES.USER;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
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
    version: '2.0.0',
    fallbackToSimple: !supabase
  };
}

export default {
  isUserAdmin,
  hasRole,
  getUserRole,
  getAuthConfig
};
