/**
 * @module tournamentsAPI
 * @description Tournament Management API functions
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

export const tournamentsAPI = {
  /**
   * Get tournament history for a user
   */
  async getTournamentHistory(userName) {
    try {
      if (!isSupabaseAvailable() || !userName) {
        return [];
      }

      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('user_name', userName)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tournament history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTournamentHistory:', error);
      return [];
    }
  }
};
