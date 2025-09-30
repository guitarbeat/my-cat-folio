/**
 * @module WelcomeCard
 * @description Welcome card component containing the cat name and action button.
 * Provides the main content area with interactive elements.
 */

import React from 'react';
import PropTypes from 'prop-types';
import InteractiveCatName from './InteractiveCatName';
import styles from '../WelcomeScreen.module.css';

/**
 * Welcome card component
 * @param {Object} props - Component props
 * @param {string} props.catName - The cat's name
 * @param {Array} props.nameStats - Array of name statistics
 * @param {Function} props.onContinue - Continue button callback
 * @param {Function} props.onNameHover - Name hover callback
 * @param {Function} props.onNameLeave - Name leave callback
 * @returns {JSX.Element} Welcome card
 */
const WelcomeCard = ({ 
  catName, 
  nameStats, 
  onContinue, 
  onNameHover, 
  onNameLeave 
}) => {
  return (
    <div className={styles.rotatedCard}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <span className={styles.headerText}>Hello! My name is</span>
      </div>
      
      {/* Cat Name - Most Prominent */}
      <div className={styles.catNameSection}>
        <InteractiveCatName
          catName={catName}
          nameStats={nameStats}
          onNameHover={onNameHover}
          onNameLeave={onNameLeave}
        />
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
  catName: PropTypes.string.isRequired,
  nameStats: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      rating: PropTypes.number.isRequired,
      wins: PropTypes.number.isRequired,
      losses: PropTypes.number.isRequired,
      totalMatches: PropTypes.number.isRequired,
      winRate: PropTypes.number.isRequired,
      rank: PropTypes.number.isRequired,
      categories: PropTypes.arrayOf(PropTypes.string)
    })
  ),
  onContinue: PropTypes.func.isRequired,
  onNameHover: PropTypes.func,
  onNameLeave: PropTypes.func
};

export default WelcomeCard;