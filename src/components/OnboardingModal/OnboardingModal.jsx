import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './OnboardingModal.module.css';

/**
 * Floating bubbles onboarding modal that moves across the page
 */
const OnboardingModal = ({ isOpen, onClose, onDontShowAgain, isLightTheme = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [bubblePositions, setBubblePositions] = useState([]);
  const [expandedBubble, setExpandedBubble] = useState(null);

  // Reset closing state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      // Initialize random bubble positions
      const positions = Array.from({ length: 5 }, () => ({
        x: Math.random() * 80 + 10, // 10% to 90% of viewport width
        y: Math.random() * 80 + 10, // 10% to 90% of viewport height
        delay: Math.random() * 2,
        speed: 0.5 + Math.random() * 1
      }));
      setBubblePositions(positions);
    }
  }, [isOpen]);

  // Animate bubbles
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setBubblePositions(prev => prev.map(bubble => {
        let newX = bubble.x + bubble.speed * 0.1;
        let newY = bubble.y + bubble.speed * 0.05;

        // Bounce off edges
        if (newX <= 5 || newX >= 95) {
          newX = bubble.x;
          bubble.speed = -bubble.speed; // Reverse direction
        }
        if (newY <= 5 || newY >= 95) {
          newY = bubble.y;
          bubble.speed = -bubble.speed; // Reverse direction
        }

        return {
          ...bubble,
          x: newX,
          y: newY,
          speed: bubble.speed
        };
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen]);

  const steps = [
    {
      icon: '🚀',
      title: 'Welcome to Aaron\'s Folly!',
      content: 'Get ready for a wild ride through the most indecisive naming adventure you\'ve ever seen. Buckle up!',
      features: [
        { icon: '🎯', title: 'Smart Suggestions', description: 'AI-powered name recommendations' },
        { icon: '🎨', title: 'Creative Themes', description: 'Endless customization options' }
      ]
    },
    {
      icon: '🎭',
      title: 'Why So Many Names?',
      content: 'Because why settle for one when you can have a hundred? Our AI generates unique, creative names that actually make sense.',
      features: [
        { icon: '🧠', title: 'AI Magic', description: 'Advanced algorithms at work' },
        { icon: '✨', title: 'Unique Results', description: 'No two names are alike' }
      ]
    },
    {
      icon: '🎪',
      title: 'Ready to Name Everything?',
      content: 'From pets to projects, from businesses to babies - if it needs a name, we\'ve got you covered. Let\'s make some magic!',
      features: [
        { icon: '🎯', title: 'Instant Results', description: 'Get names in seconds' },
        { icon: '💾', title: 'Save Favorites', description: 'Keep track of your best picks' }
      ]
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
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

  const handleBubbleClick = (index) => {
    setExpandedBubble(index);
    setCurrentStep(index);
  };

  const handleBubbleClose = () => {
    setExpandedBubble(null);
  };

  if (!isOpen) return null;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className={`${styles.overlay} ${isLightTheme ? styles.lightTheme : styles.darkTheme}`}>
      {/* Content bubbles - each step in its own bubble */}
      {steps.map((step, index) => (
        <div
          key={index}
          className={`${styles.floatingBubble} ${styles.contentBubble} ${expandedBubble === index ? styles.expandedBubble : ''} ${currentStep === index ? styles.activeBubble : ''}`}
          style={{
            left: `${bubblePositions[index]?.x || 20 + index * 15}%`,
            top: `${bubblePositions[index]?.y || 20 + index * 10}%`,
            animationDelay: `${bubblePositions[index]?.delay || index * 0.5}s`,
            animationDuration: `${3 + (bubblePositions[index]?.speed || 0.5)}s`
          }}
          onClick={() => handleBubbleClick(index)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleBubbleClick(index);
            }
          }}
          aria-label={`Go to step ${index + 1}: ${step.title}`}
        >
          <div className={styles.bubbleContent}>
            <div className={styles.bubbleIcon}>{step.icon}</div>
            <h3 className={styles.bubbleTitle}>{step.title}</h3>
            {expandedBubble === index && (
              <>
                <p className={styles.bubbleText}>{step.content}</p>
                <div className={styles.bubbleFeatures}>
                  {step.features.map((feature, idx) => (
                    <div key={idx} className={styles.bubbleFeature}>
                      <span className={styles.bubbleFeatureIcon}>{feature.icon}</span>
                      <span className={styles.bubbleFeatureText}>{feature.title}</span>
                    </div>
                  ))}
                </div>
                <button
                  className={styles.bubbleCloseButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBubbleClose();
                  }}
                  aria-label="Close expanded bubble"
                >
                  ✕
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Main modal for navigation */}
      <div className={`${styles.modal} ${styles[`modal--${currentStep}`]} ${isClosing ? styles.closing : ''} ${isLightTheme ? styles.lightTheme : styles.darkTheme}`}>
        <div className={styles.header}>
          <div className={styles.stepIndicator}>
            <span className={styles.stepNumber}>{currentStep + 1}</span>
            <span className={styles.stepSeparator}>/</span>
            <span className={styles.totalSteps}>{steps.length}</span>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close onboarding"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.navigationContent}>
            <h2 className={styles.navigationTitle}>Navigate the Bubbles</h2>
            <p className={styles.navigationText}>
              Click on the floating bubbles to expand and explore each step, or use the navigation below.
            </p>
            <div className={styles.bubbleNavigation}>
              {steps.map((step, index) => (
                <button
                  key={index}
                  className={`${styles.bubbleNavButton} ${currentStep === index ? styles.activeNavButton : ''}`}
                  onClick={() => setCurrentStep(index)}
                >
                  {step.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.leftActions}>
            {!isFirstStep && (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={prevStep}
              >
                ← Back
              </button>
            )}
          </div>

          <div className={styles.centerActions}>
            {!isLastStep && (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={nextStep}
              >
                Next →
              </button>
            )}
            {isLastStep && (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleClose}
              >
                Get Started!
              </button>
            )}
          </div>

          <div className={styles.rightActions}>
            <button
              type="button"
              className={styles.dontShowButton}
              onClick={handleDontShowAgain}
            >
              Don&apos;t show again
            </button>
          </div>
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
