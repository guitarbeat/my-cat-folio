/**
 * @module useTournamentState
 * @description Pure state management for tournament data using Zustand selectors.
 * Separated from useTournament.js for better performance and clarity.
 */

import { useTournamentData, useTournamentActions } from '../store/useAppStore';

/**
 * Hook for accessing tournament state and actions
 * @returns {Object} Tournament state and actions
 */
export const useTournamentState = () => {
  const tournament = useTournamentData();
  const actions = useTournamentActions();

  return {
    // * State
    names: tournament.names,
    ratings: tournament.ratings,
    isComplete: tournament.isComplete,
    isLoading: tournament.isLoading,
    voteHistory: tournament.voteHistory,
    currentView: tournament.currentView,

    // * Actions
    setNames: actions.setNames,
    setRatings: actions.setRatings,
    setIsComplete: actions.setIsComplete,
    setIsLoading: actions.setIsLoading,
    setVoteHistory: actions.setVoteHistory,
    setCurrentView: actions.setCurrentView,
    resetTournament: actions.resetTournament
  };
};
