import React from 'react';
import styles from './SkeletonLoader.module.css';

/**
 * Skeleton loader component for better loading states
 * Provides visual placeholders while content is loading
 */

export const SkeletonLoader = ({ type = 'default', lines = 3, className = '' }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return (
          <div className={`${styles.skeletonText} ${className}`}>
            {Array.from({ length: lines }).map((_, index) => (
              <div
                key={index}
                className={styles.skeletonLine}
                style={{
                  width: `${Math.random() * 40 + 60}%`,
                  animationDelay: `${index * 0.1}s`
                }}
              />
            ))}
          </div>
        );

      case 'card':
        return (
          <div className={`${styles.skeletonCard} ${className}`}>
            <div className={styles.skeletonHeader} />
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonLine} style={{ width: '80%' }} />
              <div className={styles.skeletonLine} style={{ width: '60%' }} />
              <div className={styles.skeletonLine} style={{ width: '70%' }} />
            </div>
            <div className={styles.skeletonFooter}>
              <div className={styles.skeletonButton} />
              <div className={styles.skeletonButton} />
            </div>
          </div>
        );

      case 'table':
        return (
          <div className={`${styles.skeletonTable} ${className}`}>
            <div className={styles.skeletonTableHeader}>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={styles.skeletonTableHeaderCell} />
              ))}
            </div>
            {Array.from({ length: lines }).map((_, rowIndex) => (
              <div key={rowIndex} className={styles.skeletonTableRow}>
                {Array.from({ length: 4 }).map((_, cellIndex) => (
                  <div key={cellIndex} className={styles.skeletonTableCell} />
                ))}
              </div>
            ))}
          </div>
        );

      case 'profile':
        return (
          <div className={`${styles.skeletonProfile} ${className}`}>
            <div className={styles.skeletonAvatar} />
            <div className={styles.skeletonProfileInfo}>
              <div className={styles.skeletonName} />
              <div className={styles.skeletonStats}>
                <div className={styles.skeletonStat} />
                <div className={styles.skeletonStat} />
                <div className={styles.skeletonStat} />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className={`${styles.skeletonDefault} ${className}`}>
            <div className={styles.skeletonSpinner} />
            <div className={styles.skeletonText}>Loading...</div>
          </div>
        );
    }
  };

  return renderSkeleton();
};

/**
 * Skeleton loader for tournament brackets
 */
export const TournamentSkeleton = ({ size = 8 }) => {
  const rounds = Math.log2(size);

  return (
    <div className={styles.tournamentSkeleton}>
      {Array.from({ length: rounds }).map((_, roundIndex) => (
        <div key={roundIndex} className={styles.tournamentRound}>
          <h3 className={styles.roundTitle}>Round {roundIndex + 1}</h3>
          {Array.from({ length: Math.pow(2, rounds - roundIndex - 1) }).map((_, matchIndex) => (
            <div key={matchIndex} className={styles.skeletonMatch}>
              <div className={styles.skeletonTeam} />
              <div className={styles.skeletonTeam} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton loader for name cards
 */
export const NameCardSkeleton = ({ count = 6 }) => {
  return (
    <div className={styles.nameCardSkeletonGrid}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeletonNameCard}>
          <div className={styles.skeletonName} />
          <div className={styles.skeletonDescription} />
          <div className={styles.skeletonRating} />
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
