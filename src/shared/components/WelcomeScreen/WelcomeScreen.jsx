/**
 * @module WelcomeScreen
 * @description Enhanced welcome screen that displays the cat's name based on tournament rankings.
 * Features improved animations, particle effects, and interactive elements.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { NameStatsTooltip } from '../index';
import styles from './WelcomeScreen.module.css';

function WelcomeScreen({
  catName,
  nameStats = []
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredName, setHoveredName] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const containerRef = useRef(null);
  const nameRefs = useRef({});
  const animationFrameRef = useRef(null);

  // Simplified particle system with reduced animations
  const createParticle = useCallback(() => {
    // Significantly reduce particle count and properties
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;

    return {
      id: Math.random(),
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * (isSmallMobile ? 0.1 : isMobile ? 0.15 : 0.2),
      vy: (Math.random() - 0.5) * (isSmallMobile ? 0.1 : isMobile ? 0.15 : 0.2),
      size: Math.random() * (isSmallMobile ? 0.8 : isMobile ? 1 : 1.5) + 0.5,
      opacity: Math.random() * (isSmallMobile ? 0.1 : isMobile ? 0.15 : 0.2) + 0.1,
      life: 1,
      decay: Math.random() * (isSmallMobile ? 0.03 : 0.04) + 0.02
    };
  }, []);

  const animateParticles = useCallback(() => {
    setParticles((prevParticles) =>
      prevParticles
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - particle.decay,
          opacity: particle.opacity * particle.life
        }))
        .filter((particle) => particle.life > 0)
        .concat(
          Array.from({ length: Math.random() < 0.1 ? 1 : 0 }, createParticle)
        )
    );
  }, [createParticle]);

  // Add welcome-page class to body and html when component mounts
  useEffect(() => {
    document.body.classList.add('welcome-page');
    document.documentElement.classList.add('welcome-page');

    // Initialize particles with significantly reduced count
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    const particleCount = isSmallMobile ? 2 : isMobile ? 4 : 6;
    const initialParticles = Array.from(
      { length: particleCount },
      createParticle
    );
    setParticles(initialParticles);

    // Animate in after a brief delay (disable celebration)
    const timer = setTimeout(() => {
      setIsVisible(true);
      setShowCelebration(false); // Disable celebration effects
    }, 100);

    // Start particle animation with significantly reduced frequency
    const animate = () => {
      // Drastically reduce animation frequency for better performance
      const isMobile = window.innerWidth <= 768;
      const isSmallMobile = window.innerWidth <= 480;
      const animationThreshold = isSmallMobile ? 0.1 : isMobile ? 0.15 : 0.2;

      if (Math.random() < animationThreshold) {
        animateParticles();
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);

    // Remove class when component unmounts
    return () => {
      document.body.classList.remove('welcome-page');
      document.documentElement.classList.remove('welcome-page');
      clearTimeout(timer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Clean up name refs to prevent memory leaks
      nameRefs.current = {};
    };
  }, [createParticle, animateParticles]);

  // Personal name - you can customize this
  const personalName = "Aaron"; // Replace with your actual name


  // Handle mouse events for interactive names
  const handleNameMouseEnter = (nameData, event) => {
    const rect = event.target.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setHoveredName(nameData);

    // Add subtle haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const handleNameMouseLeave = () => {
    setHoveredName(null);
  };

  // Enhanced touch events for mobile
  const handleNameTouchStart = (nameData, event) => {
    event.preventDefault();
    setTooltipPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });
    setHoveredName(nameData);

    // Enhanced haptic feedback for touch
    if (navigator.vibrate) {
      navigator.vibrate([40, 30, 40]);
    }

    // Enhanced visual feedback
    event.target.style.transform = 'scale(0.94)';
    event.target.style.transition = 'transform 0.1s ease-out';
  };

  const handleNameTouchEnd = (event) => {
    event.preventDefault();
    // Reset visual feedback with smooth transition
    event.target.style.transform = 'scale(1)';
    event.target.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';

    // Delay hiding to allow user to see the tooltip
    setTimeout(() => {
      setHoveredName(null);
    }, 4000);
  };

  const handleNameTouchCancel = (event) => {
    event.preventDefault();
    // Reset visual feedback with smooth transition
    event.target.style.transform = 'scale(1)';
    event.target.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
    setHoveredName(null);
  };

  // Create individual name components from the cat name
  const createInteractiveNames = () => {
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
    const sortedStats = [...nameStats].sort((a, b) => b.rating - a.rating);

    // Find all occurrences of each name in the cat name
    for (const stat of sortedStats) {
      let searchIndex = 0;
      while (searchIndex < catName.length) {
        const index = catName.indexOf(stat.name, searchIndex);
        if (index === -1) break;

        matchedNames.push({
          ...stat,
          startIndex: index,
          endIndex: index + stat.name.length
        });
        searchIndex = index + 1; // Move past this match to find overlapping ones
      }
    }

    // Remove overlapping matches (keep the one with higher rating)
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
  };

  return (
    <div
      className={`${styles.welcomeWrapper} ${isVisible ? styles.visible : ''}`}
      role="main"
      aria-label="Welcome screen showing your cat's tournament-generated name"
    >
      {/* Background with overlay */}
      <div className={styles.backgroundContainer}>
        <div className={styles.backgroundImage} />
        <div className={styles.overlay} />

        {/* Particle effects */}
        <div className={styles.particleContainer}>
          {particles.map((particle) => (
            <div
              key={particle.id}
              className={styles.particle}
              style={{
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                opacity: particle.opacity,
                transform: `rotate(${particle.x * 0.1}deg)`
              }}
            />
          ))}
        </div>

        {/* Celebration effects */}
        {showCelebration && (
          <div className={styles.celebrationContainer}>
            <div className={styles.confetti} />
            <div className={styles.confetti} />
            <div className={styles.confetti} />
            <div className={styles.confetti} />
            <div className={styles.confetti} />
          </div>
        )}
      </div>


      {/* Centered Content Container */}
      <div className={styles.contentContainer} ref={containerRef}>
        {/* Rotated Card Layout */}
        <div className={styles.rotatedCard}>
          {/* Header */}
          <div className={styles.cardHeader}>
            <span className={styles.headerText}>Hello! I&apos;m {personalName}</span>
          </div>
          
          {/* Cat Name - Most Prominent */}
          <div className={styles.catNameSection}>
            <div className={styles.catNameContainer}>
              {createInteractiveNames()}
            </div>
          </div>
          
          {/* Footer */}
          <div className={styles.cardFooter}>
            <span className={styles.footerText}>Welcome to my personal site!</span>
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
  )
};

export default WelcomeScreen;
