/**
 * @module Profile
 * @description Main profile component that orchestrates user statistics and name management.
 * Refactored to use smaller, focused sub-components for better maintainability.
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

// * Main Profile Component
const Profile = ({ userName, onStartNewTournament }) => {
  // * State
  const [filterStatus, setFilterStatus] = useState(FILTER_OPTIONS.STATUS.ALL);
  const [userFilter, setUserFilter] = useState(FILTER_OPTIONS.USER.ALL);
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isAdmin, setIsAdmin] = useState(false);
  const [hiddenNames, setHiddenNames] = useState(new Set());

  // * Hooks
  const {
    names: allNames,
    loading: ratingsLoading,
    error: ratingsError,
    fetchNames
  } = useSupabaseStorage(userName);

  // * State for selected names
  const [selectedNames, setSelectedNames] = useState(new Set());

  // * Fetch names on component mount
  useEffect(() => {
    if (userName) {
      fetchNames();
    }
  }, [userName, fetchNames]);

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

      // * Refresh names
      fetchNames();
    } catch (error) {
      ErrorService.handleError(error, 'Profile - Delete Name', {
        isRetryable: true,
        affectsUserData: true,
        isCritical: false
      });
    }
  }, [fetchNames]);

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
