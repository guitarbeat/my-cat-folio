/**
 * @module WelcomeScreen
 * @description Pre-welcome screen that displays the cat's name based on tournament rankings.
 */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './WelcomeScreen.module.css';

function WelcomeScreen({ onContinue, catName }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);

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
    // Add a small delay for the animation before continuing
    setTimeout(() => {
      onContinue();
    }, 500);
  };

  return (
    <div className={`${styles.welcomeWrapper} ${isVisible ? styles.visible : ''} ${isAnimating ? styles.animating : ''}`}>
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

      {/* Centered Content Container */}
      <div className={styles.contentContainer} ref={containerRef}>
        {/* Main Content Section */}
        <div className={styles.mainContent}>
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
              <span className={styles.catNameText}>
                {catName || 'Loading...'}
              </span>
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
    </div>
  );
}

WelcomeScreen.displayName = 'WelcomeScreen';

WelcomeScreen.propTypes = {
  onContinue: PropTypes.func.isRequired,
  catName: PropTypes.string.isRequired
};

export default WelcomeScreen;