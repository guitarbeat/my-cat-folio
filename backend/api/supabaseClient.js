/**
 * @module supabaseClient
 * @description Consolidated Supabase client with unified API for cat name tournament system.
 * Combines all database operations, real-time subscriptions, and utility functions.
 */

import { createClient } from '@supabase/supabase-js';
import devLog from '../../src/shared/utils/logger';
import { databaseRetry } from '../../src/shared/utils/retryUtils';

// Environment configuration
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.BAG_NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.BAG_NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create the Supabase client if the required environment variables are present
// Otherwise export `null` so the application can still render without Supabase
let supabase = null;
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'Missing Supabase environment variables. Supabase features are disabled.'
    );
  }
} else {
  // Ensure a single Supabase client instance in browser (avoids multiple GoTrueClient warnings)
  if (typeof window !== 'undefined') {
    if (!window.__supabaseClient) {
      window.__supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    }
    supabase = window.__supabaseClient;
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
}

export { supabase };

// ===== HELPER FUNCTIONS =====

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

// ===== CORE API FUNCTIONS =====

/**
 * Cat Names Management
 */
export const catNamesAPI = {
  /**
   * Get all names with descriptions and ratings (hidden names are filtered out globally)
   */
  async getNamesWithDescriptions() {
    try {
      if (!isSupabaseAvailable()) {
        return [];
      }

      // Get ALL hidden name IDs globally (not user-specific)
      let hiddenIds = [];
      const { data: hiddenData, error: hiddenError } = await databaseRetry.read(
        async () => {
          return await supabase
            .from('cat_name_ratings')
            .select('name_id')
            .eq('is_hidden', true);
        }
      );

      if (hiddenError) {
        console.error('Error fetching hidden names:', hiddenError);
        hiddenIds = [];
      } else {
        hiddenIds = hiddenData?.map((item) => item.name_id) || [];
      }

      // Build query
      let query = supabase.from('cat_name_options').select(`
        id,
        name,
        description,
        created_at,
        avg_rating,
        popularity_score,
        total_tournaments,
        is_active,
        cat_name_ratings (
          rating,
          wins,
          losses,
          is_hidden,
          updated_at
        )
      `);

      // Filter out ALL hidden names globally
      if (hiddenIds.length > 0) {
        query = query.not('id', 'in', `(${hiddenIds.join(',')})`);
      }

      const { data, error } = await databaseRetry.read(async () => {
        return await query.order('name');
      });
      if (error) {
        console.error('Error fetching names with descriptions:', error);
        return [];
      }

      // Process data to include latest updated_at and user-specific info
      return (
        data.map((item) => ({
          ...item,
          updated_at: item.cat_name_ratings?.[0]?.updated_at || null,
          user_rating: item.cat_name_ratings?.[0]?.rating || null,
          user_wins: item.cat_name_ratings?.[0]?.wins || 0,
          user_losses: item.cat_name_ratings?.[0]?.losses || 0,
          isHidden: item.cat_name_ratings?.[0]?.is_hidden || false,
          has_user_rating: !!item.cat_name_ratings?.[0]
        })) || []
      );
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching names:', error);
      }
      throw error;
    }
  },

  /**
   * Add a new name option
   */
  async addName(name, description = '') {
    try {
      if (!isSupabaseAvailable()) {
        return { success: false, error: 'Supabase not configured' };
      }

      const { data, error } = await supabase
        .from('cat_name_options')
        .insert([{ name: name.trim(), description: description.trim() }])
        .select()
        .single();

      if (error) {
        console.error('Error adding name:', error);
        return { success: false, error: error.message || 'Failed to add name' };
      }
      return { success: true, data };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error adding name:', error);
      }
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  },

  /**
   * Remove a name option
   */
  async removeName(name) {
    try {
      if (!isSupabaseAvailable()) {
        return { success: false, error: 'Supabase not configured' };
      }

      const { error } = await supabase
        .from('cat_name_options')
        .delete()
        .eq('name', name);

      if (error) {
        console.error('Error removing name:', error);
        return {
          success: false,
          error: error.message || 'Failed to remove name'
        };
      }
      return { success: true };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error removing name:', error);
      }
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  },

  /**
   * Get leaderboard data
   */
  async getLeaderboard(limit = 50, categoryId = null, minTournaments = 1) {
    try {
      if (!isSupabaseAvailable()) {
        return [];
      }

      const { data, error } = await supabase.rpc('get_cat_name_leaderboard', {
        p_limit: limit,
        p_category_id: categoryId,
        p_min_tournaments: minTournaments
      });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching leaderboard:', error);
      }
      return [];
    }
  }
};

