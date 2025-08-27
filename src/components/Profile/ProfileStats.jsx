import React from 'react';
import PropTypes from 'prop-types';
import StatsCard from '../StatsCard/StatsCard';
import styles from './ProfileStats.module.css';

/**
 * @module ProfileStats
 * @description Displays user statistics and analytics in a card-based layout.
 * Now includes selection analytics and tournament insights.
 */

const ProfileStats = ({
  stats,
  selectionStats,
  isLoading = false,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.loadingGrid}>
          {Array.from({ length: 8 }).map((_, index) => (
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

        {/* Selection Analytics Section */}
        {selectionStats && (
          <>
            <StatsCard
              title="Tournament Selections"
              value={selectionStats.totalSelections || 0}
              subtitle="Names selected for tournaments"
              icon="🎲"
              variant="primary"
            />

            <StatsCard
              title="Tournaments Created"
              value={selectionStats.totalTournaments || 0}
              subtitle="Tournaments you've started"
              icon="🏁"
              variant="success"
            />

            <StatsCard
              title="Selection Frequency"
              value={selectionStats.avgSelectionsPerName || 0}
              subtitle="Avg selections per name"
              icon="📊"
              variant="warning"
            />

            <StatsCard
              title="Most Selected"
              value={selectionStats.mostSelectedName || 'N/A'}
              subtitle="Your favorite name"
              icon="❤️"
              variant="danger"
            />

            <StatsCard
              title="Selection Streak"
              value={selectionStats.currentStreak || 0}
              subtitle="Consecutive days selecting"
              icon="🔥"
              variant="info"
            />

            <StatsCard
              title="Selection Rank"
              value={`#${selectionStats.userRank || 'N/A'}`}
              subtitle="Your ranking among users"
              icon="🏅"
              variant="secondary"
            />
          </>
        )}
      </div>

      {/* Selection Insights Section */}
      {selectionStats && selectionStats.insights && (
        <div className={styles.insightsSection}>
          <h3 className={styles.insightsTitle}>Selection Insights</h3>
          <div className={styles.insightsGrid}>
            <div className={styles.insightCard}>
              <span className={styles.insightIcon}>📅</span>
              <div className={styles.insightContent}>
                <h4>Selection Pattern</h4>
                <p>
                  {selectionStats.insights.selectionPattern ||
                    'Analyzing your patterns...'}
                </p>
              </div>
            </div>

            <div className={styles.insightCard}>
              <span className={styles.insightIcon}>🎯</span>
              <div className={styles.insightContent}>
                <h4>Preferred Categories</h4>
                <p>
                  {selectionStats.insights.preferredCategories ||
                    'Discovering your preferences...'}
                </p>
              </div>
            </div>

            <div className={styles.insightCard}>
              <span className={styles.insightIcon}>🚀</span>
              <div className={styles.insightContent}>
                <h4>Improvement Tip</h4>
                <p>
                  {selectionStats.insights.improvementTip ||
                    'Optimizing your selections...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
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
  selectionStats: PropTypes.shape({
    totalSelections: PropTypes.number,
    totalTournaments: PropTypes.number,
    avgSelectionsPerName: PropTypes.number,
    mostSelectedName: PropTypes.string,
    currentStreak: PropTypes.number,
    userRank: PropTypes.number,
    insights: PropTypes.shape({
      selectionPattern: PropTypes.string,
      preferredCategories: PropTypes.string,
      improvementTip: PropTypes.string
    })
  }),
  isLoading: PropTypes.bool,
  className: PropTypes.string
};

export default ProfileStats;
