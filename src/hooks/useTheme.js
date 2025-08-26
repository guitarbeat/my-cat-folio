/**
 * @module useTheme
 * @description A custom React hook that manages theme state (light/dark) with localStorage persistence.
 * Automatically updates the document body class and meta theme-color tag.
 *
 * @example
 * // Using the hook in a component
 * const { isLightTheme, toggleTheme, setTheme } = useTheme();
 *
 * @returns {Object} An object containing theme state and control functions
 */

import { useEffect, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';

function useTheme() {
  // Get initial theme from localStorage or default to light theme
  const [isLightTheme, setIsLightTheme] = useLocalStorage('theme', true);

  // Update document body class and meta tag when theme changes
  useEffect(() => {
    const body = document.body;
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');

    if (isLightTheme) {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', '#eef1f6'); // Light theme color
      }
    } else {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', '#1a1f2e'); // Dark theme color
      }
    }
  }, [isLightTheme]);

  // Toggle between light and dark themes
  const toggleTheme = useCallback(() => {
    setIsLightTheme(prev => !prev);
  }, [setIsLightTheme]);

  // Set theme directly
  const setTheme = useCallback((isLight) => {
    setIsLightTheme(isLight);
  }, [setIsLightTheme]);

  return {
    isLightTheme,
    toggleTheme,
    setTheme
  };
}

export default useTheme;
