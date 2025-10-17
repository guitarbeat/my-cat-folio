/**
 * @module useRouting
 * @description Simple URL-based routing hook for handling different routes
 */
import { useState, useEffect, useCallback } from 'react';

export function useRouting() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.pathname +
        window.location.search +
        window.location.hash
      );
    }
    return '/';
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleRouteChange = () => {
      setCurrentRoute(window.location.pathname + window.location.search + window.location.hash);
    };

    // Listen for browser navigation (back/forward buttons)
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  const sanitizeRoute = useCallback((route) => {
    if (!route) return '/';

    if (route.startsWith('http://') || route.startsWith('https://')) {
      try {
        const { pathname, search, hash } = new URL(route);
        return `${pathname}${search}${hash}` || '/';
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Invalid URL provided to navigateTo:', error);
        }
        return '/';
      }
    }

    if (route.startsWith('/')) {
      return route;
    }

    return `/${route}`;
  }, []);

  const navigateTo = useCallback(
    (route, options = {}) => {
      const sanitizedRoute = sanitizeRoute(route);

      if (typeof window === 'undefined') {
        setCurrentRoute(sanitizedRoute);
        return;
      }

      const { replace = false } = options;

      const fullPath = sanitizedRoute;

      if (window.location.pathname + window.location.search + window.location.hash === fullPath) {
        setCurrentRoute(fullPath);
        return;
      }

      const historyMethod = replace ? 'replaceState' : 'pushState';

      window.history[historyMethod]({}, '', fullPath);
      setCurrentRoute(fullPath);
    },
    [sanitizeRoute]
  );

  const isRoute = useCallback(
    (route) => {
      const sanitizedRoute = sanitizeRoute(route);
      return currentRoute === sanitizedRoute;
    },
    [currentRoute, sanitizeRoute]
  );

  return {
    currentRoute,
    navigateTo,
    isRoute
  };
}