/**
 * User Ratings Management
 */
export const ratingsAPI = {
  /**
   * Update user rating for a name
   */
  async updateRating(
    userName,
    nameId,
    newRating,
    outcome = null,
    context = 'tournament'
  ) {
    const now = new Date().toISOString();

    try {
      if (!isSupabaseAvailable()) {
        return { success: false, error: 'Supabase not configured' };
      }

      // Get existing rating data
      const { data: existingData, error: fetchError } = await supabase
        .from('cat_name_ratings')
        .select('rating, wins, losses, updated_at')
        .eq('user_name', userName)
        .eq('name_id', nameId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // Calculate new values
      const currentRating = existingData?.rating || 1500;
      let wins = existingData?.wins || 0;
      let losses = existingData?.losses || 0;

      if (outcome === 'win') wins += 1;
      else if (outcome === 'loss') losses += 1;

      // Record to rating history
      await this.addRatingHistory(
        userName,
        nameId,
        currentRating,
        newRating,
        context
      );

      // Update rating
      const { error } = await supabase.from('cat_name_ratings').upsert(
        {
          user_name: userName,
          name_id: nameId,
          rating: newRating,
          wins,
          losses,
          updated_at: now
        },
        { onConflict: 'user_name,name_id', returning: 'minimal' }
      );

      if (error) {
        console.error('Error updating rating:', error);
        return {
          success: false,
          error: error.message || 'Failed to update rating'
        };
      }

      return {
        success: true,
        rating: newRating,
        previous_rating: currentRating,
        change: newRating - currentRating,
        wins,
        losses,
        updated_at: now
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating rating:', error);
      }
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  },

  /**
   * Get rating history for a user from the consolidated cat_name_ratings table
   */
  async getRatingHistory(userName, nameId = null, limit = 20) {
    try {
      if (!isSupabaseAvailable()) {
        return [];
      }

      let query = supabase
        .from('cat_name_ratings')
        .select('rating_history')
        .eq('user_name', userName)
        .not('rating_history', 'is', null);

      if (nameId) {
        query = query.eq('name_id', nameId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching rating history:', error);
        return [];
      }

      // Extract and flatten rating history from JSONB
      const allHistory =
        data
          ?.map((item) => item.rating_history || [])
          .flat()
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, limit) || [];

      return allHistory;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching rating history:', error);
      }
      return [];
    }
  },

  /**
   * Add rating history entry
   */
  async addRatingHistory(
    userName,
    nameId,
    oldRating,
    newRating,
    context = 'manual'
  ) {
    try {
      if (!isSupabaseAvailable()) {
        return { success: false, error: 'Supabase not configured' };
      }

      // Get name from name_id
      const { data: nameData } = await supabase
        .from('cat_name_options')
        .select('name')
        .eq('id', nameId)
        .single();

      // Get existing rating data to update the rating_history JSONB column
      const { data: existingRating, error: fetchError } = await supabase
        .from('cat_name_ratings')
        .select('rating_history')
        .eq('user_name', userName)
        .eq('name_id', nameId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // Prepare new history entry
      const newHistoryEntry = {
        user_name: userName,
        name_id: nameId,
        name: nameData?.name || 'Unknown',
        old_rating: oldRating,
        new_rating: newRating,
        change: newRating - (oldRating || 0),
        context,
        timestamp: new Date().toISOString()
      };

      // Update or insert the rating_history in cat_name_ratings
      const { error } = await supabase.from('cat_name_ratings').upsert(
        {
          user_name: userName,
          name_id: nameId,
          rating_history: existingRating?.rating_history
            ? [...existingRating.rating_history, newHistoryEntry]
            : [newHistoryEntry]
        },
        {
          onConflict: 'user_name,name_id'
        }
      );

      if (error) throw error;
      return { success: true };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving rating history:', error);
      }
      throw error;
    }
  }
};

/**
 * Hidden Names Management
 */
export const hiddenNamesAPI = {
  /**
   * Hide a name for a user
   */
  async hideName(userName, nameId) {
    try {
      if (!isSupabaseAvailable()) {
        return { success: false, error: 'Supabase not configured' };
      }

      // First check if a record exists to avoid overwriting wins/losses
      const { data: existing, error: fetchError } = await supabase
        .from('cat_name_ratings')
        .select('user_name, name_id')
        .eq('user_name', userName)
        .eq('name_id', nameId)
        .single();

      if (!fetchError && existing) {
        // Existing record: update only the hidden flag
        const { error: updateError } = await supabase
          .from('cat_name_ratings')
          .update({ is_hidden: true })
          .eq('user_name', userName)
          .eq('name_id', nameId);
        if (updateError) throw updateError;
      } else if (fetchError?.code === 'PGRST116') {
        // No existing record: insert minimal new record with hidden flag
        const { error: insertError } = await supabase
          .from('cat_name_ratings')
          .insert({
            user_name: userName,
            name_id: nameId,
            is_hidden: true
          });
        if (insertError) throw insertError;
      } else if (fetchError) {
        throw fetchError;
      }

      return { success: true };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error hiding name:', error);
      }
      throw error;
    }
  },

  /**
   * Unhide a name for a user
   */
  async unhideName(userName, nameId) {
    try {
      if (!isSupabaseAvailable()) {
        return { success: false, error: 'Supabase not configured' };
      }

      // Update the hidden status to false in cat_name_ratings
      const { error } = await supabase
        .from('cat_name_ratings')
        .update({ is_hidden: false })
        .eq('name_id', nameId)
        .eq('user_name', userName);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error unhiding name:', error);
      }
      throw error;
    }
  },

  /**
   * Hide multiple names for a user
   */
  async hideNames(userName, nameIds) {
    try {
      if (!isSupabaseAvailable()) {
        return { success: false, error: 'Supabase not configured' };
      }

      if (!nameIds || nameIds.length === 0) {
        return { success: true, processed: 0 };
      }

      const results = [];
      let processed = 0;

      for (const nameId of nameIds) {
        try {
          const result = await this.hideName(userName, nameId);
          results.push({ nameId, success: result.success });
          if (result.success) processed++;
        } catch (error) {
          results.push({ nameId, success: false, error: error.message });
        }
      }

      return { success: true, processed, results };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error hiding names:', error);
      }
      throw error;
    }
  },

  /**
   * Unhide multiple names for a user
   */
  async unhideNames(userName, nameIds) {
    try {
      if (!isSupabaseAvailable()) {
        return { success: false, error: 'Supabase not configured' };
      }

      if (!nameIds || nameIds.length === 0) {
        return { success: true, processed: 0 };
      }

      const results = [];
      let processed = 0;

      for (const nameId of nameIds) {
        try {
          const result = await this.unhideName(userName, nameId);
          results.push({ nameId, success: result.success });
          if (result.success) processed++;
        } catch (error) {
          results.push({ nameId, success: false, error: error.message });
        }
      }

      return { success: true, processed, results };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error unhiding names:', error);
      }
      throw error;
    }
  },

  /**
   * Get hidden names for a user
   */
  async getHiddenNames(userName) {
    try {
      if (!isSupabaseAvailable()) {
        return [];
      }

      const { data, error } = await supabase
        .from('cat_name_ratings')
        .select(
          `
          name_id,
          updated_at,
          cat_name_options (
            id,
            name,
            description
          )
        `
        )
        .eq('user_name', userName)
        .eq('is_hidden', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching hidden names:', error);
      }
      return [];
    }
  }
};

