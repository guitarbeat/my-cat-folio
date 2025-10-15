/**
 * @module useMediaQuery
 * @description Hook for responsive design using CSS media queries.
 * Replaces scattered window.innerWidth checks throughout the app.
 */

import { useState, useEffect } from 'react';

/**
 * Hook for responsive design using CSS media queries
 * @param {string} query - CSS media query string
 * @returns {boolean} Whether the media query matches
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // * Check if window is available (SSR safety)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);

    // * Set initial value
    setMatches(mediaQuery.matches);

    // * Create event listener
    const handler = (event) => setMatches(event.matches);

    // * Add listener
    mediaQuery.addEventListener('change', handler);

    // * Cleanup
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

/**
 * Common breakpoint hooks for consistent responsive design
 */
export const useIsMobile = () => useMediaQuery('(width <= 768px)');
export const useIsTablet = () => useMediaQuery('(width > 768px) and (width <= 1024px)');
export const useIsDesktop = () => useMediaQuery('(width > 1024px)');
export const useIsSmallMobile = () => useMediaQuery('(width <= 480px)');
export const useIsLargeMobile = () => useMediaQuery('(width > 480px) and (width <= 768px)');

/**
 * Touch device detection
 */
export const useIsTouchDevice = () => useMediaQuery('(hover: none) and (pointer: coarse)');

/**
 * Reduced motion preference
 */
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

/**
 * High contrast preference
 */
export const usePrefersHighContrast = () => useMediaQuery('(prefers-contrast: more)');

/**
 * Dark mode preference
 */
export const usePrefersDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)');

/**
 * Light mode preference
 */
export const usePrefersLightMode = () => useMediaQuery('(prefers-color-scheme: light)');
