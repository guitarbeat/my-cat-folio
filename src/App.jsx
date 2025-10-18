/**
 * @module App
 * @description Main application component for the cat name tournament app.
 * Refactored to use centralized state management and services for better maintainability.
 *
 * @component
 * @returns {JSX.Element} The complete application UI
 */

import React, { useCallback } from 'react';
// * Use path aliases for better tree shaking
import CatBackground from '@components/CatBackground/CatBackground';
import ViewRouter from '@components/ViewRouter/ViewRouter';
import { Error, Toast, Loading } from '@components';
import PerformanceDashboard from '@components/PerformanceDashboard';
import { SidebarProvider, SidebarTrigger } from './shared/components/ui/sidebar';
import { AppSidebar } from './shared/components/AppSidebar/AppSidebar';

// * Lazy load heavy components for better code splitting
import useUserSession from '@hooks/useUserSession';
import useToast from '@hooks/useToast';
import { useRouting } from '@hooks/useRouting';
import useAppStore, { useAppStoreInitialization } from '@core/store/useAppStore';
import { TournamentService } from '@services/tournamentService';
import { ErrorManager } from '@services/errorManager';

// * Components imported directly for better code splitting

const normalizeRoutePath = (routeValue) => {
  if (typeof routeValue !== 'string') {
    return '/';
  }

  const [path] = routeValue.split(/[?#]/);

  if (!path) {
    return '/';
  }

  if (path.length > 1 && path.endsWith('/')) {
    return path.replace(/\/+$/, '') || '/';
  }

  return path;
};

/**
 * Generate a cat background video element
 * @param {number} index - The index number for the CSS class
 * @returns {JSX.Element} Video element with fallback image
 */

function App() {
  // * Toast notifications
  const { toasts, removeToast, showToast } = useToast();

  const { login, logout } = useUserSession({ showToast });

  // * Initialize store from localStorage
  useAppStoreInitialization();

  // * Centralized store
  const {
    user,
    tournament,
    ui,
    errors,
    tournamentActions,
    uiActions,
    errorActions
  } = useAppStore();

  // * Simple URL routing helpers
  const { currentRoute, navigateTo } = useRouting();

  const normalizedPath = React.useMemo(() => normalizeRoutePath(currentRoute), [currentRoute]);
  const previousRouteRef = React.useRef(null);
  const lastViewRef = React.useRef(tournament.currentView);
  const lastCompletionRef = React.useRef(tournament.isComplete);

  // Get admin status from server-side validation
  const isAdmin = user.isAdmin;

  // * Keyboard shortcut for performance dashboard (Ctrl+Shift+P)
  React.useEffect(() => {
    if (!isAdmin) return;
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        uiActions.togglePerformanceDashboard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [uiActions, isAdmin]);

  // * Handle tournament completion
  const handleTournamentComplete = useCallback(
    async (finalRatings) => {
      try {
        if (!user.name) {
          throw new Error('No user name available');
        }

        const updatedRatings =
          await TournamentService.processTournamentCompletion(
            finalRatings,
            tournament.voteHistory,
            user.name,
            tournament.ratings
          );

        // * Update store with new ratings
        tournamentActions.setRatings(updatedRatings);
        tournamentActions.setComplete(true);
      } catch (error) {
        ErrorManager.handleError(error, 'Tournament Completion', {
          isRetryable: true,
          affectsUserData: true,
          isCritical: false
        });
      }
    },
    [user.name, tournament.voteHistory, tournament.ratings, tournamentActions]
  );

  // * Handle start new tournament
  const handleStartNewTournament = useCallback(() => {
    tournamentActions.resetTournament();
  }, [tournamentActions]);

  // * Handle tournament setup
  const handleTournamentSetup = useCallback(
    (names) => {
      // * Reset tournament state and set loading
      tournamentActions.resetTournament();
      tournamentActions.setLoading(true);

      const processedNames = TournamentService.createTournament(
        names,
        tournament.ratings
      );

      tournamentActions.setNames(processedNames);
      // Ensure we are on the tournament view after starting
      tournamentActions.setView('tournament');

      // * Use setTimeout to ensure the loading state is visible and prevent flashing
      setTimeout(() => {
        tournamentActions.setLoading(false);
      }, 100);
    },
    [tournament.ratings, tournamentActions]
  );

  // * Handle ratings update
  const handleUpdateRatings = useCallback(
    async (adjustedRatings) => {
      try {
        const updatedRatings = await TournamentService.updateRatings(
          adjustedRatings,
          user.name
        );
        tournamentActions.setRatings(updatedRatings);
        return true;
      } catch (error) {
        ErrorManager.handleError(error, 'Rating Update', {
          isRetryable: true,
          affectsUserData: true,
          isCritical: false
        });
        throw error;
      }
    },
    [user.name, tournamentActions]
  );

  // * Handle logout
  const handleLogout = useCallback(async () => {
    logout(); // * This already calls userActions.logout() internally
    tournamentActions.resetTournament();
  }, [logout, tournamentActions]);

  // * Handle theme change
  const handleThemeChange = useCallback(() => {
    uiActions.toggleTheme();
  }, [uiActions]);

  // * Update the URL when the active view changes
  React.useEffect(() => {
    if (!user.isLoggedIn || normalizedPath === '/bongo') {
      lastViewRef.current = tournament.currentView;
      lastCompletionRef.current = tournament.isComplete;
      return;
    }

    const completionChanged = tournament.isComplete !== lastCompletionRef.current;
    lastCompletionRef.current = tournament.isComplete;

    if (!completionChanged && tournament.currentView === lastViewRef.current) {
      return;
    }

    lastViewRef.current = tournament.currentView;

    if (tournament.currentView === 'profile') {
      if (normalizedPath !== '/profile') {
        navigateTo('/profile');
      }
      return;
    }

    if (tournament.isComplete && tournament.currentView === 'tournament') {
      if (normalizedPath !== '/results') {
        navigateTo('/results');
      }
      return;
    }

    if (!['/', '/tournament'].includes(normalizedPath)) {
      navigateTo('/tournament');
    }
  }, [
    navigateTo,
    normalizedPath,
    tournament.currentView,
    tournament.isComplete,
    user.isLoggedIn
  ]);

  // * Keep application state in sync with URL changes
  React.useEffect(() => {
    if (normalizedPath === '/bongo') {
      previousRouteRef.current = currentRoute;
      return;
    }

    if (!user.isLoggedIn) {
      if (normalizedPath !== '/login') {
        navigateTo('/login', { replace: true });
      }
      previousRouteRef.current = currentRoute;
      return;
    }

    if (normalizedPath === '/profile' && tournament.currentView !== 'profile') {
      lastViewRef.current = 'profile';
      tournamentActions.setView('profile');
      previousRouteRef.current = currentRoute;
      return;
    }

    const previousPath = normalizeRoutePath(previousRouteRef.current);
    const pathChanged = previousRouteRef.current === null || previousPath !== normalizedPath;
    const tournamentPaths = new Set(['/', '/tournament', '/results']);

    if (pathChanged && tournamentPaths.has(normalizedPath) && tournament.currentView !== 'tournament') {
      lastViewRef.current = 'tournament';
      tournamentActions.setView('tournament');
    }

    previousRouteRef.current = currentRoute;
  }, [
    currentRoute,
    navigateTo,
    normalizedPath,
    tournament.currentView,
    tournamentActions,
    user.isLoggedIn
  ]);

  // * Synchronize global body class with current theme
  React.useEffect(() => {
    const bodyElement = document.body;
    const rootElement = document.documentElement;

    if (!bodyElement || !rootElement) {
      return undefined;
    }

    const themeClass = ui.theme === 'light' ? 'light-theme' : 'dark-theme';
    const themeColor = ui.theme === 'light' ? '#f4f7fb' : '#020617';

    bodyElement.classList.remove('light-theme', 'dark-theme');
    bodyElement.classList.add(themeClass);

    rootElement.dataset.theme = ui.theme;
    rootElement.style.colorScheme = ui.theme;
    bodyElement.style.colorScheme = ui.theme;

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', themeColor);
    }

    return () => {
      bodyElement.classList.remove('light-theme', 'dark-theme');
      rootElement.removeAttribute('data-theme');
      rootElement.style.removeProperty('color-scheme');
      bodyElement.style.removeProperty('color-scheme');
    };
  }, [ui.theme]);

  // * Welcome screen removed

  // * Handle user login
  const handleLogin = useCallback(async (userName) => {
    try {
      const success = await login(userName);
      return success;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [login]);

  // * Memoize main content to prevent unnecessary re-renders

  // * Memoize NavBar props to prevent unnecessary re-renders
  const navBarProps = React.useMemo(
    () => ({
      view: tournament.currentView || 'tournament',
      setView: (view) => {
        tournamentActions.setView(view);
        if (view === 'profile') {
          tournamentActions.resetTournament();
        }
      },
      isLoggedIn: user.isLoggedIn,
      userName: user.name,
      isAdmin,
      onLogout: handleLogout,
      onStartNewTournament: handleStartNewTournament,
      isLightTheme: ui.theme === 'light',
      onThemeChange: handleThemeChange,
      onTogglePerformanceDashboard: () => uiActions.togglePerformanceDashboard()
    }),
    [
      tournament.currentView,
      tournamentActions,
      user.isLoggedIn,
      user.name,
      isAdmin,
      handleLogout,
      handleStartNewTournament,
      ui.theme,
      handleThemeChange,
      uiActions
    ]
  );


  return (
    <SidebarProvider collapsedWidth={56}>
      <div className="app">
        {/* * Skip link for keyboard navigation */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* * Static cat-themed background */}
        <CatBackground />

        {/* * Header with Sidebar Trigger */}
        <header className="app-header">
          <SidebarTrigger className="app-sidebar-trigger" />
        </header>

        {/* * App Sidebar */}
        <AppSidebar {...navBarProps} />

        <main className="app-main-wrapper">
          <div id="main-content" className="main-content" tabIndex="-1">
            {errors.current && user.isLoggedIn && (
              <Error
                variant="list"
                error={errors.current}
                onDismiss={() => errorActions.clearError()}
                onRetry={() => window.location.reload()}
              />
            )}

            <ViewRouter
              isLoggedIn={user.isLoggedIn}
              onLogin={handleLogin}
              tournament={tournament}
              userName={user.name}
              onStartNewTournament={handleStartNewTournament}
              onUpdateRatings={handleUpdateRatings}
              onTournamentSetup={handleTournamentSetup}
              onTournamentComplete={handleTournamentComplete}
              onVote={(vote) => tournamentActions.addVote(vote)}
            />
          </div>

          {/* * Global loading overlay */}
          {tournament.isLoading && (
        <div
          className="global-loading-overlay"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <Loading variant="spinner" text="Initializing Tournament..." />
        </div>
      )}

      {/* * Toast notifications */}
      <Toast
        variant="container"
        toasts={toasts}
        removeToast={removeToast}
        position="top-right"
        maxToasts={5}
      />

        {/* * Performance Dashboard - Admin (Aaron) only */}
        <PerformanceDashboard
          userName={user.name}
          isVisible={isAdmin && ui.showPerformanceDashboard}
          onClose={() => uiActions.setPerformanceDashboardVisible(false)}
        />
        </main>
      </div>
    </SidebarProvider>
  );
}

export default App;
