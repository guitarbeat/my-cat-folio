/**
 * @module supabaseClient
 * @description Configures and exports the Supabase client instance.
 * Sets up the connection to Supabase with proper authentication and headers.
 *
 * @example
 * // Import and use the client
 * import { supabase } from './supabaseClient';
 *
 * // Make a query
 * const { data, error } = await supabase
 *   .from('table_name')
 *   .select('*');
 *
 * @requires REACT_APP_SUPABASE_URL - Environment variable for Supabase project URL
 * @requires REACT_APP_SUPABASE_ANON_KEY - Environment variable for Supabase anonymous key
 */

/* eslint-env node */
import { createClient } from '@supabase/supabase-js';
import devLog from '../utils/logger';


const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Add this function to get names with descriptions
export const getNamesWithDescriptions = async () => {
  try {
    // First get hidden name IDs
    const { data: hiddenData, error: hiddenError } = await supabase
      .from("hidden_names")
      .select("name_id");

    if (hiddenError) {
      console.error("Error fetching hidden names:", hiddenError);
      throw hiddenError;
    }

    const hiddenIds = hiddenData?.map((item) => item.name_id) || [];

    // Build query with updated_at field
    let query = supabase.from("name_options").select(`
        id,
        name,
        description,
        cat_name_ratings (
          rating,
          wins,
          losses,
          updated_at
        )
      `);

    // Only apply the not.in filter if we have hidden IDs
    if (hiddenIds.length > 0) {
      query = query.not("id", "in", `(${hiddenIds.join(",")})`);
    }

    // Execute query with ordering
    const { data, error } = await query.order("name");

    if (error) {
      throw error;
    }

    // Process the data to include the latest updated_at
    const processedData = data.map((item) => ({
      ...item,
      updated_at: item.cat_name_ratings?.[0]?.updated_at || null,
    }));

    return processedData || [];
  } catch (error) {
    console.error("Error fetching names:", error);
    throw error;
  }
};

// Add a function to create the rating_history table if it doesn't exist
export const ensureRatingHistoryTable = async () => {
  try {
    // Check if table exists
    const { data: tableExists } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "rating_history")
      .single();

    if (!tableExists) {
      // Create the table using SQL - this requires you to have enabled database functions
      // You may need to do this manually in the Supabase dashboard if this doesn't work
      await supabase.rpc('create_rating_history_table');
      devLog('Created rating_history table');

    }
  } catch (error) {
    console.error("Error ensuring rating_history table exists:", error);
  }
};

// Enhanced function to track rating changes with more context
export const addRatingHistory = async (
  userName,
  nameId,
  oldRating,
  newRating,
  context = "manual",
) => {
  try {
    // Get the name from the name_id
    const { data: nameData } = await supabase
      .from("name_options")
      .select("name")
      .eq("id", nameId)
      .single();

    const { error } = await supabase.from("rating_history").insert({
      user_name: userName,
      name_id: nameId,
      name: nameData?.name || "Unknown",
      old_rating: oldRating,
      new_rating: newRating,
      change: newRating - (oldRating || 0),
      context, // 'tournament', 'manual', etc.
      timestamp: new Date().toISOString(),
    });

    if (error) {
      // If table doesn't exist, try to create it
      if (error.code === "42P01") {
        // Table doesn't exist
        await ensureRatingHistoryTable();
        // Try again
        return addRatingHistory(
          userName,
          nameId,
          oldRating,
          newRating,
          context,
        );
      }
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving rating history:", error);
    return { success: false, error };
  }
};

// Improved rating update function with better history tracking
export const updateRating = async (
  userName,
  nameId,
  newRating,
  outcome = null,
  context = "tournament",
) => {
  const now = new Date().toISOString();

  try {
    // First get existing rating data
    const { data: existingData, error: fetchError } = await supabase
      .from("cat_name_ratings")
      .select("rating, wins, losses, updated_at")
      .eq("user_name", userName)
      .eq("name_id", nameId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 means no rows found
      console.error("Error fetching existing rating:", fetchError);
      return { error: fetchError };
    }

    // Get current values or initialize
    const currentRating = existingData?.rating || 1500; // Use the DEFAULT_RATING constant value
    let wins = existingData?.wins || 0;
    let losses = existingData?.losses || 0;

    // Update wins/losses based on outcome if provided
    if (outcome === "win") {
      wins += 1;
    } else if (outcome === "loss") {
      losses += 1;
    }

    // Create backup of current data before updating
    if (existingData) {
      try {
        await supabase.from("cat_name_ratings_backup").insert({
          user_name: userName,
          name_id: nameId,
          rating: currentRating,
          wins: existingData.wins || 0,
          losses: existingData.losses || 0,
          updated_at: existingData.updated_at || now,
        });
      } catch (backupError) {
        console.warn("Failed to create rating backup:", backupError);
        // Continue anyway - backup failure shouldn't stop the update
      }
    }

    // Record to rating history
    await addRatingHistory(userName, nameId, currentRating, newRating, context);

    // Update the rating with new values
    const { error } = await supabase.from("cat_name_ratings").upsert(
      {
        user_name: userName,
        name_id: nameId,
        rating: newRating,
        wins,
        losses,
        updated_at: now,
      },
      {
        onConflict: "user_name,name_id",
        returning: "minimal",
      },
    );

    if (error) {
      throw error;
    }

    // Return success with updated values
    return {
      error: null,
      data: {
        rating: newRating,
        previous_rating: currentRating,
        change: newRating - currentRating,
        wins,
        losses,
        updated_at: now,
      },
    };
  } catch (error) {
    console.error("Error updating rating:", error);
    return { error };
  }
};

// Add function to get rating history
export const getRatingHistory = async (userName, nameId = null, limit = 20) => {
  try {
    let query = supabase
      .from("rating_history")
      .select("*")
      .eq("user_name", userName)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (nameId) {
      query = query.eq("name_id", nameId);
    }

    const { data, error } = await query;

    if (error) {
      // If table doesn't exist, create it
      if (error.code === "42P01") {
        await ensureRatingHistoryTable();
        return getRatingHistory(userName, nameId, limit);
      }
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching rating history:", error);
    return [];
  }
};

// Add this function to delete a name (only if it's hidden)
export const deleteName = async (nameId) => {
  try {
    // First check if the name exists in name_options
    const { data: nameData, error: nameError } = await supabase
      .from("name_options")
      .select("name")
      .eq("id", nameId)
      .single();

    if (nameError?.code === "PGRST116") {
      // This error code means no rows were returned
      throw new Error("Name has already been deleted");
    } else if (nameError) {
      console.error("Error checking name existence:", nameError);
      throw nameError;
    }

    if (!nameData) {
      throw new Error("Name does not exist in database");
    }

    // Check if name is hidden
    const { data: hiddenData, error: hiddenError } = await supabase
      .from("hidden_names")
      .select("*")
      .eq("name_id", nameId);

    if (hiddenError) {
      console.error("Error checking hidden status:", hiddenError);
      throw hiddenError;
    }

    if (!hiddenData || hiddenData.length === 0) {
      throw new Error("Cannot delete name that is not hidden");
    }

    // Use a transaction to ensure all deletes happen or none happen
    const { error: error1 } = await supabase.rpc("delete_name_cascade", {
      target_name_id: nameId,
    });

    if (error1) {
      console.error("Error in delete transaction:", error1);
      throw error1;
    }

    return { error: null, success: true };
  } catch (error) {
    console.error("Error in deleteName function:", error);
    return { error, success: false };
  }
};
