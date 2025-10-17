import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FILTER_OPTIONS } from '../../core/constants';
import { Select } from '../../shared/components';
import styles from './ProfileFilters.module.css';

/**
 * @module ProfileFilters
 * @description Handles filtering and sorting controls for the profile view.
 * Now includes selection-based filtering and sorting options.
 */

const ProfileFilters = ({
  filterStatus,
  setFilterStatus,
  userFilter,
  setUserFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  isAdmin = false,
  className = '',
  // * New selection-based filter props
  selectionFilter = 'all',
  setSelectionFilter,
  hasSelectionData = false
}) => {
  const handleSortOrderToggle = () => {
    setSortOrder(
      sortOrder === FILTER_OPTIONS.ORDER.ASC
        ? FILTER_OPTIONS.ORDER.DESC
        : FILTER_OPTIONS.ORDER.ASC
    );
  };

  const sortOptions = useMemo(() => {
    const options = [
      { value: FILTER_OPTIONS.SORT.RATING, label: 'Rating' },
      { value: FILTER_OPTIONS.SORT.NAME, label: 'Name' },
      { value: FILTER_OPTIONS.SORT.WINS, label: 'Wins' },
      { value: FILTER_OPTIONS.SORT.LOSSES, label: 'Losses' },
      { value: FILTER_OPTIONS.SORT.WIN_RATE, label: 'Win Rate' },
      { value: FILTER_OPTIONS.SORT.CREATED, label: 'Created Date' }
    ];

    if (hasSelectionData) {
      options.push(
        { value: 'selection_count', label: 'Selection Count' },
        { value: 'last_selected', label: 'Last Selected' },
        { value: 'selection_frequency', label: 'Selection Frequency' },
        { value: 'tournament_appearances', label: 'Tournament Appearances' }
      );
    }

    return options;
  }, [hasSelectionData]);

  return (
    <div className={`${styles.container} ${className}`}>
      <h3 className={styles.sectionTitle}>Filters & Sorting</h3>

      <div className={styles.filtersGrid}>
        {/* * Status Filter */}
        <Select
          name="status-filter"
          label="Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={[
            { value: FILTER_OPTIONS.STATUS.ALL, label: 'All Names' },
            { value: FILTER_OPTIONS.STATUS.ACTIVE, label: 'Active Only' },
            { value: FILTER_OPTIONS.STATUS.HIDDEN, label: 'Hidden Only' }
          ]}
          containerClassName={styles.filterGroup}
          className={styles.filterSelect}
        />

        {/* * User Filter */}
        <Select
          name="user-filter"
          label="User"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          options={[
            { value: FILTER_OPTIONS.USER.ALL, label: 'All Users' },
            { value: FILTER_OPTIONS.USER.CURRENT, label: 'Current User' },
            ...(isAdmin
              ? [{ value: FILTER_OPTIONS.USER.OTHER, label: 'Other Users' }]
              : [])
          ]}
          containerClassName={styles.filterGroup}
          className={styles.filterSelect}
        />

        {/* * NEW: Selection Status Filter */}
        {hasSelectionData && (
          <Select
            name="selection-filter"
            label="Selection Status"
            value={selectionFilter}
            onChange={(e) => setSelectionFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Names' },
              { value: 'selected', label: "Names I've Selected" },
              { value: 'never_selected', label: "Names I've Never Selected" },
              {
                value: 'frequently_selected',
                label: 'Frequently Selected'
              },
              { value: 'recently_selected', label: 'Recently Selected' }
            ]}
            containerClassName={styles.filterGroup}
            className={styles.filterSelect}
          />
        )}

        {/* * Sort By - Enhanced with selection options */}
        <Select
          name="sort-by"
          label="Sort By"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          options={sortOptions}
          containerClassName={styles.filterGroup}
          className={styles.filterSelect}
        />

        {/* * Sort Order Toggle */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Order</label>
          <button
            type="button"
            onClick={handleSortOrderToggle}
            className={styles.sortOrderButton}
            aria-label={`Sort ${sortOrder === FILTER_OPTIONS.ORDER.ASC ? 'ascending' : 'descending'}`}
          >
            <span className={styles.sortOrderIcon}>
              {sortOrder === FILTER_OPTIONS.ORDER.ASC ? '↑' : '↓'}
            </span>
            <span className={styles.sortOrderText}>
              {sortOrder === FILTER_OPTIONS.ORDER.ASC
                ? 'Ascending'
                : 'Descending'}
            </span>
          </button>
        </div>
      </div>

      {/* * Active Filters Display - Enhanced */}
      <div className={styles.activeFilters}>
        <span className={styles.activeFilterLabel}>Active Filters:</span>
        <span className={styles.activeFilter}>
          Status:{' '}
          {filterStatus === FILTER_OPTIONS.STATUS.ALL ? 'All' : filterStatus}
        </span>
        <span className={styles.activeFilter}>
          User: {userFilter === FILTER_OPTIONS.USER.ALL ? 'All' : userFilter}
        </span>
        {hasSelectionData && selectionFilter !== 'all' && (
          <span className={styles.activeFilter}>
            Selection:{' '}
            {selectionFilter
              .replace('_', ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
        )}
        <span className={styles.activeFilter}>
          Sort:{' '}
          {sortBy.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} (
          {sortOrder})
        </span>
      </div>
    </div>
  );
};

ProfileFilters.propTypes = {
  filterStatus: PropTypes.string.isRequired,
  setFilterStatus: PropTypes.func.isRequired,
  userFilter: PropTypes.string.isRequired,
  setUserFilter: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  setSortBy: PropTypes.func.isRequired,
  sortOrder: PropTypes.string.isRequired,
  setSortOrder: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool,
  className: PropTypes.string,
  // * New props for selection-based filtering
  selectionFilter: PropTypes.string,
  setSelectionFilter: PropTypes.func,
  hasSelectionData: PropTypes.bool
};

export default ProfileFilters;
