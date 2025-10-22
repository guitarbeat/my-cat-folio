import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useTournamentStats', () => {
  let useAppStore;
  let selectTournamentStats;

  beforeEach(async () => {
    vi.resetModules();
    const { default: store, selectTournamentStats: statsSelector } = await import(
      './useAppStore'
    );
    useAppStore = store;
    selectTournamentStats = statsSelector;

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

describe('system theme synchronization', () => {
  const createMatchMediaMock = (initialMatches = false) => {
    let changeListener;

    return {
      matches: initialMatches,
      media: '(prefers-color-scheme: dark)',
      addEventListener: vi.fn((event, listener) => {
        if (event === 'change') {
          changeListener = listener;
        }
      }),
      removeEventListener: vi.fn(),
      addListener: undefined,
      removeListener: undefined,
      dispatch(matches) {
        this.matches = matches;
        if (changeListener) {
          changeListener({ matches });
        }
      }
    };
  };

  beforeEach(() => {
    window.localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    delete window.matchMedia;
    vi.restoreAllMocks();
  });

  it('reacts to system preference changes when following the system theme', async () => {
    const matchMediaMock = createMatchMediaMock(false);
    window.matchMedia = vi.fn().mockReturnValue(matchMediaMock);

    const { default: store } = await import('./useAppStore');

    store.getState().uiActions.initializeTheme();

    matchMediaMock.dispatch(true);
    expect(store.getState().ui.theme).toBe('dark');

    store.getState().uiActions.setTheme('light');
    matchMediaMock.dispatch(false);
    expect(store.getState().ui.theme).toBe('light');

    store.getState().uiActions.setTheme('system');
    matchMediaMock.dispatch(true);
    expect(store.getState().ui.theme).toBe('dark');
    matchMediaMock.dispatch(false);
    expect(store.getState().ui.theme).toBe('light');
  });
});
