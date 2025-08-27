/**
 * @module ErrorService
 * @description Centralized error handling service for the application.
 * Provides consistent error handling, logging, and user feedback.
 */

export class ErrorService {
  /**
   * * Error types for categorization
   */
  static get ERROR_TYPES() {
    return {
      NETWORK: 'network',
      VALIDATION: 'validation',
      AUTH: 'auth',
      DATABASE: 'database',
      UNKNOWN: 'unknown'
    };
  }

  /**
   * * Error severity levels
   */
  static get SEVERITY_LEVELS() {
    return {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      CRITICAL: 'critical'
    };
  }

  /**
   * * Handles errors with consistent formatting and logging
   * @param {Error|Object} error - The error object or error-like object
   * @param {string} context - Context where the error occurred
   * @param {Object} metadata - Additional metadata about the error
   * @returns {Object} Formatted error object for UI display
   */
  static handleError(error, context = 'Unknown', metadata = {}) {
    const errorInfo = this.parseError(error);
    const formattedError = this.formatError(errorInfo, context, metadata);

    // * Log error for debugging
    this.logError(formattedError, context, metadata);

    return formattedError;
  }

  /**
   * * Parses different types of error objects
   * @param {Error|Object} error - The error to parse
   * @returns {Object} Parsed error information
   */
  static parseError(error) {
    if (error instanceof Error) {
      return {
        message: error.message,
        name: error.name,
        stack: error.stack,
        type: this.determineErrorType(error)
      };
    }

    if (typeof error === 'string') {
      return {
        message: error,
        name: 'StringError',
        stack: null,
        type: this.ERROR_TYPES.UNKNOWN
      };
    }

    if (error && typeof error === 'object') {
      return {
        message: error.message || error.error || 'Unknown error occurred',
        name: error.name || 'ObjectError',
        stack: error.stack || null,
        type: this.determineErrorType(error),
        code: error.code || null,
        status: error.status || null
      };
    }

    return {
      message: 'An unexpected error occurred',
      name: 'UnknownError',
      stack: null,
      type: this.ERROR_TYPES.UNKNOWN
    };
  }

  /**
   * * Determines the type of error based on error properties
   * @param {Error|Object} error - The error to analyze
   * @returns {string} Error type
   */
  static determineErrorType(error) {
    if (error.code === 'PGRST301' || error.code === 'PGRST302') {
      return this.ERROR_TYPES.AUTH;
    }

    if (error.code === 'PGRST116' || error.code === 'PGRST117') {
      return this.ERROR_TYPES.VALIDATION;
    }

    if (
      error.status === 0 ||
      error.status === 500 ||
      error.message?.includes('fetch')
    ) {
      return this.ERROR_TYPES.NETWORK;
    }

    if (
      error.message?.includes('database') ||
      error.message?.includes('supabase')
    ) {
      return this.ERROR_TYPES.DATABASE;
    }

    return this.ERROR_TYPES.UNKNOWN;
  }

