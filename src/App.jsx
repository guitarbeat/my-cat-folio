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

  // * Parallax for galaxy background (respects reduced motion)
  React.useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const stars = document.querySelector('.cat-background__stars');
    const nebula = document.querySelector('.cat-background__nebula');
    const cats = Array.from(document.querySelectorAll('.cat-background__cat'));
    let ticking = false;
    let mouseX = 0;
    let mouseY = 0;

    const onScroll = () => {
      if (ticking) return;
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
            const mouseParX = (mouseX - window.innerWidth / 2) * (0.0005 + idx * 0.0001);
            const mouseParY = (mouseY - window.innerHeight / 2) * (0.0004 + idx * 0.00008);
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
      if (!ticking) onScroll();
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
      // Ensure we are on the tournament view after starting
      tournamentActions.setView('tournament');

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
                <video
                  className="cat-background__cat cat-background__cat--1"
                  muted
                  loop
                  autoPlay
                  playsInline
                  preload="none"
                >
                  <source src="/images/cat.webm" type="video/webm" />
                  <img
                    src="/images/cat.gif"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                </video>
                <video
                  className="cat-background__cat cat-background__cat--2"
                  muted
                  loop
                  autoPlay
                  playsInline
                  preload="none"
                >
                  <source src="/images/cat.webm" type="video/webm" />
                  <img
                    src="/images/cat.gif"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                </video>
                <video
                  className="cat-background__cat cat-background__cat--3"
                  muted
                  loop
                  autoPlay
                  playsInline
                  preload="none"
                >
                  <source src="/images/cat.webm" type="video/webm" />
                  <img
                    src="/images/cat.gif"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                </video>
                <video
                  className="cat-background__cat cat-background__cat--4"
                  muted
                  loop
                  autoPlay
                  playsInline
                  preload="none"
                >
                  <source src="/images/cat.webm" type="video/webm" />
                  <img
                    src="/images/cat.gif"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                </video>
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
