/**
 * @module LoadingSpinner
 * @description An elegant loading spinner component that provides visual feedback
 * during asynchronous operations. Features a rotating cat animation.
 * 
 * @example
 * // Default size
 * {isLoading && <LoadingSpinner />}
 * 
 * // Custom size
 * {isLoading && <LoadingSpinner size="large" />}
 * 
 * @component
 * @param {Object} props
 * @param {('small'|'medium'|'large')} [props.size='medium'] - Size variant of the spinner
 * @param {string} [props.text] - Optional loading text to display below the spinner
 * @returns {JSX.Element} An animated loading spinner with proper ARIA attributes
 */

import React from 'react';
import styles from './LoadingSpinner.module.css';

/**
 * A modern, elegant loading spinner component that provides visual feedback
 * during asynchronous operations using a rotating cat animation.
 * 
 * @param {Object} props
 * @param {('small'|'medium'|'large')} [props.size='medium'] - Size variant of the spinner
 * @param {string} [props.text] - Optional loading text to display below the spinner
 * @returns {JSX.Element}
 */
const LoadingSpinner = ({ size = 'medium', text }) => {
  return (
    <div className={styles.container} role="status" aria-label="Loading">
      <div className={styles.box}>
        <div className={`${styles.cat} ${styles[size]}`}>
          <div className={styles.cat__head}></div>
          <div className={styles.cat__body}></div>
          <div className={styles.cat__body}></div>
          <div className={styles.cat__tail}></div>
        </div>
      </div>
      {text && <p className={styles.text}>{text}</p>}
      <span className={styles.srOnly}>Loading...</span>
    </div>
  );
};

export default LoadingSpinner; 