/**
 * Tournament Management
 */
export const tournamentsAPI = {
  /**
   * Create a new tournament (updated for consolidated schema)
   */
  async createTournament(
    userName,
    tournamentName,
    participantNames,
    tournamentData = {}
  ) {
    try {
      if (!isSupabaseAvailable()) {
        return { success: false, error: 'Supabase not configured' };
      }

      // Create tournament in the consolidated cat_app_users table
      const newTournament = {
        id: crypto.randomUUID(), // Generate unique ID
        user_name: userName,
        tournament_name: tournamentName,
        participant_names: participantNames,
        tournament_data: tournamentData,
        status: 'in_progress',
        created_at: new Date().toISOString()
      };

      // Get or create user record in cat_app_users
      const { data: userData, error: userError } = await supabase
        .from('cat_app_users')
        .select('tournament_data')
        .eq('user_name', userName)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        // If it's a column doesn't exist error, initialize with empty array
        if (userError.code === '42703') {
          console.warn(
            'Tournament data column not found, initializing with empty array. Run the migration to add the column.'
          );
          const tournaments = [newTournament];

          // Try to create the column and insert the tournament
          const { error: upsertError } = await supabase
            .from('cat_app_users')
            .upsert(
              {
                user_name: userName,
                tournament_data: tournaments
              },
              {
                onConflict: 'user_name',
                ignoreDuplicates: false
              }
            )
            .select()
            .single();

          if (upsertError) {
            console.error(
              'Failed to create tournament after column creation attempt:',
              upsertError
            );
            // Return the tournament object anyway to prevent app crashes
            return newTournament;
          }
          return newTournament;
        }
        throw userError;
      }

      // Prepare tournament data array
      const tournaments = userData?.tournament_data || [];
      tournaments.push(newTournament);

      // Update user's tournament data
      const { error } = await supabase
        .from('cat_app_users')
        .upsert(
          {
            user_name: userName,
            tournament_data: tournaments
          },
          {
            onConflict: 'user_name',
            ignoreDuplicates: false
          }
        )
        .select()
        .single();

      if (error) {
        // If it's a column doesn't exist error, log warning and return tournament
        if (error.code === '42703') {
          console.warn(
            'Tournament data column not found, cannot save tournament. Run the migration to add the column.'
          );
          return newTournament;
        }
        throw error;
      }
      return newTournament;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating tournament:', error);
      }
      throw error;
    }
  },

  /**
   * Update tournament status
   */
  async updateTournamentStatus(tournamentId, status) {
    try {
      if (!isSupabaseAvailable()) {
        return { success: false, error: 'Supabase not configured' };
      }

      // Find the tournament in the user's tournament_data array
      // We need to search through all users to find the tournament
      const { data: allUsers, error: fetchError } = await supabase
        .from('cat_app_users')
        .select('user_name, tournament_data')
        .not('tournament_data', 'is', null);

      if (fetchError) {
        console.error(
          'Error fetching users for tournament update:',
          fetchError
        );
        return { success: false, error: 'Failed to fetch tournament data' };
      }

      let tournamentFound = false;
      let updatedUser = null;

      // Search through all users to find the tournament
      for (const user of allUsers) {
        if (!user.tournament_data || !Array.isArray(user.tournament_data))
          continue;

        const tournamentIndex = user.tournament_data.findIndex(
          (t) => t.id === tournamentId
        );
        if (tournamentIndex !== -1) {
          // Update the tournament status
          const updatedTournaments = [...user.tournament_data];
          updatedTournaments[tournamentIndex] = {
            ...updatedTournaments[tournamentIndex],
            status: status,
            updated_at: new Date().toISOString()
          };

          // Update the user's tournament data
          const { error: updateError } = await supabase
            .from('cat_app_users')
            .update({ tournament_data: updatedTournaments })
            .eq('user_name', user.user_name);

          if (updateError) {
            console.error('Error updating tournament status:', updateError);
            return {
              success: false,
              error: 'Failed to update tournament status'
            };
          }

          tournamentFound = true;
          updatedUser = user.user_name;
          break;
        }
      }

      if (!tournamentFound) {
        return { success: false, error: 'Tournament not found' };
      }

      return {
        success: true,
        tournamentId,
        status,
        updatedUser,
        message: `Tournament status updated to ${status}`
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating tournament status:', error);
      }
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  },

  /**
   * Get user tournaments (updated for consolidated schema)
   */
  async getUserTournaments(userName, status = null) {
    try {
      if (!isSupabaseAvailable()) {
        return [];
      }

      // Get tournaments from the consolidated cat_app_users table
      const { data: userData, error } = await supabase
        .from('cat_app_users')
        .select('tournament_data')
        .eq('user_name', userName)
        .single();

      if (error) {
        // If it's a column doesn't exist error, return empty array
        if (error.code === '42703') {
          console.warn(
            'Tournament data column not found, returning empty array. Run the migration to add the column.'
          );
          return [];
        }
        throw error;
      }

      let tournaments = userData?.tournament_data || [];

      // Filter by status if specified
      if (status) {
        tournaments = tournaments.filter((t) => t.status === status);
      }

      // Sort by created_at (newest first)
      tournaments.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      return tournaments;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching tournaments:', error);
      }
      return [];
    }
  },

  /**
   * Save tournament name selections for a user
   * @param {string} userName - The username
   * @param {Array} selectedNames - Array of name objects with id, name properties
   * @param {string} tournamentId - Optional tournament identifier
   * @returns {Object} Success status and selection count
   */
  async saveTournamentSelections(userName, selectedNames, tournamentId = null) {
    try {
      if (!isSupabaseAvailable()) {
        return { success: false, error: 'Supabase not configured' };
      }

      const now = new Date().toISOString();
      const finalTournamentId = tournamentId || `tournament_${Date.now()}`;

      // Instead of using tournament_selections table (which has RLS issues),
      // we'll store the selections in the cat_name_ratings table
      // This approach is simpler and avoids RLS policy complications

      // Update the cat_name_ratings table to track selection count and tournament data
      const updatePromises = selectedNames.map(async (nameObj) => {
        try {
          // Use atomic server-side increment to avoid 409s and RLS reads
          const { error: rpcError } = await supabase.rpc(
            'increment_selection',
            {
              p_user_name: userName,
              p_name_id: nameObj.id
            }
          );

          if (rpcError) {
            console.error(
              'RPC increment_selection error for',
              userName,
              nameObj.id,
              ':',
              rpcError
            );
            return { error: rpcError };
          }

          return { error: null };
        } catch (error) {
          return { error };
        }
      });

      const results = await Promise.all(updatePromises);

      // Check for any errors
      const errors = results.filter((result) => result.error);
      if (errors.length > 0) {
        console.warn('Some tournament selections had errors:', errors);
      }

      // Also try to create a simple tournament record in the user's preferences
      try {
        const { data: userData } = await supabase
          .from('cat_app_users')
          .select('tournament_data')
          .eq('user_name', userName)
          .single();

        const tournaments = userData?.tournament_data || [];
        const newTournament = {
          id: finalTournamentId,
          name: `Tournament Setup - ${selectedNames.length} names`,
          created_at: now,
          status: 'setup_complete',
          selected_names: selectedNames.map((n) => ({
            id: n.id,
            name: n.name
          })),
          selection_count: selectedNames.length
        };

        tournaments.push(newTournament);

        const { error: userUpsertError } = await supabase
          .from('cat_app_users')
          .upsert(
            {
              user_name: userName,
              tournament_data: tournaments
            },
            { onConflict: 'user_name' }
          );

        if (userUpsertError) {
          console.error(
            'User upsert error for',
            userName,
            ':',
            userUpsertError
          );
        }
      } catch (tournamentError) {
        // Don't fail if tournament creation fails
        if (process.env.NODE_ENV === 'development') {
          console.warn('Could not save tournament record:', tournamentError);
        }
      }

      return {
        success: true,
        finalTournamentId,
        selectionCount: selectedNames.length,
        selectedNames: selectedNames.map((n) => n.name),
        method: 'cat_name_ratings_update'
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving tournament selections:', error);
      }
      throw error;
    }
  },

  /**
   * Create the tournament_selections table if it doesn't exist
   */
  async createTournamentSelectionsTable() {
    try {
      if (!isSupabaseAvailable()) {
        return { success: false, error: 'Supabase not configured' };
      }

      const { error } = await supabase.rpc(
        'create_tournament_selections_table'
      );
      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            'Could not create table via RPC, table may already exist:',
            error
          );
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          'Table creation RPC not available, table may already exist:',
          error
        );
      }
    }
  },

  /**
   * Get tournament selection history for a user
   * @param {string} userName - The username
   * @param {number} limit - Maximum number of records to return
   * @returns {Array} Array of tournament selection records
   */
  async getTournamentSelectionHistory(userName, limit = 50) {
    try {
      if (!isSupabaseAvailable()) {
        return [];
      }

      const { data, error } = await supabase
        .from('tournament_selections')
        .select(
          `
          *,
          cat_name_options (
            name,
            description
          )
        `
        )
        .eq('user_name', userName)
        .order('selected_at', { ascending: false })
        .limit(limit);

      if (error) {
        // If table doesn't exist, return empty array
        if (error.code === '42P01') {
          return [];
        }
        throw error;
      }

      return data || [];
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching tournament selection history:', error);
      }
      return [];
    }
  },

  /**
   * Get popular names based on tournament selections
   * @param {number} limit - Maximum number of names to return
   * @returns {Array} Array of popular names with selection counts
   */
  async getPopularTournamentNames(limit = 20) {
    try {
      if (!isSupabaseAvailable()) {
        return [];
      }

      const { data, error } = await supabase
        .from('tournament_selections')
        .select(
          `
          name_id,
          cat_name_options (
            name,
            description
          ),
          selection_count:count
        `
        )
        .group('name_id, cat_name_options.name, cat_name_options.description')
        .order('selection_count', { ascending: false })
        .limit(limit);

      if (error) {
        // If table doesn't exist, return empty array
        if (error.code === '42P01') {
          return [];
        }
        throw error;
      }

      return data || [];
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching popular tournament names:', error);
      }
      return [];
    }
  },

  /**
   * Get personalized name recommendations for a user
   * @param {string} userName - The username
   * @param {number} limit - Maximum number of recommendations to return
   * @returns {Array} Array of recommended names with scores and reasoning
   */
  async getPersonalizedRecommendations(userName, limit = 10) {
    try {
      if (!isSupabaseAvailable()) {
        return [];
      }

      const { data, error } = await supabase.rpc(
        'get_personalized_recommendations',
        {
          p_user_name: userName,
          p_limit: limit
        }
      );

      if (error) {
        console.error('Error getting personalized recommendations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting personalized recommendations:', error);
      }
      return [];
    }
  },

  /**
   * Get selection analytics dashboard data
   * @returns {Object} Dashboard statistics and metrics
   */
  async getSelectionDashboard() {
    try {
      if (!isSupabaseAvailable()) {
        return null;
      }

      const { data, error } = await supabase
        .from('selection_summary')
        .select('*')
        .single();

      if (error) {
        console.error('Error getting selection dashboard:', error);
        return null;
      }

      return data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting selection dashboard:', error);
      }
      return null;
    }
  },

  /**
   * Get popular names based on selections
   * @param {number} limit - Maximum number of names to return
   * @returns {Array} Array of popular names with selection metrics
   */
  async getPopularNamesBySelections(limit = 20) {
    try {
      if (!isSupabaseAvailable()) {
        return [];
      }

      const { data, error } = await supabase
        .from('popular_names_by_selections')
        .select('*')
        .limit(limit);

      if (error) {
        console.error('Error getting popular names:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting popular names:', error);
      }
      return [];
    }
  }
};

