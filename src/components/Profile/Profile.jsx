/**
 * @module Profile
 * @description Displays user statistics and saved tournament data with enhanced analytics.
 */
import React, { useState, useCallback, useMemo, memo, useEffect } from "react";
import PropTypes from "prop-types";
import useSupabaseStorage from "../../supabase/useSupabaseStorage";
import { supabase, deleteName } from "../../supabase/supabaseClient";
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  ArcElement,
  RadialLinearScale,
  BarController,
  BarElement,
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { TimeScale } from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import StatsCard from "../StatsCard/StatsCard";
import NameCard from "../NameCard/NameCard";
import styles from "./Profile.module.css";
import { DEFAULT_RATING, FILTER_OPTIONS } from "../../utils/constants";

// Register Chart.js components
ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  ArcElement,
  RadialLinearScale,
  TimeScale,
  BarController,
  BarElement,
  Filler
);

// Enhanced utility functions for better statistics
const calculateEnhancedStats = (
  ratings,
  filterStatus = FILTER_OPTIONS.STATUS.ALL
) => {
  if (!ratings?.length)
    return {
      total: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      avgRating: 0,
      ratingSpread: 0,
      totalMatches: 0,
      activeNames: 0,
      popularNames: 0,
    };

  const filtered =
    filterStatus === FILTER_OPTIONS.STATUS.ACTIVE
      ? ratings.filter((r) => !r.isHidden)
      : filterStatus === FILTER_OPTIONS.STATUS.HIDDEN
        ? ratings.filter((r) => r.isHidden)
        : ratings;

  const total = filtered.length;
  const wins = filtered.reduce((sum, r) => sum + (r.user_wins || 0), 0);
  const losses = filtered.reduce((sum, r) => sum + (r.user_losses || 0), 0);
  const winRate = total > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

  // Enhanced rating statistics
  const ratingsWithValues = filtered.filter((r) => r.user_rating !== null);
  const avgRating =
    ratingsWithValues.length > 0
      ? Math.round(
          ratingsWithValues.reduce((sum, r) => sum + (r.user_rating || 0), 0) /
            ratingsWithValues.length
        )
      : 0;

  const ratingSpread =
    ratingsWithValues.length > 0
      ? Math.max(...ratingsWithValues.map((r) => r.user_rating || 0)) -
        Math.min(...ratingsWithValues.map((r) => r.user_rating || 0))
      : 0;

  const totalMatches = wins + losses;
  const activeNames = filtered.filter((r) => r.is_active).length;
  const popularNames = filtered.filter(
    (r) => (r.popularity_score || 0) > 100
  ).length;

  return {
    total,
    wins,
    losses,
    winRate,
    avgRating,
    ratingSpread,
    totalMatches,
    activeNames,
    popularNames,
  };
};

// New utility function for global statistics
const calculateGlobalStats = (allRatings, allNames) => {
  if (!allRatings?.length || !allNames?.length) return {};

  // Global rating statistics
  const allRatingsWithValues = allRatings.filter((r) => r.rating !== null);
  const globalAvgRating =
    allRatingsWithValues.length > 0
      ? Math.round(
          allRatingsWithValues.reduce((sum, r) => sum + (r.rating || 0), 0) /
            allRatingsWithValues.length
        )
      : 0;

  // Rating distribution across all users
  const ratingDistribution = {
    "1000-1200": 0,
    "1201-1400": 0,
    "1401-1600": 0,
    "1601-1800": 0,
    "1801-2000": 0,
    "2000+": 0,
  };

  allRatingsWithValues.forEach((rating) => {
    const ratingValue = rating.rating || 1500;
    if (ratingValue <= 1200) ratingDistribution["1000-1200"]++;
    else if (ratingValue <= 1400) ratingDistribution["1201-1400"]++;
    else if (ratingValue <= 1600) ratingDistribution["1401-1600"]++;
    else if (ratingValue <= 1800) ratingDistribution["1601-1800"]++;
    else if (ratingValue <= 2000) ratingDistribution["1801-2000"]++;
    else ratingDistribution["2000+"]++;
  });

  // Win rate distribution across all users
  const globalWinRateDistribution = {
    "0-20%": 0,
    "21-40%": 0,
    "41-60%": 0,
    "61-80%": 0,
    "81-100%": 0,
  };

  allRatings.forEach((rating) => {
    const total = (rating.wins || 0) + (rating.losses || 0);
    if (total === 0) return;
    const winRate = ((rating.wins || 0) / total) * 100;
    if (winRate <= 20) globalWinRateDistribution["0-20%"]++;
    else if (winRate <= 40) globalWinRateDistribution["21-40%"]++;
    else if (winRate <= 60) globalWinRateDistribution["41-60%"]++;
    else if (winRate <= 80) globalWinRateDistribution["61-80%"]++;
    else globalWinRateDistribution["81-100%"]++;
  });

  // Popularity analysis
  const namesWithPopularity = allNames.filter(
    (n) => n.popularity_score !== null
  );
  const avgPopularity =
    namesWithPopularity.length > 0
      ? Math.round(
          namesWithPopularity.reduce(
            (sum, n) => sum + (n.popularity_score || 0),
            0
          ) / namesWithPopularity.length
        )
      : 0;

  // Most and least popular names
  const sortedByPopularity = [...allNames].sort(
    (a, b) => (b.popularity_score || 0) - (a.popularity_score || 0)
  );
  const topPopularNames = sortedByPopularity.slice(0, 10);
  const leastPopularNames = sortedByPopularity.slice(-10).reverse();

  return {
    globalAvgRating,
    ratingDistribution,
    globalWinRateDistribution,
    avgPopularity,
    topPopularNames,
    leastPopularNames,
    totalGlobalRatings: allRatings.length,
    totalNamesWithRatings: allRatingsWithValues.length,
  };
};

// Enhanced NameCard wrapper for Profile view
const ProfileNameCard = memo(
  ({
    name,
    isHidden,
    onToggleVisibility,
    onDelete,
    isAdmin,
    isSelected,
    onSelectionChange,
  }) => {
    const {
      id,
      name: nameText,
      rating = DEFAULT_RATING,
      wins = 0,
      losses = 0,
      description,
      avg_rating,
      popularity_score,
      total_tournaments,
      categories,
      created_at,
    } = name;

    const totalMatches = wins + losses;
    const winRate =
      totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    // Create enhanced metadata object for NameCard
    const metadata = {
      rating: avg_rating || rating,
      popularity: popularity_score,
      tournaments: total_tournaments,
      categories: categories,
      winRate: winRate,
      totalMatches: totalMatches,
      created: created_at,
    };

    // Create enhanced description that includes comprehensive stats
    const enhancedDescription =
      description ||
      `Win Rate: ${winRate}% • Matches: ${totalMatches} • Popularity: ${popularity_score || 0}`;

    return (
      <NameCard
        name={nameText}
        description={enhancedDescription}
        isSelected={isSelected}
        onClick={() => {}} // No click action needed in profile view
        disabled={false}
        size="medium"
        metadata={metadata}
        className={isHidden ? styles.hiddenName : ""}
        isAdmin={isAdmin}
        isHidden={isHidden}
        onToggleVisibility={() => onToggleVisibility(id)}
        onDelete={() => onDelete(name)}
        onSelectionChange={(selected) => onSelectionChange(id, selected)}
      />
    );
  }
);

