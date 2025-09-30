/**
 * @module authUtils
 * @description Utilities for authentication and authorization checks
 */

/**
 * List of admin usernames (case-insensitive)
 * TODO: Replace with proper role-based authentication when user system is enhanced
 */
const ADMIN_USERS = ['aaron'];

/**
 * Checks if a user has admin privileges
 * @param {string} userName - The username to check
 * @returns {boolean} True if user is an admin
 *
 * @example
 * isUserAdmin('Aaron') // true
 * isUserAdmin('john') // false
 * isUserAdmin('') // false
 * isUserAdmin(null) // false
 */
export function isUserAdmin(userName) {
  if (!userName || typeof userName !== 'string') {
    return false;
  }

  return ADMIN_USERS.includes(userName.toLowerCase().trim());
}

/**
 * Gets the current admin configuration
 * @returns {Object} Admin configuration object
 */
export function getAdminConfig() {
  return {
    adminUsers: [...ADMIN_USERS],
    isSimpleAuth: true, // Indicates this is simple username-based auth
    version: '1.0.0'
  };
}

export default {
  isUserAdmin,
  getAdminConfig
};