/**
 * User Preferences Management
 */
export const userPreferencesAPI = {
  /**
   * Get user preferences (updated for consolidated schema)
   */
  async getPreferences(userName) {
    try {
      if (!isSupabaseAvailable()) {
        return {
          user_name: userName,
          preferred_categories: [],
          tournament_size_preference: 8,
          rating_display_preference: 'elo',
          sound_enabled: true,
          theme_preference: 'dark'
        };
      }

      // First try to get preferences from the preferences column
      const { data, error } = await supabase
        .from('cat_app_users')
        .select('preferences')
        .eq('user_name', userName)
        .single();

      if (error && error.code !== 'PGRST116') {
        // If it's a column doesn't exist error, return defaults
        if (error.code === '42703') {
          console.warn(
            'Preferences column not found, returning defaults. Run the migration to add the column.'
          );
          return {
            user_name: userName,
            preferred_categories: [],
            tournament_size_preference: 8,
            rating_display_preference: 'elo',
            sound_enabled: true,
            theme_preference: 'dark'
          };
        }
        throw error;
      }

      // Return preferences if they exist, otherwise return defaults
      return (
        data?.preferences || {
          user_name: userName,
          preferred_categories: [],
          tournament_size_preference: 8,
          rating_display_preference: 'elo',
          sound_enabled: true,
          theme_preference: 'dark'
        }
      );
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching preferences:', error);
      }
      // Return defaults on any error to prevent app crashes
      return {
        user_name: userName,
        preferred_categories: [],
        tournament_size_preference: 8,
        rating_display_preference: 'elo',
        sound_enabled: true,
        theme_preference: 'dark'
      };
    }
  },

  /**
   * Update user preferences (updated for consolidated schema)
   */
  async updatePreferences(userName, preferences) {
    try {
      if (!isSupabaseAvailable()) {
        return preferences;
      }

      // Update preferences in the consolidated cat_app_users table
      const { data, error } = await supabase
        .from('cat_app_users')
        .upsert(
          {
            user_name: userName,
            preferences: {
              ...preferences,
              updated_at: new Date().toISOString()
            }
          },
          { onConflict: 'user_name' }
        )
        .select()
        .single();

      if (error) {
        // If it's a column doesn't exist error, log warning and return preferences
        if (error.code === '42703') {
          console.warn(
            'Preferences column not found, cannot save preferences. Run the migration to add the column.'
          );
          return preferences;
        }
        throw error;
      }
      return data?.preferences;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating preferences:', error);
      }
      // Return the preferences object on error to prevent app crashes
      return preferences;
    }
  }
};

