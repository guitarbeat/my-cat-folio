import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * @module useAppStore
 * @description Centralized state management for the entire application using Zustand.
 * Consolidates tournament state, user state, UI state, and actions into a single store.
 */

const useAppStore = create(
  devtools(
    (set, get) => ({
      // * Tournament State
      tournament: {
        names: null,
        ratings: {},
        isComplete: false,
        isLoading: false,
        voteHistory: [],
        currentView: 'tournament'
      },

      // * User State
      user: {
        name: '',
        isLoggedIn: false,
        isAdmin: false,
        preferences: {}
      },

      // * UI State
      ui: {
        theme: 'light',
        showOnboarding: false,
        showGlobalAnalytics: false,
        showUserComparison: false,
        matrixMode: false
      },

      // * Error State
      errors: {
        current: null,
        history: []
      },

      // * Tournament Actions
      tournamentActions: {
        setNames: (names) =>
          set((state) => ({
            tournament: {
              ...state.tournament,
              names: names?.map((n) => ({
                id: n.id,
                name: n.name,
                description: n.description,
                rating: state.tournament.ratings[n.name]?.rating || 1500
              }))
            }
          })),

        setRatings: (ratings) =>
          set((state) => ({
            tournament: {
              ...state.tournament,
              ratings: { ...state.tournament.ratings, ...ratings }
            }
          })),

        setComplete: (isComplete) =>
          set((state) => ({
            tournament: {
              ...state.tournament,
              isComplete
            }
          })),

        setLoading: (isLoading) =>
          set((state) => ({
            tournament: {
              ...state.tournament,
              isLoading
            }
          })),

        addVote: (vote) =>
          set((state) => ({
            tournament: {
              ...state.tournament,
              voteHistory: [...state.tournament.voteHistory, vote]
            }
          })),

        resetTournament: () =>
          set((state) => ({
            tournament: {
              ...state.tournament,
              names: null,
              isComplete: false,
              voteHistory: [],
              isLoading: false // * Explicitly set loading to false to prevent flashing
            }
          })),

        setView: (view) =>
          set((state) => ({
            tournament: {
              ...state.tournament,
              currentView: view
            }
          }))
      },

      // * User Actions
      userActions: {
        setUser: (userData) =>
          set((state) => ({
            user: {
              ...state.user,
              ...userData
            }
          })),

        login: (userName) =>
          set((state) => ({
            user: {
              ...state.user,
              name: userName,
              isLoggedIn: true
            }
          })),

        logout: () =>
          set((state) => ({
            user: {
              ...state.user,
              name: '',
              isLoggedIn: false,
              isAdmin: false
            },
            tournament: {
              ...state.tournament,
              names: null,
              isComplete: false,
              voteHistory: []
            }
          })),

        setAdminStatus: (isAdmin) =>
          set((state) => ({
            user: {
              ...state.user,
              isAdmin
            }
          }))
      },

      // * UI Actions
      uiActions: {
        setTheme: (theme) =>
          set((state) => ({
            ui: {
              ...state.ui,
              theme
            }
          })),

        toggleTheme: () =>
          set((state) => ({
            ui: {
              ...state.ui,
              theme: state.ui.theme === 'light' ? 'dark' : 'light'
            }
          })),

        setOnboarding: (show) =>
          set((state) => ({
            ui: {
              ...state.ui,
              showOnboarding: show
            }
          })),

        setMatrixMode: (enabled) =>
          set((state) => ({
            ui: {
              ...state.ui,
              matrixMode: enabled
            }
          })),

        setGlobalAnalytics: (show) =>
          set((state) => ({
            ui: {
              ...state.ui,
              showGlobalAnalytics: show
            }
          })),

        setUserComparison: (show) =>
          set((state) => ({
            ui: {
              ...state.ui,
              showUserComparison: show
            }
          }))
      },

      // * Error Actions
      errorActions: {
        setError: (error) =>
          set((state) => ({
            errors: {
              current: error,
              history: error ? [...state.errors.history, error] : state.errors.history
            }
          })),

        clearError: () =>
          set((state) => ({
            errors: {
              ...state.errors,
              current: null
            }
          })),

        logError: (error, context, metadata = {}) => {
          const errorLog = {
            error,
            context,
            metadata,
            timestamp: new Date().toISOString()
          };

          set((state) => ({
            errors: {
              ...state.errors,
              history: [...state.errors.history, errorLog]
            }
          }));

          // * Log to console for development
          if (process.env.NODE_ENV === 'development') {
            console.error('Error logged:', errorLog);
          }
        }
      },

      // * Computed Selectors
      selectors: {
        getTournamentNames: () => get().tournament.names,
        getRatings: () => get().tournament.ratings,
        getIsComplete: () => get().tournament.isComplete,
        getIsLoading: () => get().tournament.isLoading,
        getVoteHistory: () => get().tournament.voteHistory,
        getCurrentView: () => get().tournament.currentView,
        getUserName: () => get().user.name,
        getIsLoggedIn: () => get().user.isLoggedIn,
        getIsAdmin: () => get().user.isAdmin,
        getTheme: () => get().ui.theme,
        getShowOnboarding: () => get().ui.showOnboarding,
        getCurrentError: () => get().errors.current
      }
    }),
    {
      name: 'meow-namester-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

export default useAppStore;
