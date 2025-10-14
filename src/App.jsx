/**
 * @module App
 * @description Main application component for the cat name tournament app.
 * Refactored to use centralized state management and services for better maintainability.
 *
 * @component
 * @returns {JSX.Element} The complete application UI
 */

import React, { useCallback, useMemo, lazy, Suspense, useState } from 'react';
import {
  ErrorBoundary,
  ErrorDisplay,
  ToastContainer,
  WelcomeScreen
} from './shared/components';
import NavBar from './shared/components/NavBar/NavBar';
import PerformanceDashboard from './shared/components/PerformanceDashboard';

// * Lazy load heavy components for better code splitting
const Login = lazy(() => import('./features/auth/Login'));
const Tournament = lazy(() => import('./features/tournament/Tournament'));
const TournamentSetup = lazy(
  () => import('./features/tournament/TournamentSetup')
);
const Results = lazy(() => import('./features/tournament/Results'));
const Profile = lazy(() => import('./features/profile/Profile'));
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
const createCatVideo = (index) => (
  <video
    className={`cat-background__cat cat-background__cat--${index}`}
    muted
    loop
    autoPlay
    playsInline
    preload="none"
  >
    <source src="/assets/images/cat.webm" type="video/webm" />
    <img
      src="/assets/images/cat.gif"
      alt=""
      loading="lazy"
      decoding="async"
      fetchPriority="low"
    />
  </video>
);

function App() {
  const { userName, isLoggedIn, login, logout } = useUserSession();
  const { isLightTheme, toggleTheme } = useTheme();

  // * Toast notifications
  const { toasts, removeToast } = useToast();

  // * Welcome screen state
  const [showWelcomeScreen, setShowWelcomeScreen] = React.useState(true);

  // * Performance dashboard state
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);

  // * Keyboard shortcut for performance dashboard (Ctrl+Shift+P)
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        setShowPerformanceDashboard(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  // * Parallax for galaxy background (respects reduced motion)
  React.useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      return;
    }

    const stars = document.querySelector('.cat-background__stars');
    const nebula = document.querySelector('.cat-background__nebula');
    const cats = Array.from(document.querySelectorAll('.cat-background__cat'));
    let ticking = false;
    let mouseX = 0;
    let mouseY = 0;

    const onScroll = () => {
      if (ticking) {
        return;
      }
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        if (stars) {
          const sTranslate = Math.min(30, y * 0.02);
          stars.style.transform = `translateY(${sTranslate}px)`;
        }
        if (nebula) {
          const nTranslate = Math.min(60, y * 0.05);
          const nScale = 1 + Math.min(0.12, y * 0.00025);
          const nParallaxX = (mouseX - window.innerWidth / 2) * 0.0008;
          const nParallaxY = (mouseY - window.innerHeight / 2) * 0.0006;
          nebula.style.transform = `translate(${nParallaxX * 40}px, ${nTranslate + nParallaxY * 30}px) scale(${nScale})`;
        }
        if (cats.length) {
          cats.forEach((el, idx) => {
            const speed = 0.035 + idx * 0.012; // vary per cat
            const cTranslateY = Math.min(80, y * speed);
            const swayX = Math.sin((y + idx * 120) * 0.002) * 10;
            const mouseParX =
              (mouseX - window.innerWidth / 2) * (0.0005 + idx * 0.0001);
            const mouseParY =
              (mouseY - window.innerHeight / 2) * (0.0004 + idx * 0.00008);
            el.style.transform = `translate(${swayX + mouseParX * 35}px, ${cTranslateY + mouseParY * 25}px)`;
          });
        }
        ticking = false;
      });
    };

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // schedule a frame if none pending to reflect latest mouse
      if (!ticking) {
        onScroll();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

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
    // Reset tournament state and go back to welcome screen
    tournamentActions.resetTournament();
    setShowWelcomeScreen(true);
  }, [logout, userActions, tournamentActions]);

  // * Handle theme change
  const handleThemeChange = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  // * Handle welcome screen continue
  const handleWelcomeContinue = useCallback(() => {
    setShowWelcomeScreen(false);
    // Always show Login after Welcome, even if a previous session exists
    if (isLoggedIn) {
      logout();
      userActions.logout();
      tournamentActions.resetTournament();
    }
  }, [isLoggedIn, logout, userActions, tournamentActions]);

  // * Memoize main content to prevent unnecessary re-renders
  const mainContent = useMemo(() => {
    if (!isLoggedIn) {
      return (
        <Suspense
          fallback={<div className="loading-placeholder">Loading...</div>}
        >
          <Login onLogin={login} />
        </Suspense>
      );
    }

    // * Handle profile view
    if (tournament.currentView === 'profile') {
      return (
        <Suspense
          fallback={
            <div className="loading-placeholder">Loading Profile...</div>
          }
        >
          <Profile
            userName={userName}
            onStartNewTournament={handleStartNewTournament}
            ratings={tournament.ratings}
            onUpdateRatings={handleUpdateRatings}
          />
        </Suspense>
      );
    }

    // * Show tournament setup if no names selected, otherwise show tournament
    if (tournament.names === null) {
      return (
        <Suspense
          fallback={
            <div className="loading-placeholder">
              Loading Tournament Setup...
            </div>
          }
        >
          <TournamentSetup
            onStart={handleTournamentSetup}
            userName={userName}
            existingRatings={tournament.ratings}
          />
        </Suspense>
      );
    }

    // * Show tournament if names are selected
    if (tournament.isComplete) {
      return (
        <Suspense
          fallback={
            <div className="loading-placeholder">Loading Results...</div>
          }
        >
          <Results
            ratings={tournament.ratings}
            onStartNew={handleStartNewTournament}
            userName={userName}
            onUpdateRatings={handleUpdateRatings}
            currentTournamentNames={tournament.names}
            voteHistory={tournament.voteHistory}
          />
        </Suspense>
      );
    }

    return (
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="loading-placeholder">Loading Tournament...</div>
          }
        >
          <Tournament
            names={tournament.names}
            existingRatings={tournament.ratings}
            onComplete={handleTournamentComplete}
            userName={userName}
            onVote={(vote) => tournamentActions.addVote(vote)}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }, [
    isLoggedIn,
    login,
    tournament.currentView,
    tournament.names,
    tournament.isComplete,
    tournament.ratings,
    tournament.voteHistory,
    userName,
    handleTournamentSetup,
    handleStartNewTournament,
    handleUpdateRatings,
    handleTournamentComplete,
    tournamentActions
  ]);

  // * Memoize NavBar props to prevent unnecessary re-renders
  const navBarProps = useMemo(
    () => ({
      view: tournament.currentView || 'tournament',
      setView: (view) => {
        tournamentActions.setView(view);
        // If going to profile, reset tournament to show setup
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
      onTogglePerformanceDashboard: () => setShowPerformanceDashboard(prev => !prev)
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

  // * Show welcome screen first
  if (showWelcomeScreen) {
    return (
      <WelcomeScreen
        onContinue={handleWelcomeContinue}
        isLightTheme={isLightTheme}
        onThemeToggle={handleThemeChange}
      />
    );
  }

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
            if (prefersReducedMotion || saveData) {
              return null;
            }
            return (
              <>
                {createCatVideo(1)}
                {createCatVideo(2)}
                {createCatVideo(3)}
                {createCatVideo(4)}
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

      {/* * Performance Dashboard - Available to all users */}
      <PerformanceDashboard
        userName={userName}
        isVisible={showPerformanceDashboard}
        onClose={() => setShowPerformanceDashboard(false)}
      />
    </div>
  );
}

export default App;
