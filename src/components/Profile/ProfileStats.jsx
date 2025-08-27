import React from 'react';
import PropTypes from 'prop-types';
import StatsCard from '../StatsCard/StatsCard';
import styles from './ProfileStats.module.css';

/**
 * @module ProfileStats
 * @description Displays user statistics and analytics in a card-based layout.
 * Extracted from Profile component for better separation of concerns.
 */

const ProfileStats = ({
  stats,
  isLoading = false,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.loadingGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={styles.loadingCard}>
              <div className={styles.loadingBar} />
              <div className={styles.loadingText} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`${styles.container} ${className}`}>
        <p className={styles.noStats}>No statistics available</p>
      </div>
    );
  }

  const {
    total,
    wins,
    losses,
    winRate,
    avgRating,
    ratingSpread,
    totalMatches,
    activeNames,
    popularNames
  } = stats;

  return (
    <div className={`${styles.container} ${className}`}>
      <h2 className={styles.sectionTitle}>Your Statistics</h2>

      <div className={styles.statsGrid}>
        <StatsCard
          title="Total Names"
          value={total}
          subtitle="Names in your collection"
          icon="📊"
          variant="primary"
        />

        <StatsCard
          title="Win Rate"
          value={`${winRate}%`}
          subtitle={`${wins} wins, ${losses} losses`}
          icon="🏆"
          variant="success"
        />

        <StatsCard
          title="Average Rating"
          value={avgRating}
          subtitle="Your average name rating"
          icon="⭐"
          variant="warning"
        />

        <StatsCard
          title="Rating Spread"
          value={ratingSpread}
          subtitle="Range of your ratings"
          icon="📈"
          variant="info"
        />

        <StatsCard
          title="Total Matches"
          value={totalMatches}
          subtitle="Tournament matches played"
          icon="🎯"
          variant="secondary"
        />

        <StatsCard
          title="Active Names"
          value={activeNames}
          subtitle="Names currently visible"
          icon="👁️"
          variant="default"
        />

        {popularNames > 0 && (
          <StatsCard
            title="Popular Names"
            value={popularNames}
            subtitle="High popularity names"
            icon="🔥"
            variant="danger"
          />
        )}
      </div>
    </div>
  );
};

ProfileStats.propTypes = {
  stats: PropTypes.shape({
    total: PropTypes.number,
    wins: PropTypes.number,
    losses: PropTypes.number,
    winRate: PropTypes.number,
    avgRating: PropTypes.number,
    ratingSpread: PropTypes.number,
    totalMatches: PropTypes.number,
    activeNames: PropTypes.number,
    popularNames: PropTypes.number
  }),
  isLoading: PropTypes.bool,
  className: PropTypes.string
};

export default ProfileStats;
