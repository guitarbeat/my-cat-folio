/**
 * @module Profile
 * @description Displays user statistics and saved tournament data with enhanced analytics.
 */
import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import useSupabaseStorage from '../../supabase/useSupabaseStorage';
import { supabase, deleteName } from '../../supabase/supabaseClient';

import StatsCard from '../StatsCard/StatsCard';
import NameCard from '../NameCard/NameCard';
import { SkeletonLoader } from '../LoadingSpinner';
import { validateCatName } from '../../utils/validation';
import styles from './Profile.module.css';
import { DEFAULT_RATING, FILTER_OPTIONS } from '../../utils/constants';

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
    onSelectionChange
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
      created_at
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
      created: created_at
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
        className={isHidden ? styles.hiddenName : ''}
        isAdmin={isAdmin}
        isHidden={isHidden}
        onToggleVisibility={isAdmin ? () => onToggleVisibility(id) : undefined}
        onDelete={isAdmin ? () => onDelete(name) : undefined}
        onSelectionChange={
          isAdmin ? (selected) => onSelectionChange(id, selected) : undefined
        }
        showAdminControls={isAdmin} // Only show admin controls for admins
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
  onSelectionChange: PropTypes.func.isRequired
};

// Main Profile Component
const Profile = ({ userName, onStartNewTournament }) => {
  // State
  const [filterStatus, setFilterStatus] = useState(FILTER_OPTIONS.STATUS.ALL);
  const [userFilter, setUserFilter] = useState(FILTER_OPTIONS.USER.ALL);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isAdmin, setIsAdmin] = useState(false);
  const [hiddenNames, setHiddenNames] = useState(new Set());


  // Global analytics state
  const [globalAnalytics] = useState({
    globalAvgRating: 0,
    totalGlobalRatings: 0,
    totalNamesWithRatings: 0,
    avgPopularity: 0,
    ratingDistribution: {},
    topPopularNames: [],
    leastPopularNames: []
  });

  // UI state for showing/hiding sections
  const [showGlobalAnalytics] = useState(false);
  const [showUserComparison] = useState(false);
  const [currentlyViewedUser] = useState(userName);


  // Hooks
  const {
    names: allNames,
    loading: ratingsLoading,
    error: ratingsError,
    fetchNames
  } = useSupabaseStorage(userName);

  // State for hidden names data
  const [hiddenNamesData, setHiddenNamesData] = useState([]);

  // State for selected names and available users
  const [selectedNames, setSelectedNames] = useState(new Set());
  const [availableUsers, setAvailableUsers] = useState([]);

  // Get names based on admin status and filter
  const names = useMemo(() => {
    if (!allNames?.length && !hiddenNamesData.length) return [];

    // For admins, combine regular names with hidden names data
    if (isAdmin) {
      const combinedNames = [...allNames];

      // Add hidden names data if we have it
      if (hiddenNamesData.length > 0) {
        combinedNames.push(...hiddenNamesData);
      }

      console.log('Admin names:', {
        regularNames: allNames.length,
        hiddenNames: hiddenNamesData.length,
        combined: combinedNames.length,
        filterStatus
      });

      return combinedNames;
    }

    // Regular users only see non-hidden names
    return allNames;
  }, [allNames, hiddenNamesData, isAdmin, filterStatus]);

  // Computed values
  const filteredRatings = useMemo(() => {
    if (!names?.length) return [];

    let filtered = names;

    // First filter by status
    if (filterStatus === FILTER_OPTIONS.STATUS.ACTIVE) {
      filtered = names.filter((r) => !hiddenNames.has(r.id));
      console.log('Filtering for ACTIVE names:', {
        total: names.length,
        filtered: filtered.length,
        hiddenCount: hiddenNames.size
      });
    } else if (filterStatus === FILTER_OPTIONS.STATUS.HIDDEN) {
      filtered = names.filter((r) => hiddenNames.has(r.id));
      console.log('Filtering for HIDDEN names:', {
        total: names.length,
        filtered: filtered.length,
        hiddenCount: hiddenNames.size,
        hiddenIds: Array.from(hiddenNames)
      });
    } else {
      console.log('Showing ALL names:', {
        total: names.length,
        filtered: filtered.length,
        hiddenCount: hiddenNames.size
      });
    }

    // Then filter by user if specific users are selected
    if (userFilter === FILTER_OPTIONS.USER.SPECIFIC && selectedUsers.size > 0) {
      filtered = filtered.filter((r) => {
        // For names with direct user_name, check if it matches selected users
        if (r.user_name && selectedUsers.has(r.user_name)) {
          return true;
        }

        // For names without user_name, check if any of their ratings are from selected users
        // This handles the case where names are stored globally but have user-specific ratings
        if (r.ratings && Array.isArray(r.ratings)) {
          return r.ratings.some(
            (rating) => rating.user_name && selectedUsers.has(rating.user_name)
          );
        }

        // If no user association found, exclude from results
        return false;
      });

      console.log('Filtering by selected users:', {
        selectedUsers: Array.from(selectedUsers),
        filteredAfterUserFilter: filtered.length,
        originalCount: names.length
      });
    }

    return [...filtered].sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'rating':
          aVal = a.user_rating || a.avg_rating || 0;
          bVal = b.user_rating || b.avg_rating || 0;
          break;
        case 'matches':
          aVal = (a.user_wins || 0) + (a.user_losses || 0);
          bVal = (b.user_wins || 0) + (b.user_losses || 0);
          break;
        case 'popularity':
          aVal = a.popularity_score || 0;
          bVal = b.popularity_score || 0;
          break;
        case 'tournaments':
          aVal = a.total_tournaments || 0;
          bVal = b.total_tournaments || 0;
          break;
        default:
          aVal = a.user_rating || a.avg_rating || 0;
          bVal = b.user_rating || b.avg_rating || 0;
      }
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [
    names,
    filterStatus,
    userFilter,
    selectedUsers,
    hiddenNames,
    sortBy,
    sortOrder
  ]);

  const enhancedStats = useMemo(
    () => calculateEnhancedStats(filteredRatings, filterStatus),
    [filteredRatings, filterStatus]
  );

  // Effects
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Simple admin check: if user is "Aaron" or "aaron", they're admin
        // This is a temporary solution until we have proper role-based auth
        const isAdminUser = userName === 'Aaron' || userName === 'aaron';
        setIsAdmin(isAdminUser);

        // Log for debugging
        console.log('Admin check:', { userName, isAdminUser });

        // Note: cat_app_users table might not exist yet, so we're using username-based admin detection
        // TODO: Implement proper role-based auth when the database schema is set up
        console.log('Admin status set to:', isAdminUser);
      } catch (error) {
        console.error('Error checking admin status:', error);
        // Fallback: if user is Aaron, they're admin
        setIsAdmin(userName === 'Aaron' || userName === 'aaron');
      }
    };
    checkAdminStatus();
  }, [userName]);


  useEffect(() => {
    const fetchHiddenNames = async () => {
      try {
        // Fetch ALL hidden names globally (not user-specific)
        const { data, error } = await supabase
          .from('cat_name_ratings')
          .select(
            `
            name_id,
            user_name,
            cat_name_options (
              name,
              description
            )
          `
          )
          .eq('is_hidden', true);

        if (!error && data) {
          setHiddenNames(new Set(data.map((item) => item.name_id)));
          console.log('Fetched hidden names:', data);
        }
      } catch (error) {
        console.error('Error fetching hidden names:', error);
      }
    };

    // Always fetch hidden names (they affect all users)
    fetchHiddenNames();
  }, [isAdmin, userName]);

  // Fetch hidden names data for admin display
  useEffect(() => {
    if (!isAdmin) return;

    const fetchHiddenNamesData = async () => {
      try {
        // Fetch the actual hidden names with full data for display
        const { data, error } = await supabase
          .from('cat_name_options')
          .select(
            `
            id,
              name,
            description,
            created_at,
            avg_rating,
            popularity_score,
            total_tournaments,
            is_active,
            categories
          `
          )
          .in('id', Array.from(hiddenNames));

        if (!error && data) {
          // Transform the data to match the expected format
          const transformedData = data.map((name) => ({
            ...name,
            user_rating: null, // Hidden names don't have user ratings
            user_wins: 0,
            user_losses: 0,
            has_user_rating: false,
            updated_at: null
          }));

          setHiddenNamesData(transformedData);
          console.log(
            'Fetched hidden names data for display:',
            transformedData
          );
        }
      } catch (error) {
        console.error('Error fetching hidden names data:', error);
      }
    };

    if (hiddenNames.size > 0) {
      fetchHiddenNamesData();
    }
  }, [isAdmin, filterStatus, hiddenNames]);

  // Fetch available users for admin filtering
  useEffect(() => {
    if (!isAdmin) return;

    const fetchAvailableUsers = async () => {
      try {
        const { data: usersWithRatings, error } = await supabase
          .from('cat_name_ratings')
          .select('user_name')
          .order('user_name');

        if (error) throw error;

        const uniqueUsers = [
          ...new Set(usersWithRatings.map((u) => u.user_name))
        ];
        setAvailableUsers(uniqueUsers);
      } catch (error) {
        console.error('Error fetching available users:', error);
      }
    };

    fetchAvailableUsers();
  }, [isAdmin]);

  // Event handlers - Admin only
  const handleToggleVisibility = useCallback(
    async (nameId) => {
      if (!isAdmin) {
        console.warn('Only admins can toggle name visibility');
        return;
      }

      try {
        if (hiddenNames.has(nameId)) {
          // Unhide the name globally
          const { error } = await supabase
            .from('cat_name_ratings')
            .update({ is_hidden: false })
            .eq('name_id', nameId);

          if (error) throw error;

          setHiddenNames(
            (prev) => new Set([...prev].filter((id) => id !== nameId))
          );
          console.log(`Unhidden name ${nameId} globally`);
        } else {
          // Hide the name globally
          const { error } = await supabase
            .from('cat_name_ratings')
            .update({ is_hidden: true })
            .eq('name_id', nameId);

          if (error) throw error;

          setHiddenNames((prev) => new Set([...prev, nameId]));
          console.log(`Hidden name ${nameId} globally`);
        }

        // Refresh the names to update the UI
        fetchNames();
      } catch (error) {
        console.error('Error toggling visibility:', error);
      }
    },
    [hiddenNames, isAdmin, fetchNames]
  );

  const handleDeleteName = useCallback(
    async (name) => {
      try {
        // Validate the name before deletion
        const validation = validateCatName(name.name);
        if (!validation.success) {
          alert(`Invalid name: ${validation.error}`);
          return;
        }

        const result = await deleteName(name.id);
        if (result?.success === false) {
          throw new Error(result.error || 'Failed to delete name');
        }

        fetchNames();
      } catch (error) {
        console.error('Error deleting name:', error);
        alert(`Failed to delete name: ${error.message}`);
      }
    },
    [fetchNames]
  );

  // Admin handlers
  const handleBulkHide = useCallback(async () => {
    if (!isAdmin) {
      console.warn('Only admins can perform bulk operations');
      return;
    }

    try {
      for (const nameId of selectedNames) {
        // Hide the name globally
        const { error } = await supabase
          .from('cat_name_ratings')
          .update({ is_hidden: true })
          .eq('name_id', nameId);

        if (error) throw error;

        setHiddenNames((prev) => new Set([...prev, nameId]));
      }
      setSelectedNames(new Set());
      fetchNames();
      console.log(`Bulk hidden ${selectedNames.size} names globally`);
          } catch (error) {
        console.error('Error in bulk hide:', error);
        alert(`Failed to hide names: ${error.message}`);
      }
  }, [selectedNames, isAdmin, fetchNames]);

  const handleBulkDelete = useCallback(async () => {
    try {
      for (const nameId of selectedNames) {
        await deleteName(nameId);
      }
      setSelectedNames(new Set());
      fetchNames();
          } catch (error) {
        console.error('Error in bulk delete:', error);
        alert(`Failed to delete names: ${error.message}`);
      }
  }, [selectedNames, fetchNames]);

  // New bulk operations for all names - Admin only
  const handleHideAllNames = useCallback(async () => {
    if (!isAdmin) {
      console.warn('Only admins can perform bulk operations');
      return;
    }

    try {
      // Get all visible names (not currently hidden)
      const visibleNames = names.filter((name) => !hiddenNames.has(name.id));

      for (const name of visibleNames) {
        // Hide the name globally
        const { error } = await supabase
          .from('cat_name_ratings')
          .update({ is_hidden: true })
          .eq('name_id', name.id);

        if (error) throw error;

        setHiddenNames((prev) => new Set([...prev, name.id]));
      }

      // Show success message
      console.log(`Hidden ${visibleNames.length} names globally`);
      fetchNames();
    } catch (error) {
      console.error('Error hiding all names:', error);
    }
  }, [names, hiddenNames, isAdmin, fetchNames]);

  const handleUnhideAllNames = useCallback(async () => {
    if (!isAdmin) {
      console.warn('Only admins can perform bulk operations');
      return;
    }

    try {
      // Get all hidden names
      const hiddenNameIds = Array.from(hiddenNames);

      for (const nameId of hiddenNameIds) {
        // Unhide the name globally
        const { error } = await supabase
          .from('cat_name_ratings')
          .update({ is_hidden: false })
          .eq('name_id', nameId);

        if (error) throw error;

        setHiddenNames((prev) => {
          const newSet = new Set(prev);
          newSet.delete(nameId);
          return newSet;
        });
      }

      // Show success message
      console.log(`Unhidden ${hiddenNameIds.length} names globally`);
      fetchNames();
    } catch (error) {
      console.error('Error unhiding all names:', error);
    }
  }, [hiddenNames, isAdmin, fetchNames]);

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
      const { data: allRatings } = await supabase.from('cat_name_ratings')
        .select(`
          *,
          cat_name_options (
            name,
            description,
            popularity_score,
            categories
          )
        `);

      // Get user data from cat_name_ratings (consolidated schema)
      const { data: allUsers } = await supabase
        .from('cat_name_ratings')
        .select('user_name')
        .limit(100);

      const exportData = {
        timestamp: new Date().toISOString(),
        ratings: allRatings || [],
        users: allUsers || [],
        globalAnalytics
      };

      // Create and download CSV
      const csvContent = convertToCSV(exportData);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cat_names_analytics_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  }, [globalAnalytics]);

  // Utility function to convert data to CSV
  const convertToCSV = (data) => {
    // Simple CSV conversion - you can enhance this as needed
    const headers = ['Data Type', 'Timestamp', 'Details'];
    const rows = [

      [
        'Global Analytics',
        data.timestamp,
        JSON.stringify(data.globalAnalytics)
      ],
      ['Total Ratings', data.timestamp, data.ratings.length],
      ['Total Users', data.timestamp, data.users.length]
    ];

    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  };

  // Debug logging for admin status
  useEffect(() => {
    console.log('Profile component state:', {
      userName,
      isAdmin,
      showGlobalAnalytics,
      showUserComparison
    });
  }, [userName, isAdmin, showGlobalAnalytics, showUserComparison]);

  // Reset filter status for non-admin users
  useEffect(() => {
    if (!isAdmin && filterStatus === FILTER_OPTIONS.STATUS.HIDDEN) {
      setFilterStatus(FILTER_OPTIONS.STATUS.ALL);
    }
    if (!isAdmin && userFilter === FILTER_OPTIONS.USER.SPECIFIC) {
      setUserFilter(FILTER_OPTIONS.USER.ALL);
      setSelectedUsers(new Set());
    }
  }, [isAdmin, filterStatus, userFilter]);

  // Loading and error states
  if (ratingsLoading) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
          <h1 className={styles.profileTitle}>Loading Profile...</h1>
        </div>
        <div className={styles.mainContent}>
          <SkeletonLoader type="profile" />
          <div className={styles.namesGrid}>
            <SkeletonLoader type="card" lines={5} />
            <SkeletonLoader type="card" lines={5} />
            <SkeletonLoader type="card" lines={5} />
          </div>
        </div>
      </div>
    );
  }
  if (ratingsError) {
    // Handle error object properly - extract message or convert to string
    const errorMessage = ratingsError?.message || ratingsError?.details ||
                        (typeof ratingsError === 'string' ? ratingsError : 'Unknown error occurred');
    return (
      <div className={styles.error}>
        <h3>⚠️ Error Loading Profile Data</h3>
        <p>Error loading ratings: {errorMessage}</p>
        <button
          onClick={() => fetchNames()}
          className={styles.button}
          style={{ marginTop: '1rem' }}
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      {/* Header - Fixed at top */}
      <div className={styles.profileHeader}>
        <h1 className={styles.profileTitle}>
          {currentlyViewedUser === userName
            ? 'Your Profile'
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
          <button
            onClick={() => {
              localStorage.removeItem('catNameTournament_onboardingSeen');
              window.location.reload();
            }}
            className={styles.button}
            title="Show onboarding tutorial again"
          >
            ❓ Help
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


            {/* Quick Bulk Operations */}
            <div className={styles.sidebarSection}>
              <h4>🎯 Quick Actions</h4>
              <div className={styles.adminNote}>
                <p>⚠️ Name hiding affects ALL users globally</p>
              </div>
              <div className={styles.quickBulkButtons}>
                <button
                  onClick={handleHideAllNames}
                  className={`${styles.sidebarButton} ${styles.warningButton}`}
                  title="Hide all visible names globally"
                >
                  🔒 Hide All Names
                </button>
                <button
                  onClick={handleUnhideAllNames}
                  className={`${styles.sidebarButton} ${styles.successButton}`}
                  title="Unhide all hidden names globally"
                >
                  🔓 Unhide All Names
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
                {isAdmin && (
                  <option value={FILTER_OPTIONS.STATUS.HIDDEN}>Hidden</option>
                )}
              </select>
            </div>

            {/* User filters - Admin only */}
            {isAdmin && (
              <>
                <div className={styles.filterGroup}>
                  <label>Users:</label>
                  <select
                    value={userFilter}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setUserFilter(newValue);
                      // Clear selected users when switching to "All Users"
                      if (newValue === FILTER_OPTIONS.USER.ALL) {
                        setSelectedUsers(new Set());
                      }
                    }}
                    className={styles.filterSelect}
                  >
                    <option value={FILTER_OPTIONS.USER.ALL}>All Users</option>
                    <option value={FILTER_OPTIONS.USER.SPECIFIC}>
                      Specific Users
                    </option>
                  </select>
                </div>

                {userFilter === FILTER_OPTIONS.USER.SPECIFIC && (
                  <div className={styles.filterGroup}>
                    <label>Select Users:</label>
                    <div className={styles.userFilterActions}>
                      <button
                        type="button"
                        onClick={() => setSelectedUsers(new Set(availableUsers))}
                        className={styles.userFilterButton}
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedUsers(new Set())}
                        className={styles.userFilterButton}
                      >
                        Clear All
                      </button>
                    </div>
                    {selectedUsers.size > 0 && (
                      <div className={styles.userFilterSummary}>
                        <span className={styles.userFilterCount}>
                          {selectedUsers.size} user
                          {selectedUsers.size !== 1 ? 's' : ''} selected
                        </span>
                      </div>
                    )}
                    <div className={styles.userCheckboxes}>
                      {availableUsers.map((user) => (
                        <label key={user} className={styles.userCheckbox}>
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers(
                                  (prev) => new Set([...prev, user])
                                );
                              } else {
                                setSelectedUsers((prev) => {
                                  const newSet = new Set(prev);
                                  newSet.delete(user);
                                  return newSet;
                                });
                              }
                            }}
                          />
                          <span title={user}>{user}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

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
                  setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'))
                }
                className={styles.sortButton}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
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
  onStartNewTournament: PropTypes.func.isRequired
};

export default Profile;
