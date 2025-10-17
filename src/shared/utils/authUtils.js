/**
 * @module authUtils
 * @description Utilities for authentication and authorization checks with role-based access control
 */

import {
  getSupabaseClient,
  getSupabaseClientSync
} from '@/integrations/supabase/client';

const resolveSupabaseClient = async () =>
  getSupabaseClientSync() ?? (await getSupabaseClient());

/**
 * User roles hierarchy (higher number = more permissions)
 */
export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
};

const ROLE_PRIORITY = {
  [USER_ROLES.USER]: 0,
  [USER_ROLES.MODERATOR]: 1,
  [USER_ROLES.ADMIN]: 2
};

let canUseRoleRpc = true;
let preferredRoleSource = 'user_roles';

const normalizeRole = (role) => role?.toLowerCase?.() ?? null;

const isMissingResourceError = (error) => {
  if (!error) return false;

  const statusCode = typeof error.status === 'number' ? error.status : null;
  const errorCode = typeof error.code === 'string' ? error.code.toUpperCase() : '';
  const message = error.message?.toLowerCase?.() ?? '';

  return (
    statusCode === 404 ||
    errorCode === '404' ||
    errorCode === 'PGRST301' ||
    errorCode === 'PGRST303' ||
    message.includes('does not exist') ||
    message.includes('not found')
  );
};

const compareRoles = (currentRole, requiredRole) => {
  const current = ROLE_PRIORITY[normalizeRole(currentRole)] ?? -1;
  const required = ROLE_PRIORITY[normalizeRole(requiredRole)] ?? Number.POSITIVE_INFINITY;

  return current >= required;
};

const fetchRoleFromSource = async (activeSupabase, userName, source) => {
  if (!activeSupabase) return { role: null, handled: true };

  const trimmedUserName = userName.trim?.() ?? userName;

  if (source === 'user_roles') {
    const { data, error } = await activeSupabase
      .from('user_roles')
      .select('role')
      .eq('user_name', trimmedUserName)
      .order('role', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isMissingResourceError(error)) {
        preferredRoleSource = 'cat_app_users';
        return { role: null, handled: true };
      }
      throw error;
    }

    return { role: data?.role ?? null, handled: false };
  }

  const { data, error } = await activeSupabase
    .from('cat_app_users')
    .select('user_role')
    .eq('user_name', trimmedUserName)
    .maybeSingle();

  if (error) {
    if (isMissingResourceError(error) && preferredRoleSource !== 'cat_app_users') {
      preferredRoleSource = 'user_roles';
      return { role: null, handled: true };
    }
    throw error;
  }

  return { role: data?.user_role ?? null, handled: false };
};

const fetchUserRole = async (activeSupabase, userName) => {
  const sources = preferredRoleSource === 'user_roles'
    ? ['user_roles', 'cat_app_users']
    : ['cat_app_users', 'user_roles'];

  for (const source of sources) {
    try {
      const result = await fetchRoleFromSource(activeSupabase, userName, source);
      if (result?.handled) {
        continue;
      }
      if (result?.role) {
        return normalizeRole(result.role);
      }
    } catch (error) {
      console.error('Error fetching user role from Supabase:', error);
      break;
    }
  }

  return null;
};

/**
 * Checks if a user has admin privileges using role-based authentication
 * @param {string} userIdOrName - The user ID or username to check
 * @returns {Promise<boolean>} True if user is an admin
 */
export async function isUserAdmin(userIdOrName) {
  return hasRole(userIdOrName, USER_ROLES.ADMIN);
}

/**
 * Checks if a user has a specific role or higher
 * @param {string} userName - The username to check
 * @param {string} requiredRole - The minimum role required
 * @returns {Promise<boolean>} True if user has the required role or higher
 */
export async function hasRole(userName, requiredRole) {
  if (!userName || !requiredRole) return false;

  const activeSupabase = await resolveSupabaseClient();

  if (!activeSupabase) {
    console.warn('Supabase client is not configured. Role check will default to false.');
    return false;
  }

  try {
    const trimmedUserName = userName.trim?.() ?? userName;
    const normalizedRequiredRole = normalizeRole(requiredRole);

    if (!normalizedRequiredRole) {
      return false;
    }

    if (canUseRoleRpc) {
      const { data, error } = await activeSupabase.rpc('has_role', {
        _user_name: trimmedUserName,
        _role: normalizedRequiredRole
      });

      if (!error) {
        return data === true;
      }

      if (isMissingResourceError(error)) {
        canUseRoleRpc = false;
      } else {
        throw error;
      }
    }

    const userRole = await fetchUserRole(activeSupabase, trimmedUserName);
    if (!userRole) {
      return false;
    }

    return compareRoles(userRole, normalizedRequiredRole);
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

/**
 * Gets the current user's role
 * @param {string} userName - The username to check
 * @returns {Promise<string|null>} The user's role or null if not found
 */
export async function getUserRole(userName) {
  if (!userName) return null;

  const activeSupabase = await resolveSupabaseClient();

  if (!activeSupabase) {
    console.warn('Supabase client is not configured. Using default user role.');
    return USER_ROLES.USER;
  }

  try {
    const trimmedUserName = userName.trim?.() ?? userName;
    const role = await fetchUserRole(activeSupabase, trimmedUserName);

    return role ?? USER_ROLES.USER;
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