/**
 * Categories Management
 */
export const categoriesAPI = {
  /**
   * Get all categories
   */
  async getCategories() {
    try {
      if (!isSupabaseAvailable()) {
        return [];
      }

      // Get categories from the consolidated cat_name_options table
      const { data, error } = await supabase
        .from('cat_name_options')
        .select('categories')
        .not('categories', 'is', null);

      if (error) throw error;
      return data || [];
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching categories:', error);
      }
      return [];
    }
  },

  /**
   * Get names by category (updated for consolidated schema)
   */
  async getNamesByCategory(categoryId) {
    try {
      if (!isSupabaseAvailable()) {
        return [];
      }

      // Categories are now stored as JSONB in cat_name_options
      const { data, error } = await supabase
        .from('cat_name_options')
        .select(
          `
          id,
          name,
          description,
          avg_rating,
          popularity_score,
          categories
        `
        )
        .contains('categories', [categoryId]);

      if (error) throw error;
      return data || [];
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching names by category:', error);
      }
      return [];
    }
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Note: Rating history is now stored in cat_name_ratings.rating_history as JSONB
 * This function is kept for backward compatibility but no longer creates tables
 */
export const ensureRatingHistoryTable = async () => {
  devLog(
    'Rating history is now stored in cat_name_ratings.rating_history as JSONB'
  );
  return { success: true };
};

