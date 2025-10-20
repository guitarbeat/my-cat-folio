/**
 * @module Profile
 * @description Main profile component that orchestrates user statistics and name management.
 * Now includes comprehensive selection analytics and tournament insights.
 */
import React, { useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import {
  getSupabaseClientSync,
  resolveSupabaseClient,
} from "../../integrations/supabase/client";
import {
  deleteName,
  catNamesAPI,
  tournamentsAPI,
  hiddenNamesAPI,
  getNamesWithUserRatings,
} from "../../integrations/supabase/api";
import useToast from "../../core/hooks/useToast";
import { FILTER_OPTIONS } from "../../core/constants";
// ErrorManager removed to prevent circular dependency
import { isUserAdmin } from "../../shared/utils/authUtils";

import ProfileStats from "./ProfileStats";
import ProfileFilters from "./ProfileFilters";
import ProfileNameList from "./ProfileNameList";
import { Error, StartTournamentButton } from "../../shared/components";
import styles from "./Profile.module.css";

// * Use database-optimized stats calculation
const fetchUserStatsFromDB = async (userName) => {
  if (!userName) return null;

  if (!(await resolveSupabaseClient())) {
    return null;
  }

  try {
    const dbStats = await catNamesAPI.getUserStats(userName);
    if (!dbStats) return null;

    // Return database stats directly (no transformation needed)
    return dbStats;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching user stats from DB:", error);
    }
    return null;
  }
};

