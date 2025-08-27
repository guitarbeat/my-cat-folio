import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './OnboardingModal.module.css';

/**
 * @module OnboardingModal
 * @description Simple, performant onboarding modal that guides users through the app features.
 * Replaced the complex floating bubble system with a clean, step-by-step approach.
 */

const OnboardingModal = ({ isOpen, onClose, onDontShowAgain, isLightTheme = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // * Onboarding steps
  const steps = [
    {
      icon: '🚀',
      title: 'Welcome to Meow Namester!',
      content: 'Get ready for the most fun cat name tournament you\'ve ever experienced. Let\'s find the purr-fect name together!',
      features: [
        { icon: '🎯', title: 'Smart Tournament System', description: 'AI-powered name battles' },
        { icon: '🎨', title: 'Beautiful Interface', description: 'Modern, responsive design' }
      ]
    },
    {
      icon: '🏆',
      title: 'How Tournaments Work',
      content: 'Names compete head-to-head in exciting battles. You vote for your favorites, and our system learns your preferences to suggest better names.',
      features: [
        { icon: '⚔️', title: 'Head-to-Head Battles', description: 'Names compete in pairs' },
        { icon: '📊', title: 'Smart Rankings', description: 'Elo rating system for fair competition' }
      ]
    },
    {
      icon: '🎪',
      title: 'Ready to Start?',
      content: 'You\'re all set! Create your first tournament and start discovering amazing cat names. The more you play, the better the suggestions get.',
      features: [
        { icon: '🎯', title: 'Instant Results', description: 'Get names in seconds' },
        { icon: '💾', title: 'Save Favorites', description: 'Keep track of your best picks' }
      ]
    }
  ];

  // * Handle modal open/close with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCurrentStep(0);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // * Handle step navigation
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onClose();
  };

  const handleDontShowAgain = () => {
    onDontShowAgain();
    onClose();
  };

  // * Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
          if (currentStep < steps.length - 1) {
            handleNext();
          }
          break;
        case 'ArrowLeft':
          if (currentStep > 0) {
            handlePrevious();
          }
          break;
        case 'Enter':
          handleNext();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, steps.length]);

  // * Don't render if not open
  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}>
      <div className={`${styles.modal} ${isLightTheme ? styles.lightTheme : styles.darkTheme}`}>
        {/* * Header */}
        <div className={styles.header}>
          <div className={styles.stepIndicator}>
            {steps.map((_, index) => (
              <div
                key={index}
                className={`${styles.stepDot} ${index === currentStep ? styles.active : ''} ${index < currentStep ? styles.completed : ''}`}
                onClick={() => setCurrentStep(index)}
                role="button"
                tabIndex={0}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close onboarding"
          >
            ×
          </button>
        </div>

        {/* * Content */}
        <div className={styles.content}>
          <div className={styles.stepIcon}>
            {currentStepData.icon}
          </div>

          <h2 className={styles.stepTitle}>
            {currentStepData.title}
          </h2>

          <p className={styles.stepContent}>
            {currentStepData.content}
          </p>

          {/* * Features */}
          <div className={styles.features}>
            {currentStepData.features.map((feature, index) => (
              <div key={index} className={styles.feature}>
                <span className={styles.featureIcon}>
                  {feature.icon}
                </span>
                <div className={styles.featureText}>
                  <strong>{feature.title}</strong>
                  <span>{feature.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* * Footer */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            {!isFirstStep && (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handlePrevious}
              >
                ← Previous
              </button>
            )}
          </div>

          <div className={styles.footerCenter}>
            <button
              type="button"
              className={styles.dontShowButton}
              onClick={handleDontShowAgain}
            >
              Don&apos;t show again
            </button>
          </div>

          <div className={styles.footerRight}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleNext}
            >
              {isLastStep ? 'Get Started! 🎉' : 'Next →'}
            </button>
          </div>
        </div>

        {/* * Progress bar */}
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

OnboardingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDontShowAgain: PropTypes.func.isRequired,
  isLightTheme: PropTypes.bool
};

export default OnboardingModal;
