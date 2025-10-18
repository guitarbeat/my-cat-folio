/**
 * @module Error
 * @description Unified error component that consolidates ErrorBoundary, ErrorDisplay, and InlineError
 * Supports multiple error display variants: boundary (full-page), list (multiple errors), and inline (single error)
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ERROR_SEVERITY, getSeverityClass } from '../../services/errorManager';
import styles from './Error.module.css';
import ErrorBoundaryFallback from './ErrorBoundaryFallback.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

/**
 * Unified Error Component
 * @param {Object} props - Component props
 * @param {string} props.variant - Display variant: 'boundary', 'list', or 'inline'
 * @param {Error|Array|string} props.error - Error(s) to display
 * @param {Function} props.onRetry - Retry callback
 * @param {Function} props.onDismiss - Dismiss callback
 * @param {Function} props.onClearAll - Clear all callback
 * @param {string} props.context - Error context ('form', 'vote', 'submit', etc.)
 * @param {string} props.position - Position for inline variant ('above', 'below', 'inline')
 * @param {boolean} props.showDetails - Show detailed error information
 * @param {boolean} props.showRetry - Show retry button
 * @param {boolean} props.showDismiss - Show dismiss button
 * @param {string} props.size - Size variant ('small', 'medium', 'large')
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Children for boundary variant
 */
const ErrorComponent = ({
  variant = 'inline',
  error,
  onRetry,
  onDismiss,
  onClearAll,
  context = 'general',
  position = 'below',
  showDetails = false,
  showRetry = true,
  showDismiss = true,
  size = 'medium',
  className = '',
  children
}) => {
  // Boundary variant (React error boundary)
  if (variant === 'boundary') {
    return (
      <ErrorBoundary
        FallbackComponent={(props) => (
          <ErrorBoundaryFallback {...props} onRetry={onRetry} />
        )}
        onReset={onRetry}
      >
        {children}
      </ErrorBoundary>
    );
  }

  // List variant (multiple errors from store)
  if (variant === 'list') {
    return (
      <ErrorList
        errors={error}
        onRetry={onRetry}
        onDismiss={onDismiss}
        onClearAll={onClearAll}
        showDetails={showDetails}
        className={className}
      />
    );
  }

  // Inline variant (single error)
  return (
    <ErrorInline
      error={error}
      context={context}
      position={position}
      onRetry={onRetry}
      onDismiss={onDismiss}
      showRetry={showRetry}
      showDismiss={showDismiss}
      size={size}
      className={className}
    />
  );
};


/**
 * Error List Component (multiple errors)
 */
