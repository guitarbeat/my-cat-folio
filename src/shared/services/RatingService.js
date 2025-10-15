/**
 * @module RatingService
 * @description Service for rating calculations and Elo rating system.
 * Extracted from tournamentService.js for better separation of concerns.
 */

/**
 * Service for managing rating calculations
 */
class RatingService {
  /**
   * Calculate Elo rating change
   * @param {number} ratingA - Current rating of player A
   * @param {number} ratingB - Current rating of player B
   * @param {number} scoreA - Score for player A (1 for win, 0 for loss, 0.5 for draw)
   * @param {number} kFactor - K-factor for rating calculation
   * @returns {Object} New ratings for both players
   */
  calculateEloChange(ratingA, ratingB, scoreA, kFactor = 32) {
    const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    const expectedB = 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400));

    const newRatingA = ratingA + kFactor * (scoreA - expectedA);
    const newRatingB = ratingB + kFactor * ((1 - scoreA) - expectedB);

    return {
      newRatingA: Math.round(newRatingA),
      newRatingB: Math.round(newRatingB)
    };
  }

  /**
   * Calculate expected score for a player
   * @param {number} ratingA - Player A rating
   * @param {number} ratingB - Player B rating
   * @returns {number} Expected score for player A
   */
  calculateExpectedScore(ratingA, ratingB) {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  }

  /**
   * Calculate rating change for a single player
   * @param {number} currentRating - Current player rating
   * @param {number} expectedScore - Expected score
   * @param {number} actualScore - Actual score
   * @param {number} kFactor - K-factor for rating calculation
   * @returns {number} New rating
   */
  calculateRatingChange(currentRating, expectedScore, actualScore, kFactor = 32) {
    const ratingChange = kFactor * (actualScore - expectedScore);
    return Math.round(currentRating + ratingChange);
  }

  /**
   * Get rating category based on rating value
   * @param {number} rating - Player rating
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
   * Calculate average rating from an array of ratings
   * @param {Array<number>} ratings - Array of ratings
   * @returns {number} Average rating
   */
  calculateAverageRating(ratings) {
    if (!ratings || ratings.length === 0) return 0;
    return Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length);
  }

  /**
   * Calculate rating distribution statistics
   * @param {Object} ratings - Object with name as key and rating as value
   * @returns {Object} Rating distribution statistics
   */
  calculateRatingDistribution(ratings) {
    const ratingValues = Object.values(ratings);
    if (ratingValues.length === 0) {
      return {
        min: 0,
        max: 0,
        average: 0,
        median: 0,
        standardDeviation: 0
      };
    }

    const sortedRatings = ratingValues.sort((a, b) => a - b);
    const min = sortedRatings[0];
    const max = sortedRatings[sortedRatings.length - 1];
    const average = this.calculateAverageRating(ratingValues);
    
    // Calculate median
    const middle = Math.floor(sortedRatings.length / 2);
    const median = sortedRatings.length % 2 === 0
      ? (sortedRatings[middle - 1] + sortedRatings[middle]) / 2
      : sortedRatings[middle];

    // Calculate standard deviation
    const variance = ratingValues.reduce((sum, rating) => {
      const diff = rating - average;
      return sum + (diff * diff);
    }, 0) / ratingValues.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      min,
      max,
      average,
      median,
      standardDeviation
    };
  }

  /**
   * Calculate rating change for a match
   * @param {string} winner - Winner name
   * @param {string} loser - Loser name
   * @param {Object} currentRatings - Current ratings object
   * @param {number} kFactor - K-factor for rating calculation
   * @returns {Object} Updated ratings and rating changes
   */
  calculateMatchRatingChange(winner, loser, currentRatings, kFactor = 32) {
    const winnerRating = currentRatings[winner] || 1200;
    const loserRating = currentRatings[loser] || 1200;

    const { newRatingA, newRatingB } = this.calculateEloChange(
      winnerRating,
      loserRating,
      1, // Winner gets 1 point
      kFactor
    );

    return {
      winnerRating: newRatingA,
      loserRating: newRatingB,
      winnerChange: newRatingA - winnerRating,
      loserChange: newRatingB - loserRating
    };
  }
}

export default new RatingService();
