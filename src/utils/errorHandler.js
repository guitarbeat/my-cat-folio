/**
 * @module errorHandler
 * @description Centralized error handling utility for consistent error management
 * across the application. Provides error logging, user feedback, and recovery options.
 */

// Error types for categorization
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  AUTHENTICATION: 'AUTHENTICATION',
  DATABASE: 'DATABASE',
  VALIDATION: 'VALIDATION',
  RUNTIME: 'RUNTIME',
  UNKNOWN: 'UNKNOWN'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

// Error messages for user display
export const USER_FRIENDLY_MESSAGES = {
  [ERROR_TYPES.NETWORK]: {
    [ERROR_SEVERITY.LOW]: 'Connection is slow. Please try again.',
    [ERROR_SEVERITY.MEDIUM]: 'Network connection issue. Please check your internet and try again.',
    [ERROR_SEVERITY.HIGH]: 'Unable to connect to the server. Please try again later.',
    [ERROR_SEVERITY.CRITICAL]: 'Service temporarily unavailable. Please try again later.'
  },
  [ERROR_TYPES.AUTHENTICATION]: {
    [ERROR_SEVERITY.LOW]: 'Please log in again.',
    [ERROR_SEVERITY.MEDIUM]: 'Your session has expired. Please log in again.',
    [ERROR_SEVERITY.HIGH]: 'Authentication failed. Please check your credentials.',
    [ERROR_SEVERITY.CRITICAL]: 'Account access issue. Please contact support.'
  },
  [ERROR_TYPES.DATABASE]: {
    [ERROR_SEVERITY.LOW]: 'Data loading is slow. Please try again.',
    [ERROR_SEVERITY.MEDIUM]: 'Unable to load data. Please refresh the page.',
    [ERROR_SEVERITY.HIGH]: 'Data access error. Please try again later.',
    [ERROR_SEVERITY.CRITICAL]: 'Database connection issue. Please try again later.'
  },
  [ERROR_TYPES.VALIDATION]: {
    [ERROR_SEVERITY.LOW]: 'Please check your input and try again.',
    [ERROR_SEVERITY.MEDIUM]: 'Invalid input detected. Please review and try again.',
    [ERROR_SEVERITY.HIGH]: 'Input validation failed. Please check your data.',
    [ERROR_SEVERITY.CRITICAL]: 'Critical validation error. Please contact support.'
  },
  [ERROR_TYPES.RUNTIME]: {
    [ERROR_SEVERITY.LOW]: 'Something went wrong. Please try again.',
    [ERROR_SEVERITY.MEDIUM]: 'An error occurred. Please refresh the page.',
    [ERROR_SEVERITY.HIGH]: 'Application error. Please try again later.',
    [ERROR_SEVERITY.CRITICAL]: 'Critical application error. Please contact support.'
  },
  [ERROR_TYPES.UNKNOWN]: {
    [ERROR_SEVERITY.LOW]: 'Something unexpected happened. Please try again.',
    [ERROR_SEVERITY.MEDIUM]: 'An unexpected error occurred. Please try again.',
    [ERROR_SEVERITY.HIGH]: 'Unexpected error. Please try again later.',
    [ERROR_SEVERITY.CRITICAL]: 'Critical unexpected error. Please contact support.'
  }
};

/**
 * Determine error type based on error object
 * @param {Error|Object} error - The error object
 * @returns {string} Error type
 */
export const getErrorType = (error) => {
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('fetch')) {
    return ERROR_TYPES.NETWORK;
  }
  if (error?.code === 'PGRST116' || error?.message?.includes('auth')) {
    return ERROR_TYPES.AUTHENTICATION;
  }
  if (error?.code?.startsWith('PGRST') || error?.message?.includes('database')) {
    return ERROR_TYPES.DATABASE;
  }
  if (error?.code === 'VALIDATION_ERROR' || error?.message?.includes('validation')) {
    return ERROR_TYPES.VALIDATION;
  }
  if (error?.name === 'TypeError' || error?.name === 'ReferenceError') {
    return ERROR_TYPES.RUNTIME;
  }
  return ERROR_TYPES.UNKNOWN;
};

