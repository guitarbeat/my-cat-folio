/**
 * @module StatisticsService
 * @description Service for statistics aggregation and analysis.
 * Extracted from tournamentService.js for better separation of concerns.
 */

/**
 * Service for managing tournament statistics
 */
class StatisticsService {
  /**
   * Calculate comprehensive tournament statistics
   * @param {Array<Object>} matches - Array of all matches
   * @param {Object} ratings - Ratings object
   * @param {Array<string>} names - Array of participant names
   * @returns {Object} Comprehensive statistics
   */
  calculateTournamentStatistics(matches, ratings, names) {
    if (!matches || !names || names.length === 0) {
      return this.getEmptyStatistics();
    }

    const basicStats = this.calculateBasicStatistics(matches, names);
    const ratingStats = this.calculateRatingStatistics(ratings, names);
    const matchStats = this.calculateMatchStatistics(matches, names);
    const progressStats = this.calculateProgressStatistics(matches, names);

    return {
      ...basicStats,
      ...ratingStats,
      ...matchStats,
      ...progressStats
    };
  }

  /**
   * Calculate basic tournament statistics
   * @param {Array<Object>} matches - Array of all matches
   * @param {Array<string>} names - Array of participant names
   * @returns {Object} Basic statistics
   */
  calculateBasicStatistics(matches, names) {
    const totalMatches = matches.length;
    const completedMatches = matches.filter(match => match.winner).length;
    const totalParticipants = names.length;
    const totalPossibleMatches = (totalParticipants * (totalParticipants - 1)) / 2;

    return {
      totalParticipants,
      totalMatches,
      completedMatches,
      totalPossibleMatches,
      completionRate: totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0
    };
  }

  /**
   * Calculate rating-based statistics
   * @param {Object} ratings - Ratings object
   * @param {Array<string>} names - Array of participant names
   * @returns {Object} Rating statistics
   */
  calculateRatingStatistics(ratings, names) {
    if (!ratings || Object.keys(ratings).length === 0) {
      return {
        averageRating: 1200,
        highestRating: 1200,
        lowestRating: 1200,
        ratingRange: 0,
        ratingDistribution: {}
      };
    }

    const ratingValues = names.map(name => ratings[name] || 1200);
    const averageRating = ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length;
    const highestRating = Math.max(...ratingValues);
    const lowestRating = Math.min(...ratingValues);
    const ratingRange = highestRating - lowestRating;

    // * Calculate rating distribution
    const distribution = {};
    ratingValues.forEach(rating => {
      const category = this.getRatingCategory(rating);
      distribution[category] = (distribution[category] || 0) + 1;
    });

    return {
      averageRating: Math.round(averageRating),
      highestRating,
      lowestRating,
      ratingRange,
      ratingDistribution: distribution
    };
  }

  /**
   * Calculate match-based statistics
   * @param {Array<Object>} matches - Array of all matches
   * @param {Array<string>} names - Array of participant names
   * @returns {Object} Match statistics
   */
  calculateMatchStatistics(matches, names) {
    const participantStats = {};
    let totalVotes = 0;
    let averageMatchDuration = 0;

    // * Initialize participant stats
    names.forEach(name => {
      participantStats[name] = {
        wins: 0,
        losses: 0,
        winRate: 0,
        totalMatches: 0,
        averageRating: 0
      };
    });

    // * Calculate participant statistics
    matches.forEach(match => {
      if (match.winner) {
        totalVotes++;
        
        if (participantStats[match.name1]) {
          participantStats[match.name1].totalMatches++;
          if (match.winner === match.name1) {
            participantStats[match.name1].wins++;
          } else {
            participantStats[match.name1].losses++;
          }
        }

        if (participantStats[match.name2]) {
          participantStats[match.name2].totalMatches++;
          if (match.winner === match.name2) {
            participantStats[match.name2].wins++;
          } else {
            participantStats[match.name2].losses++;
          }
        }
      }
    });

    // * Calculate win rates
    Object.keys(participantStats).forEach(name => {
      const stats = participantStats[name];
      stats.winRate = stats.totalMatches > 0 ? (stats.wins / stats.totalMatches) * 100 : 0;
    });

    // * Calculate average match duration
    const completedMatches = matches.filter(match => match.winner && match.timestamp);
    if (completedMatches.length > 1) {
      const durations = [];
      for (let i = 1; i < completedMatches.length; i++) {
        const duration = completedMatches[i].timestamp - completedMatches[i - 1].timestamp;
        durations.push(duration);
      }
      averageMatchDuration = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
    }

    return {
      participantStats,
      totalVotes,
      averageMatchDuration: Math.round(averageMatchDuration)
    };
  }

