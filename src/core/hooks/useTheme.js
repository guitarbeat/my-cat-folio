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

import { useEffect, useCallback, useMemo } from 'react';
import useLocalStorage from './useLocalStorage';

function useTheme() {
  // Get initial theme from localStorage or default to light theme
  const [isLightTheme, setIsLightTheme] = useLocalStorage('theme', true);

  // * Memoize theme classes to prevent unnecessary recalculations
  const themeClasses = useMemo(
    () => ({
      light: {
        bodyClass: 'light-theme',
        darkBodyClass: 'dark-theme',
        metaColor: '#334155'
      },
      dark: {
        bodyClass: 'dark-theme',
        darkBodyClass: 'light-theme',
        metaColor: '#1a1f2e'
      }
    }),
    []
  );

  // Update document body class and meta tag when theme changes
  useEffect(() => {
    const body = document.body;
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const currentTheme = isLightTheme ? 'light' : 'dark';
    const { bodyClass, darkBodyClass, metaColor } = themeClasses[currentTheme];

    // * Batch DOM updates to prevent layout thrashing
    requestAnimationFrame(() => {
      // Remove all theme classes first
      body.classList.remove('light-theme', 'dark-theme');
      // Add the current theme class
      body.classList.add(bodyClass);

      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', metaColor);
      }
    });
  }, [isLightTheme, themeClasses]);

  // Toggle between light and dark themes
  const toggleTheme = useCallback(() => {
    setIsLightTheme((prev) => !prev);
  }, [setIsLightTheme]);

  // Set theme directly
  const setTheme = useCallback(
    (isLight) => {
      setIsLightTheme(isLight);
    },
    [setIsLightTheme]
  );

  return {
    isLightTheme,
    toggleTheme,
    setTheme
  };
}

export default useTheme;
