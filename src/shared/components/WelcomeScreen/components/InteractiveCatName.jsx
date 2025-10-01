/**
 * @module InteractiveCatName
 * @description Interactive cat name component with hover effects and statistics tooltips.
 * Handles name parsing, interactive elements, and user interactions.
 */

import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from '../WelcomeScreen.module.css';

/**
 * Interactive cat name component
 * @param {Object} props - Component props
 * @param {string} props.catName - The cat's name
 * @param {Array} props.nameStats - Array of name statistics
 * @param {Function} props.onNameHover - Name hover callback
 * @param {Function} props.onNameLeave - Name leave callback
 * @returns {JSX.Element} Interactive cat name
 */
const InteractiveCatName = ({ catName, nameStats, onNameHover, onNameLeave }) => {
  const [, setHoveredName] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const nameRefs = useRef({});

  // Handle mouse events for interactive names
  const handleNameMouseEnter = useCallback((nameData, event) => {
    const rect = event.target.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setHoveredName(nameData);
    onNameHover?.(nameData, tooltipPosition);

    // Add subtle haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  }, [onNameHover, tooltipPosition]);

  const handleNameMouseLeave = useCallback(() => {
    setHoveredName(null);
    onNameLeave?.();
  }, [onNameLeave]);

  // Enhanced touch events for mobile
  const handleNameTouchStart = useCallback((nameData, event) => {
    event.preventDefault();
    setTooltipPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });
    setHoveredName(nameData);
    onNameHover?.(nameData, tooltipPosition);

    // Enhanced haptic feedback for touch
    if (navigator.vibrate) {
      navigator.vibrate([40, 30, 40]);
    }

    // Enhanced visual feedback
    event.target.style.transform = 'scale(0.94)';
    event.target.style.transition = 'transform 0.1s ease-out';
  }, [onNameHover, tooltipPosition]);

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

  // Create individual name components from the cat name
  const createInteractiveNames = useCallback(() => {
    if (!catName || catName === 'Loading...' || nameStats.length === 0) {
      return (
        <span
          className={styles.catNameText}
          role="text"
          aria-label="Loading cat name"
        >
          {catName || 'Loading...'}
        </span>
      );
    }

    // Handle error state
    if (catName === 'Mystery Cat' || !nameStats || nameStats.length === 0) {
      return (
        <span
          className={styles.catNameText}
          role="text"
          aria-label="Cat name: Mystery Cat"
        >
          {catName}
        </span>
      );
    }

    // Find all matches in the original name without modifying it
    const matchedNames = [];

    // Remove duplicate names from nameStats (in case there are duplicates in the data)
    const uniqueNameStats = nameStats.reduce((acc, stat) => {
      const existing = acc.find(item => item.name === stat.name);
      if (!existing) {
        acc.push(stat);
      } else if (stat.rating > existing.rating) {
        // Keep the one with higher rating
        const index = acc.indexOf(existing);
        acc[index] = stat;
      }
      return acc;
    }, []);

    const sortedStats = [...uniqueNameStats].sort((a, b) => b.rating - a.rating);

    // Find all occurrences of each name in the cat name
    for (const stat of sortedStats) {
      let searchIndex = 0;
      while (searchIndex < catName.length) {
        const index = catName.indexOf(stat.name, searchIndex);
        if (index === -1) break;

        // Only add if this exact match doesn't already exist
        const isDuplicate = matchedNames.some(existing =>
          existing.name === stat.name &&
          existing.startIndex === index &&
          existing.endIndex === index + stat.name.length
        );

        if (!isDuplicate) {
          matchedNames.push({
            ...stat,
            startIndex: index,
            endIndex: index + stat.name.length
          });
        }

        // Move past the entire match to avoid finding overlapping substrings
        searchIndex = index + stat.name.length;
      }
    }

    // Remove overlapping matches (keep the one with higher rating)
    matchedNames.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return a.startIndex - b.startIndex;
    });

    const filteredMatches = [];
    for (const match of matchedNames) {
      const hasOverlap = filteredMatches.some(
        (existing) =>
          match.startIndex < existing.endIndex &&
          match.endIndex > existing.startIndex
      );
      if (!hasOverlap) {
        filteredMatches.push(match);
      }
    }

    // Sort by position in the original name
    filteredMatches.sort((a, b) => a.startIndex - b.startIndex);

    const nameComponents = [];
    let lastIndex = 0;

    filteredMatches.forEach((nameData, index) => {
      // Add any text before this name
      if (nameData.startIndex > lastIndex) {
        const beforeText = catName.substring(lastIndex, nameData.startIndex);
        nameComponents.push(
          <span key={`text-${index}`} className={styles.catNameText}>
            {beforeText}
          </span>
        );
      }

      // Add the interactive name
      nameComponents.push(
        <span
          key={`name-${index}`}
          ref={(el) => {
            if (el) nameRefs.current[nameData.name] = el;
          }}
          className={`${styles.catNameText} ${styles.interactiveName}`}
          data-long-name={nameData.name.length > 12 ? 'true' : 'false'}
          onMouseEnter={(e) => handleNameMouseEnter(nameData, e)}
          onMouseLeave={handleNameMouseLeave}
          onTouchStart={(e) => handleNameTouchStart(nameData, e)}
          onTouchEnd={handleNameTouchEnd}
          onTouchCancel={handleNameTouchCancel}
          title={`Tap to see stats for ${nameData.name}`}
          aria-label={`Interactive name: ${nameData.name}. Rating: ${nameData.rating}, Win rate: ${nameData.winRate}%. Tap to view detailed statistics.`}
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
              handleNameMouseEnter(nameData, e);
            }
          }}
        >
          {nameData.name}
        </span>
      );

      lastIndex = nameData.endIndex;
    });

    // Add any remaining text
    if (lastIndex < catName.length) {
      const remainingText = catName.substring(lastIndex);
      nameComponents.push(
        <span key="text-end" className={styles.catNameText}>
          {remainingText}
        </span>
      );
    }

    return nameComponents.length > 0 ? (
      nameComponents
    ) : (
      <span className={styles.catNameText}>{catName}</span>
    );
  }, [
    catName,
    nameStats,
    handleNameMouseEnter,
    handleNameMouseLeave,
    handleNameTouchStart,
    handleNameTouchEnd,
    handleNameTouchCancel
  ]);

  return (
    <div className={styles.catNameContainer}>
      {createInteractiveNames()}
    </div>
  );
};

InteractiveCatName.displayName = 'InteractiveCatName';

InteractiveCatName.propTypes = {
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

export default InteractiveCatName;
