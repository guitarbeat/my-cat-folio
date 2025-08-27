import { useState, useEffect, useCallback } from 'react';

/**
 * @module useOnboarding
 * @description Custom hook to manage onboarding modal state and localStorage persistence
 * @returns {Object} Object containing onboarding state and control functions
 */
const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Check localStorage on mount - only run once
  useEffect(() => {
    try {
      const onboardingSeen = localStorage.getItem('catNameTournament_onboardingSeen');
      if (!onboardingSeen) {
        setShowOnboarding(true);
      } else {
        setHasSeenOnboarding(true);
      }
    } catch (error) {
      // * Handle localStorage errors gracefully
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error reading onboarding state from localStorage:', error);
      }
      // * Default to showing onboarding if there's an error
      setShowOnboarding(true);
    }
  }, []); // * Empty dependency array - only run once

  const closeOnboarding = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  const dontShowAgain = useCallback(() => {
    try {
      localStorage.setItem('catNameTournament_onboardingSeen', 'true');
      setHasSeenOnboarding(true);
      setShowOnboarding(false);
    } catch (error) {
      // * Handle localStorage errors gracefully
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error saving onboarding state to localStorage:', error);
      }
      // * Still close the modal even if localStorage fails
      setShowOnboarding(false);
    }
  }, []);

  const resetOnboarding = useCallback(() => {
    try {
      localStorage.removeItem('catNameTournament_onboardingSeen');
      setHasSeenOnboarding(false);
      setShowOnboarding(true);
    } catch (error) {
      // * Handle localStorage errors gracefully
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error resetting onboarding state in localStorage:', error);
      }
      // * Still reset the state even if localStorage fails
      setHasSeenOnboarding(false);
      setShowOnboarding(true);
    }
  }, []);

  const setShowOnboardingState = useCallback((show) => {
    setShowOnboarding(show);
  }, []);

  return {
    showOnboarding,
    hasSeenOnboarding,
    closeOnboarding,
    dontShowAgain,
    resetOnboarding,
    setShowOnboarding: setShowOnboardingState
  };
};

export default useOnboarding;