/**
 * Delete a name with cascade (only if hidden)
 */
export const deleteName = async (nameId) => {
  try {
    if (!isSupabaseAvailable()) {
      return { success: false, error: 'Supabase not configured' };
    }

    // Check if name exists
    const { data: nameData, error: nameError } = await supabase
      .from('cat_name_options')
      .select('name')
      .eq('id', nameId)
      .single();

    if (nameError?.code === 'PGRST116') {
      throw new Error('Name has already been deleted');
    } else if (nameError) {
      throw nameError;
    }

    if (!nameData) {
      throw new Error('Name does not exist in database');
    }

    // Check if name is hidden
    const { data: hiddenData, error: hiddenError } = await supabase
      .from('cat_name_ratings')
      .select('*')
      .eq('name_id', nameId)
      .eq('is_hidden', true);

    if (hiddenError) throw hiddenError;
    if (!hiddenData || hiddenData.length === 0) {
      throw new Error('Cannot delete name that is not hidden');
    }

    // Use transaction to delete
    const { error } = await supabase.rpc('delete_name_cascade', {
      target_name_id: nameId
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in deleteName function:', error);
    }
    throw error;
  }
};

/**
 * Images (Supabase Storage)
 */
export const imagesAPI = {
  /**
   * List images from the `cat-images` bucket. Optionally from a prefix folder.
   * Deduplicates by base filename (ignoring extension) and prefers smaller files
   * when Supabase returns sizes. Otherwise, prefers modern formats (avif > webp > jpg/jpeg > png > gif).
   */
  async list(prefix = '', limit = 1000) {
    try {
      if (!isSupabaseAvailable()) {
        return [];
      }

      const opts = { limit, search: undefined, sortBy: { column: 'updated_at', order: 'desc' } };
      const { data, error } = await supabase.storage.from('cat-images').list(prefix, opts);
      if (error) {
        if (process.env.NODE_ENV === 'development') console.warn('imagesAPI.list error:', error);
        return [];
      }
      const files = (data || []).filter((f) => f && f.name);
      if (!files.length) return [];

      const rankByExt = (name) => {
        const n = name.toLowerCase();
        if (n.endsWith('.avif')) return 1;
        if (n.endsWith('.webp')) return 2;
        if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 3;
        if (n.endsWith('.png')) return 4;
        if (n.endsWith('.gif')) return 5;
        return 9;
      };

      const pickSmaller = (a, b) => {
        const sizeA = a?.metadata?.size ?? a?.size;
        const sizeB = b?.metadata?.size ?? b?.size;
        if (typeof sizeA === 'number' && typeof sizeB === 'number') {
          return sizeA <= sizeB ? a : b;
        }
        // fallback to extension ranking
        return rankByExt(a.name) <= rankByExt(b.name) ? a : b;
      };

      const byBase = new Map();
      for (const f of files) {
        const base = f.name.replace(/\.[^.]+$/, '').toLowerCase();
        const current = byBase.get(base);
        byBase.set(base, current ? pickSmaller(current, f) : f);
      }

      // Map to public URLs
      const toUrl = (name) => {
        const fullPath = prefix ? `${prefix}/${name}` : name;
        const { data: urlData } = supabase.storage.from('cat-images').getPublicUrl(fullPath);
        return urlData?.publicUrl;
      };

      return Array.from(byBase.values())
        .map((f) => toUrl(f.name))
        .filter(Boolean);
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error('imagesAPI.list fatal:', e);
      return [];
    }
  },

  /**
   * Upload an image file to the `cat-images` bucket. Returns public URL.
   */
  async upload(file, _userName = 'anon', prefix = '') {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase not configured');
    }

    const safe = (file?.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_');
    // Store at bucket root to simplify listing (no recursion needed)
    const objectPath = `${prefix ? `${prefix}/` : ''}${Date.now()}-${safe}`;
    const { error } = await supabase.storage.from('cat-images').upload(objectPath, file, {
      upsert: false,
      cacheControl: '3600'
    });
    if (error) throw error;
    const { data } = supabase.storage.from('cat-images').getPublicUrl(objectPath);
    return data?.publicUrl;
  }
};
// ===== LEGACY EXPORTS (for backward compatibility) =====

// Keep these for existing code that might still use them
export const getNamesWithDescriptions = catNamesAPI.getNamesWithDescriptions;
export const addRatingHistory = ratingsAPI.addRatingHistory;
export const updateRating = ratingsAPI.updateRating;
export const getRatingHistory = ratingsAPI.getRatingHistory;