// * Calculate selection analytics using consolidated tournament_data in cat_app_users
const calculateSelectionStats = async (userName) => {
  try {
    if (!(await resolveSupabaseClient())) return null;

    // Pull tournaments from cat_app_users.tournament_data via API
    const tournaments = await tournamentsAPI.getUserTournaments(userName);
    if (!tournaments || tournaments.length === 0) {
      return null;
    }

    // Flatten selections from tournament_data
    const selections = tournaments.flatMap((t) =>
      (t.selected_names || []).map((n) => ({
        name_id: n.id,
        name: n.name,
        tournament_id: t.id,
        selected_at: t.created_at,
      }))
    );

    // Calculate basic metrics
    const totalSelections = selections.length;
    const totalTournaments = tournaments.length;
    const uniqueNames = new Set(selections.map((s) => s.name_id)).size;
    const avgSelectionsPerName =
      uniqueNames > 0
        ? Math.round((totalSelections / uniqueNames) * 10) / 10
        : 0;

    // Find most selected name
    const nameCounts = {};
    selections.forEach((s) => {
      nameCounts[s.name] = (nameCounts[s.name] || 0) + 1;
    });
    const mostSelectedName =
      Object.entries(nameCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

    // Calculate selection streak (consecutive days)
    const sortedSelections = selections
      .map((s) => new Date(s.selected_at || Date.now()).toDateString())
      .sort()
      .filter((date, index, arr) => index === 0 || date !== arr[index - 1]);

    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < sortedSelections.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedSelections[i - 1]);
        const currDate = new Date(sortedSelections[i]);
        const dayDiff = Math.floor(
          (currDate - prevDate) / (1000 * 60 * 60 * 24)
        );

        if (dayDiff === 1) {
          tempStreak++;
        } else {
          maxStreak = Math.max(maxStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);
    currentStreak = tempStreak;

    // Cross-user ranking not supported without a view; omit
    const userRank = "N/A";

    // Generate insights
    const insights = {
      selectionPattern: generateSelectionPattern(selections),
      preferredCategories: await generatePreferredCategories(selections),
      improvementTip: generateImprovementTip(
        totalSelections,
        totalTournaments,
        currentStreak
      ),
    };

    return {
      totalSelections,
      totalTournaments,
      avgSelectionsPerName,
      mostSelectedName,
      currentStreak,
      maxStreak,
      userRank: userRank || "N/A",
      insights,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error calculating selection stats:", error);
    }
    return null;
  }
};

// * Generate selection pattern insights
const generateSelectionPattern = (selections) => {
  if (!selections || selections.length === 0)
    return "No selection data available";

  const totalSelections = selections.length;
  const uniqueTournaments = new Set(selections.map((s) => s.tournament_id))
    .size;
  const avgSelectionsPerTournament =
    Math.round((totalSelections / uniqueTournaments) * 10) / 10;

  if (avgSelectionsPerTournament > 8) {
    return "You prefer large tournaments with many names";
  } else if (avgSelectionsPerTournament > 4) {
    return "You enjoy medium-sized tournaments";
  } else {
    return "You prefer focused, smaller tournaments";
  }
};

// * Generate preferred categories insight
const generatePreferredCategories = async (selections) => {
  try {
    const nameIds = selections.map((s) => s.name_id);
    const supabaseClient = await resolveSupabaseClient();

    if (!supabaseClient) {
      return "Analyzing your preferences...";
    }

    const { data: names, error } = await supabaseClient
      .from("cat_name_options")
      .select("categories")
      .in("id", nameIds);

    if (error || !names) return "Analyzing your preferences...";

    const categoryCounts = {};
    names.forEach((name) => {
      if (name.categories && Array.isArray(name.categories)) {
        name.categories.forEach((cat) => {
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
      }
    });

    const topCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat);

    if (topCategories.length > 0) {
      return `You favor: ${topCategories.join(", ")}`;
    }

    return "Discovering your preferences...";
  } catch {
    return "Analyzing your preferences...";
  }
};

// * Generate improvement tips
const generateImprovementTip = (
  totalSelections,
  totalTournaments,
  currentStreak
) => {
  if (totalSelections === 0) {
    return "Start selecting names to see your first tournament!";
  }

  if (totalTournaments < 3) {
    return "Try creating more tournaments to discover your preferences";
  }

  if (currentStreak < 3) {
    return "Build a selection streak by playing daily";
  }

  if (totalSelections / totalTournaments < 4) {
    return "Consider selecting more names per tournament for variety";
  }

  return "Great job! You're an active tournament participant";
};

// * Main Profile Component
const Profile = ({ userName, onStartNewTournament }) => {
  // * State
  const [filterStatus, setFilterStatus] = useState(FILTER_OPTIONS.STATUS.ALL);
  const [userFilter, setUserFilter] = useState(FILTER_OPTIONS.USER.ALL);
  const [sortBy, setSortBy] = useState(FILTER_OPTIONS.SORT.RATING);
  const [sortOrder, setSortOrder] = useState(FILTER_OPTIONS.ORDER.DESC);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hiddenNames, setHiddenNames] = useState(new Set());
  const [selectionStats, setSelectionStats] = useState(null);
  // * NEW: Selection-based filtering state
  const [selectionFilter, setSelectionFilter] = useState("all");
  // * Filter count state
  const [filteredCount, setFilteredCount] = useState(0);

  // * Handle filtered count change from ProfileNameList
  const handleFilteredCountChange = useCallback((count) => {
    setFilteredCount(count);
  }, []);

  const { showSuccess, showError, showToast } = useToast();
  const [hasSupabaseClient, setHasSupabaseClient] = useState(
    () => !!getSupabaseClientSync()
  );

  useEffect(() => {
    let isMounted = true;

    const ensureClient = async () => {
      const client = await resolveSupabaseClient();
      if (isMounted) {
        setHasSupabaseClient(!!client);
      }
    };

    void ensureClient();

    return () => {
      isMounted = false;
    };
  }, []);

  // * Hooks
  const [allNames, setAllNames] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [ratingsError, setRatingsError] = useState(null);

  const fetchNames = useCallback(async () => {
    try {
      setRatingsLoading(true);
      setRatingsError(null);
      const supabaseClient = await resolveSupabaseClient();
      setHasSupabaseClient(!!supabaseClient);

      if (!supabaseClient) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Supabase not configured, using empty data for Profile");
        }
        setAllNames([]);
        return;
      }
      const names = await getNamesWithUserRatings(userName);
      setAllNames(names);

      // Initialize hidden names from the data
      const hiddenIds = new Set(
        names.filter((name) => name.isHidden).map((name) => name.id)
      );
      setHiddenNames(hiddenIds);
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching names:", err);
      }
      setRatingsError(err);
    } finally {
      setRatingsLoading(false);
    }
  }, [userName]);

  // * Fetch selection statistics
  const fetchSelectionStats = useCallback(async () => {
    if (!userName) return;

    try {
      const supabaseClient = await resolveSupabaseClient();
      setHasSupabaseClient(!!supabaseClient);

      if (!supabaseClient) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Supabase not configured, skipping selection stats");
        }
        setSelectionStats(null);
        return;
      }
      const stats = await calculateSelectionStats(userName);
      setSelectionStats(stats);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching selection stats:", error);
      }
      setSelectionStats(null);
    }
  }, [userName]);

  // * State for selected names
  const [selectedNames, setSelectedNames] = useState(new Set());

  // * Fetch names and selection stats on component mount
  useEffect(() => {
    if (userName) {
      fetchNames();
      fetchSelectionStats();
    }
  }, [userName, fetchNames, fetchSelectionStats]);

  // Check if the current user is an admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (userName) {
        const adminStatus = await isUserAdmin(userName);
        setIsAdmin(adminStatus);
      }
    };
    checkAdmin();
  }, [userName]);

  // * State for statistics
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // * Load statistics using database-optimized function
  useEffect(() => {
    const loadStats = async () => {
      if (!userName) return;

      setStatsLoading(true);

      // Try database-optimized stats first
      const dbStats = await fetchUserStatsFromDB(userName);
      if (dbStats) {
        setStats(dbStats);
      } else {
        // Fallback to empty stats if database unavailable
        setStats(null);
      }

      setStatsLoading(false);
    };

    loadStats();
  }, [userName]);

  // * Handle name visibility toggle
  const handleToggleVisibility = useCallback(
    async (nameId) => {
      try {
        const currentlyHidden = hiddenNames.has(nameId);

        const supabaseClient = await resolveSupabaseClient();
        setHasSupabaseClient(!!supabaseClient);

        if (!supabaseClient) {
          if (process.env.NODE_ENV === "development") {
            console.warn("Supabase not configured, cannot toggle visibility");
          }
          showError("Database not available");
          return;
        }

        if (currentlyHidden) {
          await hiddenNamesAPI.unhideName(userName, nameId);
          showSuccess("Unhidden");
        } else {
          await hiddenNamesAPI.hideName(userName, nameId);
          showSuccess("Hidden");
        }

        // Optimistic local update for instant UI feedback
        setHiddenNames((prev) => {
          const next = new Set(prev);
          if (currentlyHidden) next.delete(nameId);
          else next.add(nameId);
          return next;
        });

        // Refresh backing data (ensures filters reflect server state)
        fetchNames();
      } catch (error) {
        console.error("Profile - Toggle Visibility error:", error);
        showToast("Failed to toggle name visibility", "error");
        showError("Failed to update visibility");
      }
    },
    [hiddenNames, fetchNames, userName, showSuccess, showError, showToast]
  );

  // * Handle name deletion
  const handleDelete = useCallback(
    async (name) => {
      try {
        const supabaseClient = await resolveSupabaseClient();
        setHasSupabaseClient(!!supabaseClient);

        if (!supabaseClient) {
          if (process.env.NODE_ENV === "development") {
            console.warn("Supabase not configured, cannot delete name");
          }
          showError("Database not available");
          return;
        }

        const { error } = await deleteName(name.id);
        if (error) throw error;

        // * Refresh names and selection stats
        fetchNames();
        fetchSelectionStats();
      } catch (error) {
        console.error("Profile - Delete Name error:", error);
        showToast("Failed to delete name", "error");
        showError("Failed to delete name");
      }
    },
    [fetchNames, fetchSelectionStats, showError, showToast]
  );

  // * Handle name selection
  const handleSelectionChange = useCallback((nameId, selected) => {
    setSelectedNames((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(nameId);
      } else {
        newSet.delete(nameId);
      }
      return newSet;
    });
  }, []);

  // * Handle bulk hide operation
  const handleBulkHide = useCallback(
    async (nameIds) => {
      try {
        const supabaseClient = await resolveSupabaseClient();
        setHasSupabaseClient(!!supabaseClient);

        if (!supabaseClient) {
          if (process.env.NODE_ENV === "development") {
            console.warn("Supabase not configured, cannot hide names");
          }
          showError("Database not available");
          return;
        }

        const result = await hiddenNamesAPI.hideNames(userName, nameIds);

        if (result.success) {
          showSuccess(
            `Hidden ${result.processed} name${result.processed !== 1 ? "s" : ""}`
          );

          // Update local state optimistically
          setHiddenNames((prev) => {
            const newSet = new Set(prev);
            nameIds.forEach((id) => newSet.add(id));
            return newSet;
          });

          // Clear selection
          setSelectedNames(new Set());

          // Refresh data
          fetchNames();
        } else {
          showError("Failed to hide names");
        }
      } catch (error) {
        console.error("Profile - Bulk Hide error:", error);
        showToast("Failed to hide names", "error");
        showError("Failed to hide names");
      }
    },
    [userName, fetchNames, showSuccess, showError, showToast]
  );

  // * Handle bulk unhide operation
  const handleBulkUnhide = useCallback(
    async (nameIds) => {
      try {
        const supabaseClient = await resolveSupabaseClient();
        setHasSupabaseClient(!!supabaseClient);

        if (!supabaseClient) {
          if (process.env.NODE_ENV === "development") {
            console.warn("Supabase not configured, cannot unhide names");
          }
          showError("Database not available");
          return;
        }

        const result = await hiddenNamesAPI.unhideNames(userName, nameIds);

        if (result.success) {
          showSuccess(
            `Unhidden ${result.processed} name${result.processed !== 1 ? "s" : ""}`
          );

          // Update local state optimistically
          setHiddenNames((prev) => {
            const newSet = new Set(prev);
            nameIds.forEach((id) => newSet.delete(id));
            return newSet;
          });

          // Clear selection
          setSelectedNames(new Set());

          // Refresh data
          fetchNames();
        } else {
          showError("Failed to unhide names");
        }
      } catch (error) {
        console.error("Profile - Bulk Unhide error:", error);
        showToast("Failed to unhide names", "error");
        showError("Failed to unhide names");
      }
    },
    [userName, fetchNames, showSuccess, showError, showToast]
  );

  // * Handle error display
  if (ratingsError) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error Loading Profile</h2>
        <p>{ratingsError.message}</p>
        <button onClick={fetchNames}>Retry</button>
      </div>
    );
  }

  // * Handle case when no data is available (e.g., Supabase not configured)
  if (!ratingsLoading && allNames.length === 0 && !ratingsError) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Profile: {userName}</h1>
          <StartTournamentButton
            onClick={onStartNewTournament}
            className={styles.newTournamentButton}
          >
            Start New Tournament
          </StartTournamentButton>
        </div>
        <div className={styles.noDataContainer}>
          <h2>No Data Available</h2>
          <p>
            {!hasSupabaseClient
              ? "Database not configured. Please set up Supabase environment variables to view your profile data."
              : "No names found in your profile. Start a tournament to begin collecting data!"}
          </p>
          <StartTournamentButton
            onClick={onStartNewTournament}
            className={styles.noDataButton}
            size="large"
          >
            Start New Tournament
          </StartTournamentButton>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      {/* * Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Profile: {userName}</h1>
        <div className={styles.headerButtons}>
          <StartTournamentButton
            onClick={onStartNewTournament}
            className={styles.newTournamentButton}
            size="medium"
          >
            Start New Tournament
          </StartTournamentButton>
        </div>
      </div>

      {/* * Statistics Section */}
      <ProfileStats
        stats={stats}
        selectionStats={selectionStats}
        isLoading={statsLoading || ratingsLoading}
        className={styles.statsSection}
      />

      {/* * Filters Section */}
      <ProfileFilters
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        userFilter={userFilter}
        setUserFilter={setUserFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        isAdmin={isAdmin}
        className={styles.filtersSection}
        selectionFilter={selectionFilter}
        setSelectionFilter={setSelectionFilter}
        hasSelectionData={!!selectionStats} // * Show selection filters if we have selection data
        filteredCount={filteredCount}
        totalCount={allNames.length}
      />

      {/* * Names List Section */}
      <ProfileNameList
        names={allNames}
        ratings={{ userName }}
        isLoading={ratingsLoading}
        filterStatus={filterStatus}
        userFilter={userFilter}
        sortBy={sortBy}
        sortOrder={sortOrder}
        isAdmin={isAdmin}
        onToggleVisibility={handleToggleVisibility}
        onDelete={handleDelete}
        onSelectionChange={handleSelectionChange}
        selectedNames={selectedNames}
        hiddenIds={hiddenNames}
        className={styles.namesSection}
        showAdminControls={isAdmin} // * Pass admin controls flag
        selectionFilter={selectionFilter}
        selectionStats={selectionStats}
        onBulkHide={handleBulkHide}
        onBulkUnhide={handleBulkUnhide}
        onFilteredCountChange={handleFilteredCountChange}
      />
    </div>
  );
};

Profile.propTypes = {
  userName: PropTypes.string.isRequired,
  onStartNewTournament: PropTypes.func.isRequired,
};

// * Wrap Profile with error boundary
function ProfileWithErrorBoundary(props) {
  return (
    <Error variant="boundary">
      <Profile {...props} />
    </Error>
  );
}

export default ProfileWithErrorBoundary;
