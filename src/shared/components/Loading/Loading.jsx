/**
 * @module Loading
 * @description Unified loading component that consolidates LoadingSpinner and SuspenseView
 * Supports multiple loading display variants: spinner, suspense, and skeleton
 */

import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import styles from './Loading.module.css';

/**
 * Unified Loading Component
 * @param {Object} props - Component props
 * @param {string} props.variant - Display variant: 'spinner', 'suspense', or 'skeleton'
 * @param {('small'|'medium'|'large')} props.size - Size variant for spinner
 * @param {string} props.text - Loading text to display
 * @param {boolean} props.overlay - Whether to show as overlay
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Children for suspense variant
 * @returns {JSX.Element|null} The loading component or null
 */
const Loading = ({
  variant = 'spinner',
  size = 'medium',
  text,
  overlay = false,
  className = '',
  children
}) => {
  // Suspense variant (React Suspense wrapper)
  if (variant === 'suspense') {
    if (!children) return null;

    const fallback = (
      <div className={`${styles.container} ${overlay ? styles.overlay : ''} ${className}`}>
        <div className={`${styles.spinner} ${styles[size]}`}>🐈‍⬛</div>
        {text && <p className={styles.text}>{text}</p>}
        <span className={styles.srOnly}>Loading...</span>
      </div>
    );

    return (
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    );
  }

  // Skeleton variant (placeholder content)
  if (variant === 'skeleton') {
    return (
      <div className={`${styles.skeleton} ${className}`}>
        <div className={styles.skeletonShimmer}></div>
      </div>
    );
  }

  // Spinner variant (default - simple loading state)
  const containerClasses = [
    styles.container,
    overlay ? styles.overlay : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} role="status" aria-label="Loading">
      <div className={`${styles.spinner} ${styles[size]}`}>🐈‍⬛</div>
      {text && <p className={styles.text}>{text}</p>}
      <span className={styles.srOnly}>Loading...</span>
    </div>
  );
};

/**
 * Legacy LoadingSpinner component (for backward compatibility)
 * @deprecated Use Loading component with variant="spinner" instead
 */
export const LoadingSpinner = ({ size = 'medium', text }) => {
  console.warn('LoadingSpinner is deprecated. Use Loading component with variant="spinner" instead.');
  return <Loading variant="spinner" size={size} text={text} />;
};

/**
 * Legacy SuspenseView component (for backward compatibility)
 * @deprecated Use Loading component with variant="suspense" instead
 */
export const SuspenseView = ({ text, children }) => {
  console.warn('SuspenseView is deprecated. Use Loading component with variant="suspense" instead.');
  return <Loading variant="suspense" text={text}>{children}</Loading>;
};

// PropTypes
Loading.propTypes = {
  variant: PropTypes.oneOf(['spinner', 'suspense', 'skeleton']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  text: PropTypes.string,
  overlay: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node
};

Loading.displayName = 'Loading';

export default Loading;
