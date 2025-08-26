import { useState, useEffect } from 'react';

/**
 * @module useOnboarding
 * @description Custom hook to manage onboarding modal state and localStorage persistence
 * @returns {Object} Object containing onboarding state and control functions
 */
const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const onboardingSeen = localStorage.getItem('catNameTournament_onboardingSeen');
    if (!onboardingSeen) {
      setShowOnboarding(true);
    } else {
      setHasSeenOnboarding(true);
    }
  }, []);

  const closeOnboarding = () => {
    setShowOnboarding(false);
  };

  const dontShowAgain = () => {
    localStorage.setItem('catNameTournament_onboardingSeen', 'true');
    setHasSeenOnboarding(true);
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('catNameTournament_onboardingSeen');
    setHasSeenOnboarding(false);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    hasSeenOnboarding,
    closeOnboarding,
    dontShowAgain,
    resetOnboarding,
  };
};

export default useOnboarding;