  /**
   * * Formats error for consistent UI display
   * @param {Object} errorInfo - Parsed error information
   * @param {string} context - Context where error occurred
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Formatted error for UI
   */
  static formatError(errorInfo, context, metadata) {
    const severity = this.determineSeverity(errorInfo, metadata);
    const userMessage = this.getUserFriendlyMessage(errorInfo, context);
    const isRetryable = this.isRetryable(errorInfo, metadata);

    return {
      id: this.generateErrorId(),
      message: errorInfo.message,
      userMessage,
      context,
      type: errorInfo.type,
      severity,
      isRetryable,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        originalError: errorInfo,
        stack: errorInfo.stack
      }
    };
  }

  /**
   * * Determines error severity based on type and metadata
   * @param {Object} errorInfo - Parsed error information
   * @param {Object} metadata - Error metadata
   * @returns {string} Severity level
   */
  static determineSeverity(errorInfo, metadata) {
    if (metadata.isCritical) {
      return this.SEVERITY_LEVELS.CRITICAL;
    }

    if (metadata.affectsUserData) {
      return this.SEVERITY_LEVELS.HIGH;
    }

    switch (errorInfo.type) {
      case this.ERROR_TYPES.AUTH:
        return this.SEVERITY_LEVELS.HIGH;
      case this.ERROR_TYPES.DATABASE:
        return this.SEVERITY_LEVELS.MEDIUM;
      case this.ERROR_TYPES.NETWORK:
        return this.SEVERITY_LEVELS.MEDIUM;
      case this.ERROR_TYPES.VALIDATION:
        return this.SEVERITY_LEVELS.LOW;
      default:
        return this.SEVERITY_LEVELS.MEDIUM;
    }
  }

  /**
   * * Generates user-friendly error messages
   * @param {Object} errorInfo - Parsed error information
   * @param {string} context - Error context
   * @returns {string} User-friendly message
   */
  static getUserFriendlyMessage(errorInfo, context) {
    const contextMap = {
      'Tournament Completion': 'Failed to complete tournament',
      'Tournament Setup': 'Failed to set up tournament',
      'Rating Update': 'Failed to update ratings',
      Login: 'Failed to log in',
      'Profile Load': 'Failed to load profile',
      'Database Query': 'Failed to fetch data'
    };

    const contextMessage = contextMap[context] || 'An error occurred';

    switch (errorInfo.type) {
      case this.ERROR_TYPES.NETWORK:
        return `${contextMessage}. Please check your internet connection and try again.`;
      case this.ERROR_TYPES.AUTH:
        return `${contextMessage}. Please log in again.`;
      case this.ERROR_TYPES.VALIDATION:
        return `${contextMessage}. Please check your input and try again.`;
      case this.ERROR_TYPES.DATABASE:
        return `${contextMessage}. Please try again later.`;
      default:
        return `${contextMessage}. Please try again.`;
    }
  }

  /**
   * * Determines if an error is retryable
   * @param {Object} errorInfo - Parsed error information
   * @param {Object} metadata - Error metadata
   * @returns {boolean} Whether error is retryable
   */
  static isRetryable(errorInfo, metadata) {
    if (metadata.isRetryable === false) {
      return false;
    }

    if (metadata.isRetryable === true) {
      return true;
    }

    // * Network errors are generally retryable
    if (errorInfo.type === this.ERROR_TYPES.NETWORK) {
      return true;
    }

    // * Database errors might be retryable
    if (errorInfo.type === this.ERROR_TYPES.DATABASE) {
      return true;
    }

    // * Auth errors are not retryable
    if (errorInfo.type === this.ERROR_TYPES.AUTH) {
      return false;
    }

    // * Validation errors are not retryable
    if (errorInfo.type === this.ERROR_TYPES.VALIDATION) {
      return false;
    }

    return false;
  }

  /**
   * * Generates unique error ID
   * @returns {string} Unique error identifier
   */
  static generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * * Logs error information for debugging
   * @param {Object} formattedError - Formatted error object
   * @param {string} context - Error context
   * @param {Object} metadata - Error metadata
   */
  static logError(formattedError, context, metadata) {
    const logData = {
      error: formattedError,
      context,
      metadata,
      timestamp: new Date().toISOString()
    };

    // * Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error in ${context}`);
      console.error('Error Details:', logData);
      console.groupEnd();
    }

    // * TODO: Send to error tracking service (e.g., Sentry) in production
    if (process.env.NODE_ENV === 'production') {
      // * this.sendToErrorService(logData);
    }
  }

  /**
   * * Creates a retry wrapper for async operations
   * @param {Function} operation - Async operation to retry
   * @param {Object} options - Retry options
   * @returns {Function} Wrapped function with retry logic
   */
  static withRetry(operation, options = {}) {
    const {
      maxRetries = 3,
      delay = 1000,
      backoff = 2,
      shouldRetry = (error) => this.isRetryable(error, {})
    } = options;

    return async (...args) => {
      let lastError;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await operation(...args);
        } catch (error) {
          lastError = error;

          if (attempt === maxRetries || !shouldRetry(error)) {
            throw error;
          }

          // * Wait before retrying with exponential backoff
          const waitTime = delay * Math.pow(backoff, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }

      throw lastError;
    };
  }
}

export default ErrorService;
