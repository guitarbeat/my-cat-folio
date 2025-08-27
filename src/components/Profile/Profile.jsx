/**
 * @module Profile
 * @description Main profile component that orchestrates user statistics and name management.
 * Now includes comprehensive selection analytics and tournament insights.
 */
import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import useSupabaseStorage from '../../supabase/useSupabaseStorage';
import { supabase, deleteName } from '../../supabase/supabaseClient';
import { FILTER_OPTIONS } from '../../constants';
import { ErrorService } from '../../services/errorService';

import ProfileStats from './ProfileStats';
import ProfileFilters from './ProfileFilters';
import ProfileNameList from './ProfileNameList';
import styles from './Profile.module.css';

// * Enhanced utility functions for better statistics
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

  // * Enhanced rating statistics
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

// * Calculate selection analytics from tournament selections
const calculateSelectionStats = async (userName) => {
  try {
    // Get user's tournament selections
    const { data: selections, error: selectionsError } = await supabase
      .from('tournament_selections')
      .select('*')
      .eq('user_name', userName);

    if (selectionsError) throw selectionsError;

    if (!selections || selections.length === 0) {
      return null;
    }

    // Calculate basic metrics
    const totalSelections = selections.length;
    const totalTournaments = new Set(selections.map(s => s.tournament_id)).size;
    const uniqueNames = new Set(selections.map(s => s.name_id)).size;
    const avgSelectionsPerName = uniqueNames > 0 ? Math.round(totalSelections / uniqueNames * 10) / 10 : 0;

    // Find most selected name
    const nameCounts = {};
    selections.forEach(s => {
      nameCounts[s.name] = (nameCounts[s.name] || 0) + 1;
    });
    const mostSelectedName = Object.entries(nameCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    // Calculate selection streak (consecutive days)
    const sortedSelections = selections
      .map(s => new Date(s.selected_at).toDateString())
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
        const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
        
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

    // Get user ranking
    const { data: allUserStats, error: rankingError } = await supabase
      .from('user_preference_analysis')
      .select('user_name, total_selections')
      .order('total_selections', { ascending: false });

    let userRank = 'N/A';
    if (!rankingError && allUserStats) {
      userRank = allUserStats.findIndex(u => u.user_name === userName) + 1;
    }

    // Generate insights
    const insights = {
      selectionPattern: generateSelectionPattern(selections),
      preferredCategories: await generatePreferredCategories(selections),
      improvementTip: generateImprovementTip(totalSelections, totalTournaments, currentStreak)
    };

    return {
      totalSelections,
      totalTournaments,
      avgSelectionsPerName,
      mostSelectedName,
      currentStreak,
      maxStreak,
      userRank: userRank || 'N/A',
      insights
    };
  } catch (error) {
    console.error('Error calculating selection stats:', error);
    return null;
  }
};

// * Generate selection pattern insights
const generateSelectionPattern = (selections) => {
  if (!selections || selections.length === 0) return 'No selection data available';
  
  const totalSelections = selections.length;
  const uniqueTournaments = new Set(selections.map(s => s.tournament_id)).size;
  const avgSelectionsPerTournament = Math.round(totalSelections / uniqueTournaments * 10) / 10;
  
  if (avgSelectionsPerTournament > 8) {
    return 'You prefer large tournaments with many names';
  } else if (avgSelectionsPerTournament > 4) {
    return 'You enjoy medium-sized tournaments';
  } else {
    return 'You prefer focused, smaller tournaments';
  }
};

// * Generate preferred categories insight
const generatePreferredCategories = async (selections) => {
  try {
    const nameIds = selections.map(s => s.name_id);
    const { data: names, error } = await supabase
      .from('cat_name_options')
      .select('categories')
      .in('id', nameIds);

    if (error || !names) return 'Analyzing your preferences...';

    const categoryCounts = {};
    names.forEach(name => {
      if (name.categories && Array.isArray(name.categories)) {
        name.categories.forEach(cat => {
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
      }
    });

    const topCategories = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat);

    if (topCategories.length > 0) {
      return `You favor: ${topCategories.join(', ')}`;
    }
    
    return 'Discovering your preferences...';
  } catch (error) {
    return 'Analyzing your preferences...';
  }
};

// * Generate improvement tips
const generateImprovementTip = (totalSelections, totalTournaments, currentStreak) => {
  if (totalSelections === 0) {
    return 'Start selecting names to see your first tournament!';
  }
  
  if (totalTournaments < 3) {
    return 'Try creating more tournaments to discover your preferences';
  }
  
  if (currentStreak < 3) {
    return 'Build a selection streak by playing daily';
  }
  
  if (totalSelections / totalTournaments < 4) {
    return 'Consider selecting more names per tournament for variety';
  }
  
  return 'Great job! You\'re an active tournament participant';
};

// * Main Profile Component
const Profile = ({ userName, onStartNewTournament }) => {
  // * State
  const [filterStatus, setFilterStatus] = useState(FILTER_OPTIONS.STATUS.ALL);
  const [userFilter, setUserFilter] = useState(FILTER_OPTIONS.USER.ALL);
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isAdmin, setIsAdmin] = useState(false);
  const [hiddenNames, setHiddenNames] = useState(new Set());
  const [selectionStats, setSelectionStats] = useState(null);

  // * Hooks
  const {
    names: allNames,
    loading: ratingsLoading,
    error: ratingsError,
    fetchNames
  } = useSupabaseStorage(userName);

  // * State for selected names
  const [selectedNames, setSelectedNames] = useState(new Set());

  // * Fetch names and selection stats on component mount
  useEffect(() => {
    if (userName) {
      fetchNames();
      fetchSelectionStats();
    }
  }, [userName]); // Remove fetchNames dependency to prevent infinite loops

  // * Fetch selection statistics
  const fetchSelectionStats = useCallback(async () => {
    if (!userName) return;
    
    try {
      const stats = await calculateSelectionStats(userName);
      setSelectionStats(stats);
    } catch (error) {
      console.error('Error fetching selection stats:', error);
    }
  }, [userName]);

  // * Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: adminCheck } = await supabase
            .from('user_preferences')
            .select('is_admin')
            .eq('user_name', user.email)
            .single();

          setIsAdmin(adminCheck?.is_admin || false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  // * Calculate statistics based on current filters
  const stats = calculateEnhancedStats(allNames, filterStatus);

  // * Handle name visibility toggle
  const handleToggleVisibility = useCallback(async (nameId) => {
    try {
      const { error } = await supabase
        .from('cat_name_options')
        .update({ is_hidden: !hiddenNames.has(nameId) })
        .eq('id', nameId);

      if (error) throw error;

      // * Update local state
      setHiddenNames(prev => {
        const newSet = new Set(prev);
        if (newSet.has(nameId)) {
          newSet.delete(nameId);
        } else {
          newSet.add(nameId);
        }
        return newSet;
      });

      // * Refresh names
      fetchNames();
    } catch (error) {
      ErrorService.handleError(error, 'Profile - Toggle Visibility', {
        isRetryable: true,
        affectsUserData: false,
        isCritical: false
      });
    }
  }, [hiddenNames, fetchNames]);

  // * Handle name deletion
  const handleDelete = useCallback(async (name) => {
    try {
      const { error } = await deleteName(name.id);
      if (error) throw error;

      // * Refresh names and selection stats
      fetchNames();
      fetchSelectionStats();
    } catch (error) {
      ErrorService.handleError(error, 'Profile - Delete Name', {
        isRetryable: true,
        affectsUserData: true,
        isCritical: false
      });
    }
  }, [fetchNames, fetchSelectionStats]);

  // * Handle name selection
  const handleSelectionChange = useCallback((nameId, selected) => {
    setSelectedNames(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(nameId);
      } else {
        newSet.delete(nameId);
      }
      return newSet;
    });
  }, []);

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

  return (
    <div className={styles.profileContainer}>
      {/* * Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Profile: {userName}</h1>
        <button
          onClick={onStartNewTournament}
          className={styles.newTournamentButton}
        >
          Start New Tournament
        </button>
      </div>

      {/* * Statistics Section */}
      <ProfileStats
        stats={stats}
        selectionStats={selectionStats}
        isLoading={ratingsLoading}
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
        className={styles.namesSection}
      />
    </div>
  );
};

Profile.propTypes = {
  userName: PropTypes.string.isRequired,
  onStartNewTournament: PropTypes.func.isRequired
};

export default Profile;
