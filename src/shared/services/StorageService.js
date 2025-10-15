/**
 * @module StorageService
 * @description Centralized storage service for all persistence logic.
 * Consolidates localStorage, sessionStorage, and other storage operations.
 */

/**
 * Service for managing all storage operations
 */
class StorageService {
  constructor() {
    this.storage = window.localStorage;
    this.sessionStorage = window.sessionStorage;
  }

  /**
   * Check if storage is available
   * @returns {boolean} Whether storage is available
   */
  isStorageAvailable() {
    try {
      const test = '__storage_test__';
      this.storage.setItem(test, test);
      this.storage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} Stored value or default
   */
  getItem(key, defaultValue = null) {
    if (!this.isStorageAvailable()) {
      console.warn('localStorage is not available');
      return defaultValue;
    }

    try {
      const item = this.storage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} Whether operation was successful
   */
  setItem(key, value) {
    if (!this.isStorageAvailable()) {
      console.warn('localStorage is not available');
      return false;
    }

    try {
      this.storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} Whether operation was successful
   */
  removeItem(key) {
    if (!this.isStorageAvailable()) {
      console.warn('localStorage is not available');
      return false;
    }

    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all localStorage items
   * @returns {boolean} Whether operation was successful
   */
  clear() {
    if (!this.isStorageAvailable()) {
      console.warn('localStorage is not available');
      return false;
    }

    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  /**
   * Get all keys from localStorage
   * @returns {Array<string>} Array of storage keys
   */
  getAllKeys() {
    if (!this.isStorageAvailable()) {
      return [];
    }

    try {
      return Object.keys(this.storage);
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }

  /**
   * Get multiple items at once
   * @param {Array<string>} keys - Array of keys to retrieve
   * @returns {Object} Object with key-value pairs
   */
  getMultipleItems(keys) {
    const result = {};
    keys.forEach(key => {
      result[key] = this.getItem(key);
    });
    return result;
  }

  /**
   * Set multiple items at once
   * @param {Object} items - Object with key-value pairs
   * @returns {boolean} Whether all operations were successful
   */
  setMultipleItems(items) {
    let allSuccessful = true;
    Object.entries(items).forEach(([key, value]) => {
      if (!this.setItem(key, value)) {
        allSuccessful = false;
      }
    });
    return allSuccessful;
  }

  /**
   * Session storage methods
   */
  getSessionItem(key, defaultValue = null) {
    if (!this.isStorageAvailable()) {
      return defaultValue;
    }

    try {
      const item = this.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from sessionStorage key "${key}":`, error);
      return defaultValue;
    }
  }

  setSessionItem(key, value) {
    if (!this.isStorageAvailable()) {
      return false;
    }

    try {
      this.sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to sessionStorage key "${key}":`, error);
      return false;
    }
  }

  removeSessionItem(key) {
    if (!this.isStorageAvailable()) {
      return false;
    }

    try {
      this.sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from sessionStorage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Tournament-specific storage methods
   */
  saveTournamentData(tournamentData) {
    return this.setItem('tournamentData', tournamentData);
  }

  getTournamentData() {
    return this.getItem('tournamentData', {
      names: null,
      ratings: {},
      isComplete: false,
      isLoading: false,
      voteHistory: [],
      currentView: 'tournament'
    });
  }

  saveUserData(userData) {
    return this.setItem('userData', userData);
  }

  getUserData() {
    return this.getItem('userData', {
      name: '',
      isLoggedIn: false,
      isAdmin: false,
      preferences: {}
    });
  }

  saveUIState(uiState) {
    return this.setItem('uiState', uiState);
  }

  getUIState() {
    return this.getItem('uiState', {
      theme: 'light',
      showPerformanceDashboard: false,
      showGlobalAnalytics: false,
      showUserComparison: false,
      matrixMode: false
    });
  }

  /**
   * Clear all tournament data
   */
  clearTournamentData() {
    const keysToRemove = [
      'tournamentData',
      'tournamentNames',
      'tournamentRatings',
      'tournamentVoteHistory',
      'tournamentMatches'
    ];
    
    keysToRemove.forEach(key => this.removeItem(key));
  }

  /**
   * Export data for backup
   * @returns {Object} All stored data
   */
  exportData() {
    const allKeys = this.getAllKeys();
    const data = {};
    
    allKeys.forEach(key => {
      data[key] = this.getItem(key);
    });
    
    return {
      timestamp: Date.now(),
      data
    };
  }

  /**
   * Import data from backup
   * @param {Object} backupData - Backup data object
   * @returns {boolean} Whether import was successful
   */
  importData(backupData) {
    if (!backupData || !backupData.data) {
      console.error('Invalid backup data format');
      return false;
    }

    try {
      Object.entries(backupData.data).forEach(([key, value]) => {
        this.setItem(key, value);
      });
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export default new StorageService();
