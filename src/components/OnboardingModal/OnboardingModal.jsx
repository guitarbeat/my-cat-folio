import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './OnboardingModal.module.css';

/**
 * @module OnboardingModal
 * @description iMessage-style onboarding modal that guides users through the app features.
 * Uses conversational bubbles and non-blocking design.
 */

const OnboardingModal = ({ isOpen, onClose, onDontShowAgain, isLightTheme = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // * Onboarding steps as conversational messages
  const steps = [
    {
      type: 'them',
      messages: [
        { type: 'emoji', content: '🚀' },
        { type: 'text', content: 'Welcome to Meow Namester!' },
        { type: 'text', content: 'I\'m here to help you discover the perfect cat name through fun tournaments.' }
      ]
    },
    {
      type: 'them',
      messages: [
        { type: 'text', content: 'Here\'s how it works:' },
        { type: 'text', content: '• Names compete head-to-head in exciting battles' },
        { type: 'text', content: '• You vote for your favorites' },
        { type: 'text', content: '• Our system learns your preferences' },
        { type: 'text', content: '• Better suggestions come with each tournament!' }
      ]
    },
    {
      type: 'them',
      messages: [
        { type: 'text', content: 'Ready to start naming?' },
        { type: 'text', content: 'Just click the button below and I\'ll guide you through your first tournament!' }
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

        {/* * iMessage Content */}
        <div className={styles.content}>
          <div className={styles.imessage}>
            {currentStepData.messages.map((message, index) => (
              <p
                key={index}
                className={`${styles.message} ${styles[`from-${currentStepData.type}`]} ${
                  message.type === 'emoji' ? styles.emoji : ''
                } ${index === currentStepData.messages.length - 1 ? '' : styles.marginBOne}`}
              >
                {message.content}
              </p>
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
