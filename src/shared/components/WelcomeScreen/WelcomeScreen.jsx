/**
 * @module WelcomeScreen
 * @description Pre-welcome screen that asks for the user's cat's name before showing the main app.
 */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './WelcomeScreen.module.css';

function WelcomeScreen({ onContinue }) {
  const [catName, setCatName] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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

  const resetTypingTimer = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
  };

  const handleCatNameChange = (e) => {
    setCatName(e.target.value);
    setIsTyping(true);
    resetTypingTimer();
    
    // Clear typing indicator after 2 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalCatName = catName.trim() || 'Mystery Cat';
    onContinue(finalCatName);
  };

  const handleSkip = () => {
    onContinue('Mystery Cat');
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`${styles.welcomeWrapper} ${isVisible ? styles.visible : ''}`}>
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

          <div className={styles.questionSection}>
            <h2 className={styles.questionTitle}>
              What's your cat's name?
            </h2>
            <p className={styles.questionSubtext}>
              We'll use this to personalize your tournament experience!
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className={styles.formSection}>
          {isTyping && (
            <div className={styles.typingIndicator}>
              <span className={styles.typingText}>
                The cat is watching you type!
              </span>
              <span className={styles.typingDots}>
                <span className={styles.dot}>.</span>
                <span className={styles.dot}>.</span>
                <span className={styles.dot}>.</span>
              </span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className={styles.welcomeForm}
            role="form"
            aria-label="Cat name form"
          >
            <div className={styles.inputWrapper}>
              <label htmlFor="catName" className={styles.inputLabel}>
                My cat's name is:
              </label>
              <div className={styles.inputContainer}>
                <input
                  id="catName"
                  type="text"
                  value={catName}
                  onChange={handleCatNameChange}
                  placeholder="Enter your cat's name"
                  className={styles.catNameInput}
                  autoFocus
                  aria-label="Your cat's name"
                  aria-describedby="catNameHelp"
                  maxLength={30}
                />
              </div>
              <p id="catNameHelp" className={styles.helperText}>
                Don't worry, you can always change this later!
              </p>
              
              {catName.trim() && (
                <div className={styles.characterCounter}>
                  <span className={styles.counterText}>
                    {catName.length}/30 characters
                  </span>
                  <div className={styles.counterBar}>
                    <div
                      className={styles.counterProgress}
                      style={{ width: `${(catName.length / 30) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="submit"
                className={`${styles.primaryButton} ${catName.trim() ? styles.hasName : ''}`}
              >
                <span className={styles.buttonContent}>
                  {catName.trim() ? `Continue with ${catName}` : 'Continue'}
                  <span className={styles.buttonEmoji} aria-hidden="true">
                    🐱
                  </span>
                </span>
              </button>
              
              <button
                type="button"
                onClick={handleSkip}
                className={styles.secondaryButton}
              >
                Skip for now
              </button>
            </div>
          </form>

          <div className={styles.namePreview}>
            {catName ? (
              <p className={styles.helperText}>
                Your cat <span className={styles.nameHighlight}>"{catName}"</span> will be the star of this tournament!
              </p>
            ) : (
              <p className={styles.helperText}>
                We'll help you find the perfect name for your feline friend!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

WelcomeScreen.displayName = 'WelcomeScreen';

WelcomeScreen.propTypes = {
  onContinue: PropTypes.func.isRequired
};

export default WelcomeScreen;