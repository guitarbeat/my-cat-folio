/**
 * @module useErrorHandler
 * @description Custom hook for handling errors in React components with
 * standardized error handling, logging, and user feedback.
 */

import { useState, useCallback, useRef } from "react";
import {
  createStandardizedError,
  withRetry,
  ERROR_TYPES,
  ERROR_SEVERITY,
} from "../utils/errorHandler";

/**
 * Custom hook for error handling in React components
 * @param {Object} options - Configuration options
 * @param {boolean} options.showUserFeedback - Whether to show error messages to users
 * @param {number} options.maxRetries - Maximum number of retry attempts
 * @param {Function} options.onError - Callback function when errors occur
 * @param {Function} options.onRecovery - Callback function when errors are recovered from
 * @returns {Object} Error handling utilities and state
 */
export const useErrorHandler = (options = {}) => {
  const {
    showUserFeedback = true,
    maxRetries = 3,
    onError = null,
    onRecovery = null,
  } = options;

  const [errors, setErrors] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const retryCountRef = useRef(0);
  const lastErrorRef = useRef(null);

  /**
   * Handle an error with standardized processing
   * @param {Error|Object} error - The error to handle
   * @param {string} context - Where the error occurred
   * @param {Object} additionalInfo - Additional context about the error
   * @returns {Object} Standardized error information
   */
  const handleError = useCallback(
    (error, context = "Component Error", additionalInfo = {}) => {
      const standardizedError = createStandardizedError(
        error,
        context,
        additionalInfo,
      );

      // Update state
      setErrors((prev) => [...prev, standardizedError]);
      setIsError(true);
      lastErrorRef.current = standardizedError;

      // Call error callback if provided
      if (onError) {
        onError(standardizedError);
      }

      return standardizedError;
    },
    [onError],
  );

  /**
   * Clear all errors and reset error state
   */
  const clearErrors = useCallback(() => {
    setErrors([]);
    setIsError(false);
    setIsRecovering(false);
    retryCountRef.current = 0;
    lastErrorRef.current = null;
  }, []);

  /**
   * Clear a specific error by index
   * @param {number} index - Index of the error to clear
   */
  const clearError = useCallback(
    (index) => {
      setErrors((prev) => prev.filter((_, i) => i !== index));
      if (errors.length <= 1) {
        setIsError(false);
        setIsRecovering(false);
      }
    },
    [errors.length],
  );

  /**
   * Retry the last failed operation
   * @param {Function} operation - The operation to retry
   * @param {Object} retryOptions - Retry configuration
   */
  const retryOperation = useCallback(
    async (operation, retryOptions = {}) => {
      if (!lastErrorRef.current?.isRetryable) {
        throw new Error("Operation is not retryable");
      }

      setIsRecovering(true);

      try {
        const result = await withRetry(operation, {
          maxRetries: retryOptions.maxRetries || maxRetries,
          delay: retryOptions.delay || 1000,
          backoff: retryOptions.backoff || 2,
        });

        // Success - clear errors and call recovery callback
        clearErrors();
        if (onRecovery) {
          onRecovery(result);
        }

        return result;
      } catch (retryError) {
        // Retry failed - handle the new error
        handleError(retryError, "Retry Operation", {
          originalError: lastErrorRef.current,
          retryAttempt: retryCountRef.current + 1,
        });
        throw retryError;
      } finally {
        setIsRecovering(false);
      }
    },
    [maxRetries, onRecovery, clearErrors, handleError],
  );

  /**
   * Execute an operation with automatic error handling
   * @param {Function} operation - The operation to execute
   * @param {Object} options - Execution options
   * @returns {Promise} Operation result
   */
  const executeWithErrorHandling = useCallback(
    async (operation, options = {}) => {
      const {
        context = "Operation",
        retryOnError = false,
        showFeedback = showUserFeedback,
        additionalInfo = {},
      } = options;

      try {
        const result = await operation();

        // Clear any previous errors on success
        if (isError) {
          clearErrors();
        }

        return result;
      } catch (error) {
        const errorInfo = handleError(error, context, {
          ...additionalInfo,
          retryOnError,
          showFeedback,
        });

        if (retryOnError && errorInfo.isRetryable) {
          return retryOperation(operation, { context, additionalInfo });
        }

        throw error;
      }
    },
    [isError, clearErrors, handleError, retryOperation, showUserFeedback],
  );

  /**
   * Get the most recent error
   * @returns {Object|null} The most recent error or null
   */
  const getLastError = useCallback(() => {
    return lastErrorRef.current;
  }, []);

  /**
   * Check if there are any critical errors
   * @returns {boolean} True if there are critical errors
   */
  const hasCriticalErrors = useCallback(() => {
    return errors.some((error) => error.severity === ERROR_SEVERITY.CRITICAL);
  }, [errors]);

  /**
   * Get errors by type
   * @param {string} errorType - The type of errors to filter by
   * @returns {Array} Array of errors of the specified type
   */
  const getErrorsByType = useCallback(
    (errorType) => {
      return errors.filter((error) => error.errorType === errorType);
    },
    [errors],
  );

  /**
   * Get errors by severity
   * @param {string} severity - The severity level to filter by
   * @returns {Array} Array of errors of the specified severity
   */
  const getErrorsBySeverity = useCallback(
    (severity) => {
      return errors.filter((error) => error.severity === severity);
    },
    [errors],
  );

  /**
   * Get user-friendly error messages for display
   * @returns {Array} Array of user-friendly error messages
   */
  const getUserFriendlyErrors = useCallback(() => {
    return errors
      .filter((error) => error.shouldShowUser)
      .map((error) => ({
        message: error.userMessage,
        severity: error.severity,
        timestamp: error.timestamp,
        context: error.context,
      }));
  }, [errors]);

  return {
    // State
    errors,
    isError,
    isRecovering,

    // Actions
    handleError,
    clearErrors,
    clearError,
    retryOperation,
    executeWithErrorHandling,

    // Getters
    getLastError,
    hasCriticalErrors,
    getErrorsByType,
    getErrorsBySeverity,
    getUserFriendlyErrors,

    // Utilities
    ERROR_TYPES,
    ERROR_SEVERITY,
  };
};

export default useErrorHandler;
