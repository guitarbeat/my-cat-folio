/**
 * @module useSupabaseStorage
 * @description A custom React hook that provides persistent storage using Supabase.
 * Manages real-time synchronization of data between the client and Supabase backend.
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";
import { DEFAULT_RATING } from "../components/Profile/Profile";

function useSupabaseStorage(tableName, initialValue = [], userName = "") {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userName) {
      return;
    }
    fetchData();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`${tableName}_changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tableName,
          filter: userName ? `user_name=eq.${userName}` : undefined,
        },
        () => {
          fetchData();
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tableName, userName]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. First fetch all names
      const { data: nameData, error: nameError } = await supabase
        .from("name_options")
        .select(
          `
          id,
          name,
          description
        `,
        )
        .order("name");

      if (nameError) {
        throw nameError;
      }

      // 2. Fetch all hidden name IDs
      const { data: hiddenData, error: hiddenError } = await supabase
        .from("hidden_names")
        .select("name_id");

      if (hiddenError) {
        throw hiddenError;
      }

      // 3. Create a Set of hidden IDs for efficient lookup
      const hiddenIdSet = new Set(
        hiddenData?.map((item) => item.name_id) || [],
      );

      // 4. Filter out hidden names
      const visibleNames =
        nameData?.filter((item) => !hiddenIdSet.has(item.id)) || [];

      // 5. Fetch user ratings for these names
      const { data: ratingsData, error: ratingsError } = await supabase
        .from("cat_name_ratings")
        .select("name_id, rating, wins, losses, updated_at")
        .eq("user_name", userName)
        .in(
          "name_id",
          visibleNames.map((item) => item.id),
        );

      if (ratingsError) {
        throw ratingsError;
      }

      // 6. Create a map of ratings by name_id
      const ratingsMap = (ratingsData || []).reduce((map, item) => {
        map[item.name_id] = item;
        return map;
      }, {});

      // 7. Combine the data
      const processedData = visibleNames.map((item) => {
        const ratingData = ratingsMap[item.id];

        const wins = parseInt(ratingData?.wins || 0, 10);
        const losses = parseInt(ratingData?.losses || 0, 10);

        return {
          id: item.id,
          name: item.name,
          description: item.description,
          rating: parseInt(ratingData?.rating || DEFAULT_RATING, 10),
          wins,
          losses,
          updated_at: ratingData?.updated_at || new Date().toISOString(),
          hasRating: !!ratingData,
        };
      });

      setStoredValue(processedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userName]);

  async function setValue(newValue) {
    if (!userName) {
      return;
    }

    try {
      // First, ensure all names exist in name_options
      const names = Array.isArray(newValue)
        ? newValue.map((v) => v.name)
        : [newValue.name];

      const { data: nameOptions, error: nameError } = await supabase
        .from("name_options")
        .select("id, name")
        .in("name", names);

      if (nameError) {
        throw nameError;
      }

      // Create a map of name to name_id
      const nameToIdMap = nameOptions.reduce((acc, { id, name }) => {
        acc[name] = id;
        return acc;
      }, {});

      // Prepare records for upsert
      const records = (Array.isArray(newValue) ? newValue : [newValue])
        .map((item) => {
          const wins = parseInt(item.wins || 0, 10);
          const losses = parseInt(item.losses || 0, 10);

          return {
            user_name: userName,
            name_id: nameToIdMap[item.name],
            rating: parseInt(item.rating || DEFAULT_RATING, 10),
            wins,
            losses,
            updated_at: new Date().toISOString(),
          };
        })
        .filter((record) => record.name_id);

      if (records.length === 0) {
        throw new Error("No valid records to update");
      }

      const { error: upsertError } = await supabase
        .from("cat_name_ratings")
        .upsert(records, {
          onConflict: "user_name,name_id",
          returning: "minimal",
        });

      if (upsertError) {
        throw upsertError;
      }

      // Fetch updated data to verify
      const { error: verifyError } = await supabase
        .from("cat_name_ratings")
        .select(
          `
          rating,
          wins,
          losses,
          name_id,
          name_options (
            id,
            name,
            description
          )
        `,
        )
        .in(
          "name_id",
          records.map((r) => r.name_id),
        );

      if (verifyError) {
        console.error("Error verifying update:", verifyError);
      }

      // Fetch updated data
      await fetchData();
    } catch (err) {
      console.error("Error updating data:", err);
      setError(err);
      throw err;
    }
  }

  async function clearUserData() {
    if (!userName) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from("cat_name_ratings")
        .delete()
        .eq("user_name", userName);

      if (deleteError) {
        throw deleteError;
      }

      setStoredValue(initialValue);
    } catch (err) {
      console.error("Error clearing user data:", err);
      setError(err);
      throw err;
    }
  }

  return [storedValue, setValue, { loading, error, clearUserData }];
}

export default useSupabaseStorage;