/**
 * Determine error severity based on error type and context
 * @param {string} errorType - The type of error
 * @param {Object} context - Additional context about the error
 * @returns {string} Error severity
 */
export const getErrorSeverity = (errorType, context = {}) => {
  const { isRetryable = true, affectsUserData = false, isCritical = false } = context;

  if (isCritical) return ERROR_SEVERITY.CRITICAL;
  if (affectsUserData) return ERROR_SEVERITY.HIGH;
  if (!isRetryable) return ERROR_SEVERITY.MEDIUM;
  return ERROR_SEVERITY.LOW;
};

/**
 * Get user-friendly error message
 * @param {string} errorType - The type of error
 * @param {string} errorSeverity - The severity of the error
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyMessage = (errorType, errorSeverity) => {
  return USER_FRIENDLY_MESSAGES[errorType]?.[errorSeverity] ||
         USER_FRIENDLY_MESSAGES[ERROR_TYPES.UNKNOWN][ERROR_SEVERITY.MEDIUM];
};

/**
 * Enhanced error logging with context
 * @param {Error|Object} error - The error object
 * @param {string} context - Where the error occurred
 * @param {Object} additionalInfo - Additional information about the error
 */
export const logError = (error, context = 'Unknown', additionalInfo = {}) => {
  const errorType = getErrorType(error);
  const severity = getErrorSeverity(errorType, additionalInfo);
  const userMessage = getUserFriendlyMessage(errorType, severity);

  const errorLog = {
    timestamp: new Date().toISOString(),
    context,
    errorType,
    severity,
    userMessage,
    error: {
      name: error?.name || 'Unknown',
      message: error?.message || 'No message',
      stack: error?.stack,
      code: error?.code
    },
    additionalInfo,
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Error in ${context}`);
    console.error('Error Details:', errorLog);
    console.groupEnd();
  }

  // Log to external service in production (you can implement this)
  if (process.env.NODE_ENV === 'production') {
    // Example: send to error tracking service
    // logToExternalService(errorLog);
  }

  return {
    errorType,
    severity,
    userMessage,
    isRetryable: additionalInfo.isRetryable !== false,
    shouldShowUser: severity !== ERROR_SEVERITY.LOW
  };
};

/**
 * Handle API errors with retry logic
 * @param {Function} apiCall - The API function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} API call result
 */
export const withRetry = async (apiCall, options = {}) => {
  const { maxRetries = 3, delay = 1000, backoff = 2 } = options;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      // Don't retry on certain error types
      if (getErrorType(error) === ERROR_TYPES.AUTHENTICATION) {
        throw error;
      }

      if (attempt === maxRetries) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error in withRetry:', error);
          console.error('Retry attempt failed:', attempt);
          console.error('Max retries reached');
        }
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoff, attempt - 1)));
    }
  }

  throw lastError;
};

/**
 * Create a standardized error object
 * @param {Error|Object} error - The original error
 * @param {string} context - Where the error occurred
 * @param {Object} additionalInfo - Additional context
 * @returns {Object} Standardized error object
 */
export const createStandardizedError = (error, context = 'Unknown', additionalInfo = {}) => {
  const errorInfo = logError(error, context, additionalInfo);

  return {
    ...errorInfo,
    originalError: error,
    context,
    timestamp: new Date().toISOString(),
    retry: () => {
      // Implement retry logic based on context
      if (errorInfo.isRetryable) {
        window.location.reload();
      }
    }
  };
};

/**
 * Global error handler for unhandled errors
 */
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    logError(event.reason, 'Unhandled Promise Rejection', {
      isRetryable: false,
      affectsUserData: false,
      isCritical: true
    });
  });

  // Handle unhandled errors
  window.addEventListener('error', (event) => {
    event.preventDefault();
    logError(event.error, 'Unhandled Error', {
      isRetryable: false,
      affectsUserData: false,
      isCritical: true
    });
  });
};

export default {
  ERROR_TYPES,
  ERROR_SEVERITY,
  getErrorType,
  getErrorSeverity,
  getUserFriendlyMessage,
  logError,
  withRetry,
  createStandardizedError,
  setupGlobalErrorHandling
};
