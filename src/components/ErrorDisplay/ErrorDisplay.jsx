/**
 * @module ErrorDisplay
 * @description A reusable component for displaying errors to users with
 * appropriate styling, actions, and information based on error severity.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ERROR_SEVERITY, getSeverityClass } from '../../utils/errorHandler';
import styles from './ErrorDisplay.module.css';

/**
 * ErrorDisplay component for showing user-friendly error messages
 * @param {Object} props - Component props
 * @param {Array} props.errors - Array of error objects to display
 * @param {Function} props.onRetry - Function to call when retry is clicked
 * @param {Function} props.onDismiss - Function to call when dismiss is clicked
 * @param {Function} props.onClearAll - Function to call when clear all is clicked
 * @param {boolean} props.showDetails - Whether to show detailed error information
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element|null} The error display component or null if no errors
 */
const ErrorDisplay = ({
  errors = [],
  onRetry,
  onDismiss,
  onClearAll,
  showDetails = false,
  className = ''
}) => {
  const [expandedErrors, setExpandedErrors] = useState(new Set());

  if (!errors || errors.length === 0) {
    return null;
  }

  const toggleErrorExpansion = (errorId) => {
    setExpandedErrors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(errorId)) {
        newSet.delete(errorId);
      } else {
        newSet.add(errorId);
      }
      return newSet;
    });
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case ERROR_SEVERITY.CRITICAL:
        return '🚨';
      case ERROR_SEVERITY.HIGH:
        return '⚠️';
      case ERROR_SEVERITY.MEDIUM:
        return '⚠️';
      case ERROR_SEVERITY.LOW:
        return 'ℹ️';
      default:
        return '❓';
    }
  };

  // * Using shared getSeverityClass function from errorHandler utility

  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch {
      return 'Unknown time';
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Header with clear all button */}
      {errors.length > 1 && onClearAll && (
        <div className={styles.header}>
          <span className={styles.errorCount}>
            {errors.length} error{errors.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onClearAll}
            className={styles.clearAllButton}
            aria-label="Clear all errors"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Error list */}
      <div className={styles.errorList}>
        {errors.map((error, index) => (
          <div
            key={`${error.timestamp}-${index}`}
            className={`${styles.errorItem} ${getSeverityClass(error.severity, styles)}`}
          >
            {/* Error header */}
            <div className={styles.errorHeader}>
              <div className={styles.errorInfo}>
                <span className={styles.severityIcon}>
                  {getSeverityIcon(error.severity)}
                </span>
                <span className={styles.errorMessage}>{error.message}</span>
                <span className={styles.errorTime}>
                  {formatTimestamp(error.timestamp)}
                </span>
              </div>

              <div className={styles.errorActions}>
                {error.isRetryable && onRetry && (
                  <button
                    onClick={() => onRetry(error, index)}
                    className={styles.retryButton}
                    aria-label="Retry operation"
                  >
                    ↻ Retry
                  </button>
                )}

                {onDismiss && (
                  <button
                    onClick={() => onDismiss(index)}
                    className={styles.dismissButton}
                    aria-label="Dismiss error"
                  >
                    ×
                  </button>
                )}

                {showDetails && (
                  <button
                    onClick={() =>
                      toggleErrorExpansion(`${error.timestamp}-${index}`)
                    }
                    className={styles.detailsButton}
                    aria-label="Toggle error details"
                  >
                    {expandedErrors.has(`${error.timestamp}-${index}`)
                      ? '−'
                      : '+'}
                  </button>
                )}
              </div>
            </div>

            {/* Error details (expandable) */}
            {showDetails &&
              expandedErrors.has(`${error.timestamp}-${index}`) && (
                <div className={styles.errorDetails}>
                  <div className={styles.detailRow}>
                    <strong>Type:</strong> {error.errorType}
                  </div>
                  <div className={styles.detailRow}>
                    <strong>Severity:</strong> {error.severity}
                  </div>
                  <div className={styles.detailRow}>
                    <strong>Context:</strong> {error.context}
                  </div>
                  {error.originalError && (
                    <div className={styles.detailRow}>
                      <strong>Original Error:</strong>
                      <pre className={styles.errorStack}>
                        {error.originalError.toString()}
                      </pre>
                    </div>
                  )}
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

ErrorDisplay.propTypes = {
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      message: PropTypes.string.isRequired,
      severity: PropTypes.oneOf(Object.values(ERROR_SEVERITY)).isRequired,
      timestamp: PropTypes.string.isRequired,
      context: PropTypes.string,
      errorType: PropTypes.string,
      isRetryable: PropTypes.bool,
      originalError: PropTypes.oneOfType([
        PropTypes.instanceOf(Error),
        PropTypes.object
      ])
    })
  ),
  onRetry: PropTypes.func,
  onDismiss: PropTypes.func,
  onClearAll: PropTypes.func,
  showDetails: PropTypes.bool,
  className: PropTypes.string
};

export default ErrorDisplay;
