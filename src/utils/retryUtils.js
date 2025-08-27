/**
 * Retry utilities for failed operations
 * Implements exponential backoff and circuit breaker patterns
 */

/**
 * Retry configuration options
 */
export const retryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  jitter: 0.1 // 10% random jitter
};

/**
 * Calculate delay with exponential backoff and jitter
 * @param {number} attempt - Current attempt number (1-based)
 * @param {Object} config - Retry configuration
 * @returns {number} Delay in milliseconds
 */
const calculateDelay = (attempt, config = retryConfig) => {
  const exponentialDelay =
    config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, config.maxDelay);

  // Add jitter to prevent thundering herd
  const jitterRange = cappedDelay * config.jitter;
  const jitter = (Math.random() - 0.5) * jitterRange;

  return Math.max(0, cappedDelay + jitter);
};

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Promise that resolves with the function result
 */
export const withRetry = async (fn, options = {}) => {
  const config = { ...retryConfig, ...options };
  let lastError;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on certain error types
      if (isNonRetryableError(error)) {
        throw error;
      }

      // If this is the last attempt, throw the error
      if (attempt === config.maxAttempts) {
        break;
      }

      // Calculate delay for next attempt
      const delay = calculateDelay(attempt, config);

      // Log retry attempt
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `Retry attempt ${attempt}/${config.maxAttempts} failed:`,
          error.message
        );
        console.warn(`Retrying in ${delay}ms...`);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Check if an error is non-retryable
 * @param {Error} error - The error to check
 * @returns {boolean} True if the error should not be retried
 */
const isNonRetryableError = (error) => {
  // Authentication errors
  if (error?.status === 401 || error?.status === 403) {
    return true;
  }

  // Bad request errors (client errors)
  if (error?.status === 400) {
    return true;
  }

  // Validation errors
  if (error?.code === 'VALIDATION_ERROR') {
    return true;
  }

  // Network errors that might be retryable
  if (error?.code === 'NETWORK_ERROR' || error?.code === 'TIMEOUT') {
    return false;
  }

  // Database errors that might be retryable
  if (error?.code === 'PGRST301' || error?.code === 'PGRST302') {
    return false;
  }

  // Default to retryable
  return false;
};

/**
 * Circuit breaker implementation
 * Prevents repeated calls to failing services
 */
export class CircuitBreaker {
  constructor(failureThreshold = 5, resetTimeout = 60000) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  /**
   * Execute a function with circuit breaker protection
   * @param {Function} fn - Function to execute
   * @returns {Promise} Promise that resolves with the function result
   */
  async execute(fn) {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN - service is unavailable');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = null;
  }

  /**
   * Handle failed execution
   */
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  /**
   * Check if enough time has passed to attempt reset
   * @returns {boolean} True if reset should be attempted
   */
  shouldAttemptReset() {
    if (!this.lastFailureTime) return false;
    return Date.now() - this.lastFailureTime >= this.resetTimeout;
  }

  /**
   * Get current circuit breaker status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      failureThreshold: this.failureThreshold,
      lastFailureTime: this.lastFailureTime,
      timeUntilReset: this.lastFailureTime
        ? Math.max(0, this.resetTimeout - (Date.now() - this.lastFailureTime))
        : 0
    };
  }

  /**
   * Manually reset the circuit breaker
   */
  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
  }
}

/**
 * Create a retry wrapper with circuit breaker
 * @param {Function} fn - Function to wrap
 * @param {Object} options - Options for retry and circuit breaker
 * @returns {Function} Wrapped function with retry and circuit breaker
 */
export const createResilientFunction = (fn, options = {}) => {
  const circuitBreaker = new CircuitBreaker(
    options.failureThreshold || 5,
    options.resetTimeout || 60000
  );

  return async (...args) => {
    return circuitBreaker.execute(() => withRetry(() => fn(...args), options));
  };
};

/**
 * Retry specific database operations with appropriate error handling
 */
export const databaseRetry = {
  /**
   * Retry database read operations
   */
  async read(fn, options = {}) {
    const readOptions = {
      maxAttempts: 3,
      baseDelay: 500,
      ...options
    };

    return withRetry(fn, readOptions);
  },

  /**
   * Retry database write operations
   */
  async write(fn, options = {}) {
    const writeOptions = {
      maxAttempts: 2,
      baseDelay: 1000,
      ...options
    };

    return withRetry(fn, writeOptions);
  },

  /**
   * Retry critical operations with more attempts
   */
  async critical(fn, options = {}) {
    const criticalOptions = {
      maxAttempts: 5,
      baseDelay: 2000,
      ...options
    };

    return withRetry(fn, criticalOptions);
  }
};
