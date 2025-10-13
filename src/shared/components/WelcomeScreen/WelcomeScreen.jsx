/**
 * @module WelcomeScreen
 * @description Simplified welcome screen component with clean, maintainable code.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { NameStatsTooltip } from '../index';
import { catNamesAPI } from '../../../../backend/api/supabaseClient';
import useImageGallery from '../../../core/hooks/useImageGallery';
import ThemeToggle from './components/ThemeToggle';
import WelcomeCard from './components/WelcomeCard';
import styles from './WelcomeScreen.module.css';

function WelcomeScreen({ onContinue, isLightTheme, onThemeToggle }) {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredName, setHoveredName] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [activeNames, setActiveNames] = useState([]);
  const [namesLoading, setNamesLoading] = useState(true);
  const [namesError, setNamesError] = useState(null);

  // * Define gallery data
  const galleryData = useMemo(
    () => [
      '/assets/images/IMG_0778.avif',
      '/assets/images/IMG_0779.avif',
      '/assets/images/IMG_0865.avif',
      '/assets/images/IMG_0884.avif',
      '/assets/images/IMG_0923.avif',
      '/assets/images/IMG_1116.avif'
    ],
    []
  );

  const {
    currentImage,
    isImageTransitioning
  } = useImageGallery({
    initialImages: galleryData,
    rotationInterval: 6000,
    autoRotate: true
  });

  // * Fetch Aaron's top names from backend
  const fetchActiveNames = useCallback(async () => {
    try {
      setNamesLoading(true);
      setNamesError(null);
      const names = await catNamesAPI.getAaronsTopNames(6);
      setActiveNames(names);
    } catch (err) {
      console.error('Error fetching Aaron\'s top names:', err);
      setNamesError(err);
    } finally {
      setNamesLoading(false);
    }
  }, []);

  // * Handle name hover events
  const handleNameHover = useCallback((nameData, position) => {
    setHoveredName(nameData);
    setTooltipPosition(position);
  }, []);

  const handleNameLeave = useCallback(() => {
    setHoveredName(null);
  }, []);

  // * Initialize component
  useEffect(() => {
    document.body.classList.add('welcome-page');
    document.documentElement.classList.add('welcome-page');

    // * Fetch active names
    fetchActiveNames();

    // * Animate in after a brief delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => {
      document.body.classList.remove('welcome-page');
      document.documentElement.classList.remove('welcome-page');
      clearTimeout(timer);
    };
  }, [fetchActiveNames]);

  return (
    <div
      className={`${styles.welcomeWrapper} ${isVisible ? styles.visible : ''}`}
      role="main"
      aria-label="Welcome screen showing your cat's tournament-generated name"
    >
      {/* Theme Toggle Button */}
      <ThemeToggle isLightTheme={isLightTheme} onToggle={onThemeToggle} />

      {/* Background with overlay */}
      <div className={styles.backgroundContainer}>
        <div
          className={`${styles.backgroundImage} ${isImageTransitioning ? styles.bgTransitioning : ''}`}
          style={{ backgroundImage: `url(${currentImage})` }}
          aria-hidden="true"
        />
        <div className={styles.overlay} />
      </div>

      {/* Centered Content Container */}
      <div className={styles.contentContainer}>

        {/* Welcome Card */}
        <WelcomeCard
          activeNames={activeNames}
          namesLoading={namesLoading}
          namesError={namesError}
          onContinue={onContinue}
          onNameHover={handleNameHover}
          onNameLeave={handleNameLeave}
        />
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
  onContinue: PropTypes.func,
  isLightTheme: PropTypes.bool.isRequired,
  onThemeToggle: PropTypes.func.isRequired
};

export default WelcomeScreen;
