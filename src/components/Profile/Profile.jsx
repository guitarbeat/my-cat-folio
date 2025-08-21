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
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
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
const calculateEnhancedStats = (ratings, filterStatus = FILTER_OPTIONS.STATUS.ALL) => {
  if (!ratings?.length) return { 
    total: 0, 
    wins: 0, 
    losses: 0, 
    winRate: 0,
    avgRating: 0,
    ratingSpread: 0,
    totalMatches: 0,
    activeNames: 0,
    popularNames: 0
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
  const ratingsWithValues = filtered.filter(r => r.user_rating !== null);
  const avgRating = ratingsWithValues.length > 0 
    ? Math.round(ratingsWithValues.reduce((sum, r) => sum + (r.user_rating || 0), 0) / ratingsWithValues.length)
    : 0;
  
  const ratingSpread = ratingsWithValues.length > 0
    ? Math.max(...ratingsWithValues.map(r => r.user_rating || 0)) - Math.min(...ratingsWithValues.map(r => r.user_rating || 0))
    : 0;

  const totalMatches = wins + losses;
  const activeNames = filtered.filter(r => r.is_active).length;
  const popularNames = filtered.filter(r => (r.popularity_score || 0) > 100).length;

  return { 
    total, 
    wins, 
    losses, 
    winRate, 
    avgRating, 
    ratingSpread, 
    totalMatches, 
    activeNames, 
    popularNames 
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
      description || `Win Rate: ${winRate}% • Matches: ${totalMatches} • Popularity: ${popularity_score || 0}`;

    return (
      <div className={styles.profileNameCardWrapper}>
        {/* Selection checkbox for admin */}
        {isAdmin && (
          <div className={styles.selectionContainer}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelectionChange(id)}
              className={styles.selectionCheckbox}
              aria-label={`Select ${nameText}`}
            />
          </div>
        )}

        {/* Main NameCard with enhanced metadata */}
        <NameCard
          name={nameText}
          description={enhancedDescription}
          isSelected={false} // We handle selection separately
          onClick={() => {}} // No click action needed in profile view
          disabled={false}
          size="medium"
          metadata={metadata}
          className={isHidden ? styles.hiddenName : ""}
        />

        {/* Admin actions overlay */}
        {isAdmin && (
          <div className={styles.adminActionsOverlay}>
            <button
              onClick={() => onToggleVisibility(id)}
              className={styles.actionButton}
              aria-label={`${isHidden ? "Show" : "Hide"} ${nameText}`}
            >
              {isHidden ? "🔒" : "🔓"}
            </button>
            {isHidden && (
              <button
                onClick={() => onDelete(name)}
                className={`${styles.actionButton} ${styles.deleteButton}`}
                aria-label={`Delete ${nameText}`}
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
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
const EnhancedChart = memo(({ title, children, className = "", description = "" }) => (
  <div className={`${styles.enhancedChart} ${className}`}>
    <div className={styles.chartHeader}>
      <h4 className={styles.chartTitle}>{title}</h4>
      {description && <p className={styles.chartDescription}>{description}</p>}
    </div>
    {children}
  </div>
));

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
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showSystemStats, setShowSystemStats] = useState(false);
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
  const [ratingHistory, setRatingHistory] = useState([]);
  const [tournamentAnalytics, setTournamentAnalytics] = useState({
    totalTournaments: 0,
    completedTournaments: 0,
    avgTournamentSize: 0,
    tournamentTrends: [],
  });

  // Hooks
  const {
    names,
    loading: ratingsLoading,
    error: ratingsError,
    fetchNames,
    hideName,
    unhideName,
    getRatingHistory,
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

    filteredRatings.forEach(rating => {
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

    filteredRatings.forEach(rating => {
      const total = (rating.user_wins || 0) + (rating.user_losses || 0);
      if (total === 0) return;
      const winRate = (rating.user_wins || 0) / total * 100;
      if (winRate <= 20) winRateRanges["0-20%"]++;
      else if (winRate <= 40) winRateRanges["21-40%"]++;
      else if (winRate <= 60) winRateRanges["41-60%"]++;
      else if (winRate <= 80) winRateRanges["61-80%"]++;
      else winRateRanges["81-100%"]++;
    });

    // Popularity vs Rating scatter data
    const popularityData = filteredRatings
      .filter(r => r.popularity_score && r.user_rating)
      .map(r => ({
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setIsAdmin(profile?.role === "admin");
      }
    };
    checkAdminStatus();
  }, []);

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

  useEffect(() => {
    const fetchHiddenNames = async () => {
      try {
        const { data, error } = await supabase
          .from("cat_hidden_names")
          .select("name_id")
          .eq("user_name", userName);

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
  }, [isAdmin, userName]);

  // Enhanced analytics effects
  useEffect(() => {
    const fetchRatingHistory = async () => {
      if (!userName) return;
      try {
        const history = await getRatingHistory();
        setRatingHistory(history);
      } catch (error) {
        console.error("Error fetching rating history:", error);
      }
    };

    fetchRatingHistory();
  }, [userName, getRatingHistory]);

  useEffect(() => {
    const fetchTournamentAnalytics = async () => {
      if (!userName) return;
      try {
        // Get user's tournament data
        const { data: tournaments, error } = await supabase
          .from("cat_tournaments")
          .select("*")
          .eq("user_name", userName);

        if (!error && tournaments) {
          const total = tournaments.length;
          const completed = tournaments.filter(t => t.status === "completed").length;
          const avgSize = tournaments.length > 0 
            ? Math.round(tournaments.reduce((sum, t) => sum + (t.participant_names?.length || 0), 0) / total)
            : 0;

          // Create tournament trends (last 10 tournaments)
          const recentTournaments = tournaments
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10)
            .map(t => ({
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
      } catch (error) {
        console.error("Error toggling visibility:", error);
      }
    },
    [hiddenNames, hideName, unhideName]
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

  const fetchSystemStats = useCallback(async () => {
    try {
      // Get total users
      const { count: userCount } = await supabase
        .from("app_users")
        .select("*", { count: "exact", head: true });

      // Get total names
      const { count: nameCount } = await supabase
        .from("cat_name_options")
        .select("*", { count: "exact", head: true });

      // Get hidden names count
      const { count: hiddenCount } = await supabase
        .from("cat_hidden_names")
        .select("*", { count: "exact", head: true });

      // Get tournament statistics
      const { count: tournamentCount } = await supabase
        .from("cat_tournaments")
        .select("*", { count: "exact", head: true });

      const { count: activeTournamentCount } = await supabase
        .from("cat_tournaments")
        .select("*", { count: "exact", head: true })
        .eq("status", "in_progress");

      // Get rating statistics
      const { count: ratingCount } = await supabase
        .from("cat_name_ratings")
        .select("*", { count: "exact", head: true });

      // Get average popularity score
      const { data: popularityData } = await supabase
        .from("cat_name_options")
        .select("popularity_score")
        .not("popularity_score", "is", null);

      const avgPopularityScore = popularityData?.length > 0
        ? Math.round(popularityData.reduce((sum, item) => sum + (item.popularity_score || 0), 0) / popularityData.length)
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

  // Loading and error states
  if (ratingsLoading) return <LoadingSpinner />;
  if (ratingsError)
    return (
      <div className={styles.error}>Error loading ratings: {ratingsError}</div>
    );

  return (
    <div className={styles.profileContainer}>
      {/* Header */}
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
        </div>
      </div>

      {/* Enhanced Stats Overview */}
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

      {/* Enhanced Controls */}
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

      {/* Names Grid */}
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

      {/* Enhanced Charts Section */}
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
                        "rgba(239, 68, 68, 0.8)",   // Red
                        "rgba(245, 158, 11, 0.8)",  // Orange
                        "rgba(59, 130, 246, 0.8)",  // Blue
                        "rgba(16, 185, 129, 0.8)",  // Green
                        "rgba(139, 92, 246, 0.8)",  // Purple
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
                    title: { display: true, text: "Rating Distribution" }
                  },
                  scales: { 
                    y: { beginAtZero: true },
                    x: { title: { display: true, text: "Rating Range" } }
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
                        "rgba(239, 68, 68, 0.8)",   // Red
                        "rgba(245, 158, 11, 0.8)",  // Orange
                        "rgba(156, 163, 175, 0.8)", // Gray
                        "rgba(16, 185, 129, 0.8)",  // Green
                        "rgba(59, 130, 246, 0.8)",  // Blue
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
                    title: { display: true, text: "Win Rate Distribution" }
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
                        const total = (r.user_wins || 0) + (r.user_losses || 0);
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
                    title: { display: true, text: "Top 10 Win Rates" }
                  },
                  scales: { 
                    y: { beginAtZero: true, max: 100, title: { display: true, text: "Win Rate (%)" } },
                    x: { title: { display: true, text: "Cat Names" } }
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
                  <span className={styles.metricValue}>{tournamentAnalytics.totalTournaments}</span>
                </div>
                <div className={styles.tournamentMetric}>
                  <h5>Completed</h5>
                  <span className={styles.metricValue}>{tournamentAnalytics.completedTournaments}</span>
                </div>
                <div className={styles.tournamentMetric}>
                  <h5>Avg Size</h5>
                  <span className={styles.metricValue}>{tournamentAnalytics.avgTournamentSize}</span>
                </div>
                <div className={styles.tournamentMetric}>
                  <h5>Completion Rate</h5>
                  <span className={styles.metricValue}>
                    {tournamentAnalytics.totalTournaments > 0 
                      ? Math.round((tournamentAnalytics.completedTournaments / tournamentAnalytics.totalTournaments) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
              
              {tournamentAnalytics.tournamentTrends.length > 0 && (
                <div className={styles.chartWrapper}>
                  <Line
                    key="tournament-trends-line"
                    data={{
                      labels: tournamentAnalytics.tournamentTrends.map(t => t.date),
                      datasets: [
                        {
                          label: "Tournament Size",
                          data: tournamentAnalytics.tournamentTrends.map(t => t.size),
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
                        title: { display: true, text: "Recent Tournament Sizes" }
                      },
                      scales: { 
                        y: { beginAtZero: true, title: { display: true, text: "Number of Names" } },
                        x: { title: { display: true, text: "Tournament Date" } }
                      },
                    }}
                  />
                </div>
              )}
            </EnhancedChart>
          )}

          {/* Rating vs Popularity Scatter */}
          {chartData.popularityData && chartData.popularityData.length > 0 && (
            <EnhancedChart 
              title="Rating vs Popularity" 
              description="Relationship between popularity scores and ratings"
              className={styles.fullWidthChart}
            >
              <div className={styles.chartWrapper}>
                <Bar
                  key="popularity-rating-bar"
                  data={{
                    labels: chartData.popularityData.slice(0, 15).map(d => d.name),
                    datasets: [
                      {
                        label: "Popularity Score",
                        data: chartData.popularityData.slice(0, 15).map(d => d.x),
                        backgroundColor: "rgba(16, 185, 129, 0.8)",
                        borderColor: "rgba(16, 185, 129, 1)",
                        borderWidth: 2,
                      },
                      {
                        label: "Rating (scaled)",
                        data: chartData.popularityData.slice(0, 15).map(d => d.y / 20), // Scale down for visibility
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
                      title: { display: true, text: "Popularity vs Rating Comparison" }
                    },
                    scales: { 
                      y: { 
                        beginAtZero: true,
                        title: { display: true, text: "Score" }
                      },
                      x: { 
                        title: { display: true, text: "Cat Names" }
                      }
                    },
                  }}
                />
              </div>
            </EnhancedChart>
          )}
        </div>
      )}

      {/* Admin Panel */}
      {isAdmin && (
        <div className={styles.adminPanel}>
          <div className={styles.adminHeader}>
            <h2>🔧 Admin Panel</h2>
            <div className={styles.adminActions}>
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className={styles.adminButton}
              >
                {showBulkActions ? "✕" : "📦"} Bulk Actions
              </button>
              <button
                onClick={() => setShowSystemStats(!showSystemStats)}
                className={styles.adminButton}
              >
                {showSystemStats ? "✕" : "📊"} System Stats
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {showBulkActions && (
            <div className={styles.bulkActions}>
              <div className={styles.bulkControls}>
                <button
                  onClick={handleBulkHide}
                  className={`${styles.adminButton} ${styles.dangerButton}`}
                  disabled={selectedNames.size === 0}
                >
                  🔒 Hide Selected ({selectedNames.size})
                </button>
                <button
                  onClick={handleBulkDelete}
                  className={`${styles.adminButton} ${styles.dangerButton}`}
                  disabled={selectedNames.size === 0}
                >
                  🗑️ Delete Selected ({selectedNames.size})
                </button>
                <button
                  onClick={() => setSelectedNames(new Set())}
                  className={styles.adminButton}
                >
                  ✕ Clear Selection
                </button>
              </div>
              <div className={styles.bulkInfo}>
                <p>
                  Select names from the grid above to perform bulk operations
                </p>
              </div>
            </div>
          )}

          {/* Enhanced System Statistics */}
          {showSystemStats && (
            <div className={styles.systemStats}>
              <div className={styles.statGrid}>
                <div className={styles.statCard}>
                  <h4>Total Users</h4>
                  <span className={styles.statValue}>
                    {systemStats.totalUsers}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <h4>Total Names</h4>
                  <span className={styles.statValue}>
                    {systemStats.totalNames}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <h4>Hidden Names</h4>
                  <span className={styles.statValue}>
                    {systemStats.hiddenNames}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <h4>Active Tournaments</h4>
                  <span className={styles.statValue}>
                    {systemStats.activeTournaments}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <h4>Total Tournaments</h4>
                  <span className={styles.statValue}>
                    {systemStats.totalTournaments}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <h4>Total Ratings</h4>
                  <span className={styles.statValue}>
                    {systemStats.totalRatings}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <h4>Avg Popularity</h4>
                  <span className={styles.statValue}>
                    {systemStats.avgPopularityScore}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {filteredRatings.length === 0 && (
        <div className={styles.emptyState}>
          <p>No names found with the current filters.</p>
        </div>
      )}
    </div>
  );
};

Profile.propTypes = {
  userName: PropTypes.string.isRequired,
  onStartNewTournament: PropTypes.func.isRequired,
};

export default Profile;
