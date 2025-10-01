/**
 * @module WelcomeScreen
 * @description Refactored welcome screen with improved performance and maintainability.
 * Uses custom hooks and smaller components for better code organization.
 */
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { NameStatsTooltip } from '../index';
import useTheme from '../../../core/hooks/useTheme';
import useParticleSystem from '../../../core/hooks/useParticleSystem';
import useImageGallery from '../../../core/hooks/useImageGallery';
import ThemeToggle from './components/ThemeToggle';
import CatImageGallery from './components/CatImageGallery';
import WelcomeCard from './components/WelcomeCard';
import ParticleBackground from './components/ParticleBackground';
import styles from './WelcomeScreen.module.css';

function WelcomeScreen({
  catName,
  nameStats = [],
  onContinue
}) {
  const { isLightTheme, toggleTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredName, setHoveredName] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Custom hooks for better performance and organization
  const { particles, isEnabled: particlesEnabled } = useParticleSystem({
    enabled: true,
    maxParticles: 6,
    isVisible: isVisible
  });

  const {
    currentImage,
    isImageTransitioning,
    hasMultipleImages,
    currentImageIndex,
    totalImages: galleryDataLength,
    goToNextImage,
    goToPreviousImage,
    goToImage,
    handleImageLoad
  } = useImageGallery({
    initialImages: [],
    rotationInterval: 6000, // Increased for better performance
    autoRotate: true
  });

  // Handle name hover events
  const handleNameHover = useCallback((nameData, position) => {
    setHoveredName(nameData);
    setTooltipPosition(position);
  }, []);

  const handleNameLeave = useCallback(() => {
    setHoveredName(null);
  }, []);

  // Add welcome-page class to body and html when component mounts
  useEffect(() => {
    document.body.classList.add('welcome-page');
    document.documentElement.classList.add('welcome-page');

    // Animate in after a brief delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => {
      document.body.classList.remove('welcome-page');
      document.documentElement.classList.remove('welcome-page');
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className={`${styles.welcomeWrapper} ${isVisible ? styles.visible : ''}`}
      role="main"
      aria-label="Welcome screen showing your cat's tournament-generated name"
    >
      {/* Theme Toggle Button */}
      <ThemeToggle isLightTheme={isLightTheme} onToggle={toggleTheme} />

      {/* Background with overlay */}
      <div className={styles.backgroundContainer}>
        <div className={styles.backgroundImage} />
        <div className={styles.overlay} />

        {/* Particle effects */}
        <ParticleBackground particles={particles} isEnabled={particlesEnabled} />
      </div>

      {/* Centered Content Container */}
      <div className={styles.contentContainer}>
        {/* Cat Image Gallery */}
        <CatImageGallery
          currentImage={currentImage}
          isTransitioning={isImageTransitioning}
          hasMultipleImages={hasMultipleImages}
          currentIndex={currentImageIndex}
          totalImages={galleryDataLength}
          onPrevious={goToPreviousImage}
          onNext={goToNextImage}
          onImageSelect={goToImage}
          onImageLoad={handleImageLoad}
        />

        {/* Welcome Card */}
        <WelcomeCard
          catName={catName}
          nameStats={nameStats}
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
  onContinue: PropTypes.func
};

export default WelcomeScreen;
