import useAppStore, { selectTournamentStats } from './useAppStore';

describe('useTournamentStats', () => {
  beforeEach(() => {
    useAppStore.setState((state) => ({
      ...state,
      tournament: {
        ...state.tournament,
        names: null,
        voteHistory: [],
        isComplete: false,
        isLoading: false
      }
    }));
  });

  it('returns 0 progress when no names are available', () => {
    const stats = selectTournamentStats(useAppStore.getState());

    expect(stats.totalNames).toBe(0);
    expect(stats.progress).toBe(0);
  });

  it('returns 0 progress when only one name exists', () => {
    useAppStore.setState((state) => ({
      ...state,
      tournament: {
        ...state.tournament,
        names: [
          {
            id: '1',
            name: 'Misty',
            description: 'A mysterious cat'
          }
        ],
        voteHistory: []
      }
    }));

    const stats = selectTournamentStats(useAppStore.getState());

    expect(stats.totalNames).toBe(1);
    expect(stats.progress).toBe(0);
  });

  it('calculates progress when multiple names are available', () => {
    useAppStore.setState((state) => ({
      ...state,
      tournament: {
        ...state.tournament,
        names: [
          { id: '1', name: 'Misty', description: 'A mysterious cat' },
          { id: '2', name: 'Shadow', description: 'A shadowy feline' },
          { id: '3', name: 'Luna', description: 'A lunar companion' }
        ],
        voteHistory: [{ id: 'match-1' }, { id: 'match-2' }, { id: 'match-3' }]
      }
    }));

    const stats = selectTournamentStats(useAppStore.getState());

    expect(stats.totalNames).toBe(3);
    expect(stats.progress).toBe(100);
  });
});
