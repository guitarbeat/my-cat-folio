import React, { lazy } from 'react';
import PropTypes from 'prop-types';
import { Loading } from '..';
import { Error } from '..';
import Login from '../../../features/auth/Login';

const Tournament = lazy(() => import('../../../features/tournament/Tournament'));
const TournamentSetup = lazy(() => import('../../../features/tournament/TournamentSetup'));
const Results = lazy(() => import('../../../features/tournament/Results'));
const Profile = lazy(() => import('../../../features/profile/Profile'));

export default function ViewRouter({
  isLoggedIn,
  onLogin,
  tournament,
  userName,
  onStartNewTournament,
  onUpdateRatings,
  onTournamentSetup,
  onTournamentComplete,
  onVote
}) {

  if (!isLoggedIn) {
    return (
      <Login onLogin={onLogin} />
    );
  }

  if (tournament.currentView === 'profile') {
    return (
      <Loading variant="suspense" text="Loading Profile...">
        <Profile
          userName={userName}
          onStartNewTournament={onStartNewTournament}
          ratings={tournament.ratings}
          onUpdateRatings={onUpdateRatings}
        />
      </Loading>
    );
  }

  if (tournament.names === null) {
    return (
      <Loading variant="suspense" text="Loading Tournament Setup...">
        <TournamentSetup
          onStart={onTournamentSetup}
          userName={userName}
          existingRatings={tournament.ratings}
        />
      </Loading>
    );
  }

  if (tournament.isComplete) {
    return (
      <Loading variant="suspense" text="Loading Results...">
        <Results
          ratings={tournament.ratings}
          onStartNew={onStartNewTournament}
          userName={userName}
          onUpdateRatings={onUpdateRatings}
          currentTournamentNames={tournament.names}
          voteHistory={tournament.voteHistory}
        />
      </Loading>
    );
  }

  return (
    <Error variant="boundary">
      <Loading variant="suspense" text="Loading Tournament...">
        <Tournament
          names={tournament.names}
          existingRatings={tournament.ratings}
          onComplete={onTournamentComplete}
          userName={userName}
          onVote={onVote}
        />
      </Loading>
    </Error>
  );
}

ViewRouter.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
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
