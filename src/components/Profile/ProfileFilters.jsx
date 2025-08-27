import React from 'react';
import PropTypes from 'prop-types';
import { FILTER_OPTIONS } from '../../constants';
import styles from './ProfileFilters.module.css';

/**
 * @module ProfileFilters
 * @description Handles filtering and sorting controls for the profile view.
 * Extracted from Profile component for better separation of concerns.
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
  className = ''
}) => {
  const handleSortOrderToggle = () => {
    setSortOrder(sortOrder === FILTER_OPTIONS.ORDER.ASC ? FILTER_OPTIONS.ORDER.DESC : FILTER_OPTIONS.ORDER.ASC);
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <h3 className={styles.sectionTitle}>Filters & Sorting</h3>
      
      <div className={styles.filtersGrid}>
        {/* * Status Filter */}
        <div className={styles.filterGroup}>
          <label htmlFor="status-filter" className={styles.filterLabel}>
            Status
          </label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value={FILTER_OPTIONS.STATUS.ALL}>All Names</option>
            <option value={FILTER_OPTIONS.STATUS.ACTIVE}>Active Only</option>
            <option value={FILTER_OPTIONS.STATUS.HIDDEN}>Hidden Only</option>
          </select>
        </div>

        {/* * User Filter */}
        <div className={styles.filterGroup}>
          <label htmlFor="user-filter" className={styles.filterLabel}>
            User
          </label>
          <select
            id="user-filter"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value={FILTER_OPTIONS.USER.ALL}>All Users</option>
            <option value={FILTER_OPTIONS.USER.CURRENT}>Current User</option>
            {isAdmin && (
              <option value={FILTER_OPTIONS.USER.OTHER}>Other Users</option>
            )}
          </select>
        </div>

        {/* * Sort By */}
        <div className={styles.filterGroup}>
          <label htmlFor="sort-by" className={styles.filterLabel}>
            Sort By
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.filterSelect}
          >
            <option value={FILTER_OPTIONS.SORT.RATING}>Rating</option>
            <option value={FILTER_OPTIONS.SORT.NAME}>Name</option>
            <option value={FILTER_OPTIONS.SORT.WINS}>Wins</option>
            <option value={FILTER_OPTIONS.SORT.LOSSES}>Losses</option>
            <option value={FILTER_OPTIONS.SORT.WIN_RATE}>Win Rate</option>
            <option value={FILTER_OPTIONS.SORT.CREATED}>Created Date</option>
          </select>
        </div>

        {/* * Sort Order Toggle */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            Order
          </label>
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
              {sortOrder === FILTER_OPTIONS.ORDER.ASC ? 'Ascending' : 'Descending'}
            </span>
          </button>
        </div>
      </div>

      {/* * Active Filters Display */}
      <div className={styles.activeFilters}>
        <span className={styles.activeFilterLabel}>Active Filters:</span>
        <span className={styles.activeFilter}>
          Status: {filterStatus === FILTER_OPTIONS.STATUS.ALL ? 'All' : filterStatus}
        </span>
        <span className={styles.activeFilter}>
          User: {userFilter === FILTER_OPTIONS.USER.ALL ? 'All' : userFilter}
        </span>
        <span className={styles.activeFilter}>
          Sort: {sortBy} ({sortOrder})
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
  className: PropTypes.string
};

export default ProfileFilters;
