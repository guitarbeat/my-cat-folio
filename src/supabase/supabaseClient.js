/**
 * @module supabaseClient
 * @description Consolidated Supabase client with unified API for cat name tournament system.
 * Combines all database operations, real-time subscriptions, and utility functions.
 */

import { createClient } from '@supabase/supabase-js';
import devLog from '../utils/logger';

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
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

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
      // Get ALL hidden name IDs globally (not user-specific)
      let hiddenIds = [];
      const { data: hiddenData, error: hiddenError } = await supabase
        .from('cat_name_ratings')
        .select('name_id')
        .eq('is_hidden', true);

      if (hiddenError) throw hiddenError;
      hiddenIds = hiddenData?.map((item) => item.name_id) || [];

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
          updated_at
        )
      `);

      // Filter out ALL hidden names globally
      if (hiddenIds.length > 0) {
        query = query.not('id', 'in', `(${hiddenIds.join(',')})`);
      }

      const { data, error } = await query.order('name');
      if (error) throw error;

      // Process data to include latest updated_at and user-specific info
      return (
        data.map((item) => ({
          ...item,
          updated_at: item.cat_name_ratings?.[0]?.updated_at || null,
          user_rating: item.cat_name_ratings?.[0]?.rating || null,
          user_wins: item.cat_name_ratings?.[0]?.wins || 0,
          user_losses: item.cat_name_ratings?.[0]?.losses || 0,
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
      const { data, error } = await supabase
        .from('cat_name_options')
        .insert([{ name: name.trim(), description: description.trim() }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error adding name:', error);
      }
      throw error;
    }
  },

  /**
   * Remove a name option
   */
  async removeName(name) {
    try {
      const { error } = await supabase
        .from('cat_name_options')
        .delete()
        .eq('name', name);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error removing name:', error);
      }
      throw error;
    }
  },

  /**
   * Get leaderboard data
   */
  async getLeaderboard(limit = 50, categoryId = null, minTournaments = 1) {
    try {
      const { data, error } = await supabase.rpc('get_cat_name_leaderboard', {
        p_limit: limit,
        p_category_id: categoryId,
        p_min_tournaments: minTournaments
      });

      if (error) throw error;
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

      if (error) throw error;

      return {
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
      throw error;
    }
  },

  /**
   * Get rating history for a user from the consolidated cat_name_ratings table
   */
  async getRatingHistory(userName, nameId = null, limit = 20) {
    try {
      let query = supabase
        .from('cat_name_ratings')
        .select('rating_history')
        .eq('user_name', userName)
        .not('rating_history', 'is', null);

      if (nameId) {
        query = query.eq('name_id', nameId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Extract and flatten rating history from JSONB
      const allHistory = data
        ?.map(item => item.rating_history || [])
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
      const { error } = await supabase
        .from('cat_name_ratings')
        .upsert({
          user_name: userName,
          name_id: nameId,
          rating_history: existingRating?.rating_history
            ? [...existingRating.rating_history, newHistoryEntry]
            : [newHistoryEntry]
        }, {
          onConflict: 'user_name,name_id'
        });

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
      // Update or insert the hidden status in cat_name_ratings
      const { error } = await supabase
        .from('cat_name_ratings')
        .upsert({
          name_id: nameId,
          user_name: userName,
          is_hidden: true,
          rating: 1500, // Default rating if none exists
          wins: 0,
          losses: 0
        }, {
          onConflict: 'name_id,user_name',
          ignoreDuplicates: false
        });

      if (error) throw error;
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
   * Get hidden names for a user
   */
  async getHiddenNames(userName) {
    try {
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
          console.warn('Tournament data column not found, initializing with empty array. Run the migration to add the column.');
          const tournaments = [newTournament];

          // Try to create the column and insert the tournament
          const { error: upsertError } = await supabase
            .from('cat_app_users')
            .upsert({
              user_name: userName,
              tournament_data: tournaments
            }, {
              onConflict: 'user_name',
              ignoreDuplicates: false
            })
            .select()
            .single();

          if (upsertError) {
            console.error('Failed to create tournament after column creation attempt:', upsertError);
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
        .upsert({
          user_name: userName,
          tournament_data: tournaments
        }, {
          onConflict: 'user_name',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        // If it's a column doesn't exist error, log warning and return tournament
        if (error.code === '42703') {
          console.warn('Tournament data column not found, cannot save tournament. Run the migration to add the column.');
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
  // eslint-disable-next-line no-unused-vars
  async updateTournamentStatus(tournamentId, status) {
    try {
      // This function needs to be updated to work with the new schema
      // For now, we'll need to know which user owns the tournament
      // This is a limitation of the new consolidated schema
      if (process.env.NODE_ENV === 'development') {
        console.warn('updateTournamentStatus: This function needs to be updated for the new consolidated schema');
      }
      throw new Error('updateTournamentStatus: Function needs to be updated for new schema');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating tournament:', error);
      }
      throw error;
    }
  },

  /**
   * Get user tournaments (updated for consolidated schema)
   */
  async getUserTournaments(userName, status = null) {
    try {
      // Get tournaments from the consolidated cat_app_users table
      const { data: userData, error } = await supabase
        .from('cat_app_users')
        .select('tournament_data')
        .eq('user_name', userName)
        .single();

      if (error) {
        // If it's a column doesn't exist error, return empty array
        if (error.code === '42703') {
          console.warn('Tournament data column not found, returning empty array. Run the migration to add the column.');
          return [];
        }
        throw error;
      }

      let tournaments = userData?.tournament_data || [];

      // Filter by status if specified
      if (status) {
        tournaments = tournaments.filter(t => t.status === status);
      }

      // Sort by created_at (newest first)
      tournaments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

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
      const now = new Date().toISOString();
      const finalTournamentId = tournamentId || `tournament_${Date.now()}`;

      // Prepare records for tournament selections
      const selectionRecords = selectedNames.map(nameObj => ({
        user_name: userName,
        name_id: nameObj.id,
        name: nameObj.name,
        tournament_id: finalTournamentId,
        selected_at: now,
        selection_type: 'tournament_setup'
      }));

      // Insert tournament selections
      const { error: selectionError } = await supabase
        .from('tournament_selections')
        .insert(selectionRecords);

      if (selectionError) {
        // If table doesn't exist, create it first
        if (selectionError.code === '42P01') {
          await this.createTournamentSelectionsTable();
          // Retry insert
          const { error: retryError } = await supabase
            .from('tournament_selections')
            .insert(selectionRecords);
          if (retryError) throw retryError;
        } else {
          throw selectionError;
        }
      }

      // Update the cat_name_ratings table to track selection count
      const updatePromises = selectedNames.map(nameObj =>
        supabase
          .from('cat_name_ratings')
          .upsert({
            user_name: userName,
            name_id: nameObj.id,
            tournament_selections: supabase.sql`COALESCE(tournament_selections, 0) + 1`,
            last_selected_at: now,
            updated_at: now
          }, { onConflict: 'user_name,name_id' })
      );

      await Promise.all(updatePromises);

      return {
        success: true,
        finalTournamentId,
        selectionCount: selectedNames.length,
        selectedNames: selectedNames.map(n => n.name)
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
      const { error } = await supabase.rpc('create_tournament_selections_table');
      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Could not create table via RPC, table may already exist:', error);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Table creation RPC not available, table may already exist:', error);
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
      const { data, error } = await supabase
        .from('tournament_selections')
        .select(`
          *,
          cat_name_options (
            name,
            description
          )
        `)
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
      const { data, error } = await supabase
        .from('tournament_selections')
        .select(`
          name_id,
          cat_name_options (
            name,
            description
          ),
          selection_count:count
        `)
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
      // First try to get preferences from the preferences column
      const { data, error } = await supabase
        .from('cat_app_users')
        .select('preferences')
        .eq('user_name', userName)
        .single();

      if (error && error.code !== 'PGRST116') {
        // If it's a column doesn't exist error, return defaults
        if (error.code === '42703') {
          console.warn('Preferences column not found, returning defaults. Run the migration to add the column.');
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
          console.warn('Preferences column not found, cannot save preferences. Run the migration to add the column.');
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
      // Categories are now stored as JSONB in cat_name_options
      const { data, error } = await supabase
        .from('cat_name_options')
        .select(`
          id,
          name,
          description,
          avg_rating,
          popularity_score,
          categories
        `)
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
  devLog('Rating history is now stored in cat_name_ratings.rating_history as JSONB');
  return { success: true };
};

/**
 * Delete a name with cascade (only if hidden)
 */
export const deleteName = async (nameId) => {
  try {
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

// ===== LEGACY EXPORTS (for backward compatibility) =====

// Keep these for existing code that might still use them
export const getNamesWithDescriptions = catNamesAPI.getNamesWithDescriptions;
export const addRatingHistory = ratingsAPI.addRatingHistory;
export const updateRating = ratingsAPI.updateRating;
export const getRatingHistory = ratingsAPI.getRatingHistory;
