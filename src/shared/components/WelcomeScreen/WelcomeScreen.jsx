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
    maxParticles: 6
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
    rotationInterval: 4000,
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
      <button
        className={styles.themeToggle}
        onClick={toggleTheme}
        type="button"
        aria-label={`Switch to ${isLightTheme ? 'dark' : 'light'} mode`}
        title={`Switch to ${isLightTheme ? 'dark' : 'light'} mode`}
      >
        <span className={styles.themeIcon} aria-hidden="true">
          {isLightTheme ? '🌙' : '☀️'}
        </span>
        <span className={styles.themeText}>
          {isLightTheme ? 'Dark' : 'Light'}
        </span>
      </button>

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
          {/* Cat Image Section */}
          <div className={styles.catImageSection}>
            <div className={styles.catImageContainer}>
              <img
                src={galleryData[currentImageIndex] || "/assets/images/IMG_0778.jpg"}
                alt={`My cat looking adorable - Image ${currentImageIndex + 1} of ${galleryData.length}`}
                className={`${styles.catImage} ${isImageTransitioning ? styles.imageTransitioning : ''}`}
                loading="lazy"
                onLoad={() => setIsImageTransitioning(false)}
              />
              <div className={styles.catImageGlow} />
              
              {/* Image Navigation Controls */}
              {galleryData.length > 1 && (
                <>
                  <button
                    className={styles.imageNavButton}
                    onClick={goToPreviousImage}
                    disabled={isImageTransitioning}
                    aria-label="Previous cat image"
                    type="button"
                  >
                    ‹
                  </button>
                  <button
                    className={styles.imageNavButton}
                    onClick={goToNextImage}
                    disabled={isImageTransitioning}
                    aria-label="Next cat image"
                    type="button"
                  >
                    ›
                  </button>
                  
                  {/* Image Counter */}
                  <div className={styles.imageCounter}>
                    {currentImageIndex + 1} / {galleryData.length}
                  </div>
                  
                  {/* Image Dots Indicator */}
                  <div className={styles.imageDots}>
                    {galleryData.map((_, index) => (
                      <button
                        key={index}
                        className={`${styles.imageDot} ${index === currentImageIndex ? styles.activeDot : ''}`}
                        onClick={() => {
                          if (!isImageTransitioning) {
                            setIsImageTransitioning(true);
                            setTimeout(() => {
                              setCurrentImageIndex(index);
                              setIsImageTransitioning(false);
                            }, 300);
                          }
                        }}
                        disabled={isImageTransitioning}
                        aria-label={`Go to image ${index + 1}`}
                        type="button"
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Rotated Card Layout */}
          <div className={styles.rotatedCard}>
            {/* Header */}
            <div className={styles.cardHeader}>
              <span className={styles.headerText}>Hello! My name is</span>
            </div>
            
            {/* Cat Name - Most Prominent */}
            <div className={styles.catNameSection}>
              <div className={styles.catNameContainer}>
                {createInteractiveNames()}
              </div>
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
