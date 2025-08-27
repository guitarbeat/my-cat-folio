/**
 * @module App
 * @description Main application component for the cat name tournament app.
 * Refactored to use centralized state management and services for better maintainability.
 *
 * @component
 * @returns {JSX.Element} The complete application UI
 */

import React from 'react';
import { ErrorBoundary, Login, ErrorDisplay, OnboardingModal, ToastContainer } from './components';
import NavBar from './components/NavBar/NavBar';
import useUserSession from './hooks/useUserSession';
import useOnboarding from './hooks/useOnboarding';
import useTheme from './hooks/useTheme';
import useToast from './hooks/useToast';
import useAppStore from './store/useAppStore';
import { TournamentService } from './services/tournamentService';
import { ErrorService } from './services/errorService';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import FloatingKitties from './components/FloatingKitties';

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

  // * Onboarding management
  const {
    showOnboarding,
    closeOnboarding,
    dontShowAgain,
    setShowOnboarding
  } = useOnboarding();

  // * Toast notifications
  const {
    toasts,
    removeToast
  } = useToast();

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
  const handleTournamentComplete = async (finalRatings) => {
    try {
      if (!userName) {
        throw new Error('No user name available');
      }

      const updatedRatings = await TournamentService.processTournamentCompletion(
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
  };

  // * Handle start new tournament
  const handleStartNewTournament = () => {
    tournamentActions.resetTournament();
  };

  // * Handle tournament setup
  const handleTournamentSetup = (names) => {
    tournamentActions.setLoading(true);

    const processedNames = TournamentService.createTournament(names, tournament.ratings);
    tournamentActions.setNames(processedNames);
    tournamentActions.setLoading(false);
  };

  // * Handle ratings update
  const handleUpdateRatings = async (adjustedRatings) => {
    try {
      const updatedRatings = await TournamentService.updateRatings(adjustedRatings, userName);
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
  };

  // * Handle logout
  const handleLogout = async () => {
    logout();
    userActions.logout();
  };

  // * Handle theme change
  const handleThemeChange = (isLight) => {
    const theme = isLight ? 'light' : 'dark';
    uiActions.setTheme(theme);
    toggleTheme();
  };

  // * Render main content based on current view
  const renderMainContent = () => {
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
  };

  return (
    <div className="app">
      {/* * Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* * Floating kitties background */}
      <FloatingKitties
        kittieCount={12}
        creationInterval={3000}
        minSize={20}
        maxSize={35}
        minDuration={4}
        maxDuration={10}
        backgroundImage="galaxy"
        enableGlow={true}
        enableHover={true}
      />

      {/* * NavBar - always visible for navigation and controls */}
      <NavBar
        view={tournament.currentView}
        setView={(view) => tournamentActions.setView(view)}
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLogout={handleLogout}
        onStartNewTournament={handleStartNewTournament}
        isLightTheme={isLightTheme}
        onThemeChange={handleThemeChange}
        onShowOnboarding={() => setShowOnboarding(true)}
        onCloseOnboarding={closeOnboarding}
        isOnboardingOpen={showOnboarding}
      />

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
          <ErrorBoundary>
            {renderMainContent()}
          </ErrorBoundary>
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

      {/* * Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={closeOnboarding}
        onDontShowAgain={dontShowAgain}
        isLightTheme={isLightTheme}
      />

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
