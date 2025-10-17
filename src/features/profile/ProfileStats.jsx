import React from 'react';
import PropTypes from 'prop-types';
import StatsCard from '../../shared/components/StatsCard/StatsCard';
import styles from './ProfileStats.module.css';

const STAT_CARD_SECTIONS = {
  base: [
    {
      key: 'total',
      title: 'Total Names',
      emoji: '📊',
      variant: 'primary',
      getValue: ({ total = 0 }) => total
    },
    {
      key: 'winRate',
      title: 'Win Rate',
      emoji: '🏆',
      variant: 'success',
      getValue: ({ winRate = 0 }) => `${winRate}%`
    },
    {
      key: 'avgRating',
      title: 'Average Rating',
      emoji: '⭐',
      variant: 'warning',
      getValue: ({ avgRating = 0 }) => avgRating
    },
    {
      key: 'ratingSpread',
      title: 'Rating Spread',
      emoji: '📈',
      variant: 'info',
      getValue: ({ ratingSpread = 0 }) => ratingSpread
    },
    {
      key: 'totalMatches',
      title: 'Total Matches',
      emoji: '🎯',
      variant: 'secondary',
      getValue: ({ totalMatches = 0 }) => totalMatches
    },
    {
      key: 'activeNames',
      title: 'Active Names',
      emoji: '👁️',
      variant: 'default',
      getValue: ({ activeNames = 0 }) => activeNames
    },
    {
      key: 'popularNames',
      title: 'Popular Names',
      emoji: '🔥',
      variant: 'danger',
      getValue: ({ popularNames = 0 }) => popularNames,
      isVisible: ({ popularNames = 0 }) => popularNames > 0
    }
  ],
  selection: [
    {
      key: 'totalSelections',
      title: 'Tournament Selections',
      emoji: '🎲',
      variant: 'primary',
      getValue: ({ totalSelections = 0 }) => totalSelections
    },
    {
      key: 'totalTournaments',
      title: 'Tournaments Created',
      emoji: '🏁',
      variant: 'success',
      getValue: ({ totalTournaments = 0 }) => totalTournaments
    },
    {
      key: 'avgSelectionsPerName',
      title: 'Selection Frequency',
      emoji: '📊',
      variant: 'warning',
      getValue: ({ avgSelectionsPerName = 0 }) => avgSelectionsPerName
    },
    {
      key: 'mostSelectedName',
      title: 'Most Selected',
      emoji: '❤️',
      variant: 'danger',
      getValue: ({ mostSelectedName = 'N/A' }) => mostSelectedName
    },
    {
      key: 'currentStreak',
      title: 'Selection Streak',
      emoji: '🔥',
      variant: 'info',
      getValue: ({ currentStreak = 0 }) => currentStreak
    },
    {
      key: 'userRank',
      title: 'Selection Rank',
      emoji: '🏅',
      variant: 'secondary',
      getValue: ({ userRank }) => (userRank ? `#${userRank}` : '#N/A')
    }
  ]
};

const SELECTION_INSIGHT_DEFINITIONS = [
  {
    key: 'selectionPattern',
    icon: '📅',
    title: 'Selection Pattern',
    fallback: 'Analyzing your patterns...'
  },
  {
    key: 'preferredCategories',
    icon: '🎯',
    title: 'Preferred Categories',
    fallback: 'Discovering your preferences...'
  },
  {
    key: 'improvementTip',
    icon: '🚀',
    title: 'Improvement Tip',
    fallback: 'Optimizing your selections...'
  }
];

const buildStatCards = (data, definitions = []) => {
  if (!data) return [];

  return definitions
    .filter(({ isVisible }) => (isVisible ? isVisible(data) : true))
    .map(({ key, title, emoji, variant, getValue }) => ({
      key,
      title,
      emoji,
      variant,
      value: typeof getValue === 'function' ? getValue(data) : data[key]
    }));
};

const buildSelectionInsights = (insights) => {
  if (!insights) return [];

  return SELECTION_INSIGHT_DEFINITIONS.map(
    ({ key, icon, title, fallback }) => ({
      key,
      icon,
      title,
      content: insights[key] || fallback
    })
  );
};

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

  const baseStatCards = buildStatCards(stats, STAT_CARD_SECTIONS.base);
  const selectionStatCards = buildStatCards(
    selectionStats,
    STAT_CARD_SECTIONS.selection
  );
  const selectionInsights = buildSelectionInsights(selectionStats?.insights);

  return (
    <div className={`${styles.container} ${className}`}>
      <h2 className={styles.sectionTitle}>Your Statistics</h2>

      <div className={styles.statsGrid}>
        {baseStatCards.map(({ key, ...cardProps }) => (
          <StatsCard key={key} {...cardProps} />
        ))}

        {/* Selection Analytics Section */}
        {selectionStatCards.map(({ key, ...cardProps }) => (
          <StatsCard key={key} {...cardProps} />
        ))}
      </div>

      {/* Selection Insights Section */}
      {selectionInsights.length > 0 && (
        <div className={styles.insightsSection}>
          <h3 className={styles.insightsTitle}>Selection Insights</h3>
          <div className={styles.insightsGrid}>
            {selectionInsights.map(({ key, icon, title, content }) => (
              <div key={key} className={styles.insightCard}>
                <span className={styles.insightIcon}>{icon}</span>
                <div className={styles.insightContent}>
                  <h4>{title}</h4>
                  <p>{content}</p>
                </div>
              </div>
            ))}
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
