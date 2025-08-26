/**
 * @module Toast
 * @description A toast notification component for showing temporary messages to users.
 * Provides different types (success, error, info, warning) with auto-dismiss functionality.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Toast.module.css';

/**
 * Toast component for displaying temporary notifications
 * @param {Object} props - Component props
 * @param {string} props.message - The message to display
 * @param {string} props.type - Type of toast ('success', 'error', 'info', 'warning')
 * @param {number} props.duration - Duration in milliseconds before auto-dismiss
 * @param {Function} props.onDismiss - Function to call when toast is dismissed
 * @param {boolean} props.autoDismiss - Whether to auto-dismiss the toast
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} The toast component
 */
const Toast = ({
  message,
  type = 'info',
  duration = 5000,
  onDismiss,
  autoDismiss = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!autoDismiss) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, autoDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300); // Match CSS transition duration
  };

  if (!isVisible) return null;

  const getTypeIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return styles.success;
      case 'error':
        return styles.error;
      case 'warning':
        return styles.warning;
      case 'info':
      default:
        return styles.info;
    }
  };

  return (
    <div
      className={`
        ${styles.container} 
        ${getTypeClass()} 
        ${isExiting ? styles.exiting : ''} 
        ${className}
      `}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className={styles.content}>
        <span className={styles.icon}>
          {getTypeIcon()}
        </span>

        <span className={styles.message}>
          {message}
        </span>

        <button
          onClick={handleDismiss}
          className={styles.dismissButton}
          aria-label="Dismiss notification"
          type="button"
        >
          ×
        </button>
      </div>

      {/* Progress bar for auto-dismiss */}
      {autoDismiss && (
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              animationDuration: `${duration}ms`,
              animationPlayState: isExiting ? 'paused' : 'running'
            }}
          />
        </div>
      )}
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'info', 'warning']),
  duration: PropTypes.number,
  onDismiss: PropTypes.func,
  autoDismiss: PropTypes.bool,
  className: PropTypes.string
};

export default Toast;
