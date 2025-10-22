/**
 * @module useToast
 * @description Custom hook for managing toast notifications with a queue system.
 * Provides functions to show, hide, and manage multiple toast notifications.
 */

import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for managing toast notifications
 * @param {Object} options - Configuration options
 * @param {number} options.maxToasts - Maximum number of toasts to show
 * @param {number} options.defaultDuration - Default duration for toasts
 * @returns {Object} Toast management utilities and state
 */
export const useToast = (options = {}) => {
  const { maxToasts = 5, defaultDuration = 2500 } = options;

  const [toasts, setToasts] = useState([]);
  const toastIdCounter = useRef(0);

  /**
   * Generate a unique toast ID
   * @returns {string} Unique toast ID
   */
  const generateToastId = useCallback(() => {
    return `toast-${Date.now()}-${toastIdCounter.current++}`;
  }, []);

  /**
   * Show a toast notification
   * @param {Object} toastConfig - Toast configuration
   * @param {string} toastConfig.message - Toast message
   * @param {string} toastConfig.type - Toast type ('success', 'error', 'info', 'warning')
   * @param {number} toastConfig.duration - Duration in milliseconds
   * @param {boolean} toastConfig.autoDismiss - Whether to auto-dismiss
   * @returns {string} Toast ID
   */
  const showToast = useCallback(
    (toastConfig) => {
      const {
        message,
        type = 'info',
        duration = defaultDuration,
        autoDismiss = true
      } = toastConfig;

      const toastId = generateToastId();

      const newToast = {
        id: toastId,
        message,
        type,
        duration,
        autoDismiss,
        timestamp: Date.now()
      };

      setToasts((prev) => {
        const updatedToasts = [...prev, newToast];
        // Keep only the most recent toasts up to maxToasts
        return updatedToasts.slice(-maxToasts);
      });

      return toastId;
    },
    [defaultDuration, maxToasts, generateToastId]
  );

  /**
   * Show a success toast
   * @param {string} message - Success message
   * @param {Object} options - Additional options
   * @returns {string} Toast ID
   */
  const showSuccess = useCallback(
    (message, options = {}) => {
      return showToast({
        message,
        type: 'success',
        ...options
      });
    },
    [showToast]
  );

  /**
   * Show an error toast
   * @param {string} message - Error message
   * @param {Object} options - Additional options
   * @returns {string} Toast ID
   */
  const showError = useCallback(
    (message, options = {}) => {
      return showToast({
        message,
        type: 'error',
        ...options
      });
    },
    [showToast]
  );

  /**
   * Show an info toast
   * @param {string} message - Info message
   * @param {Object} options - Additional options
   * @returns {string} Toast ID
   */
  const showInfo = useCallback(
    (message, options = {}) => {
      return showToast({
        message,
        type: 'info',
        ...options
      });
    },
    [showToast]
  );

  /**
   * Show a warning toast
   * @param {string} message - Warning message
   * @param {Object} options - Additional options
   * @returns {string} Toast ID
   */
  const showWarning = useCallback(
    (message, options = {}) => {
      return showToast({
        message,
        type: 'warning',
        ...options
      });
    },
    [showToast]
  );

  /**
   * Remove a specific toast by ID
   * @param {string} toastId - ID of the toast to remove
   */
  const removeToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  }, []);

  /**
   * Remove all toasts
   */
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  /**
   * Remove toasts by type
   * @param {string} type - Type of toasts to remove
   */
  const removeToastsByType = useCallback((type) => {
    setToasts((prev) => prev.filter((toast) => toast.type !== type));
  }, []);

  /**
   * Update a specific toast
   * @param {string} toastId - ID of the toast to update
   * @param {Object} updates - Updates to apply
   */
  const updateToast = useCallback((toastId, updates) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === toastId ? { ...toast, ...updates } : toast
      )
    );
  }, []);

  /**
   * Get toasts by type
   * @param {string} type - Type of toasts to get
   * @returns {Array} Array of toasts of the specified type
   */
  const getToastsByType = useCallback(
    (type) => {
      return toasts.filter((toast) => toast.type === type);
    },
    [toasts]
  );

  /**
   * Check if there are any toasts of a specific type
   * @param {string} type - Type to check
   * @returns {boolean} True if there are toasts of the specified type
   */
  const hasToastsOfType = useCallback(
    (type) => {
      return toasts.some((toast) => toast.type === type);
    },
    [toasts]
  );

  return {
    // State
    toasts,

    // Actions
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeToast,
    clearAllToasts,
    removeToastsByType,
    updateToast,

    // Getters
    getToastsByType,
    hasToastsOfType,

    // Utilities
    toastCount: toasts.length,
    hasToasts: toasts.length > 0
  };
};

export default useToast;
