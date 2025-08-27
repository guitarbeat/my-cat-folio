/**
 * @module App
 * @description Main application component for the cat name tournament app.
 * Refactored to use centralized state management and services for better maintainability.
 *
 * @component
 * @returns {JSX.Element} The complete application UI
 */

import React, { useCallback, useMemo } from 'react';
import {
  ErrorBoundary,
  Login,
  ErrorDisplay,
  ToastContainer
} from './components';
import NavBar from './components/NavBar/NavBar';
import useUserSession from './hooks/useUserSession';
import useTheme from './hooks/useTheme';
import useToast from './hooks/useToast';
import useAppStore from './store/useAppStore';
import { TournamentService } from './services/tournamentService';
import { ErrorService } from './services/errorService';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';

// * Lazy-loaded components for performance
const Results = React.lazy(() => import('./components/Results/Results'));
const Profile = React.lazy(() => import('./components/Profile/Profile'));
const TournamentSetup = React.lazy(
  () => import('./components/TournamentSetup/TournamentSetup')
);
const Tournament = React.lazy(
  () => import('./components/Tournament/Tournament')
);

function App() {
  const { userName, isLoggedIn, login, logout } = useUserSession();
  const { isLightTheme, toggleTheme } = useTheme();

  // * Toast notifications
  const { toasts, removeToast } = useToast();

  // * Centralized store
  const {
    tournament,
    errors,
    tournamentActions,
    userActions,
    uiActions,
    errorActions
  } = useAppStore();

  // * Handle tournament completion
  const handleTournamentComplete = useCallback(
    async (finalRatings) => {
      try {
        if (!userName) {
          throw new Error('No user name available');
        }

        const updatedRatings =
          await TournamentService.processTournamentCompletion(
            finalRatings,
            tournament.voteHistory,
            userName,
            tournament.ratings
          );

        // * Update store with new ratings
        tournamentActions.setRatings(updatedRatings);
        tournamentActions.setComplete(true);
      } catch (error) {
        ErrorService.handleError(error, 'Tournament Completion', {
          isRetryable: true,
          affectsUserData: true,
          isCritical: false
        });
      }
    },
    [userName, tournament.voteHistory, tournament.ratings, tournamentActions]
  );

  // * Handle start new tournament
  const handleStartNewTournament = useCallback(() => {
    tournamentActions.resetTournament();
  }, [tournamentActions]);

  // * Handle tournament setup
  const handleTournamentSetup = useCallback(
    (names) => {
      console.log(
        '[DEV] 🎮 App: handleTournamentSetup called with names:',
        names
      );

      // * Only set loading if we don't already have names
      if (!tournament.names) {
        tournamentActions.setLoading(true);
      }

      const processedNames = TournamentService.createTournament(
        names,
        tournament.ratings
      );
      console.log('[DEV] 🎮 App: Processed names:', processedNames);

      tournamentActions.setNames(processedNames);

      // * Use setTimeout to ensure the loading state is visible and prevent flashing
      setTimeout(() => {
        tournamentActions.setLoading(false);
      }, 100);
    },
    [tournament.ratings, tournament.names, tournamentActions]
  );

  // * Handle ratings update
  const handleUpdateRatings = useCallback(
    async (adjustedRatings) => {
      try {
        const updatedRatings = await TournamentService.updateRatings(
          adjustedRatings,
          userName
        );
        tournamentActions.setRatings(updatedRatings);
        return true;
      } catch (error) {
        ErrorService.handleError(error, 'Rating Update', {
          isRetryable: true,
          affectsUserData: true,
          isCritical: false
        });
        throw error;
      }
    },
    [userName, tournamentActions]
  );

  // * Handle logout
  const handleLogout = useCallback(async () => {
    logout();
    userActions.logout();
  }, [logout, userActions]);

  // * Handle theme change
  const handleThemeChange = useCallback(
    (isLight) => {
      const theme = isLight ? 'light' : 'dark';
      uiActions.setTheme(theme);
      toggleTheme();
    },
    [uiActions, toggleTheme]
  );

  // * Memoize main content to prevent unnecessary re-renders
  const mainContent = useMemo(() => {
    if (!isLoggedIn) {
      return <Login onLogin={login} />;
    }

    switch (tournament.currentView) {
      case 'profile':
        return (
          <Profile
            userName={userName}
            onStartNewTournament={handleStartNewTournament}
            ratings={tournament.ratings}
            onUpdateRatings={handleUpdateRatings}
          />
        );
      case 'loading':
        return (
          <div className="fullScreenCenter">
            <LoadingSpinner size="large" text="Testing Loading Spinner..." />
          </div>
        );
      case 'tournament':
        if (tournament.isComplete) {
          return (
            <Results
              ratings={tournament.ratings}
              onStartNew={handleStartNewTournament}
              userName={userName}
              onUpdateRatings={handleUpdateRatings}
              currentTournamentNames={tournament.names}
              voteHistory={tournament.voteHistory}
            />
          );
        }

        if (tournament.names === null) {
          return (
            <TournamentSetup
              onStart={handleTournamentSetup}
              userName={userName}
              existingRatings={tournament.ratings}
            />
          );
        }

        return (
          <ErrorBoundary>
            <Tournament
              names={tournament.names}
              existingRatings={tournament.ratings}
              onComplete={handleTournamentComplete}
              userName={userName}
              onVote={(vote) => tournamentActions.addVote(vote)}
            />
          </ErrorBoundary>
        );
      default:
        return null;
    }
  }, [
    isLoggedIn,
    login,
    tournament.currentView,
    tournament.ratings,
    tournament.isComplete,
    tournament.names,
    tournament.voteHistory,
    userName,
    handleStartNewTournament,
    handleUpdateRatings,
    handleTournamentSetup,
    handleTournamentComplete,
    tournamentActions
  ]);

  // * Memoize NavBar props to prevent unnecessary re-renders
  const navBarProps = useMemo(
    () => ({
      view: tournament.currentView,
      setView: (view) => tournamentActions.setView(view),
      isLoggedIn,
      userName,
      onLogout: handleLogout,
      onStartNewTournament: handleStartNewTournament,
      isLightTheme,
      onThemeChange: handleThemeChange
    }),
    [
      tournament.currentView,
      tournamentActions,
      isLoggedIn,
      userName,
      handleLogout,
      handleStartNewTournament,
      isLightTheme,
      handleThemeChange
    ]
  );

  return (
    <div className="app">
      {/* * Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* * Static cat-themed background */}
      <div className="cat-background">
        <div className="cat-background__stars"></div>
        <div className="cat-background__nebula"></div>
        <div className="cat-background__floating-cats">
          {(() => {
            // Respect user preferences: avoid heavy GIFs for reduced motion or data-saver
            const prefersReducedMotion =
              typeof window !== 'undefined' &&
              window.matchMedia &&
              window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const saveData =
              typeof navigator !== 'undefined' &&
              navigator.connection &&
              navigator.connection.saveData;
            if (prefersReducedMotion || saveData) return null;
            return (
              <>
                <img
                  src="/images/cat.gif"
                  alt=""
                  className="cat-background__cat cat-background__cat--1"
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                />
                <img
                  src="/images/cat.gif"
                  alt=""
                  className="cat-background__cat cat-background__cat--2"
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                />
                <img
                  src="/images/cat.gif"
                  alt=""
                  className="cat-background__cat cat-background__cat--3"
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                />
                <img
                  src="/images/cat.gif"
                  alt=""
                  className="cat-background__cat cat-background__cat--4"
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                />
              </>
            );
          })()}
        </div>
      </div>

      {/* * NavBar - always visible for navigation and controls */}
      <NavBar {...navBarProps} />

      {/* * Conditional rendering based on login state */}
      {isLoggedIn ? (
        <div id="main-content" className="main-content" tabIndex="-1">
          {/* * Global error display */}
          {errors.current && (
            <ErrorDisplay
              errors={errors.current}
              onDismiss={() => errorActions.clearError()}
              onRetry={() => window.location.reload()}
            />
          )}

          {/* * Main content area */}
          <ErrorBoundary>{mainContent}</ErrorBoundary>
        </div>
      ) : (
        /* * Show Login component when not logged in */
        <Login onLogin={login} />
      )}

      {/* * Global loading overlay */}
      {tournament.isLoading && (
        <div
          className="global-loading-overlay"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <LoadingSpinner text="Initializing Tournament..." />
        </div>
      )}

      {/* * Toast notifications */}
      <ToastContainer
        toasts={toasts}
        removeToast={removeToast}
        position="top-right"
        maxToasts={5}
      />
    </div>
  );
}

export default App;
