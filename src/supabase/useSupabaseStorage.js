/**
 * @module useSupabaseStorage
 * @description Consolidated React hook for all Supabase operations in the cat name tournament system.
 * Replaces useSupabaseStorage and useNameOptions with a unified interface.
 */

import { useState, useEffect, useCallback } from "react";
import {
  catNamesAPI,
  ratingsAPI,
  hiddenNamesAPI,
  tournamentsAPI,
  userPreferencesAPI,
  categoriesAPI,
} from "./supabaseClient";
import { DEFAULT_RATING } from "../utils/constants";

/**
 * Main hook for all Supabase operations
 */
function useSupabaseStorage(userName = "") {
  const [names, setNames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userPreferences, setUserPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===== NAMES MANAGEMENT =====

  const fetchNames = useCallback(async () => {
    if (!userName) return;

    try {
      setLoading(true);
      const data = await catNamesAPI.getNamesWithDescriptions(userName);
      setNames(data);
    } catch (err) {
      console.error("Error fetching names:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userName]);

  const addName = useCallback(
    async (name, description = "") => {
      try {
        setLoading(true);
        const newName = await catNamesAPI.addName(name, description);
        await fetchNames(); // Refresh the list
        return newName;
      } catch (err) {
        console.error("Error adding name:", err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchNames],
  );

  const removeName = useCallback(
    async (name) => {
      try {
        setLoading(true);
        await catNamesAPI.removeName(name);
        await fetchNames(); // Refresh the list
      } catch (err) {
        console.error("Error removing name:", err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchNames],
  );

  // ===== RATINGS MANAGEMENT =====

  const updateRating = useCallback(
    async (nameId, newRating, outcome = null, context = "tournament") => {
      if (!userName) return;

      try {
        setLoading(true);
        const result = await ratingsAPI.updateRating(
          userName,
          nameId,
          newRating,
          outcome,
          context,
        );
        await fetchNames(); // Refresh to get updated data
        return result;
      } catch (err) {
        console.error("Error updating rating:", err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userName, fetchNames],
  );

  const getRatingHistory = useCallback(
    async (nameId = null, limit = 20) => {
      if (!userName) return [];

      try {
        return await ratingsAPI.getRatingHistory(userName, nameId, limit);
      } catch (err) {
        console.error("Error fetching rating history:", err);
        setError(err);
        return [];
      }
    },
    [userName],
  );

  // ===== HIDDEN NAMES MANAGEMENT =====

  const hideName = useCallback(
    async (nameId) => {
      if (!userName) return;

      try {
        setLoading(true);
        await hiddenNamesAPI.hideName(userName, nameId);
        await fetchNames(); // Refresh to reflect changes
      } catch (err) {
        console.error("Error hiding name:", err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userName, fetchNames],
  );

  const unhideName = useCallback(
    async (nameId) => {
      if (!userName) return;

      try {
        setLoading(true);
        await hiddenNamesAPI.unhideName(userName, nameId);
        await fetchNames(); // Refresh to reflect changes
      } catch (err) {
        console.error("Error unhiding name:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userName, fetchNames],
  );

  const getHiddenNames = useCallback(async () => {
    if (!userName) return [];

    try {
      return await hiddenNamesAPI.getHiddenNames(userName);
    } catch (err) {
      console.error("Error fetching hidden names:", err);
      setError(err);
      return [];
    }
  }, [userName]);

  // ===== TOURNAMENT MANAGEMENT =====

  const createTournament = useCallback(
    async (tournamentName, participantNames, tournamentData = {}) => {
      if (!userName) return;

      try {
        setLoading(true);
        const tournament = await tournamentsAPI.createTournament(
          userName,
          tournamentName,
          participantNames,
          tournamentData,
        );
        return tournament;
      } catch (err) {
        console.error("Error creating tournament:", err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userName],
  );

  const updateTournamentStatus = useCallback(
    async (tournamentId, status, completedAt = null) => {
      try {
        setLoading(true);
        const tournament = await tournamentsAPI.updateTournamentStatus(
          tournamentId,
          status,
          completedAt,
        );
        return tournament;
      } catch (err) {
        console.error("Error updating tournament:", err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getUserTournaments = useCallback(
    async (status = null) => {
      if (!userName) return [];

      try {
        return await tournamentsAPI.getUserTournaments(userName, status);
      } catch (err) {
        console.error("Error fetching tournaments:", err);
        setError(err);
        return [];
      }
    },
    [userName],
  );

  // ===== USER PREFERENCES =====

  const fetchUserPreferences = useCallback(async () => {
    if (!userName) return;

    try {
      const prefs = await userPreferencesAPI.getPreferences(userName);
      setUserPreferences(prefs);
      return prefs;
    } catch (err) {
      console.error("Error fetching preferences:", err);
      setError(err);
      return null;
    }
  }, [userName]);

  const updateUserPreferences = useCallback(
    async (preferences) => {
      if (!userName) return;

      try {
        setLoading(true);
        const updatedPrefs = await userPreferencesAPI.updatePreferences(
          userName,
          preferences,
        );
        setUserPreferences(updatedPrefs);
        return updatedPrefs;
      } catch (err) {
        console.error("Error updating preferences:", err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userName],
  );

  // ===== CATEGORIES =====

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await categoriesAPI.getCategories();
      setCategories(cats);
      return cats;
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err);
      return [];
    }
  }, []);

  const getNamesByCategory = useCallback(async (categoryId) => {
    try {
      return await categoriesAPI.getNamesByCategory(categoryId);
    } catch (err) {
      console.error("Error fetching names by category:", err);
      setError(err);
      return [];
    }
  }, []);

  // ===== LEADERBOARD =====

  const getLeaderboard = useCallback(
    async (limit = 50, categoryId = null, minTournaments = 1) => {
      try {
        return await catNamesAPI.getLeaderboard(
          limit,
          categoryId,
          minTournaments,
        );
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError(err);
        return [];
      }
    },
    [],
  );

  // ===== REAL-TIME SUBSCRIPTIONS =====

  useEffect(() => {
    if (!userName) return;

    // Fetch initial data
    fetchNames();
    fetchUserPreferences();
    fetchCategories();

    // Set up real-time subscriptions
    const setupSubscriptions = async () => {
      const { supabase } = await import("./supabaseClient");

      const subscriptions = [
        // Names changes
        supabase
          .channel("cat_names_changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "cat_name_options",
            },
            fetchNames,
          )
          .subscribe(),

        // Ratings changes for this user
        supabase
          .channel("cat_ratings_changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "cat_name_ratings",
              filter: `user_name=eq.${userName}`,
            },
            fetchNames,
          )
          .subscribe(),

        // Hidden names changes for this user (now in cat_name_ratings)
        supabase
          .channel("cat_name_ratings_hidden_changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "cat_name_ratings",
              filter: `user_name=eq.${userName}`,
            },
            fetchNames,
          )
          .subscribe(),

        // Categories changes (now in cat_name_options.categories)
        supabase
          .channel("cat_name_options_categories_changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "cat_name_options",
            },
            fetchCategories,
          )
          .subscribe(),

        // User preferences changes (now in cat_users)
        supabase
          .channel("cat_users_preferences_changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "cat_users",
              filter: `user_name=eq.${userName}`,
            },
            fetchUserPreferences,
          )
          .subscribe(),
      ];

      // Cleanup subscriptions
      return () => {
        subscriptions.forEach((sub) => sub.unsubscribe());
      };
    };

    setupSubscriptions();
  }, [userName, fetchNames, fetchUserPreferences, fetchCategories]);

  // ===== RETURN OBJECT =====

  return {
    // State
    names,
    categories,
    userPreferences,
    loading,
    error,

    // Names management
    fetchNames,
    addName,
    removeName,

    // Ratings management
    updateRating,
    getRatingHistory,

    // Hidden names management
    hideName,
    unhideName,
    getHiddenNames,

    // Tournament management
    createTournament,
    updateTournamentStatus,
    getUserTournaments,

    // User preferences
    fetchUserPreferences,
    updateUserPreferences,

    // Categories
    fetchCategories,
    getNamesByCategory,

    // Leaderboard
    getLeaderboard,

    // Utility
    refreshData: () => {
      fetchNames();
      fetchUserPreferences();
      fetchCategories();
    },
  };
}

export default useSupabaseStorage;
