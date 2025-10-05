/**
 * @module GridCatName
 * @description Grid-based cat name display using straightforward mapping approach.
 * Similar to profile page but adapted for welcome screen with celebration styling.
 */

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import NameCard from '../../../NameCard/NameCard';
import styles from '../WelcomeScreen.module.css';

/**
 * Grid-based cat name component using straightforward mapping
 * @param {Object} props - Component props
 * @param {string} props.catName - The cat's name
 * @param {Array} props.nameStats - Array of name statistics
 * @param {Function} props.onNameHover - Name hover callback
 * @param {Function} props.onNameLeave - Name leave callback
 * @returns {JSX.Element} Grid-based cat name display
 */
const GridCatName = ({ catName, nameStats, onNameHover, onNameLeave }) => {
  const [hoveredName, setHoveredName] = useState(null);

  // Handle name hover events
  const handleNameHover = useCallback((nameData, event) => {
    const rect = event.target.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    };
    setHoveredName(nameData);
    onNameHover?.(nameData, position);
  }, [onNameHover]);

  const handleNameLeave = useCallback(() => {
    setHoveredName(null);
    onNameLeave?.();
  }, [onNameLeave]);

  // Simple fallback for loading or error states
  if (!catName || catName === 'Loading...' || !nameStats || nameStats.length === 0) {
    return (
      <div className={styles.catNameContainer}>
        <div className={styles.welcomeGrid}>
          <div className={styles.welcomeCard}>
            <h2 className={styles.catNameText}>
              {catName || 'Loading...'}
            </h2>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (catName === 'Mystery Cat') {
    return (
      <div className={styles.catNameContainer}>
        <div className={styles.welcomeGrid}>
          <div className={styles.welcomeCard}>
            <h2 className={styles.catNameText}>
              {catName}
            </h2>
          </div>
        </div>
      </div>
    );
  }

  // NEW APPROACH: Use straightforward mapping with grid layout
  // Find names that are part of the cat name
  const matchedNames = nameStats.filter(stat => 
    catName.toLowerCase().includes(stat.name.toLowerCase())
  );

  // If no matches found, display the name as a single card
  if (matchedNames.length === 0) {
    return (
      <div className={styles.catNameContainer}>
        <div className={styles.welcomeGrid}>
          <div className={styles.welcomeCard}>
            <h2 className={styles.catNameText}>
              {catName}
            </h2>
            <p className={styles.catNameSubtext}>
              Your tournament-generated name
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Sort by rating (highest first) for better visual hierarchy
  const sortedNames = [...matchedNames].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  // Limit to top 6 names for better visual balance
  const displayNames = sortedNames.slice(0, 6);

  return (
    <div className={styles.catNameContainer}>
      <div className={styles.welcomeGrid}>
        {displayNames.map((nameData, index) => (
          <div
            key={`name-${nameData.id || index}`}
            className={styles.welcomeNameCard}
            onMouseEnter={(e) => handleNameHover(nameData, e)}
            onMouseLeave={handleNameLeave}
            style={{
              animationDelay: `${index * 0.1}s` // Staggered animation
            }}
          >
            <NameCard
              name={nameData.name}
              description={nameData.description || `Rating: ${nameData.rating || 0}`}
              size="small"
              metadata={{
                rating: nameData.rating || 0,
                popularity: nameData.popularity_score,
                tournaments: nameData.total_tournaments,
                categories: nameData.categories,
                winRate: nameData.winRate || 0,
                totalMatches: nameData.totalMatches || 0
              }}
              className={styles.welcomeNameCardContent}
              disabled={false}
            />
          </div>
        ))}
        
        {/* Show the full cat name as a special card */}
        <div className={`${styles.welcomeNameCard} ${styles.fullNameCard}`}>
          <div className={styles.fullNameContent}>
            <h2 className={styles.catNameText}>
              {catName}
            </h2>
            <p className={styles.catNameSubtext}>
              Your complete tournament name
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

GridCatName.displayName = 'GridCatName';

GridCatName.propTypes = {
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
  onNameHover: PropTypes.func,
  onNameLeave: PropTypes.func
};

export default GridCatName;