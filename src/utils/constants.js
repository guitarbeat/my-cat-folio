/**
 * Shared constants used across the application
 */

// Rating constants
export const DEFAULT_RATING = 1500;

// Tournament constants
export const MIN_TOURNAMENT_NAMES = 2;

// Filter constants
export const FILTER_OPTIONS = {
  STATUS: {
    ALL: 'all',
    ACTIVE: 'active',
    HIDDEN: 'hidden'
  },
  USER: {
    ALL: 'all_users',
    SPECIFIC: 'specific_users'
  }
};

// Time constants
export const ACTIVE_THRESHOLD = 3600000; // 1 hour in milliseconds

// Chart constants
export const CHART_COLORS = {
  PRIMARY: 'rgba(59, 130, 246, 0.8)',
  SUCCESS: 'rgba(16, 185, 129, 0.8)',
  WARNING: 'rgba(245, 158, 11, 0.8)',
  ERROR: 'rgba(239, 68, 68, 0.8)',
  NEUTRAL: 'rgba(156, 163, 175, 0.8)'
};
