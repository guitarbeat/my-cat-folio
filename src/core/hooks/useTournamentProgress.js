/**
 * @module useTournamentProgress
 * @description Progress tracking and analytics for tournament functionality.
 * Separated from useTournament.js for better organization.
 */

import { useCallback, useMemo } from 'react';
import { useTournamentData } from '../store/useAppStore';

/**
 * Hook for tracking tournament progress and analytics
 * @returns {Object} Progress-related functions and computed values
 */
export const useTournamentProgress = () => {
  const tournament = useTournamentData();

  /**
   * Calculate tournament progress percentage
   */
  const progress = useMemo(() => {
    if (!tournament.names || tournament.names.length < 2) return 0;

    const totalPossibleVotes = (tournament.names.length * (tournament.names.length - 1)) / 2;
    const completedVotes = tournament.voteHistory.length;

    return totalPossibleVotes > 0 ? (completedVotes / totalPossibleVotes) * 100 : 0;
  }, [tournament.names, tournament.voteHistory.length]);

  /**
   * Get remaining matches count
   */
  const remainingMatches = useMemo(() => {
    if (!tournament.names || tournament.names.length < 2) return 0;

    const totalPossibleVotes = (tournament.names.length * (tournament.names.length - 1)) / 2;
    return Math.max(0, totalPossibleVotes - tournament.voteHistory.length);
  }, [tournament.names, tournament.voteHistory.length]);

  /**
   * Get estimated time remaining
   * @param {number} averageTimePerVote - Average time per vote in milliseconds
   * @returns {number} Estimated time remaining in milliseconds
   */
  const getEstimatedTimeRemaining = useCallback((averageTimePerVote = 10000) => {
    return remainingMatches * averageTimePerVote;
  }, [remainingMatches]);

  /**
   * Get progress statistics
   */
  const getProgressStats = useCallback(() => {
    if (!tournament.names) {
      return {
        totalNames: 0,
        completedVotes: 0,
        totalPossibleVotes: 0,
        remainingVotes: 0,
        progress: 0,
        isComplete: false
      };
    }

    const totalNames = tournament.names.length;
    const completedVotes = tournament.voteHistory.length;
    const totalPossibleVotes = (totalNames * (totalNames - 1)) / 2;
    const remainingVotes = Math.max(0, totalPossibleVotes - completedVotes);

    return {
      totalNames,
      completedVotes,
      totalPossibleVotes,
      remainingVotes,
      progress,
      isComplete: tournament.isComplete
    };
  }, [tournament.names, tournament.voteHistory.length, tournament.isComplete, progress]);

  /**
   * Get voting frequency analysis
   */
  const getVotingFrequency = useCallback(() => {
    if (tournament.voteHistory.length < 2) return null;

    const votes = tournament.voteHistory;
    const timeSpans = [];

    for (let i = 1; i < votes.length; i++) {
      const timeSpan = votes[i].timestamp - votes[i - 1].timestamp;
      timeSpans.push(timeSpan);
    }

    const averageTimeSpan = timeSpans.reduce((sum, time) => sum + time, 0) / timeSpans.length;
    const medianTimeSpan = timeSpans.sort((a, b) => a - b)[Math.floor(timeSpans.length / 2)];

    return {
      averageTimeSpan,
      medianTimeSpan,
      totalVotes: votes.length,
      timeSpans
    };
  }, [tournament.voteHistory]);

  /**
   * Get name popularity analysis
   */
  const getNamePopularity = useCallback(() => {
    if (!tournament.names || !tournament.ratings) return {};

    const popularity = {};

    // * Initialize all names
    tournament.names.forEach(name => {
      popularity[name] = {
        wins: 0,
        losses: 0,
        winRate: 0,
        rating: tournament.ratings[name] || 1200
      };
    });

    // * Count wins and losses
    tournament.voteHistory.forEach(vote => {
      if (popularity[vote.winner]) {
        popularity[vote.winner].wins++;
      }
      if (popularity[vote.loser]) {
        popularity[vote.loser].losses++;
      }
    });

    // * Calculate win rates
    Object.keys(popularity).forEach(name => {
      const stats = popularity[name];
      const totalGames = stats.wins + stats.losses;
      stats.winRate = totalGames > 0 ? (stats.wins / totalGames) * 100 : 0;
    });

    return popularity;
  }, [tournament.names, tournament.ratings, tournament.voteHistory]);

  /**
   * Get tournament completion prediction
   * @param {number} averageTimePerVote - Average time per vote in milliseconds
   * @returns {Object} Completion prediction data
   */
  const getCompletionPrediction = useCallback((averageTimePerVote = 10000) => {
    const stats = getProgressStats();
    const frequency = getVotingFrequency();

    if (!frequency || stats.remainingVotes === 0) {
      return {
        estimatedCompletionTime: null,
        confidence: 1,
        basedOnHistory: false
      };
    }

    const estimatedTimeRemaining = stats.remainingVotes * averageTimePerVote;
    const estimatedCompletionTime = Date.now() + estimatedTimeRemaining;

    // * Confidence based on voting history consistency
    const timeSpans = frequency.timeSpans;
    const variance = timeSpans.reduce((sum, time) => {
      const diff = time - frequency.averageTimeSpan;
      return sum + (diff * diff);
    }, 0) / timeSpans.length;

    const confidence = Math.max(0.1, Math.min(1, 1 - (variance / (frequency.averageTimeSpan * frequency.averageTimeSpan))));

    return {
      estimatedCompletionTime,
      confidence,
      basedOnHistory: true,
      estimatedTimeRemaining
    };
  }, [getProgressStats, getVotingFrequency]);

  return {
    progress,
    remainingMatches,
    getEstimatedTimeRemaining,
    getProgressStats,
    getVotingFrequency,
    getNamePopularity,
    getCompletionPrediction
  };
};
