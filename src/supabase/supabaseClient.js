/**
 * @module supabaseClient
 * @description Consolidated Supabase client with unified API for cat name tournament system.
 * Combines all database operations, real-time subscriptions, and utility functions.
 */

import { createClient } from "@supabase/supabase-js";
import devLog from "../utils/logger";

// Environment configuration
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.BAG_NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.BAG_NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file. Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or BAG_NEXT_PUBLIC_SUPABASE_URL and BAG_NEXT_PUBLIC_SUPABASE_ANON_KEY)",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ===== CORE API FUNCTIONS =====

/**
 * Cat Names Management
 */
export const catNamesAPI = {
  /**
   * Get all names with descriptions and ratings for a user
   */
  async getNamesWithDescriptions(userName = null) {
    try {
      // Get hidden name IDs if user is specified
      let hiddenIds = [];
      if (userName) {
        const { data: hiddenData, error: hiddenError } = await supabase
          .from("cat_hidden_names")
          .select("name_id")
          .eq("user_name", userName);

        if (hiddenError) throw hiddenError;
        hiddenIds = hiddenData?.map((item) => item.name_id) || [];
      }

      // Build query
      let query = supabase.from("cat_name_options").select(`
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

      // Filter out hidden names if user specified
      if (hiddenIds.length > 0) {
        query = query.not("id", "in", `(${hiddenIds.join(",")})`);
      }

      const { data, error } = await query.order("name");
      if (error) throw error;

      // Process data to include latest updated_at and user-specific info
      return (
        data.map((item) => ({
          ...item,
          updated_at: item.cat_name_ratings?.[0]?.updated_at || null,
          user_rating: item.cat_name_ratings?.[0]?.rating || null,
          user_wins: item.cat_name_ratings?.[0]?.wins || 0,
          user_losses: item.cat_name_ratings?.[0]?.losses || 0,
          has_user_rating: !!item.cat_name_ratings?.[0],
        })) || []
      );
    } catch (error) {
      console.error("Error fetching names:", error);
      throw error;
    }
  },

  /**
   * Add a new name option
   */
  async addName(name, description = "") {
    try {
      const { data, error } = await supabase
        .from("cat_name_options")
        .insert([{ name: name.trim(), description: description.trim() }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error adding name:", error);
      throw error;
    }
  },

  /**
   * Remove a name option
   */
  async removeName(name) {
    try {
      const { error } = await supabase
        .from("cat_name_options")
        .delete()
        .eq("name", name);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error removing name:", error);
      throw error;
    }
  },

  /**
   * Get leaderboard data
   */
  async getLeaderboard(limit = 50, categoryId = null, minTournaments = 1) {
    try {
      const { data, error } = await supabase.rpc("get_cat_name_leaderboard", {
        p_limit: limit,
        p_category_id: categoryId,
        p_min_tournaments: minTournaments,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }
  },
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
    context = "tournament",
  ) {
    const now = new Date().toISOString();

    try {
      // Get existing rating data
      const { data: existingData, error: fetchError } = await supabase
        .from("cat_name_ratings")
        .select("rating, wins, losses, updated_at")
        .eq("user_name", userName)
        .eq("name_id", nameId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      // Calculate new values
      const currentRating = existingData?.rating || 1500;
      let wins = existingData?.wins || 0;
      let losses = existingData?.losses || 0;

      if (outcome === "win") wins += 1;
      else if (outcome === "loss") losses += 1;

      // Record to rating history
      await this.addRatingHistory(
        userName,
        nameId,
        currentRating,
        newRating,
        context,
      );

      // Update rating
      const { error } = await supabase.from("cat_name_ratings").upsert(
        {
          user_name: userName,
          name_id: nameId,
          rating: newRating,
          wins,
          losses,
          updated_at: now,
        },
        { onConflict: "user_name,name_id", returning: "minimal" },
      );

      if (error) throw error;

      return {
        rating: newRating,
        previous_rating: currentRating,
        change: newRating - currentRating,
        wins,
        losses,
        updated_at: now,
      };
    } catch (error) {
      console.error("Error updating rating:", error);
      throw error;
    }
  },

  /**
   * Get rating history for a user
   */
  async getRatingHistory(userName, nameId = null, limit = 20) {
    try {
      let query = supabase
        .from("cat_rating_history")
        .select("*")
        .eq("user_name", userName)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (nameId) {
        query = query.eq("name_id", nameId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching rating history:", error);
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
    context = "manual",
  ) {
    try {
      // Get name from name_id
      const { data: nameData } = await supabase
        .from("cat_name_options")
        .select("name")
        .eq("id", nameId)
        .single();

      const { error } = await supabase.from("cat_rating_history").insert({
        user_name: userName,
        name_id: nameId,
        name: nameData?.name || "Unknown",
        old_rating: oldRating,
        new_rating: newRating,
        change: newRating - (oldRating || 0),
        context,
        timestamp: new Date().toISOString(),
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error saving rating history:", error);
      throw error;
    }
  },
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
      const { error } = await supabase.from("cat_hidden_names").insert({
        name_id: nameId,
        user_name: userName,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error hiding name:", error);
      throw error;
    }
  },

  /**
   * Unhide a name for a user
   */
  async unhideName(userName, nameId) {
    try {
      const { error } = await supabase
        .from("cat_hidden_names")
        .delete()
        .eq("name_id", nameId)
        .eq("user_name", userName);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error unhiding name:", error);
      throw error;
    }
  },

  /**
   * Get hidden names for a user
   */
  async getHiddenNames(userName) {
    try {
      const { data, error } = await supabase
        .from("cat_hidden_names")
        .select(
          `
          name_id,
          created_at,
          cat_name_options (
            id,
            name,
            description
          )
        `,
        )
        .eq("user_name", userName);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching hidden names:", error);
      return [];
    }
  },
};

/**
 * Tournament Management
 */
export const tournamentsAPI = {
  /**
   * Create a new tournament
   */
  async createTournament(
    userName,
    tournamentName,
    participantNames,
    tournamentData = {},
  ) {
    try {
      const { data, error } = await supabase
        .from("cat_tournaments")
        .insert([
          {
            user_name: userName,
            tournament_name: tournamentName,
            participant_names: participantNames,
            tournament_data: tournamentData,
            status: "in_progress",
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating tournament:", error);
      throw error;
    }
  },

  /**
   * Update tournament status
   */
  async updateTournamentStatus(tournamentId, status, completedAt = null) {
    try {
      const updateData = { status };
      if (status === "completed" && completedAt) {
        updateData.completed_at = completedAt;
      }

      const { data, error } = await supabase
        .from("cat_tournaments")
        .update(updateData)
        .eq("id", tournamentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating tournament:", error);
      throw error;
    }
  },

  /**
   * Get user tournaments
   */
  async getUserTournaments(userName, status = null) {
    try {
      let query = supabase
        .from("cat_tournaments")
        .select("*")
        .eq("user_name", userName)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      return [];
    }
  },
};

/**
 * User Preferences Management
 */
export const userPreferencesAPI = {
  /**
   * Get user preferences
   */
  async getPreferences(userName) {
    try {
      const { data, error } = await supabase
        .from("cat_user_preferences")
        .select("*")
        .eq("user_name", userName)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      // Return defaults if no preferences exist
      return (
        data || {
          user_name: userName,
          preferred_categories: [],
          tournament_size_preference: 8,
          rating_display_preference: "elo",
          sound_enabled: true,
          theme_preference: "dark",
        }
      );
    } catch (error) {
      console.error("Error fetching preferences:", error);
      throw error;
    }
  },

  /**
   * Update user preferences
   */
  async updatePreferences(userName, preferences) {
    try {
      const { data, error } = await supabase
        .from("cat_user_preferences")
        .upsert(
          {
            user_name: userName,
            ...preferences,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_name" },
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating preferences:", error);
      throw error;
    }
  },
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
      const { data, error } = await supabase
        .from("cat_name_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  /**
   * Get names by category
   */
  async getNamesByCategory(categoryId) {
    try {
      const { data, error } = await supabase
        .from("cat_name_category_mappings")
        .select(
          `
          cat_name_options (
            id,
            name,
            description,
            avg_rating,
            popularity_score
          )
        `,
        )
        .eq("category_id", categoryId);

      if (error) throw error;
      return data?.map((item) => item.cat_name_options).filter(Boolean) || [];
    } catch (error) {
      console.error("Error fetching names by category:", error);
      return [];
    }
  },
};

// ===== UTILITY FUNCTIONS =====

/**
 * Ensure rating history table exists
 */
export const ensureRatingHistoryTable = async () => {
  try {
    const { data: tableExists } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "cat_rating_history")
      .single();

    if (!tableExists) {
      await supabase.rpc("create_cat_rating_history_table");
      devLog("Created cat_rating_history table");
    }
  } catch (error) {
    console.error("Error ensuring cat_rating_history table exists:", error);
  }
};

/**
 * Delete a name with cascade (only if hidden)
 */
export const deleteName = async (nameId) => {
  try {
    // Check if name exists
    const { data: nameData, error: nameError } = await supabase
      .from("cat_name_options")
      .select("name")
      .eq("id", nameId)
      .single();

    if (nameError?.code === "PGRST116") {
      throw new Error("Name has already been deleted");
    } else if (nameError) {
      throw nameError;
    }

    if (!nameData) {
      throw new Error("Name does not exist in database");
    }

    // Check if name is hidden
    const { data: hiddenData, error: hiddenError } = await supabase
      .from("cat_hidden_names")
      .select("*")
      .eq("name_id", nameId);

    if (hiddenError) throw hiddenError;
    if (!hiddenData || hiddenData.length === 0) {
      throw new Error("Cannot delete name that is not hidden");
    }

    // Use transaction to delete
    const { error } = await supabase.rpc("delete_name_cascade", {
      target_name_id: nameId,
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error in deleteName function:", error);
    throw error;
  }
};

// ===== LEGACY EXPORTS (for backward compatibility) =====

// Keep these for existing code that might still use them
export const getNamesWithDescriptions = catNamesAPI.getNamesWithDescriptions;
export const addRatingHistory = ratingsAPI.addRatingHistory;
export const updateRating = ratingsAPI.updateRating;
export const getRatingHistory = ratingsAPI.getRatingHistory;