ProfileNameCard.propTypes = {
  name: PropTypes.object.isRequired,
  isHidden: PropTypes.bool.isRequired,
  onToggleVisibility: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelectionChange: PropTypes.func.isRequired,
};

// Enhanced Chart Components
const EnhancedChart = memo(
  ({ title, children, className = "", description = "" }) => (
    <div className={`${styles.enhancedChart} ${className}`}>
      <div className={styles.chartHeader}>
        <h4 className={styles.chartTitle}>{title}</h4>
        {description && (
          <p className={styles.chartDescription}>{description}</p>
        )}
      </div>
      {children}
    </div>
  )
);

// Main Profile Component
const Profile = ({ userName, onStartNewTournament }) => {
  // State
  const [filterStatus, setFilterStatus] = useState(FILTER_OPTIONS.STATUS.ALL);
  const [sortBy, setSortBy] = useState("rating");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentlyViewedUser] = useState(userName);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hiddenNames, setHiddenNames] = useState(new Set());

  // Admin state

  const [showGlobalAnalytics, setShowGlobalAnalytics] = useState(false);
  const [showUserComparison, setShowUserComparison] = useState(false);
  const [selectedNames, setSelectedNames] = useState(new Set());
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalNames: 0,
    hiddenNames: 0,
    activeTournaments: 0,
    totalTournaments: 0,
    avgTournamentSize: 0,
    totalRatings: 0,
    avgPopularityScore: 0,
  });

  // Enhanced analytics state
  const [tournamentAnalytics, setTournamentAnalytics] = useState({
    totalTournaments: 0,
    completedTournaments: 0,
    avgTournamentSize: 0,
    tournamentTrends: [],
  });

  // New global analytics state
  const [globalAnalytics, setGlobalAnalytics] = useState({
    globalAvgRating: 0,
    ratingDistribution: {},
    globalWinRateDistribution: {},
    avgPopularity: 0,
    topPopularNames: [],
    leastPopularNames: [],
    totalGlobalRatings: 0,
    totalNamesWithRatings: 0,
  });

  // User comparison state
  const [userComparison, setUserComparison] = useState({
    topUsers: [],
    userPerformance: [],
    ratingTrends: [],
  });

  // New user-specific analysis state
  const [selectedUserForAnalysis, setSelectedUserForAnalysis] = useState("");
  const [userAnalysisData, setUserAnalysisData] = useState({
    userRatings: [],
    userPreferences: {},
    userTournaments: [],
    userStats: {},
    userHiddenNames: [],
  });
  const [showUserAnalysis, setShowUserAnalysis] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);

  // Hooks
  const {
    names,
    loading: ratingsLoading,
    error: ratingsError,
    fetchNames,
    hideName,
    unhideName,
  } = useSupabaseStorage(userName);

  // Computed values
  const filteredRatings = useMemo(() => {
    if (!names?.length) return [];

    let filtered = names;
    if (filterStatus === FILTER_OPTIONS.STATUS.ACTIVE) {
      filtered = names.filter((r) => !hiddenNames.has(r.id));
    } else if (filterStatus === FILTER_OPTIONS.STATUS.HIDDEN) {
      filtered = names.filter((r) => hiddenNames.has(r.id));
    }

    return [...filtered].sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case "rating":
          aVal = a.user_rating || a.avg_rating || 0;
          bVal = b.user_rating || b.avg_rating || 0;
          break;
        case "matches":
          aVal = (a.user_wins || 0) + (a.user_losses || 0);
          bVal = (b.user_wins || 0) + (b.user_losses || 0);
          break;
        case "popularity":
          aVal = a.popularity_score || 0;
          bVal = b.popularity_score || 0;
          break;
        case "tournaments":
          aVal = a.total_tournaments || 0;
          bVal = b.total_tournaments || 0;
          break;
        default:
          aVal = a.user_rating || a.avg_rating || 0;
          bVal = b.user_rating || b.avg_rating || 0;
      }
      return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [names, filterStatus, hiddenNames, sortBy, sortOrder]);

  const enhancedStats = useMemo(
    () => calculateEnhancedStats(filteredRatings, filterStatus),
    [filteredRatings, filterStatus]
  );

  // Enhanced chart data
  const chartData = useMemo(() => {
    if (!filteredRatings.length) return {};

    // Rating distribution data
    const ratingRanges = {
      "1000-1200": 0,
      "1201-1400": 0,
      "1401-1600": 0,
      "1601-1800": 0,
      "1801-2000": 0,
    };

    filteredRatings.forEach((rating) => {
      const ratingValue = rating.user_rating || rating.avg_rating || 1500;
      if (ratingValue <= 1200) ratingRanges["1000-1200"]++;
      else if (ratingValue <= 1400) ratingRanges["1201-1400"]++;
      else if (ratingValue <= 1600) ratingRanges["1401-1600"]++;
      else if (ratingValue <= 1800) ratingRanges["1601-1800"]++;
      else ratingRanges["1801-2000"]++;
    });

    // Win rate distribution
    const winRateRanges = {
      "0-20%": 0,
      "21-40%": 0,
      "41-60%": 0,
      "61-80%": 0,
      "81-100%": 0,
    };

    filteredRatings.forEach((rating) => {
      const total = (rating.user_wins || 0) + (rating.user_losses || 0);
      if (total === 0) return;
      const winRate = ((rating.user_wins || 0) / total) * 100;
      if (winRate <= 20) winRateRanges["0-20%"]++;
      else if (winRate <= 40) winRateRanges["21-40%"]++;
      else if (winRate <= 60) winRateRanges["41-60%"]++;
      else if (winRate <= 80) winRateRanges["61-80%"]++;
      else winRateRanges["81-100%"]++;
    });

    // Popularity vs Rating scatter data
    const popularityData = filteredRatings
      .filter((r) => r.popularity_score && r.user_rating)
      .map((r) => ({
        x: r.popularity_score,
        y: r.user_rating || r.avg_rating || 1500,
        name: r.name,
      }));

    return {
      ratingRanges,
      winRateRanges,
      popularityData,
    };
  }, [filteredRatings]);

  // Effects
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Simple admin check: if user is "Aaron" or "aaron", they're admin
        // This is a temporary solution until we have proper role-based auth
        const isAdminUser = userName === "Aaron" || userName === "aaron";
        setIsAdmin(isAdminUser);

        // Log for debugging
        console.log("Admin check:", { userName, isAdminUser });

        // Note: cat_app_users table might not exist yet, so we're using username-based admin detection
        // TODO: Implement proper role-based auth when the database schema is set up
        console.log("Admin status set to:", isAdminUser);
      } catch (error) {
        console.error("Error checking admin status:", error);
        // Fallback: if user is Aaron, they're admin
        setIsAdmin(userName === "Aaron" || userName === "aaron");
      }
    };
    checkAdminStatus();
  }, [userName]);

  // Cleanup charts when component unmounts or data changes
  useEffect(() => {
    return () => {
      // Force cleanup of any existing charts
      const canvasElements = document.querySelectorAll("canvas");
      canvasElements.forEach((canvas) => {
        if (canvas.chart) {
          canvas.chart.destroy();
        }
      });
    };
  }, [filteredRatings]);

  // Define fetchSystemStats before it's used in useEffect
  const fetchSystemStats = useCallback(async () => {
    try {
      // Get total users from consolidated cat_app_users table
      const { count: userCount } = await supabase
        .from("cat_app_users")
        .select("*", { count: "exact", head: true });

      // Get total names
      const { count: nameCount } = await supabase
        .from("cat_name_options")
        .select("*", { count: "exact", head: true });

      // Get hidden names count from consolidated cat_name_ratings table
      const { count: hiddenCount } = await supabase
        .from("cat_name_ratings")
        .select("*", { count: "exact", head: true })
        .eq("is_hidden", true);

      // Get tournament statistics from cat_name_ratings (since cat_users might not exist)
      // We'll calculate tournament stats from the ratings data instead
      let tournamentCount = 0;
      let activeTournamentCount = 0;

      // For now, we'll set these to 0 since we don't have tournament data in the current schema
      // TODO: Implement tournament tracking when the database schema is properly set up
      tournamentCount = 0;
      activeTournamentCount = 0;

      // Get rating statistics
      const { count: ratingCount } = await supabase
        .from("cat_name_ratings")
        .select("*", { count: "exact", head: true });

      // Get average popularity score
      const { data: popularityData } = await supabase
        .from("cat_name_options")
        .select("popularity_score")
        .not("popularity_score", "is", null);

      const avgPopularityScore =
        popularityData?.length > 0
          ? Math.round(
              popularityData.reduce(
                (sum, item) => sum + (item.popularity_score || 0),
                0
              ) / popularityData.length
            )
          : 0;

      setSystemStats({
        totalUsers: userCount || 0,
        totalNames: nameCount || 0,
        hiddenNames: hiddenCount || 0,
        activeTournaments: activeTournamentCount || 0,
        totalTournaments: tournamentCount || 0,
        avgTournamentSize: 0, // Will be calculated separately
        totalRatings: ratingCount || 0,
        avgPopularityScore,
      });
    } catch (error) {
      console.error("Error fetching system stats:", error);
    }
  }, []);

  useEffect(() => {
    const fetchHiddenNames = async () => {
      try {
        const { data, error } = await supabase
          .from("cat_name_ratings")
          .select("name_id")
          .eq("user_name", userName)
          .eq("is_hidden", true);

        if (!error && data) {
          setHiddenNames(new Set(data.map((item) => item.name_id)));
        }
      } catch (error) {
        console.error("Error fetching hidden names:", error);
      }
    };

    if (isAdmin) {
      fetchHiddenNames();
      fetchSystemStats();
    }
  }, [isAdmin, userName, fetchSystemStats]);

  useEffect(() => {
    const fetchTournamentAnalytics = async () => {
      if (!userName) return;
      try {
        // Get user's tournament data from cat_name_ratings (since cat_users might not exist)
        // For now, we'll use a placeholder since tournament data isn't available in the current schema
        const userData = { tournament_data: [] };
        const error = null;

        if (!error && userData?.tournament_data) {
          const tournaments = userData.tournament_data || [];
          const total = tournaments.length;
          const completed = tournaments.filter(
            (t) => t.status === "completed"
          ).length;
          const avgSize =
            tournaments.length > 0
              ? Math.round(
                  tournaments.reduce(
                    (sum, t) => sum + (t.participant_names?.length || 0),
                    0
                  ) / total
                )
              : 0;

          // Create tournament trends (last 10 tournaments)
          const recentTournaments = tournaments
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10)
            .map((t) => ({
              date: new Date(t.created_at).toLocaleDateString(),
              size: t.participant_names?.length || 0,
              status: t.status,
            }));

          setTournamentAnalytics({
            totalTournaments: total,
            completedTournaments: completed,
            avgTournamentSize: avgSize,
            tournamentTrends: recentTournaments,
          });
        }
      } catch (error) {
        console.error("Error fetching tournament analytics:", error);
      }
    };

    fetchTournamentAnalytics();
  }, [userName]);

  // New effect for fetching global analytics (admin only)
  useEffect(() => {
    if (!isAdmin) return;

    const fetchGlobalAnalytics = async () => {
      try {
        // Get all ratings across all users
        const { data: allRatings, error: ratingsError } = await supabase.from(
          "cat_name_ratings"
        ).select(`
            rating,
            wins,
            losses,
            user_name,
            name_id,
            cat_name_options (
              name,
              popularity_score
            )
          `);

        if (ratingsError) throw ratingsError;

        // Get all names
        const { data: allNames, error: namesError } = await supabase
          .from("cat_name_options")
          .select("id, name, popularity_score, created_at");

        if (namesError) throw namesError;

        // Calculate global statistics
        const globalStats = calculateGlobalStats(allRatings, allNames);
        setGlobalAnalytics(globalStats);

        // Get top performing users
        const userStats = {};
        allRatings.forEach((rating) => {
          if (!userStats[rating.user_name]) {
            userStats[rating.user_name] = {
              wins: 0,
              losses: 0,
              totalRating: 0,
              count: 0,
            };
          }
          userStats[rating.user_name].wins += rating.wins || 0;
          userStats[rating.user_name].losses += rating.losses || 0;
          userStats[rating.user_name].totalRating += rating.rating || 0;
          userStats[rating.user_name].count += 1;
        });

        const topUsers = Object.entries(userStats)
          .map(([userName, stats]) => ({
            userName,
            winRate:
              stats.wins + stats.losses > 0
                ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100)
                : 0,
            avgRating: Math.round(stats.totalRating / stats.count),
            totalMatches: stats.wins + stats.losses,
            totalNames: stats.count,
          }))
          .sort((a, b) => b.winRate - a.winRate)
          .slice(0, 10);

        setUserComparison((prev) => ({ ...prev, topUsers }));
      } catch (error) {
        console.error("Error fetching global analytics:", error);
      }
    };

    fetchGlobalAnalytics();
  }, [isAdmin]);

  // New effect for fetching available users (admin only)
  useEffect(() => {
    if (!isAdmin) return;

    const fetchAvailableUsers = async () => {
      try {
        // Get all users who have ratings
        const { data: usersWithRatings, error } = await supabase
          .from("cat_name_ratings")
          .select("user_name")
          .order("user_name");

        if (error) throw error;

        // Get unique user names
        const uniqueUsers = [
          ...new Set(usersWithRatings.map((u) => u.user_name)),
        ];
        setAvailableUsers(uniqueUsers);
      } catch (error) {
        console.error("Error fetching available users:", error);
      }
    };

    fetchAvailableUsers();
  }, [isAdmin]);

  // New effect for fetching user-specific analysis data
  useEffect(() => {
    if (!isAdmin || !selectedUserForAnalysis) return;

    const fetchUserAnalysis = async () => {
      try {
        // Get user's ratings
        const { data: userRatings, error: ratingsError } = await supabase
          .from("cat_name_ratings")
          .select(
            `
            *,
            cat_name_options (
              id,
              name,
              description,
              popularity_score,
              categories
            )
          `
          )
          .eq("user_name", selectedUserForAnalysis)
          .order("rating", { ascending: false });

        if (ratingsError) throw ratingsError;

        // Get user's preferences and tournament data from cat_name_ratings (since cat_users might not exist)
        // For now, we'll use placeholder data since these aren't available in the current schema
        const userData = {
          preferences: {},
          tournament_data: [],
        };
        const userError = null;

        if (userError && userError.code !== "PGRST116") throw userError;

        // Get user's hidden names
        const { data: hiddenNames, error: hiddenError } = await supabase
          .from("cat_name_ratings")
          .select("name_id")
          .eq("user_name", selectedUserForAnalysis)
          .eq("is_hidden", true);

        if (hiddenError) throw hiddenError;

        // Calculate user statistics
        const ratings = userRatings || [];
        const totalRatings = ratings.length;
        const avgRating =
          totalRatings > 0
            ? Math.round(
                ratings.reduce((sum, r) => sum + (r.rating || 0), 0) /
                  totalRatings
              )
            : 0;

        const totalWins = ratings.reduce((sum, r) => sum + (r.wins || 0), 0);
        const totalLosses = ratings.reduce(
          (sum, r) => sum + (r.losses || 0),
          0
        );
        const winRate =
          totalWins + totalLosses > 0
            ? Math.round((totalWins / (totalWins + totalLosses)) * 100)
            : 0;

        const tournaments = userData?.tournament_data || [];
        const completedTournaments = tournaments.filter(
          (t) => t.status === "completed"
        ).length;
        const avgTournamentSize =
          tournaments.length > 0
            ? Math.round(
                tournaments.reduce(
                  (sum, t) => sum + (t.participant_names?.length || 0),
                  0
                ) / tournaments.length
              )
            : 0;

        setUserAnalysisData({
          userRatings: ratings,
          userPreferences: userData?.preferences || {},
          userTournaments: tournaments,
          userStats: {
            totalRatings,
            avgRating,
            totalWins,
            totalLosses,
            winRate,
            totalMatches: totalWins + totalLosses,
            totalTournaments: tournaments.length,
            completedTournaments,
            avgTournamentSize,
            hiddenNamesCount: hiddenNames?.length || 0,
          },
          userHiddenNames: hiddenNames || [],
        });
      } catch (error) {
        console.error("Error fetching user analysis:", error);
      }
    };

    fetchUserAnalysis();
  }, [isAdmin, selectedUserForAnalysis]);

  // Event handlers
  const handleToggleVisibility = useCallback(
    async (nameId) => {
      try {
        if (hiddenNames.has(nameId)) {
          await unhideName(nameId);
          setHiddenNames(
            (prev) => new Set([...prev].filter((id) => id !== nameId))
          );
        } else {
          await hideName(nameId);
          setHiddenNames((prev) => new Set([...prev, nameId]));
        }

        // Refresh the names to update the UI
        fetchNames();
      } catch (error) {
        console.error("Error toggling visibility:", error);
      }
    },
    [hiddenNames, hideName, unhideName, fetchNames]
  );

  const handleDeleteName = useCallback(
    async (name) => {
      try {
        await deleteName(name.id);
        fetchNames();
      } catch (error) {
        console.error("Error deleting name:", error);
      }
    },
    [fetchNames]
  );

  // Admin handlers
  const handleBulkHide = useCallback(async () => {
    try {
      for (const nameId of selectedNames) {
        await hideName(nameId);
        setHiddenNames((prev) => new Set([...prev, nameId]));
      }
      setSelectedNames(new Set());
      fetchNames();
    } catch (error) {
      console.error("Error in bulk hide:", error);
    }
  }, [selectedNames, hideName, fetchNames]);

  const handleBulkDelete = useCallback(async () => {
    try {
      for (const nameId of selectedNames) {
        await deleteName(nameId);
      }
      setSelectedNames(new Set());
      fetchNames();
    } catch (error) {
      console.error("Error in bulk delete:", error);
    }
  }, [selectedNames, fetchNames]);

  // New bulk operations for all names
  const handleHideAllNames = useCallback(async () => {
    try {
      // Get all visible names (not currently hidden)
      const visibleNames = names.filter((name) => !hiddenNames.has(name.id));

      for (const name of visibleNames) {
        await hideName(name.id);
        setHiddenNames((prev) => new Set([...prev, name.id]));
      }

      // Show success message
      console.log(`Hidden ${visibleNames.length} names`);
      fetchNames();
    } catch (error) {
      console.error("Error hiding all names:", error);
    }
  }, [names, hiddenNames, hideName, fetchNames]);

  const handleUnhideAllNames = useCallback(async () => {
    try {
      // Get all hidden names
      const hiddenNameIds = Array.from(hiddenNames);

      for (const nameId of hiddenNameIds) {
        await unhideName(nameId);
        setHiddenNames((prev) => {
          const newSet = new Set(prev);
          newSet.delete(nameId);
          return newSet;
        });
      }

      // Show success message
      console.log(`Unhidden ${hiddenNameIds.length} names`);
      fetchNames();
    } catch (error) {
      console.error("Error unhiding all names:", error);
    }
  }, [hiddenNames, unhideName, fetchNames]);

  const handleNameSelection = useCallback((nameId) => {
    setSelectedNames((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nameId)) {
        newSet.delete(nameId);
      } else {
        newSet.add(nameId);
      }
      return newSet;
    });
  }, []);

  // New handler for data export
  const handleExportData = useCallback(async () => {
    try {
      // Get comprehensive data for export
      const { data: allRatings } = await supabase.from("cat_name_ratings")
        .select(`
          *,
          cat_name_options (
            name,
            description,
            popularity_score,
            categories
          )
        `);

      // Since cat_users table might not exist, we'll use cat_name_ratings instead
      const { data: allUsers } = await supabase
        .from("cat_name_ratings")
        .select("user_name")
        .limit(100);

      const exportData = {
        timestamp: new Date().toISOString(),
        ratings: allRatings || [],
        users: allUsers || [],
        systemStats,
        globalAnalytics,
      };

      // Create and download CSV
      const csvContent = convertToCSV(exportData);
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cat_names_analytics_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  }, [systemStats, globalAnalytics]);

  // New handler for user selection
  const handleUserSelection = useCallback((userName) => {
    setSelectedUserForAnalysis(userName);
    setShowUserAnalysis(true);
  }, []);

  // New handler for closing user analysis
  const handleCloseUserAnalysis = useCallback(() => {
    setShowUserAnalysis(false);
    setSelectedUserForAnalysis("");
    setUserAnalysisData({
      userRatings: [],
      userPreferences: {},
      userTournaments: [],
      userStats: {},
      userHiddenNames: [],
    });
  }, []);

  // Utility function to convert data to CSV
  const convertToCSV = (data) => {
    // Simple CSV conversion - you can enhance this as needed
    const headers = ["Data Type", "Timestamp", "Details"];
    const rows = [
      ["System Stats", data.timestamp, JSON.stringify(data.systemStats)],
      [
        "Global Analytics",
        data.timestamp,
        JSON.stringify(data.globalAnalytics),
      ],
      ["Total Ratings", data.timestamp, data.ratings.length],
      ["Total Users", data.timestamp, data.users.length],
    ];

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  // Debug logging for admin status
  useEffect(() => {
    console.log("Profile component state:", {
      userName,
      isAdmin,
      showGlobalAnalytics,
      showUserComparison,
      showUserAnalysis,
    });
  }, [
    userName,
    isAdmin,
    showGlobalAnalytics,
    showUserComparison,
    showUserAnalysis,
  ]);

  // Loading and error states
  if (ratingsLoading) return <LoadingSpinner />;
  if (ratingsError)
    return (
      <div className={styles.error}>Error loading ratings: {ratingsError}</div>
    );

  return (
    <div className={styles.profileContainer}>
      {/* Header - Fixed at top */}
      <div className={styles.profileHeader}>
        <h1 className={styles.profileTitle}>
          {currentlyViewedUser === userName
            ? "Your Profile"
            : `${currentlyViewedUser}'s Profile`}
        </h1>
        <div className={styles.headerActions}>
          <button
            onClick={() => onStartNewTournament()}
            className={styles.button}
          >
            🏆 New Tournament
          </button>
          <button onClick={() => fetchNames()} className={styles.button}>
            🔄 Refresh
          </button>
          {isAdmin && (
            <button onClick={handleExportData} className={styles.button}>
              📊 Export Data
            </button>
          )}
        </div>
      </div>

      {/* Main Content - Sidebar Layout */}
      <div className={styles.mainContent}>
        {/* Left Sidebar - Admin Controls */}
        {isAdmin && (
          <div className={styles.adminSidebar}>
            <div className={styles.sidebarHeader}>
              <h3>🔧 Admin Panel</h3>
            </div>

            <div className={styles.sidebarSection}>
              <h4>📊 Quick Stats</h4>
              <div className={styles.quickStats}>
                <div className={styles.quickStat}>
                  <span className={styles.quickStatValue}>
                    {systemStats.totalUsers}
                  </span>
                  <span className={styles.quickStatLabel}>Users</span>
                </div>
                <div className={styles.quickStat}>
                  <span className={styles.quickStatValue}>
                    {systemStats.totalNames}
                  </span>
                  <span className={styles.quickStatLabel}>Names</span>
                </div>
                <div className={styles.quickStat}>
                  <span className={styles.quickStatValue}>
                    {systemStats.totalRatings}
                  </span>
                  <span className={styles.quickStatLabel}>Ratings</span>
                </div>
              </div>
            </div>

            {/* Quick Bulk Operations - Always Visible */}
            <div className={styles.sidebarSection}>
              <h4>🎯 Quick Actions</h4>
              <div className={styles.quickBulkButtons}>
                <button
                  onClick={handleHideAllNames}
                  className={`${styles.sidebarButton} ${styles.warningButton}`}
                  title="Hide all visible names"
                >
                  🔒 Hide All Names
                </button>
                <button
                  onClick={handleUnhideAllNames}
                  className={`${styles.sidebarButton} ${styles.successButton}`}
                  title="Unhide all hidden names"
                >
                  🔓 Unhide All Names
                </button>
              </div>
            </div>

            {/* Analytics */}
            <div className={styles.sidebarSection}>
              <h4>📊 Analytics</h4>
              <div className={styles.sidebarActions}>
                <button
                  onClick={() => setShowGlobalAnalytics(!showGlobalAnalytics)}
                  className={`${styles.sidebarButton} ${showGlobalAnalytics ? styles.active : ""}`}
                >
                  🌍 Global Analytics
                </button>
                <button
                  onClick={() => setShowUserComparison(!showUserComparison)}
                  className={`${styles.sidebarButton} ${showUserComparison ? styles.active : ""}`}
                >
                  👥 User Rankings
                </button>
                <button
                  onClick={() => setShowUserAnalysis(!showUserAnalysis)}
                  className={`${styles.sidebarButton} ${showUserAnalysis ? styles.active : ""}`}
                >
                  🔍 User Analysis
                </button>
              </div>
            </div>

            {/* Selected Names Bulk Actions - Only show when names are selected */}
            {selectedNames.size > 0 && (
              <div className={styles.sidebarSection}>
                <h4>📦 Selected ({selectedNames.size})</h4>
                <div className={styles.bulkActionsCompact}>
                  <button
                    onClick={handleBulkHide}
                    className={`${styles.sidebarButton} ${styles.dangerButton}`}
                  >
                    🔒 Hide Selected
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className={`${styles.sidebarButton} ${styles.dangerButton}`}
                  >
                    🗑️ Delete Selected
                  </button>
                  <button
                    onClick={() => setSelectedNames(new Set())}
                    className={styles.sidebarButton}
                  >
                    ✕ Clear Selection
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right Content - Names and Analytics */}
        <div className={styles.contentArea}>
          {/* Enhanced Stats Overview - Compact */}
          <div className={styles.statsOverview}>
            <StatsCard
              title="Total Names"
              value={enhancedStats.total}
              icon="📝"
              color="primary"
            />
            <StatsCard
              title="Win Rate"
              value={`${enhancedStats.winRate}%`}
              icon="🎯"
              color="success"
            />
            <StatsCard
              title="Total Matches"
              value={enhancedStats.totalMatches}
              icon="⚔️"
              color="warning"
            />
            <StatsCard
              title="Avg Rating"
              value={enhancedStats.avgRating}
              icon="📊"
              color="info"
            />
            <StatsCard
              title="Rating Spread"
              value={enhancedStats.ratingSpread}
              icon="📈"
              color="secondary"
            />
            <StatsCard
              title="Active Names"
              value={enhancedStats.activeNames}
              icon="✅"
              color="success"
            />
          </div>

          {/* Controls - Compact */}
          <div className={styles.controls}>
            <div className={styles.filterGroup}>
              <label>Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={styles.filterSelect}
              >
                <option value={FILTER_OPTIONS.STATUS.ALL}>All Names</option>
                <option value={FILTER_OPTIONS.STATUS.ACTIVE}>Active</option>
                <option value={FILTER_OPTIONS.STATUS.HIDDEN}>Hidden</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="rating">Rating</option>
                <option value="matches">Matches</option>
                <option value="popularity">Popularity</option>
                <option value="tournaments">Tournaments</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder((order) => (order === "asc" ? "desc" : "asc"))
                }
                className={styles.sortButton}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          {/* Names Grid - Compact */}
          <div className={styles.namesGrid}>
            {filteredRatings.map((name) => (
              <ProfileNameCard
                key={name.id}
                name={name}
                isHidden={hiddenNames.has(name.id)}
                onToggleVisibility={handleToggleVisibility}
                onDelete={handleDeleteName}
                isAdmin={isAdmin}
                isSelected={selectedNames.has(name.id)}
                onSelectionChange={handleNameSelection}
              />
            ))}
          </div>

          {/* Analytics Panels - Collapsible */}
          {(showGlobalAnalytics || showUserComparison || showUserAnalysis) && (
            <div className={styles.analyticsPanels}>
              {/* Global Analytics */}
              {showGlobalAnalytics && (
                <div className={styles.analyticsPanel}>
                  <h3>🌍 Global System Analytics</h3>

                  {/* Global Rating Overview */}
                  <div className={styles.analyticsSection}>
                    <h4>📊 Global Rating Statistics</h4>
                    <div className={styles.analyticsGrid}>
                      <div className={styles.analyticsCard}>
                        <h5>Global Average Rating</h5>
                        <span className={styles.analyticsValue}>
                          {globalAnalytics.globalAvgRating}
                        </span>
                      </div>
                      <div className={styles.analyticsCard}>
                        <h5>Total Global Ratings</h5>
                        <span className={styles.analyticsValue}>
                          {globalAnalytics.totalGlobalRatings}
                        </span>
                      </div>
                      <div className={styles.analyticsCard}>
                        <h5>Names with Ratings</h5>
                        <span className={styles.analyticsValue}>
                          {globalAnalytics.totalNamesWithRatings}
                        </span>
                      </div>
                      <div className={styles.analyticsCard}>
                        <h5>Average Popularity</h5>
                        <span className={styles.analyticsValue}>
                          {globalAnalytics.avgPopularity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Global Rating Distribution */}
                  {Object.keys(globalAnalytics.ratingDistribution).length >
                    0 && (
                    <div className={styles.analyticsSection}>
                      <h4>📈 Global Rating Distribution</h4>
                      <div className={styles.chartWrapper}>
                        <Bar
                          key="global-rating-distribution"
                          data={{
                            labels: Object.keys(
                              globalAnalytics.ratingDistribution
                            ),
                            datasets: [
                              {
                                label: "Number of Ratings",
                                data: Object.values(
                                  globalAnalytics.ratingDistribution
                                ),
                                backgroundColor: "rgba(59, 130, 246, 0.8)",
                                borderColor: "rgba(59, 130, 246, 1)",
                                borderWidth: 2,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              title: {
                                display: true,
                                text: "Global Rating Distribution",
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                title: { display: true, text: "Count" },
                              },
                              x: {
                                title: { display: true, text: "Rating Range" },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Top Popular Names */}
                  {globalAnalytics.topPopularNames.length > 0 && (
                    <div className={styles.analyticsSection}>
                      <h4>🏆 Top Popular Names</h4>
                      <div className={styles.popularNamesGrid}>
                        {globalAnalytics.topPopularNames.map((name, index) => (
                          <div key={name.id} className={styles.popularNameCard}>
                            <span className={styles.rank}>#{index + 1}</span>
                            <span className={styles.name}>{name.name}</span>
                            <span className={styles.popularity}>
                              {name.popularity_score}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Least Popular Names */}
                  {globalAnalytics.leastPopularNames.length > 0 && (
                    <div className={styles.analyticsSection}>
                      <h4>📉 Least Popular Names</h4>
                      <div className={styles.popularNamesGrid}>
                        {globalAnalytics.leastPopularNames.map(
                          (name, index) => (
                            <div
                              key={name.id}
                              className={styles.popularNameCard}
                            >
                              <span className={styles.rank}>
                                #
                                {globalAnalytics.leastPopularNames.length -
                                  index}
                              </span>
                              <span className={styles.name}>{name.name}</span>
                              <span className={styles.popularity}>
                                {name.popularity_score}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Comparison */}
              {showUserComparison && (
                <div className={styles.analyticsPanel}>
                  <h3>👥 User Performance Comparison</h3>

                  {/* Top Users */}
                  {userComparison.topUsers.length > 0 && (
                    <div className={styles.analyticsSection}>
                      <h4>🏆 Top Performing Users</h4>
                      <div className={styles.topUsersGrid}>
                        {userComparison.topUsers.map((user, index) => (
                          <div key={user.userName} className={styles.userCard}>
                            <div className={styles.userRank}>#{index + 1}</div>
                            <div className={styles.userName}>
                              {user.userName}
                            </div>
                            <div className={styles.userStats}>
                              <div className={styles.userStat}>
                                <span className={styles.statLabel}>
                                  Win Rate:
                                </span>
                                <span className={styles.statValue}>
                                  {user.winRate}%
                                </span>
                              </div>
                              <div className={styles.userStat}>
                                <span className={styles.statLabel}>
                                  Avg Rating:
                                </span>
                                <span className={styles.statValue}>
                                  {user.avgRating}
                                </span>
                              </div>
                              <div className={styles.userStat}>
                                <span className={styles.statLabel}>
                                  Matches:
                                </span>
                                <span className={styles.statValue}>
                                  {user.totalMatches}
                                </span>
                              </div>
                              <div className={styles.userStat}>
                                <span className={styles.statLabel}>Names:</span>
                                <span className={styles.statValue}>
                                  {user.totalNames}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User-Specific Analysis */}
              {showUserAnalysis && selectedUserForAnalysis && (
                <div className={styles.analyticsPanel}>
                  <h3>📊 {selectedUserForAnalysis}&apos;s Analysis</h3>
                  <div className={styles.userAnalysisContent}>
                    <div className={styles.userStatsGrid}>
                      <div className={styles.userStatCard}>
                        <h4>Total Ratings</h4>
                        <span className={styles.statValue}>
                          {userAnalysisData.userStats.totalRatings}
                        </span>
                      </div>
                      <div className={styles.userStatCard}>
                        <h4>Avg Rating</h4>
                        <span className={styles.statValue}>
                          {userAnalysisData.userStats.avgRating}
                        </span>
                      </div>
                      <div className={styles.userStatCard}>
                        <h4>Total Wins</h4>
                        <span className={styles.statValue}>
                          {userAnalysisData.userStats.totalWins}
                        </span>
                      </div>
                      <div className={styles.userStatCard}>
                        <h4>Total Losses</h4>
                        <span className={styles.statValue}>
                          {userAnalysisData.userStats.totalLosses}
                        </span>
                      </div>
                      <div className={styles.userStatCard}>
                        <h4>Win Rate</h4>
                        <span className={styles.statValue}>
                          {userAnalysisData.userStats.winRate}%
                        </span>
                      </div>
                      <div className={styles.userStatCard}>
                        <h4>Total Matches</h4>
                        <span className={styles.statValue}>
                          {userAnalysisData.userStats.totalMatches}
                        </span>
                      </div>
                      <div className={styles.userStatCard}>
                        <h4>Total Tournaments</h4>
                        <span className={styles.statValue}>
                          {userAnalysisData.userStats.totalTournaments}
                        </span>
                      </div>
                      <div className={styles.userStatCard}>
                        <h4>Completed Tournaments</h4>
                        <span className={styles.statValue}>
                          {userAnalysisData.userStats.completedTournaments}
                        </span>
                      </div>
                      <div className={styles.userStatCard}>
                        <h4>Avg Tournament Size</h4>
                        <span className={styles.statValue}>
                          {userAnalysisData.userStats.avgTournamentSize}
                        </span>
                      </div>
                      <div className={styles.userStatCard}>
                        <h4>Hidden Names</h4>
                        <span className={styles.statValue}>
                          {userAnalysisData.userStats.hiddenNamesCount}
                        </span>
                      </div>
                    </div>

                    <div className={styles.userPreferences}>
                      <h4>Preferences</h4>
                      <pre className={styles.preferencesText}>
                        {JSON.stringify(
                          userAnalysisData.userPreferences,
                          null,
                          2
                        )}
                      </pre>
                    </div>

                    <div className={styles.userRatings}>
                      <h4>Ratings</h4>
                      <div className={styles.ratingsTable}>
                        <div className={styles.tableHeader}>
                          <span>Name</span>
                          <span>Rating</span>
                          <span>Wins</span>
                          <span>Losses</span>
                          <span>Total Matches</span>
                        </div>
                        {userAnalysisData.userRatings.map((rating, index) => (
                          <div key={index} className={styles.tableRow}>
                            <span>{rating.name}</span>
                            <span>{rating.rating}</span>
                            <span>{rating.wins}</span>
                            <span>{rating.losses}</span>
                            <span>{rating.wins + rating.losses}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.userTournaments}>
                      <h4>Tournaments</h4>
                      <div className={styles.tournamentsTable}>
                        <div className={styles.tableHeader}>
                          <span>Date</span>
                          <span>Size</span>
                          <span>Status</span>
                        </div>
                        {userAnalysisData.userTournaments.map(
                          (tournament, index) => (
                            <div key={index} className={styles.tableRow}>
                              <span>
                                {new Date(
                                  tournament.created_at
                                ).toLocaleDateString()}
                              </span>
                              <span>
                                {tournament.participant_names?.length || 0}
                              </span>
                              <span>{tournament.status}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseUserAnalysis}
                    className={styles.closeButton}
                  >
                    ✕ Close Analysis
                  </button>
                </div>
              )}
            </div>
          )}

          {/* User Selection for Analysis - Compact */}
          {showUserAnalysis && (
            <div className={styles.userSelectionCompact}>
              <h4>Select User for Analysis</h4>
              <div className={styles.userSelectionGrid}>
                {availableUsers.map((userName) => (
                  <button
                    key={userName}
                    onClick={() => handleUserSelection(userName)}
                    className={`${styles.userSelectionButton} ${
                      selectedUserForAnalysis === userName
                        ? styles.selectedUser
                        : ""
                    }`}
                  >
                    {userName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Charts Section - Collapsible */}
          {filteredRatings.length > 0 && (
            <div className={styles.chartsSection}>
              {/* Rating Distribution */}
              <EnhancedChart
                title="Rating Distribution"
                description="Distribution of cat names across rating ranges"
                className={styles.fullWidthChart}
              >
                <div className={styles.chartWrapper}>
                  <Bar
                    key="rating-distribution-bar"
                    data={{
                      labels: Object.keys(chartData.ratingRanges || {}),
                      datasets: [
                        {
                          label: "Number of Names",
                          data: Object.values(chartData.ratingRanges || {}),
                          backgroundColor: [
                            "rgba(239, 68, 68, 0.8)", // Red
                            "rgba(245, 158, 11, 0.8)", // Orange
                            "rgba(59, 130, 246, 0.8)", // Blue
                            "rgba(16, 185, 129, 0.8)", // Green
                            "rgba(139, 92, 246, 0.8)", // Purple
                          ],
                          borderColor: [
                            "rgba(239, 68, 68, 1)",
                            "rgba(245, 158, 11, 1)",
                            "rgba(59, 130, 246, 1)",
                            "rgba(16, 185, 129, 1)",
                            "rgba(139, 92, 246, 1)",
                          ],
                          borderWidth: 2,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        title: { display: true, text: "Rating Distribution" },
                      },
                      scales: {
                        y: { beginAtZero: true },
                        x: { title: { display: true, text: "Rating Range" } },
                      },
                    }}
                  />
                </div>
              </EnhancedChart>

              {/* Win Rate Distribution */}
              <EnhancedChart
                title="Win Rate Distribution"
                description="Distribution of win rates across all names"
              >
                <div className={styles.chartWrapper}>
                  <Doughnut
                    key="win-rate-doughnut"
                    data={{
                      labels: Object.keys(chartData.winRateRanges || {}),
                      datasets: [
                        {
                          data: Object.values(chartData.winRateRanges || {}),
                          backgroundColor: [
                            "rgba(239, 68, 68, 0.8)", // Red
                            "rgba(245, 158, 11, 0.8)", // Orange
                            "rgba(156, 163, 175, 0.8)", // Gray
                            "rgba(16, 185, 129, 0.8)", // Green
                            "rgba(59, 130, 246, 0.8)", // Blue
                          ],
                          borderColor: [
                            "rgba(239, 68, 68, 1)",
                            "rgba(245, 158, 11, 1)",
                            "rgba(156, 163, 175, 1)",
                            "rgba(16, 185, 129, 1)",
                            "rgba(59, 130, 246, 1)",
                          ],
                          borderWidth: 2,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: "bottom" },
                        title: { display: true, text: "Win Rate Distribution" },
                      },
                    }}
                  />
                </div>
              </EnhancedChart>

              {/* Top Performers */}
              <EnhancedChart
                title="Top Performers"
                description="Top 10 names by win rate"
              >
                <div className={styles.chartWrapper}>
                  <Bar
                    key="top-performers-bar"
                    data={{
                      labels: filteredRatings.slice(0, 10).map((r) => r.name),
                      datasets: [
                        {
                          label: "Win Rate %",
                          data: filteredRatings.slice(0, 10).map((r) => {
                            const total =
                              (r.user_wins || 0) + (r.user_losses || 0);
                            return total > 0
                              ? Math.round((r.user_wins / total) * 100)
                              : 0;
                          }),
                          backgroundColor: "rgba(59, 130, 246, 0.8)",
                          borderColor: "rgba(59, 130, 246, 1)",
                          borderWidth: 2,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        title: { display: true, text: "Top 10 Win Rates" },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          title: { display: true, text: "Win Rate (%)" },
                        },
                        x: { title: { display: true, text: "Cat Names" } },
                      },
                    }}
                  />
                </div>
              </EnhancedChart>

              {/* Tournament Analytics */}
              {tournamentAnalytics.totalTournaments > 0 && (
                <EnhancedChart
                  title="Tournament Analytics"
                  description="Your tournament performance and trends"
                  className={styles.fullWidthChart}
                >
                  <div className={styles.tournamentStats}>
                    <div className={styles.tournamentMetric}>
                      <h5>Total Tournaments</h5>
                      <span className={styles.metricValue}>
                        {tournamentAnalytics.totalTournaments}
                      </span>
                    </div>
                    <div className={styles.tournamentMetric}>
                      <h5>Completed</h5>
                      <span className={styles.metricValue}>
                        {tournamentAnalytics.completedTournaments}
                      </span>
                    </div>
                    <div className={styles.tournamentMetric}>
                      <h5>Avg Size</h5>
                      <span className={styles.metricValue}>
                        {tournamentAnalytics.avgTournamentSize}
                      </span>
                    </div>
                    <div className={styles.tournamentMetric}>
                      <h5>Completion Rate</h5>
                      <span className={styles.metricValue}>
                        {tournamentAnalytics.totalTournaments > 0
                          ? Math.round(
                              (tournamentAnalytics.completedTournaments /
                                tournamentAnalytics.totalTournaments) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>

                  {tournamentAnalytics.tournamentTrends.length > 0 && (
                    <div className={styles.chartWrapper}>
                      <Line
                        key="tournament-trends-line"
                        data={{
                          labels: tournamentAnalytics.tournamentTrends.map(
                            (t) => t.date
                          ),
                          datasets: [
                            {
                              label: "Tournament Size",
                              data: tournamentAnalytics.tournamentTrends.map(
                                (t) => t.size
                              ),
                              borderColor: "rgba(59, 130, 246, 1)",
                              backgroundColor: "rgba(59, 130, 246, 0.1)",
                              fill: true,
                              tension: 0.4,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            title: {
                              display: true,
                              text: "Recent Tournament Sizes",
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: { display: true, text: "Number of Names" },
                            },
                            x: {
                              title: { display: true, text: "Tournament Date" },
                            },
                          },
                        }}
                      />
                    </div>
                  )}
                </EnhancedChart>
              )}

              {/* Rating vs Popularity Scatter */}
              {chartData.popularityData &&
                chartData.popularityData.length > 0 && (
                  <EnhancedChart
                    title="Rating vs Popularity"
                    description="Relationship between popularity scores and ratings"
                    className={styles.fullWidthChart}
                  >
                    <div className={styles.chartWrapper}>
                      <Bar
                        key="popularity-rating-bar"
                        data={{
                          labels: chartData.popularityData
                            .slice(0, 15)
                            .map((d) => d.name),
                          datasets: [
                            {
                              label: "Popularity Score",
                              data: chartData.popularityData
                                .slice(0, 15)
                                .map((d) => d.x),
                              backgroundColor: "rgba(16, 185, 129, 0.8)",
                              borderColor: "rgba(16, 185, 129, 1)",
                              borderWidth: 2,
                            },
                            {
                              label: "Rating (scaled)",
                              data: chartData.popularityData
                                .slice(0, 15)
                                .map((d) => d.y / 20), // Scale down for visibility
                              backgroundColor: "rgba(139, 92, 246, 0.8)",
                              borderColor: "rgba(139, 92, 246, 1)",
                              borderWidth: 2,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { position: "top" },
                            title: {
                              display: true,
                              text: "Popularity vs Rating Comparison",
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: { display: true, text: "Score" },
                            },
                            x: {
                              title: { display: true, text: "Cat Names" },
                            },
                          },
                        }}
                      />
                    </div>
                  </EnhancedChart>
                )}
            </div>
          )}

          {filteredRatings.length === 0 && (
            <div className={styles.emptyState}>
              <p>No names found with the current filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Profile.propTypes = {
  userName: PropTypes.string.isRequired,
  onStartNewTournament: PropTypes.func.isRequired,
};

export default Profile;
