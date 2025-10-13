/**
 * @module WelcomeCard
 * @description Simplified welcome card component with clean, maintainable code.
 */

import React from 'react';
import PropTypes from 'prop-types';
import NameCard from '../../NameCard/NameCard';
import { SkeletonLoader } from '../../LoadingSpinner';
import styles from '../WelcomeScreen.module.css';
const WelcomeCard = ({
  activeNames = [],
  namesLoading = false,
  namesError = null,
  onContinue,
  onNameHover,
  onNameLeave
}) => {
  return (
    <div className={styles.rotatedCard}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <span className={styles.headerText}>Aaron&apos;s Top Cat Names</span>
      </div>

      {/* Active Names Display */}
      <div className={styles.catNameSection}>
        {namesLoading ? (
          <div className={styles.loadingContainer}>
            <SkeletonLoader height={60} />
            <SkeletonLoader height={60} />
            <SkeletonLoader height={60} />
          </div>
        ) : namesError ? (
          <div className={styles.errorContainer}>
            <h3>Unable to load Aaron&apos;s top names</h3>
            <p>Please try again later</p>
          </div>
        ) : activeNames.length === 0 ? (
          <div className={styles.emptyContainer}>
            <h3>No top names available</h3>
            <p>Check back later for Aaron&apos;s top rated names!</p>
          </div>
        ) : (
          <div className={styles.namesGrid}>
            {activeNames.slice(0, 6).map((name) => (
              <div
                key={name.id}
                className={styles.nameCardWrapper}
                onMouseEnter={(e) => onNameHover?.(name, e)}
                onMouseLeave={onNameLeave}
              >
                <NameCard
                  name={name.name}
                  description={name.description || `Aaron's Rating: ${name.user_rating || 0}`}
                  size="small"
                  metadata={{
                    rating: name.user_rating || 0,
                    popularity: name.popularity_score,
                    tournaments: name.total_tournaments,
                    categories: name.categories,
                    winRate: name.user_wins && name.user_losses
                      ? Math.round((name.user_wins / (name.user_wins + name.user_losses)) * 100)
                      : 0,
                    totalMatches: (name.user_wins || 0) + (name.user_losses || 0)
                  }}
                  className={styles.welcomeNameCard}
                  disabled={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.cardFooter}>
        <button
          className={styles.footerButton}
          onClick={onContinue}
          type="button"
          aria-label="Discover the magic behind my name"
        >
          <span className={styles.footerButtonText}>Discover the magic behind my name!</span>
          <span className={styles.footerButtonEmoji} aria-hidden="true">
            ✨
          </span>
        </button>
      </div>
    </div>
  );
};

WelcomeCard.displayName = 'WelcomeCard';

WelcomeCard.propTypes = {
  activeNames: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      avg_rating: PropTypes.number,
      popularity_score: PropTypes.number,
      total_tournaments: PropTypes.number,
      categories: PropTypes.arrayOf(PropTypes.string)
    })
  ),
  namesLoading: PropTypes.bool,
  namesError: PropTypes.instanceOf(Error),
  onContinue: PropTypes.func.isRequired,
  onNameHover: PropTypes.func,
  onNameLeave: PropTypes.func
};

export default WelcomeCard;