  /**
   * Calculate progress statistics
   * @param {Array<Object>} matches - Array of all matches
   * @param {Array<string>} names - Array of participant names
   * @returns {Object} Progress statistics
   */
  calculateProgressStatistics(matches, names) {
    const totalPossibleMatches = (names.length * (names.length - 1)) / 2;
    const completedMatches = matches.filter(match => match.winner).length;
    const remainingMatches = totalPossibleMatches - completedMatches;
    const progressPercentage = totalPossibleMatches > 0 ? (completedMatches / totalPossibleMatches) * 100 : 0;

    return {
      progressPercentage: Math.round(progressPercentage),
      remainingMatches,
      isComplete: remainingMatches === 0
    };
  }

  /**
   * Get rating category for a rating value
   * @param {number} rating - Rating value
   * @returns {string} Rating category
   */
  getRatingCategory(rating) {
    if (rating >= 2400) return 'Master';
    if (rating >= 2200) return 'Expert';
    if (rating >= 2000) return 'Advanced';
    if (rating >= 1800) return 'Intermediate';
    if (rating >= 1600) return 'Novice';
    return 'Beginner';
  }

  /**
   * Calculate voting frequency analysis
   * @param {Array<Object>} matches - Array of all matches
   * @returns {Object} Voting frequency statistics
   */
  calculateVotingFrequency(matches) {
    const completedMatches = matches.filter(match => match.winner && match.timestamp);
    
    if (completedMatches.length < 2) {
      return {
        averageTimeBetweenVotes: 0,
        medianTimeBetweenVotes: 0,
        fastestVote: 0,
        slowestVote: 0,
        totalVotes: completedMatches.length
      };
    }

    const timeBetweenVotes = [];
    for (let i = 1; i < completedMatches.length; i++) {
      const timeDiff = completedMatches[i].timestamp - completedMatches[i - 1].timestamp;
      timeBetweenVotes.push(timeDiff);
    }

    const sortedTimes = timeBetweenVotes.sort((a, b) => a - b);
    const averageTime = timeBetweenVotes.reduce((sum, time) => sum + time, 0) / timeBetweenVotes.length;
    const medianTime = sortedTimes[Math.floor(sortedTimes.length / 2)];

    return {
      averageTimeBetweenVotes: Math.round(averageTime),
      medianTimeBetweenVotes: Math.round(medianTime),
      fastestVote: Math.min(...timeBetweenVotes),
      slowestVote: Math.max(...timeBetweenVotes),
      totalVotes: completedMatches.length
    };
  }

  /**
   * Get empty statistics object
   * @returns {Object} Empty statistics
   */
  getEmptyStatistics() {
    return {
      totalParticipants: 0,
      totalMatches: 0,
      completedMatches: 0,
      totalPossibleMatches: 0,
      completionRate: 0,
      averageRating: 1200,
      highestRating: 1200,
      lowestRating: 1200,
      ratingRange: 0,
      ratingDistribution: {},
      participantStats: {},
      totalVotes: 0,
      averageMatchDuration: 0,
      progressPercentage: 0,
      remainingMatches: 0,
      isComplete: false
    };
  }
}

export default new StatisticsService();
