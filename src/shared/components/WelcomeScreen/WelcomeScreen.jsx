/**
 * @module WelcomeScreen
 * @description Refactored welcome screen with improved performance and maintainability.
 * Uses custom hooks and smaller components for better code organization.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { NameStatsTooltip } from '../index';
import { catNamesAPI } from '../../../../backend/api/supabaseClient';
import useTheme from '../../../core/hooks/useTheme';
import useParticleSystem from '../../../core/hooks/useParticleSystem';
import useImageGallery from '../../../core/hooks/useImageGallery';
import performanceMonitor from '../../utils/performanceMonitor';
import { injectCriticalCSS, removeCriticalCSS } from '../../utils/criticalCSS';
import ThemeToggle from './components/ThemeToggle';
import CatImageGallery from './components/CatImageGallery';
import WelcomeCard from './components/WelcomeCard';
import ParticleBackground from './components/ParticleBackground';
import styles from './WelcomeScreen.module.css';

function WelcomeScreen({
  onContinue
}) {
  const { isLightTheme, toggleTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredName, setHoveredName] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showCelebration] = useState(false);
  const [activeNames, setActiveNames] = useState([]);
  const [namesLoading, setNamesLoading] = useState(true);
  const [namesError, setNamesError] = useState(null);
  const containerRef = useRef(null);

  // Custom hooks for better performance and organization
  const { particles, isEnabled: particlesEnabled } = useParticleSystem({
    enabled: true,
    maxParticles: 6,
    isVisible: isVisible
  });

  // * Define gallery data with proper fallbacks
  const galleryData = [
    '/assets/images/IMG_0778.jpg',
    '/assets/images/IMG_0779.jpg',
    '/assets/images/IMG_0865.jpg',
    '/assets/images/IMG_0884.jpg',
    '/assets/images/IMG_0923.jpg',
    '/assets/images/IMG_1116.jpg'
  ];

  const {
    currentImage,
    isImageTransitioning,
    hasMultipleImages,
    currentImageIndex,
    totalImages: galleryDataLength,
    loadedImages,
    failedImages,
    goToNextImage,
    goToPreviousImage,
    goToImage,
    handleImageLoad,
    handleImageError
  } = useImageGallery({
    initialImages: galleryData,
    rotationInterval: 6000, // Increased for better performance
    autoRotate: true
  });

  // Fetch Aaron's top names from backend
  const fetchActiveNames = useCallback(async () => {
    try {
      setNamesLoading(true);
      setNamesError(null);
      const names = await catNamesAPI.getAaronsTopNames(6); // Get top 6 names
      setActiveNames(names);
    } catch (err) {
      console.error('Error fetching Aaron\'s top names:', err);
      setNamesError(err);
    } finally {
      setNamesLoading(false);
    }
  }, []);

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

    // Inject critical CSS for faster rendering
    injectCriticalCSS();

    // Track Welcome Screen performance
    performanceMonitor.trackWelcomeScreenMetrics();

    // * Track image loading performance
    const trackImagePerformance = () => {
      if (loadedImages.size > 0) {
        performanceMonitor.trackImageLoadMetrics({
          loadedCount: loadedImages.size,
          failedCount: failedImages.size,
          totalImages: galleryDataLength
        });
      }
    };

    // Track image performance when loaded images change
    trackImagePerformance();

    // Fetch active names
    fetchActiveNames();

    // Animate in after a brief delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Remove critical CSS after main stylesheet loads
    const removeTimer = setTimeout(() => {
      removeCriticalCSS();
    }, 2000);

    return () => {
      document.body.classList.remove('welcome-page');
      document.documentElement.classList.remove('welcome-page');
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [fetchActiveNames, loadedImages.size, failedImages.size, galleryDataLength]);

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
          onImageError={handleImageError}
        />

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
  onContinue: PropTypes.func
};

export default WelcomeScreen;
