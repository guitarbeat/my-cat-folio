import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('useTournamentStats', () => {
  let useAppStore;
  let selectTournamentStats;

  beforeEach(async () => {
    vi.resetModules();
    const storeModule = await import('./useAppStore');
    useAppStore = storeModule.default;
    selectTournamentStats = storeModule.selectTournamentStats;

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

describe('theme initialization', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.resetModules();
  });

  it('preserves a persisted light theme value', async () => {
    window.localStorage.setItem('theme', 'light');

    const { default: store } = await import('./useAppStore');

    expect(store.getState().ui.theme).toBe('light');
  });

  it('supports legacy boolean theme values', async () => {
    window.localStorage.setItem('theme', 'false');

    const { default: store } = await import('./useAppStore');

    expect(store.getState().ui.theme).toBe('dark');
  });
});
