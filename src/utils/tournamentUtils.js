/**
 * @module tournamentUtils
 * @description Utility functions for tournament logic and state management
 */

/**
 * Generate all possible pairs from a list of names
 * @param {Array} nameList - Array of name strings
 * @returns {Array} Array of [name1, name2] pairs
 */
export function generatePairs(nameList) {
  const pairs = [];
  for (let i = 0; i < nameList.length - 1; i++) {
    for (let j = i + 1; j < nameList.length; j++) {
      pairs.push([nameList[i], nameList[j]]);
    }
  }
  return pairs;
}

/**
 * Build a comparisons map from tournament history
 * @param {Array} history - Array of tournament history entries
 * @returns {Map} Map of name -> comparison count
 */
export function buildComparisonsMap(history) {
  const comparisons = new Map();
  for (const v of history) {
    const l = v?.match?.left?.name;
    const r = v?.match?.right?.name;
    if (l) comparisons.set(l, (comparisons.get(l) || 0) + 1);
    if (r) comparisons.set(r, (comparisons.get(r) || 0) + 1);
  }
  return comparisons;
}

/**
 * Initialize sorter pairs if not already done
 * @param {Object} sorter - The sorter object
 * @param {Array} nameList - Array of name strings
 */
export function initializeSorterPairs(sorter, nameList) {
  if (!Array.isArray(sorter._pairs)) {
    sorter._pairs = generatePairs(nameList);
    sorter._pairIndex = 0;
  }
}

/**
 * Get preferences map from sorter
 * @param {Object} sorter - The sorter object
 * @returns {Map} Preferences map
 */
export function getPreferencesMap(sorter) {
  return sorter.preferences instanceof Map ? sorter.preferences : new Map();
}

/**
 * Calculate the blended rating for a name.
 * @param {number} existingRating - Previous rating value
 * @param {number} position - Position in sorted list
 * @param {number} totalNames - Total number of names
 * @param {number} matchesPlayed - Matches completed
 * @param {number} maxMatches - Total matches in tournament
 * @returns {number} Final rating between 1000 and 2000
 */
export function computeRating(
  existingRating,
  position,
  totalNames,
  matchesPlayed,
  maxMatches
) {
  const ratingSpread = Math.min(1000, totalNames * 25);
  const positionValue =
    ((totalNames - position - 1) / (totalNames - 1)) * ratingSpread;
  const newPositionRating = 1500 + positionValue;
  const blendFactor = Math.min(0.8, (matchesPlayed / maxMatches) * 0.9);
  const newRating = Math.round(
    blendFactor * newPositionRating + (1 - blendFactor) * existingRating
  );
  return Math.max(1000, Math.min(2000, newRating));
}

export default { computeRating };
