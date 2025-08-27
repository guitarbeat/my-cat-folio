/**
 * @module InlineError
 * @description A component for displaying inline errors with form fields, buttons, and actions.
 * Provides immediate feedback for validation errors, network failures, and other user-facing issues.
 */

import React from "react";
import PropTypes from "prop-types";
import { ERROR_SEVERITY } from "../../utils/errorHandler";
import styles from "./InlineError.module.css";

/**
 * InlineError component for showing errors inline with UI elements
 * @param {Object} props - Component props
 * @param {string|Error} props.error - The error to display
 * @param {string} props.context - Context for the error (e.g., 'form', 'vote', 'submit')
 * @param {string} props.position - Position relative to the element ('above', 'below', 'inline')
 * @param {Function} props.onRetry - Function to call when retry is clicked
 * @param {Function} props.onDismiss - Function to call when dismiss is clicked
 * @param {boolean} props.showRetry - Whether to show retry button
 * @param {boolean} props.showDismiss - Whether to show dismiss button
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Size variant ('small', 'medium', 'large')
 * @returns {JSX.Element|null} The inline error component or null if no error
 */
const InlineError = ({
  error,
  context = "form",
  position = "below",
  onRetry,
  onDismiss,
  showRetry = true,
  showDismiss = true,
  className = "",
  size = "medium",
}) => {
  if (!error) {
    return null;
  }

  // Extract error message
  const errorMessage =
    typeof error === "string" ? error : error.message || "An error occurred";

  // Determine if error is retryable
  const isRetryable = error?.isRetryable !== false && onRetry;

  // Determine severity for styling
  const severity = error?.severity || ERROR_SEVERITY.MEDIUM;

  // Get context-specific styling
  const getContextClass = () => {
    switch (context) {
      case "vote":
        return styles.voteError;
      case "form":
        return styles.formError;
      case "submit":
        return styles.submitError;
      case "validation":
        return styles.validationError;
      default:
        return styles.generalError;
    }
  };

  const getSeverityClass = () => {
    switch (severity) {
      case ERROR_SEVERITY.CRITICAL:
        return styles.critical;
      case ERROR_SEVERITY.HIGH:
        return styles.high;
      case ERROR_SEVERITY.MEDIUM:
        return styles.medium;
      case ERROR_SEVERITY.LOW:
        return styles.low;
      default:
        return styles.medium;
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case "small":
        return styles.small;
      case "large":
        return styles.large;
      default:
        return styles.medium;
    }
  };

  const getPositionClass = () => {
    switch (position) {
      case "above":
        return styles.positionAbove;
      case "inline":
        return styles.positionInline;
      default:
        return styles.positionBelow;
    }
  };

  return (
    <div
      className={`
        ${styles.container} 
        ${getContextClass()} 
        ${getSeverityClass()} 
        ${getSizeClass()} 
        ${getPositionClass()} 
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.errorContent}>
        <span className={styles.errorIcon}>
          {severity === ERROR_SEVERITY.CRITICAL
            ? "🚨"
            : severity === ERROR_SEVERITY.HIGH
              ? "⚠️"
              : severity === ERROR_SEVERITY.MEDIUM
                ? "⚠️"
                : "ℹ️"}
        </span>

        <span className={styles.errorMessage}>{errorMessage}</span>

        <div className={styles.errorActions}>
          {isRetryable && showRetry && (
            <button
              onClick={onRetry}
              className={styles.retryButton}
              aria-label="Retry operation"
              type="button"
            >
              <span className={styles.retryIcon}>↻</span>
              Retry
            </button>
          )}

          {onDismiss && showDismiss && (
            <button
              onClick={onDismiss}
              className={styles.dismissButton}
              aria-label="Dismiss error"
              type="button"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Additional error details for development */}
      {process.env.NODE_ENV === "development" && error?.stack && (
        <details className={styles.errorDetails}>
          <summary>Error Details (Development)</summary>
          <pre className={styles.errorStack}>{error.stack}</pre>
        </details>
      )}
    </div>
  );
};

InlineError.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Error),
    PropTypes.object,
  ]),
  context: PropTypes.oneOf(["form", "vote", "submit", "validation", "general"]),
  position: PropTypes.oneOf(["above", "below", "inline"]),
  onRetry: PropTypes.func,
  onDismiss: PropTypes.func,
  showRetry: PropTypes.bool,
  showDismiss: PropTypes.bool,
  className: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium", "large"]),
};

export default InlineError;
