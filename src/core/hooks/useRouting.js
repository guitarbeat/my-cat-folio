/**
 * @module useRouting
 * @description Simple URL-based routing hook for handling different routes
 */
import { useState, useEffect } from 'react';

export function useRouting() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRoute(window.location.pathname);
    };

    // Listen for browser navigation (back/forward buttons)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const navigateTo = (route) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', route);
      setCurrentRoute(route);
    }
  };

  const isRoute = (route) => {
    return currentRoute === route;
  };

  return {
    currentRoute,
    navigateTo,
    isRoute
  };
}
