/**
 * @module SimpleCatName
 * @description Simplified cat name component using straightforward mapping approach.
 * Replaces the complex parsing logic with a clean, maintainable solution.
 */

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from '../WelcomeScreen.module.css';

/**
 * Simple cat name component using straightforward mapping
 * @param {Object} props - Component props
 * @param {string} props.catName - The cat's name
 * @param {Array} props.nameStats - Array of name statistics
 * @param {Function} props.onNameHover - Name hover callback
 * @param {Function} props.onNameLeave - Name leave callback
 * @returns {JSX.Element} Simple cat name display
 */
const SimpleCatName = ({ catName, nameStats, onNameHover, onNameLeave }) => {
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

    // Add subtle haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  }, [onNameHover]);

  const handleNameLeave = useCallback(() => {
    setHoveredName(null);
    onNameLeave?.();
  }, [onNameLeave]);

  // Handle touch events for mobile
  const handleNameTouchStart = useCallback((nameData, event) => {
    event.preventDefault();
    const position = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
    setHoveredName(nameData);
    onNameHover?.(nameData, position);

    // Enhanced haptic feedback for touch
    if (navigator.vibrate) {
      navigator.vibrate([40, 30, 40]);
    }

    // Enhanced visual feedback
    event.target.style.transform = 'scale(0.94)';
    event.target.style.transition = 'transform 0.1s ease-out';
  }, [onNameHover]);

  const handleNameTouchEnd = useCallback((event) => {
    event.preventDefault();
    // Reset visual feedback with smooth transition
    event.target.style.transform = 'scale(1)';
    event.target.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';

    // Delay hiding to allow user to see the tooltip
    setTimeout(() => {
      setHoveredName(null);
      onNameLeave?.();
    }, 4000);
  }, [onNameLeave]);

  const handleNameTouchCancel = useCallback((event) => {
    event.preventDefault();
    // Reset visual feedback with smooth transition
    event.target.style.transform = 'scale(1)';
    event.target.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
    setHoveredName(null);
    onNameLeave?.();
  }, [onNameLeave]);

  // Simple fallback for loading or error states
  if (!catName || catName === 'Loading...' || !nameStats || nameStats.length === 0) {
    return (
      <div className={styles.catNameContainer}>
        <span
          className={styles.catNameText}
          role="text"
          aria-label={catName === 'Loading...' ? 'Loading cat name' : `Cat name: ${catName}`}
        >
          {catName || 'Loading...'}
        </span>
      </div>
    );
  }

  // Handle error state
  if (catName === 'Mystery Cat') {
    return (
      <div className={styles.catNameContainer}>
        <span
          className={styles.catNameText}
          role="text"
          aria-label="Cat name: Mystery Cat"
        >
          {catName}
        </span>
      </div>
    );
  }

  // NEW APPROACH: Use straightforward mapping instead of complex parsing
  // Find names that are part of the cat name
  const matchedNames = nameStats.filter(stat => 
    catName.toLowerCase().includes(stat.name.toLowerCase())
  );

  // If no matches found, display the name as-is
  if (matchedNames.length === 0) {
    return (
      <div className={styles.catNameContainer}>
        <span
          className={styles.catNameText}
          role="text"
          aria-label={`Cat name: ${catName}`}
        >
          {catName}
        </span>
      </div>
    );
  }

  // Sort by rating (highest first) for better visual hierarchy
  const sortedNames = [...matchedNames].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  return (
    <div className={styles.catNameContainer}>
      <div className={styles.catNameText}>
        {/* Display the full cat name with interactive highlights */}
        {sortedNames.map((nameData, index) => {
          const isHighlighted = catName.toLowerCase().includes(nameData.name.toLowerCase());
          
          if (!isHighlighted) return null;

          return (
            <span
              key={`name-${nameData.id || index}`}
              className={`${styles.catNameText} ${styles.interactiveName}`}
              data-long-name={nameData.name.length > 12 ? 'true' : 'false'}
              onMouseEnter={(e) => handleNameHover(nameData, e)}
              onMouseLeave={handleNameLeave}
              onTouchStart={(e) => handleNameTouchStart(nameData, e)}
              onTouchEnd={handleNameTouchEnd}
              onTouchCancel={handleNameTouchCancel}
              title={`Tap to see stats for ${nameData.name}`}
              aria-label={`Interactive name: ${nameData.name}. Rating: ${nameData.rating || 0}, Win rate: ${nameData.winRate || 0}%. Tap to view detailed statistics.`}
              role="button"
              tabIndex={0}
              style={{
                minHeight: '44px',
                minWidth: '48px',
                touchAction: 'manipulation'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleNameHover(nameData, e);
                }
              }}
            >
              {nameData.name}
            </span>
          );
        })}
        
        {/* If no names were highlighted, show the original name */}
        {sortedNames.length === 0 && (
          <span className={styles.catNameText}>
            {catName}
          </span>
        )}
      </div>
    </div>
  );
};

SimpleCatName.displayName = 'SimpleCatName';

SimpleCatName.propTypes = {
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

export default SimpleCatName;