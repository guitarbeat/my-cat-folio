/**
 * @module hiddenNamesAPI
 * @description Hidden Names Management API functions
 */

import { supabase } from './supabaseClientIsolated.js';

/**
 * Check if Supabase is configured and available
 * @returns {boolean} True if Supabase is available
 */
const isSupabaseAvailable = () => {
  if (!supabase) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Supabase not configured. Some features may not work.');
    }
    return false;
  }
  return true;
};

export const hiddenNamesAPI = {
  /**
   * Hide a name for a user
   */
  async hideName(nameId, userName) {
    try {
      if (!isSupabaseAvailable() || !nameId || !userName) {
        return false;
      }

      const { error } = await supabase
        .from('cat_name_ratings')
        .update({ is_hidden: true })
        .eq('name_id', nameId)
        .eq('user_name', userName);

      if (error) {
        console.error('Error hiding name:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in hideName:', error);
      return false;
    }
  },

  /**
   * Unhide a name for a user
   */
  async unhideName(nameId, userName) {
    try {
      if (!isSupabaseAvailable() || !nameId || !userName) {
        return false;
      }

      const { error } = await supabase
        .from('cat_name_ratings')
        .update({ is_hidden: false })
        .eq('name_id', nameId)
        .eq('user_name', userName);

      if (error) {
        console.error('Error unhiding name:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in unhideName:', error);
      return false;
    }
  }
};
