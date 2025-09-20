/**
 * @module WelcomeScreen
 * @description Pre-welcome screen that displays the cat's name based on tournament rankings.
 */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { NameStatsTooltip } from '../index';
import styles from './WelcomeScreen.module.css';

function WelcomeScreen({ onContinue, catName, nameStats = [], isTransitioning = false }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [hoveredName, setHoveredName] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const nameRefs = useRef({});

  // Add welcome-page class to body and html when component mounts
  useEffect(() => {
    document.body.classList.add('welcome-page');
    document.documentElement.classList.add('welcome-page');

    // Animate in after a brief delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Remove class when component unmounts
    return () => {
      document.body.classList.remove('welcome-page');
      document.documentElement.classList.remove('welcome-page');
      clearTimeout(timer);
    };
  }, []);

  const handleContinue = () => {
    setIsAnimating(true);
    setShowProgress(true);
    // Add a small delay for the animation before continuing
    setTimeout(() => {
      onContinue();
    }, 500);
  };

  // Handle mouse events for interactive names
  const handleNameMouseEnter = (nameData, event) => {
    const rect = event.target.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setHoveredName(nameData);
  };

  const handleNameMouseLeave = () => {
    setHoveredName(null);
  };

  // Create individual name components from the cat name
  const createInteractiveNames = () => {
    if (!catName || catName === 'Loading...' || nameStats.length === 0) {
      return <span className={styles.catNameText}>{catName || 'Loading...'}</span>;
    }

    // Find matching names in the stats
    const matchedNames = [];
    let remainingName = catName;
    
    // Sort stats by rating (highest first) to prioritize top names
    const sortedStats = [...nameStats].sort((a, b) => b.rating - a.rating);
    
    for (const stat of sortedStats) {
      if (remainingName.includes(stat.name)) {
        const index = remainingName.indexOf(stat.name);
        if (index !== -1) {
          matchedNames.push({
            ...stat,
            startIndex: index,
            endIndex: index + stat.name.length
          });
          // Remove the matched name to avoid duplicates
          remainingName = remainingName.replace(stat.name, '');
        }
      }
    }

    // Sort by position in the original name
    matchedNames.sort((a, b) => a.startIndex - b.startIndex);

    const nameComponents = [];
    let lastIndex = 0;

    matchedNames.forEach((nameData, index) => {
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
          onMouseEnter={(e) => handleNameMouseEnter(nameData, e)}
          onMouseLeave={handleNameMouseLeave}
          title={`Hover to see stats for ${nameData.name}`}
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

    return nameComponents.length > 0 ? nameComponents : <span className={styles.catNameText}>{catName}</span>;
  };

  return (
    <div className={`${styles.welcomeWrapper} ${isVisible ? styles.visible : ''} ${isAnimating ? styles.animating : ''} ${isTransitioning ? styles.transitioning : ''}`}>
      {/* Background with overlay */}
      <div className={styles.backgroundContainer}>
        <picture>
          <source type="image/avif" srcSet="/assets/images/IMG_5071.avif" />
          <source type="image/webp" srcSet="/assets/images/IMG_5071.webp" />
          <img
            src="/assets/images/IMG_5071.JPG"
            alt="Cat background"
            className={styles.backgroundImage}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        </picture>
        <div className={styles.overlay} />
      </div>

      {/* Progress indicator */}
      {showProgress && (
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} />
          </div>
          <p className={styles.progressText}>Preparing your tournament experience...</p>
        </div>
      )}

      {/* Centered Content Container */}
      <div className={styles.contentContainer} ref={containerRef}>
        {/* Main Content Section */}
        <div className={styles.mainContent}>
          <div className={styles.stepIndicator}>
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepText}>Meet Your Cat</span>
          </div>
          <h1 className={styles.welcomeTitle}>
            Welcome to the Cat Name Tournament!
          </h1>
          
          <picture>
            <source type="image/avif" srcSet="/assets/images/IMG_5071.avif" />
            <source type="image/webp" srcSet="/assets/images/IMG_5071.webp" />
            <img
              src="/assets/images/IMG_5071.JPG"
              alt="Cute cat avatar"
              className={styles.catImage}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          </picture>

          <div className={styles.catNameSection}>
            <h2 className={styles.catNameTitle}>
              My cat&apos;s name is:
            </h2>
            <div className={styles.catNameDisplay}>
              {createInteractiveNames()}
            </div>
            <p className={styles.catNameSubtext}>
              A name carefully crafted from all the tournament results, ranked from most to least voted!
            </p>
          </div>
        </div>

        {/* Action Section */}
        <div className={styles.actionSection}>
          <button
            onClick={handleContinue}
            className={styles.continueButton}
            disabled={isAnimating}
          >
            <span className={styles.buttonContent}>
              {isAnimating ? 'Entering Tournament...' : 'Start the Tournament!'}
              <span className={styles.buttonEmoji} aria-hidden="true">
                🏆
              </span>
            </span>
          </button>

          <div className={styles.explanationText}>
            <p>
              This name represents the collective wisdom of all tournament participants!
            </p>
          </div>
        </div>
      </div>

      {/* Interactive tooltip */}
      <NameStatsTooltip
        nameData={hoveredName}
        isVisible={!!hoveredName}
        position={tooltipPosition}
      />
    </div>
  );
}

WelcomeScreen.displayName = 'WelcomeScreen';

WelcomeScreen.propTypes = {
  onContinue: PropTypes.func.isRequired,
  catName: PropTypes.string.isRequired,
  nameStats: PropTypes.arrayOf(PropTypes.shape({
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
  })),
  isTransitioning: PropTypes.bool
};

export default WelcomeScreen;