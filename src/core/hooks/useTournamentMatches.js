/**
 * @module useTournamentMatches
 * @description Match logic and management for tournament functionality.
 * Separated from useTournament.js for better organization.
 */

import { useCallback } from 'react';
import { useTournamentData, useTournamentActions } from '../store/useAppStore';
import { useLocalStorage } from './useLocalStorage';

/**
 * Hook for managing tournament matches and voting logic
 * @returns {Object} Match-related functions and state
 */
export const useTournamentMatches = () => {
  const tournament = useTournamentData();
  const { setVoteHistory, setRatings, setIsComplete } = useTournamentActions();
  const { getItem, setItem } = useLocalStorage();

  /**
   * Calculate Elo rating change
   * @param {number} ratingA - Current rating of player A
   * @param {number} ratingB - Current rating of player B
   * @param {number} scoreA - Score for player A (1 for win, 0 for loss, 0.5 for draw)
   * @param {number} kFactor - K-factor for rating calculation
   * @returns {Object} New ratings for both players
   */
  const calculateEloChange = useCallback((ratingA, ratingB, scoreA, kFactor = 32) => {
    const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    const expectedB = 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400));

    const newRatingA = ratingA + kFactor * (scoreA - expectedA);
    const newRatingB = ratingB + kFactor * ((1 - scoreA) - expectedB);

    return {
      newRatingA: Math.round(newRatingA),
      newRatingB: Math.round(newRatingB)
    };
  }, []);

  /**
   * Process a vote between two names
   * @param {string} winner - The winning name
   * @param {string} loser - The losing name
   */
  const processVote = useCallback((winner, loser) => {
    if (!tournament.names || !tournament.ratings) return;

    const currentRatings = { ...tournament.ratings };
    const currentVoteHistory = [...tournament.voteHistory];

    // * Get current ratings (default to 1200 if not set)
    const winnerRating = currentRatings[winner] || 1200;
    const loserRating = currentRatings[loser] || 1200;

    // * Calculate new ratings
    const { newRatingA, newRatingB } = calculateEloChange(winnerRating, loserRating, 1);

    // * Update ratings
    currentRatings[winner] = newRatingA;
    currentRatings[loser] = newRatingB;

    // * Add to vote history
    const vote = {
      winner,
      loser,
      winnerRating: newRatingA,
      loserRating: newRatingB,
      timestamp: Date.now()
    };

    currentVoteHistory.push(vote);

    // * Update state
    setRatings(currentRatings);
    setVoteHistory(currentVoteHistory);

    // * Save to localStorage
    setItem('tournamentRatings', currentRatings);
    setItem('tournamentVoteHistory', currentVoteHistory);

    // * Check if tournament is complete
    const totalPossibleVotes = (tournament.names.length * (tournament.names.length - 1)) / 2;
    if (currentVoteHistory.length >= totalPossibleVotes) {
      setIsComplete(true);
    }
  }, [tournament.names, tournament.ratings, tournament.voteHistory, calculateEloChange, setRatings, setVoteHistory, setIsComplete, setItem]);

  /**
   * Get the next match to vote on
   * @returns {Object|null} Next match or null if complete
   */
  const getNextMatch = useCallback(() => {
    if (!tournament.names || tournament.isComplete) return null;

    const names = tournament.names;
    const voteHistory = tournament.voteHistory;

    // * Create a set of all voted pairs
    const votedPairs = new Set();
    voteHistory.forEach(vote => {
      votedPairs.add(`${vote.winner}-${vote.loser}`);
      votedPairs.add(`${vote.loser}-${vote.winner}`);
    });

    // * Find first unvoted pair
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const pair = `${names[i]}-${names[j]}`;
        if (!votedPairs.has(pair)) {
          return {
            name1: names[i],
            name2: names[j]
          };
        }
      }
    }

    return null;
  }, [tournament.names, tournament.voteHistory, tournament.isComplete]);

  /**
   * Get sorted names by rating
   * @returns {Array} Names sorted by rating (highest first)
   */
  const getSortedNames = useCallback(() => {
    if (!tournament.names || !tournament.ratings) return [];

    return [...tournament.names].sort((a, b) => {
      const ratingA = tournament.ratings[a] || 1200;
      const ratingB = tournament.ratings[b] || 1200;
      return ratingB - ratingA;
    });
  }, [tournament.names, tournament.ratings]);

  /**
   * Get tournament statistics
   * @returns {Object} Tournament statistics
   */
  const getTournamentStats = useCallback(() => {
    if (!tournament.names) {
      return {
        totalNames: 0,
        totalVotes: 0,
        totalPossibleVotes: 0,
        progress: 0,
        isComplete: false
      };
    }

    const totalNames = tournament.names.length;
    const totalVotes = tournament.voteHistory.length;
    const totalPossibleVotes = (totalNames * (totalNames - 1)) / 2;
    const progress = totalPossibleVotes > 0 ? (totalVotes / totalPossibleVotes) * 100 : 0;

    return {
      totalNames,
      totalVotes,
      totalPossibleVotes,
      progress,
      isComplete: tournament.isComplete
    };
  }, [tournament.names, tournament.voteHistory, tournament.isComplete]);

  return {
    processVote,
    getNextMatch,
    getSortedNames,
    getTournamentStats,
    calculateEloChange
  };
};
