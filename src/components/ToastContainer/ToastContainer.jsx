/**
 * @module ToastContainer
 * @description A container component that manages multiple toast notifications.
 * Provides a queue system and handles positioning of multiple toasts.
 */

import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Toast from '../Toast/Toast';
import styles from './ToastContainer.module.css';

/**
 * ToastContainer component for managing multiple toast notifications
 * @param {Object} props - Component props
 * @param {Array} props.toasts - Array of toast objects
 * @param {Function} props.removeToast - Function to remove a toast by id
 * @param {string} props.position - Position of the toast container
 * @param {number} props.maxToasts - Maximum number of toasts to show
 * @returns {JSX.Element} The toast container component
 */
const ToastContainer = ({
  toasts = [],
  removeToast,
  position = 'top-right',
  maxToasts = 5
}) => {
  const containerRef = useRef(null);

  // Limit the number of visible toasts
  const visibleToasts = toasts.slice(0, maxToasts);

  const getPositionClass = () => {
    switch (position) {
      case 'top-left':
        return styles.topLeft;
      case 'top-center':
        return styles.topCenter;
      case 'top-right':
        return styles.topRight;
      case 'bottom-left':
        return styles.bottomLeft;
      case 'bottom-center':
        return styles.bottomCenter;
      case 'bottom-right':
        return styles.bottomRight;
      default:
        return styles.topRight;
    }
  };

  const handleToastDismiss = useCallback(
    (toastId) => {
      removeToast?.(toastId);
    },
    [removeToast]
  );

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${getPositionClass()}`}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      aria-atomic="false"
    >
      {visibleToasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          autoDismiss={toast.autoDismiss}
          onDismiss={() => handleToastDismiss(toast.id)}
          className={styles.toast}
        />
      ))}

      {/* Show count of hidden toasts */}
      {toasts.length > maxToasts && (
        <div className={styles.hiddenCount}>
          +{toasts.length - maxToasts} more
        </div>
      )}
    </div>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['success', 'error', 'info', 'warning']),
      duration: PropTypes.number,
      autoDismiss: PropTypes.bool
    })
  ),
  removeToast: PropTypes.func.isRequired,
  position: PropTypes.oneOf([
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right'
  ]),
  maxToasts: PropTypes.number
};

export default ToastContainer;
