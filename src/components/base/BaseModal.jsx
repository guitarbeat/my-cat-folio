import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './BaseModal.module.css';

/**
 * @module BaseModal
 * @description Reusable base modal component with consistent behavior and styling.
 * Handles accessibility, focus management, and common modal patterns.
 */

const BaseModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  overlayClassName = '',
  contentClassName = '',
  ...props
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // * Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // * Handle focus management
  useEffect(() => {
    if (!isOpen) return;

    // * Store the previously focused element
    previousActiveElement.current = document.activeElement;

    // * Focus the modal
    if (modalRef.current) {
      modalRef.current.focus();
    }

    // * Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      // * Restore body scroll
      document.body.style.overflow = '';

      // * Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  // * Handle overlay click
  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  // * Handle close button click
  const handleCloseClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.overlay} ${overlayClassName}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={`${styles.modal} ${styles[size]} ${contentClassName}`}
        tabIndex="-1"
        {...props}
      >
        {/* * Header */}
        {(title || showCloseButton) && (
          <div className={styles.header}>
            {title && (
              <h2 id="modal-title" className={styles.title}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                className={styles.closeButton}
                onClick={handleCloseClick}
                aria-label="Close modal"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            )}
          </div>
        )}

        {/* * Content */}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

BaseModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'fullscreen']),
  showCloseButton: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  className: PropTypes.string,
  overlayClassName: PropTypes.string,
  contentClassName: PropTypes.string
};

export default BaseModal;
