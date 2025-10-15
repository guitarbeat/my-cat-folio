import React, { lazy } from 'react';
import PropTypes from 'prop-types';
import SuspenseView from '../SuspenseView/SuspenseView';
import { ErrorBoundary, WelcomeScreen } from '..';
import Login from '../../../features/auth/Login';

const Tournament = lazy(() => import('../../../features/tournament/Tournament'));
const TournamentSetup = lazy(() => import('../../../features/tournament/TournamentSetup'));
const Results = lazy(() => import('../../../features/tournament/Results'));
const Profile = lazy(() => import('../../../features/profile/Profile'));

export default function ViewRouter({
  showWelcomeScreen,
  isLoggedIn,
  isLightTheme,
  onThemeToggle,
  onWelcomeContinue,
  onLogin,
  tournament,
  userName,
  onStartNewTournament,
  onUpdateRatings,
  onTournamentSetup,
  onTournamentComplete,
  onVote
}) {
  if (showWelcomeScreen) {
    return (
      <WelcomeScreen
        onContinue={onWelcomeContinue}
        isLightTheme={isLightTheme}
        onThemeToggle={onThemeToggle}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <Login onLogin={onLogin} />
    );
  }

  if (tournament.currentView === 'profile') {
    return (
      <SuspenseView text="Loading Profile...">
        <Profile
          userName={userName}
          onStartNewTournament={onStartNewTournament}
          ratings={tournament.ratings}
          onUpdateRatings={onUpdateRatings}
        />
      </SuspenseView>
    );
  }

  if (tournament.names === null) {
    return (
      <SuspenseView text="Loading Tournament Setup...">
        <TournamentSetup
          onStart={onTournamentSetup}
          userName={userName}
          existingRatings={tournament.ratings}
        />
      </SuspenseView>
    );
  }

  if (tournament.isComplete) {
    return (
      <SuspenseView text="Loading Results...">
        <Results
          ratings={tournament.ratings}
          onStartNew={onStartNewTournament}
          userName={userName}
          onUpdateRatings={onUpdateRatings}
          currentTournamentNames={tournament.names}
          voteHistory={tournament.voteHistory}
        />
      </SuspenseView>
    );
  }

  return (
    <ErrorBoundary>
      <SuspenseView text="Loading Tournament...">
        <Tournament
          names={tournament.names}
          existingRatings={tournament.ratings}
          onComplete={onTournamentComplete}
          userName={userName}
          onVote={onVote}
        />
      </SuspenseView>
    </ErrorBoundary>
  );
}

ViewRouter.propTypes = {
  showWelcomeScreen: PropTypes.bool.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  isLightTheme: PropTypes.bool.isRequired,
  onThemeToggle: PropTypes.func.isRequired,
  onWelcomeContinue: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  tournament: PropTypes.shape({
    names: PropTypes.any,
    ratings: PropTypes.object.isRequired,
    isComplete: PropTypes.bool.isRequired,
    voteHistory: PropTypes.array.isRequired,
    currentView: PropTypes.string.isRequired
  }).isRequired,
  userName: PropTypes.string,
  onStartNewTournament: PropTypes.func.isRequired,
  onUpdateRatings: PropTypes.func.isRequired,
  onTournamentSetup: PropTypes.func.isRequired,
  onTournamentComplete: PropTypes.func.isRequired,
  onVote: PropTypes.func.isRequired
};
