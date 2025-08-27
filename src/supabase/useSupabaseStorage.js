/* eslint-disable react-hooks/rules-of-hooks */
/**
 * @module useSupabaseStorage
 * @description Consolidated React hook for all Supabase operations in the cat name tournament system.
 * Replaces useSupabaseStorage and useNameOptions with a unified interface.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './supabaseClient';

/**
 * Main hook for all Supabase operations
 */
function useSupabaseStorage(userName = '') {
  if (!supabase) {
    return {
      names: [],
      categories: [],
      userPreferences: null,
      loading: false,
      error: null,
      addName: async () => {},
      removeName: async () => {},
      updateRating: async () => {},
      getRatingHistory: async () => [],
      hideName: async () => {},
      unhideName: async () => {},
      getHiddenNames: async () => [],
      createTournament: async () => {},
      updateTournamentStatus: async () => {},
      getUserTournaments: async () => [],
      fetchUserPreferences: async () => {},
      updateUserPreferences: async () => {},
      fetchCategories: async () => [],
      getNamesByCategory: async () => [],
      getLeaderboard: async () => []
    };
  }

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
      const data = await supabase
        .from('cat_name_options')
        .select('*')
        .eq('user_name', userName);
      setNames(data);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching names:', err);
      }
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userName]);

  const addName = useCallback(
    async (name, description = '') => {
      try {
        setLoading(true);
        const newName = await supabase
          .from('cat_name_options')
          .insert({ user_name: userName, name: name, description: description })
          .select()
          .single();
        await fetchNames(); // Refresh the list
        return newName;
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error adding name:', err);
        }
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchNames, userName]
  );

  const removeName = useCallback(
    async (name) => {
      try {
        setLoading(true);
        await supabase
          .from('cat_name_options')
          .delete()
          .eq('user_name', userName)
          .eq('name', name);
        await fetchNames(); // Refresh the list
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error removing name:', err);
        }
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchNames, userName]
  );

  // ===== RATINGS MANAGEMENT =====

  const updateRating = useCallback(
    async (nameId, newRating, outcome = null, context = 'tournament') => {
      if (!userName) return;

      try {
        setLoading(true);
        const result = await supabase
          .from('cat_name_ratings')
          .upsert({
            user_name: userName,
            name_id: nameId,
            rating: newRating,
            outcome: outcome,
            context: context
          })
          .select()
          .single();
        await fetchNames(); // Refresh to get updated data
        return result;
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error updating rating:', err);
        }
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchNames, userName]
  );

  const getRatingHistory = useCallback(
    async (nameId = null, limit = 20) => {
      if (!userName) return [];

      try {
        const { data, error } = await supabase
          .from('cat_name_ratings')
          .select('*')
          .eq('user_name', userName)
          .eq('name_id', nameId)
          .order('timestamp', { ascending: false })
          .limit(limit);
        if (error) throw error;
        return data;
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching rating history:', err);
        }
        setError(err);
        return [];
      }
    },
    [userName]
  );

  // ===== HIDDEN NAMES MANAGEMENT =====

  const hideName = useCallback(
    async (nameId) => {
      if (!userName) return;

      try {
        setLoading(true);
        await supabase
          .from('cat_name_ratings')
          .upsert({
            user_name: userName,
            name_id: nameId,
            hidden: true
          })
          .select()
          .single();
        await fetchNames(); // Refresh to reflect changes
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error hiding name:', err);
        }
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchNames, userName]
  );

  const unhideName = useCallback(
    async (nameId) => {
      if (!userName) return;

      try {
        setLoading(true);
        await supabase
          .from('cat_name_ratings')
          .upsert({
            user_name: userName,
            name_id: nameId,
            hidden: false
          })
          .select()
          .single();
        await fetchNames(); // Refresh to reflect changes
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error unhiding name:', err);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchNames, userName]
  );

  const getHiddenNames = useCallback(async () => {
    if (!userName) return [];

    try {
      const { data, error } = await supabase
        .from('cat_name_ratings')
        .select('name_id')
        .eq('user_name', userName)
        .eq('hidden', true);
      if (error) throw error;
      return data.map((item) => item.name_id);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching hidden names:', err);
      }
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
        const tournament = await supabase
          .from('tournaments')
          .insert({
            user_name: userName,
            name: tournamentName,
            participants: participantNames,
            data: tournamentData
          })
          .select()
          .single();
        return tournament;
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error creating tournament:', err);
        }
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userName]
  );

  const updateTournamentStatus = useCallback(
    async (tournamentId, _status, completedAt = null) => {
      try {
        setLoading(true);
        const tournament = await supabase
          .from('tournaments')
          .update({ status: _status, completed_at: completedAt })
          .eq('id', tournamentId)
          .select()
          .single();
        return tournament;
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error updating tournament:', err);
        }
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getUserTournaments = useCallback(
    async (_status = null) => {
      if (!userName) return [];

      try {
        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .eq('user_name', userName);
        if (error) throw error;
        return data;
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching tournaments:', err);
        }
        setError(err);
        return [];
      }
    },
    [userName]
  );

  // ===== USER PREFERENCES =====

  const fetchUserPreferences = useCallback(async () => {
    if (!userName) return;

    try {
      const { data, error } = await supabase
        .from('cat_app_users')
        .select('*')
        .eq('user_name', userName);
      if (error) throw error;
      setUserPreferences(data[0]);
      return data[0];
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching preferences:', err);
      }
      setError(err);
      return null;
    }
  }, [userName]);

  const updateUserPreferences = useCallback(
    async (preferences) => {
      if (!userName) return;

      try {
        setLoading(true);
        const updatedPrefs = await supabase
          .from('cat_app_users')
          .upsert({
            user_name: userName,
            preferences: preferences
          })
          .select()
          .single();
        setUserPreferences(updatedPrefs);
        return updatedPrefs;
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error updating preferences:', err);
        }
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userName]
  );

  // ===== CATEGORIES =====

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('cat_name_options')
        .select('categories')
        .eq('user_name', userName);
      if (error) throw error;
      setCategories(data[0].categories);
      return data[0].categories;
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching categories:', err);
      }
      setError(err);
      return [];
    }
  }, [userName]);

  const getNamesByCategory = useCallback(
    async (categoryId) => {
      try {
        const { data, error } = await supabase
          .from('cat_name_options')
          .select('names')
          .eq('user_name', userName)
          .eq('category_id', categoryId);
        if (error) throw error;
        return data.map((item) => item.names);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching names by category:', err);
        }
        setError(err);
        return [];
      }
    },
    [userName]
  );

  // ===== LEADERBOARD =====

  const getLeaderboard = useCallback(
    async (limit = 50, categoryId = null, _minTournaments = 1) => {
      try {
        const { data, error } = await supabase
          .from('cat_name_options')
          .select('names, ratings, tournament_count')
          .eq('user_name', userName);
        if (error) throw error;

        let leaderboard = data.map((item) => ({
          name: item.names,
          rating: item.ratings,
          tournamentCount: item.tournament_count
        }));

        if (categoryId) {
          leaderboard = leaderboard.filter(
            (item) => item.categoryId === categoryId
          );
        }

        leaderboard.sort((a, b) => b.rating - a.rating);
        return leaderboard.slice(0, limit);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching leaderboard:', err);
        }
        setError(err);
        return [];
      }
    },
    [userName]
  );

  // ===== REAL-TIME SUBSCRIPTIONS =====

  // Create debounced versions of fetch functions to prevent cascading API calls
  const namesTimeoutRef = useRef(null);
  const categoriesTimeoutRef = useRef(null);
  const preferencesTimeoutRef = useRef(null);

  const debouncedFetchNames = useCallback(() => {
    if (namesTimeoutRef.current) {
      clearTimeout(namesTimeoutRef.current);
    }
    namesTimeoutRef.current = setTimeout(() => {
      fetchNames();
    }, 1000); // 1 second debounce
  }, [fetchNames]);

  const debouncedFetchCategories = useCallback(() => {
    if (categoriesTimeoutRef.current) {
      clearTimeout(categoriesTimeoutRef.current);
    }
    categoriesTimeoutRef.current = setTimeout(() => {
      fetchCategories();
    }, 1000); // 1 second debounce
  }, [fetchCategories]);

  const debouncedFetchUserPreferences = useCallback(() => {
    if (preferencesTimeoutRef.current) {
      clearTimeout(preferencesTimeoutRef.current);
    }
    preferencesTimeoutRef.current = setTimeout(() => {
      fetchUserPreferences();
    }, 1000); // 1 second debounce
  }, [fetchUserPreferences]);

    useEffect(() => {
      if (!userName) return;

      // Fetch initial data
      fetchNames();
      fetchUserPreferences();
      fetchCategories();

      // Set up real-time subscriptions
      const setupSubscriptions = async () => {
      const { supabase } = await import('./supabaseClient');

      const subscriptions = [
        // Names changes
        supabase
          .channel('cat_names_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'cat_name_options'
            },
            debouncedFetchNames
          )
          .subscribe(),

        // Ratings changes for this user
        supabase
          .channel('cat_ratings_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'cat_name_ratings',
              filter: `user_name=eq.${userName}`
            },
            debouncedFetchNames
          )
          .subscribe(),

        // Hidden names changes for this user (now in cat_name_ratings)
        supabase
          .channel('cat_name_ratings_hidden_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'cat_name_ratings',
              filter: `user_name=eq.${userName}`
            },
            debouncedFetchNames
          )
          .subscribe(),

        // Categories changes (now in cat_name_options.categories)
        supabase
          .channel('cat_name_options_categories_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'cat_name_options'
            },
            debouncedFetchCategories
          )
          .subscribe(),

        // User preferences changes (now in cat_app_users)
        supabase
          .channel('cat_app_users_preferences_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'cat_app_users',
              filter: `user_name=eq.${userName}`
            },
            debouncedFetchUserPreferences
          )
          .subscribe()
      ];

      // Cleanup subscriptions
      return () => {
        subscriptions.forEach((sub) => sub.unsubscribe());
        // Cleanup any pending timeouts
        if (namesTimeoutRef.current) clearTimeout(namesTimeoutRef.current);
        if (categoriesTimeoutRef.current)
          clearTimeout(categoriesTimeoutRef.current);
        if (preferencesTimeoutRef.current)
          clearTimeout(preferencesTimeoutRef.current);
      };
    };

      setupSubscriptions();
    }, [
      userName,
      fetchNames,
      fetchUserPreferences,
      fetchCategories,
      debouncedFetchNames,
      debouncedFetchCategories,
      debouncedFetchUserPreferences
    ]);

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
    }
  };
}

export default useSupabaseStorage;
