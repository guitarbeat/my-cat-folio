import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './OnboardingModal.module.css';

/**
 * @module OnboardingModal
 * @description Modal component that provides first-time user onboarding
 * explaining how the tournament works and how to save/share results
 */
const OnboardingModal = ({ isOpen, onClose, onDontShowAgain }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  // Reset closing state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  const steps = [
    {
      title: 'Welcome to the Cat Name Tournament! 🐱',
      content: (
        <div className={styles.stepContent}>
          <p>Ready to find the purr-fect name for your feline friend?</p>
          <p>This tournament uses a special ranking system to help you discover the best cat names through fun head-to-head matchups.</p>
        </div>
      ),
      icon: '🏆'
    },
    {
      title: 'How the Tournament Works',
      content: (
        <div className={styles.stepContent}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>⚔️</span>
            <div>
              <h4>Head-to-Head Battles</h4>
              <p>Choose between two cat names in each round. Your preferences help rank all names!</p>
            </div>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📊</span>
            <div>
              <h4>Smart Ranking System</h4>
              <p>We use advanced algorithms to learn your taste and rank names accordingly.</p>
            </div>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🎯</span>
            <div>
              <h4>Personalized Results</h4>
              <p>Get a custom ranking based on your unique preferences and voting history.</p>
            </div>
          </div>
        </div>
      ),
      icon: '🎮'
    },
    {
      title: 'Saving & Sharing Results',
      content: (
        <div className={styles.stepContent}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>💾</span>
            <div>
              <h4>Save Your Results</h4>
              <p>Your tournament results are automatically saved to your profile for future reference.</p>
            </div>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📤</span>
            <div>
              <h4>Share with Friends</h4>
              <p>Copy your results or share your profile to show off your cat naming expertise!</p>
            </div>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🔄</span>
            <div>
              <h4>Run Multiple Tournaments</h4>
              <p>Start new tournaments anytime to refine your rankings or try different name sets.</p>
            </div>
          </div>
        </div>
      ),
      icon: '💡'
    },
    {
      title: 'Ready to Start?',
      content: (
        <div className={styles.stepContent}>
          <p>You&apos;re all set! The tournament will begin with name selection, then you&apos;ll vote on pairs until we find your perfect match.</p>
          <p>Remember: there are no wrong answers - just follow your heart! 💕</p>
        </div>
      ),
      icon: '🚀'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 400); // Match the animation duration
  };

  const handleDontShowAgain = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onDontShowAgain();
      onClose();
    }, 400); // Match the animation duration
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className={styles.overlay}>
      <div className={`${styles.modal} ${styles[`modal--${currentStep}`]} ${isClosing ? styles.closing : ''}`}>
        <div className={styles.header}>
          <div className={styles.stepIndicator}>
            <span className={styles.stepNumber}>{currentStep + 1}</span>
            <span className={styles.totalSteps}>/ {steps.length}</span>
          </div>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close onboarding"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.stepIcon}>{currentStepData.icon}</div>
          <h2 className={styles.stepTitle}>{currentStepData.title}</h2>
          {currentStepData.content}
        </div>

        <div className={styles.footer}>
          <div className={styles.leftActions}>
            {!isFirstStep && (
              <button
                className={styles.secondaryButton}
                onClick={handlePrevious}
              >
                ← Previous
              </button>
            )}
          </div>

          <div className={styles.centerActions}>
            {isLastStep ? (
              <button
                className={styles.primaryButton}
                onClick={handleClose}
              >
                Let&apos;s Start! 🎉
              </button>
            ) : (
              <button
                className={styles.primaryButton}
                onClick={handleNext}
              >
                Next →
              </button>
            )}
          </div>

          <div className={styles.rightActions}>
            {isLastStep && (
              <button
                className={styles.dontShowButton}
                onClick={handleDontShowAgain}
              >
                Don&apos;t show again
              </button>
            )}
          </div>
        </div>

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
  onDontShowAgain: PropTypes.func.isRequired
};

export default OnboardingModal;
