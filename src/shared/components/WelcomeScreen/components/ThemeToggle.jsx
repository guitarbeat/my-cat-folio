/**
 * @module ThemeToggle
 * @description Theme toggle button component for the welcome screen.
 * Provides a clean interface for switching between light and dark themes.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styles from '../WelcomeScreen.module.css';

/**
 * Theme toggle button component
 * @param {Object} props - Component props
 * @param {boolean} props.isLightTheme - Whether light theme is active
 * @param {Function} props.onToggle - Toggle theme callback
 * @returns {JSX.Element} Theme toggle button
 */
const ThemeToggle = ({ isLightTheme, onToggle }) => {
  return (
    <button
      className={styles.themeToggle}
      onClick={onToggle}
      type="button"
      aria-label={`Switch to ${isLightTheme ? 'dark' : 'light'} mode`}
      title={`Switch to ${isLightTheme ? 'dark' : 'light'} mode`}
    >
      <span className={styles.themeIcon} aria-hidden="true">
        {isLightTheme ? '🌙' : '☀️'}
      </span>
      <span className={styles.themeText}>
        {isLightTheme ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};

ThemeToggle.displayName = 'ThemeToggle';

ThemeToggle.propTypes = {
  isLightTheme: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired
};

export default ThemeToggle;