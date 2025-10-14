/**
 * @module App
 * @description Main application component for the cat name tournament app.
 * Refactored to use centralized state management and services for better maintainability.
 *
 * @component
 * @returns {JSX.Element} The complete application UI
 */

import React, { useCallback } from 'react';
import CatBackground from './shared/components/CatBackground/CatBackground';
import ViewRouter from './shared/components/ViewRouter/ViewRouter';
import { ErrorBoundary, ErrorDisplay, ToastContainer } from './shared/components';
import NavBar from './shared/components/NavBar/NavBar';
import PerformanceDashboard from './shared/components/PerformanceDashboard';

// * Lazy load heavy components for better code splitting
import useUserSession from './core/hooks/useUserSession';
import useTheme from './core/hooks/useTheme';
import useToast from './core/hooks/useToast';
import useAppStore from './core/store/useAppStore';
import { TournamentService } from './shared/services/tournamentService';
import { ErrorManager } from './shared/services/errorManager';
import LoadingSpinner from './shared/components/LoadingSpinner/LoadingSpinner';

// * Components imported directly for better code splitting

/**
 * Generate a cat background video element
 * @param {number} index - The index number for the CSS class
 * @returns {JSX.Element} Video element with fallback image
 */

function App() {
  const { userName, isLoggedIn, login, logout } = useUserSession();
  const { isLightTheme, toggleTheme } = useTheme();

  // * Toast notifications
  const { toasts, removeToast } = useToast();

  // * UI flags from store
  const { ui } = useAppStore();


  // * Centralized store
  const {
    tournament,
    errors,
    tournamentActions,
    userActions,
    uiActions,
    errorActions
  } = useAppStore();

  // * Keyboard shortcut for performance dashboard (Ctrl+Shift+P)
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        uiActions.togglePerformanceDashboard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [uiActions]);

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
        ErrorManager.handleError(error, 'Tournament Completion', {
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
          userName
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
    [userName, tournamentActions]
  );

  // * Handle logout
  const handleLogout = useCallback(async () => {
    logout();
    userActions.logout();
    tournamentActions.resetTournament();
    uiActions.setWelcomeVisible(true);
  }, [logout, userActions, tournamentActions, uiActions]);

  // * Handle theme change
  const handleThemeChange = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  // * Handle welcome screen continue
  const handleWelcomeContinue = useCallback(() => {
    uiActions.setWelcomeVisible(false);
    if (isLoggedIn) {
      logout();
      userActions.logout();
      tournamentActions.resetTournament();
    }
  }, [isLoggedIn, logout, userActions, tournamentActions, uiActions]);

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
      isLoggedIn,
      userName,
      onLogout: handleLogout,
      onStartNewTournament: handleStartNewTournament,
      isLightTheme,
      onThemeChange: handleThemeChange,
      onTogglePerformanceDashboard: () => uiActions.togglePerformanceDashboard()
    }),
    [
      tournament.currentView,
      tournamentActions,
      isLoggedIn,
      userName,
      handleLogout,
      handleStartNewTournament,
      isLightTheme,
      handleThemeChange,
      uiActions
    ]
  );


  return (
    <div className="app">
      {/* * Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* * Static cat-themed background */}
      <CatBackground />

      {/* * NavBar - always visible for navigation and controls */}
      <NavBar {...navBarProps} />

      <div id="main-content" className="main-content" tabIndex="-1">
        {errors.current && isLoggedIn && (
          <ErrorDisplay
            errors={errors.current}
            onDismiss={() => errorActions.clearError()}
            onRetry={() => window.location.reload()}
          />
        )}

        <ViewRouter
          showWelcomeScreen={ui.showWelcomeScreen}
          isLoggedIn={isLoggedIn}
          isLightTheme={isLightTheme}
          onThemeToggle={handleThemeChange}
          onWelcomeContinue={handleWelcomeContinue}
          onLogin={login}
          tournament={tournament}
          userName={userName}
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

      {/* * Performance Dashboard - Available to all users */}
      <PerformanceDashboard
        userName={userName}
        isVisible={ui.showPerformanceDashboard}
        onClose={() => uiActions.setPerformanceDashboardVisible(false)}
      />
    </div>
  );
}

export default App;
