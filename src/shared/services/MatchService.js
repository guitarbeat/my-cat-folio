/**
 * @module MatchService
 * @description Service for match management and tournament logic.
 * Extracted from tournamentService.js for better separation of concerns.
 */

/**
 * Service for managing tournament matches
 */
class MatchService {
  /**
   * Generate all possible matches for a tournament
   * @param {Array<string>} names - Array of participant names
   * @returns {Array<Object>} Array of match objects
   */
  generateMatches(names) {
    if (!names || names.length < 2) return [];

    const matches = [];
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        matches.push({
          id: `${names[i]}-${names[j]}`,
          name1: names[i],
          name2: names[j],
          winner: null,
          timestamp: null
        });
      }
    }
    return matches;
  }

  /**
   * Get the next match to vote on
   * @param {Array<Object>} matches - Array of all matches
   * @returns {Object|null} Next match or null if complete
   */
  getNextMatch(matches) {
    if (!matches || matches.length === 0) return null;

    const nextMatch = matches.find(match => !match.winner);
    return nextMatch || null;
  }

  /**
   * Process a vote and update match
   * @param {string} matchId - Match ID
   * @param {string} winner - Winner name
   * @param {Array<Object>} matches - Array of all matches
   * @returns {Array<Object>} Updated matches array
   */
  processVote(matchId, winner, matches) {
    return matches.map(match => {
      if (match.id === matchId) {
        return {
          ...match,
          winner,
          timestamp: Date.now()
        };
      }
      return match;
    });
  }

  /**
   * Check if tournament is complete
   * @param {Array<Object>} matches - Array of all matches
   * @returns {boolean} Whether tournament is complete
   */
  isTournamentComplete(matches) {
    if (!matches || matches.length === 0) return false;
    return matches.every(match => match.winner);
  }

  /**
   * Get tournament progress
   * @param {Array<Object>} matches - Array of all matches
   * @returns {Object} Progress statistics
   */
  getTournamentProgress(matches) {
    if (!matches || matches.length === 0) {
      return {
        completed: 0,
        total: 0,
        percentage: 0,
        isComplete: false
      };
    }

    const completed = matches.filter(match => match.winner).length;
    const total = matches.length;
    const percentage = (completed / total) * 100;
    const isComplete = completed === total;

    return {
      completed,
      total,
      percentage,
      isComplete
    };
  }

  /**
   * Get match statistics for a specific name
   * @param {string} name - Participant name
   * @param {Array<Object>} matches - Array of all matches
   * @returns {Object} Match statistics
   */
  getMatchStatistics(name, matches) {
    if (!matches || matches.length === 0) {
      return {
        wins: 0,
        losses: 0,
        winRate: 0,
        totalMatches: 0
      };
    }

    const nameMatches = matches.filter(match =>
      match.name1 === name || match.name2 === name
    );

    const wins = nameMatches.filter(match => match.winner === name).length;
    const losses = nameMatches.filter(match =>
      match.winner && match.winner !== name
    ).length;
    const totalMatches = wins + losses;
    const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

    return {
      wins,
      losses,
      winRate,
      totalMatches
    };
  }

  /**
   * Get head-to-head record between two names
   * @param {string} name1 - First name
   * @param {string} name2 - Second name
   * @param {Array<Object>} matches - Array of all matches
   * @returns {Object} Head-to-head record
   */
  getHeadToHeadRecord(name1, name2, matches) {
    if (!matches || matches.length === 0) {
      return {
        name1Wins: 0,
        name2Wins: 0,
        totalMatches: 0
      };
    }

    const headToHeadMatches = matches.filter(match =>
      (match.name1 === name1 && match.name2 === name2) ||
      (match.name1 === name2 && match.name2 === name1)
    );

    const name1Wins = headToHeadMatches.filter(match => match.winner === name1).length;
    const name2Wins = headToHeadMatches.filter(match => match.winner === name2).length;
    const totalMatches = name1Wins + name2Wins;

    return {
      name1Wins,
      name2Wins,
      totalMatches
    };
  }

  /**
   * Get recent matches for a name
   * @param {string} name - Participant name
   * @param {Array<Object>} matches - Array of all matches
   * @param {number} limit - Maximum number of recent matches
   * @returns {Array<Object>} Recent matches
   */
  getRecentMatches(name, matches, limit = 5) {
    if (!matches || matches.length === 0) return [];

    const nameMatches = matches
      .filter(match =>
        (match.name1 === name || match.name2 === name) && match.winner
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    return nameMatches;
  }

  /**
   * Get tournament bracket structure
   * @param {Array<Object>} matches - Array of all matches
   * @param {Array<string>} names - Array of participant names
   * @returns {Object} Bracket structure
   */
  getTournamentBracket(matches, names) {
    if (!matches || !names || names.length === 0) {
      return {
        rounds: [],
        totalRounds: 0,
        currentRound: 0
      };
    }

    const totalRounds = Math.ceil(Math.log2(names.length));
    const rounds = [];

    // * Generate bracket rounds
    for (let round = 0; round < totalRounds; round++) {
      const roundMatches = matches.filter(match => {
        // * Simple round assignment based on match completion
        const matchIndex = matches.indexOf(match);
        const roundSize = Math.pow(2, totalRounds - round - 1);
        return matchIndex >= roundSize && matchIndex < roundSize * 2;
      });

      rounds.push({
        round: round + 1,
        matches: roundMatches,
        isComplete: roundMatches.every(match => match.winner)
      });
    }

    const currentRound = rounds.findIndex(round => !round.isComplete) + 1;

    return {
      rounds,
      totalRounds,
      currentRound: currentRound || totalRounds
    };
  }
}

export default new MatchService();