const ErrorList = ({ errors = [], onRetry, onDismiss, onClearAll, showDetails, className }) => {
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
      case ERROR_SEVERITY.CRITICAL: return '🚨';
      case ERROR_SEVERITY.HIGH: return '⚠️';
      case ERROR_SEVERITY.MEDIUM: return '⚠️';
      case ERROR_SEVERITY.LOW: return 'ℹ️';
      default: return '❓';
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch {
      return 'Unknown time';
    }
  };

  return (
    <div className={`${styles.list} ${className}`}>
      {/* Header with clear all button */}
      {errors.length > 1 && onClearAll && (
        <div className={styles.listHeader}>
          <span className={styles.listCount}>
            {errors.length} error{errors.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onClearAll}
            className={styles.listClearAllButton}
            aria-label="Clear all errors"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Error list */}
      <div className={styles.listItems}>
        {errors.map((error, index) => (
          <div
            key={`${error.timestamp}-${index}`}
            className={`${styles.listItem} ${getSeverityClass(error.severity, styles)}`}
          >
            {/* Error header */}
            <div className={styles.listItemHeader}>
              <div className={styles.listItemInfo}>
                <span className={styles.listSeverityIcon}>
                  {getSeverityIcon(error.severity)}
                </span>
                <span className={styles.listMessage}>{error.message}</span>
                <span className={styles.listTime}>
                  {formatTimestamp(error.timestamp)}
                </span>
              </div>

              <div className={styles.listItemActions}>
                {error.isRetryable && onRetry && (
                  <button
                    onClick={() => onRetry(error, index)}
                    className={styles.listRetryButton}
                    aria-label="Retry operation"
                  >
                    ↻ Retry
                  </button>
                )}

                {onDismiss && (
                  <button
                    onClick={() => onDismiss(index)}
                    className={styles.listDismissButton}
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
                    className={styles.listDetailsButton}
                    aria-label="Toggle error details"
                  >
                    {expandedErrors.has(`${error.timestamp}-${index}`) ? '−' : '+'}
                  </button>
                )}
              </div>
            </div>

            {/* Error details */}
            {showDetails && expandedErrors.has(`${error.timestamp}-${index}`) && (
              <div className={styles.listDetails}>
                <div className={styles.listDetailRow}>
                  <strong>Type:</strong> {error.errorType}
                </div>
                <div className={styles.listDetailRow}>
                  <strong>Severity:</strong> {error.severity}
                </div>
                <div className={styles.listDetailRow}>
                  <strong>Context:</strong> {error.context}
                </div>
                {error.originalError && (
                  <div className={styles.listDetailRow}>
                    <strong>Original Error:</strong>
                    <pre className={styles.listErrorStack}>
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

/**
 * Inline Error Component (single error)
 */
const ErrorInline = ({
  error,
  context = 'general',
  position = 'below',
  onRetry,
  onDismiss,
  showRetry = true,
  showDismiss = true,
  size = 'medium',
  className = ''
}) => {
  if (!error) {
    return null;
  }

  const errorMessage = typeof error === 'string' ? error : error.message || 'An error occurred';
  const isRetryable = error?.isRetryable !== false && onRetry;
  const severity = error?.severity || ERROR_SEVERITY.MEDIUM;

  const getContextClass = () => {
    switch (context) {
      case 'vote': return styles.inlineVote;
      case 'form': return styles.inlineForm;
      case 'submit': return styles.inlineSubmit;
      case 'validation': return styles.inlineValidation;
      default: return styles.inlineGeneral;
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small': return styles.inlineSmall;
      case 'large': return styles.inlineLarge;
      default: return styles.inlineMedium;
    }
  };

  const getPositionClass = () => {
    switch (position) {
      case 'above': return styles.inlineAbove;
      case 'inline': return styles.inlineInline;
      default: return styles.inlineBelow;
    }
  };

  const getSeverityIcon = () => {
    switch (severity) {
      case ERROR_SEVERITY.CRITICAL: return '🚨';
      case ERROR_SEVERITY.HIGH: return '⚠️';
      case ERROR_SEVERITY.MEDIUM: return '⚠️';
      case ERROR_SEVERITY.LOW: return 'ℹ️';
      default: return '❓';
    }
  };

  return (
    <div
      className={`
        ${styles.inline}
        ${getContextClass()}
        ${getSeverityClass(severity, styles)}
        ${getSizeClass()}
        ${getPositionClass()}
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.inlineContent}>
        <span className={styles.inlineIcon}>
          {getSeverityIcon()}
        </span>

        <span className={styles.inlineMessage}>{errorMessage}</span>

        <div className={styles.inlineActions}>
          {isRetryable && showRetry && (
            <button
              onClick={onRetry}
              className={styles.inlineRetryButton}
              aria-label="Retry operation"
              type="button"
            >
              <span className={styles.inlineRetryIcon}>↻</span>
              Retry
            </button>
          )}

          {onDismiss && showDismiss && (
            <button
              onClick={onDismiss}
              className={styles.inlineDismissButton}
              aria-label="Dismiss error"
              type="button"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Development error details */}
      {process.env.NODE_ENV === 'development' && error?.stack && (
        <details className={styles.inlineDevDetails}>
          <summary>Error Details (Development)</summary>
          <pre className={styles.inlineDevStack}>{error.stack}</pre>
        </details>
      )}
    </div>
  );
};

// PropTypes
ErrorComponent.propTypes = {
  variant: PropTypes.oneOf(['boundary', 'list', 'inline']),
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(globalThis.Error),
    PropTypes.object,
    PropTypes.array
  ]),
  onRetry: PropTypes.func,
  onDismiss: PropTypes.func,
  onClearAll: PropTypes.func,
  context: PropTypes.oneOf(['form', 'vote', 'submit', 'validation', 'general']),
  position: PropTypes.oneOf(['above', 'below', 'inline']),
  showDetails: PropTypes.bool,
  showRetry: PropTypes.bool,
  showDismiss: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  children: PropTypes.node
};

ErrorComponent.displayName = 'Error';

export default ErrorComponent;
