import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useEffect } from 'react';

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
        showPerformanceDashboard: false,
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
          set((state) => {
            const newUser = {
              ...state.user,
              ...userData
            };
            // * Persist to localStorage
            try {
              if (newUser.name) {
                localStorage.setItem('catNamesUser', newUser.name);
              } else {
                localStorage.removeItem('catNamesUser');
              }
            } catch (error) {
              if (process.env.NODE_ENV === 'development') {
                console.error('Error updating localStorage:', error);
              }
            }
            return {
              user: newUser
            };
          }),

        login: (userName) =>
          set((state) => {
            const newUser = {
              ...state.user,
              name: userName,
              isLoggedIn: true
            };
            // * Persist to localStorage
            try {
              localStorage.setItem('catNamesUser', userName);
            } catch (error) {
              if (process.env.NODE_ENV === 'development') {
                console.error('Error updating localStorage:', error);
              }
            }
            return {
              user: newUser
            };
          }),

        logout: () =>
          set((state) => {
            // * Clear localStorage
            try {
              localStorage.removeItem('catNamesUser');
            } catch (error) {
              if (process.env.NODE_ENV === 'development') {
                console.error('Error clearing localStorage:', error);
              }
            }
            return {
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
            };
          }),

        setAdminStatus: (isAdmin) =>
          set((state) => ({
            user: {
              ...state.user,
              isAdmin
            }
          })),

        // * Initialize user from localStorage
        initializeFromStorage: () =>
          set((state) => {
            try {
              const storedUser = localStorage.getItem('catNamesUser');
              if (storedUser) {
                return {
                  user: {
                    ...state.user,
                    name: storedUser,
                    isLoggedIn: true
                  }
                };
              }
            } catch (error) {
              if (process.env.NODE_ENV === 'development') {
                console.error('Error reading from localStorage:', error);
              }
            }
            return state;
          })
      },

      // * UI Actions
      uiActions: {
        // * Initialize theme from localStorage
        initializeTheme: () =>
          set((state) => {
            try {
              const storedTheme = localStorage.getItem('theme');
              if (storedTheme !== null) {
                const isLightTheme = storedTheme === 'true';
                return {
                  ui: {
                    ...state.ui,
                    theme: isLightTheme ? 'light' : 'dark'
                  }
                };
              }
            } catch (error) {
              if (process.env.NODE_ENV === 'development') {
                console.error('Error reading theme from localStorage:', error);
              }
            }
            return state;
          }),

        setTheme: (theme) =>
          set((state) => {
            // * Persist to localStorage
            try {
              localStorage.setItem('theme', theme === 'light' ? 'true' : 'false');
            } catch (error) {
              if (process.env.NODE_ENV === 'development') {
                console.error('Error updating theme localStorage:', error);
              }
            }
            return {
              ui: {
                ...state.ui,
                theme
              }
            };
          }),

        toggleTheme: () =>
          set((state) => {
            const newTheme = state.ui.theme === 'light' ? 'dark' : 'light';
            // * Persist to localStorage
            try {
              localStorage.setItem('theme', newTheme === 'light' ? 'true' : 'false');
            } catch (error) {
              if (process.env.NODE_ENV === 'development') {
                console.error('Error updating theme localStorage:', error);
              }
            }
            return {
              ui: {
                ...state.ui,
                theme: newTheme
              }
            };
          }),

        setPerformanceDashboardVisible: (show) =>
          set((state) => ({
            ui: {
              ...state.ui,
              showPerformanceDashboard: !!show
            }
          })),

        togglePerformanceDashboard: () =>
          set((state) => ({
            ui: {
              ...state.ui,
              showPerformanceDashboard: !state.ui.showPerformanceDashboard
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
              history: error
                ? [...state.errors.history, error]
                : state.errors.history
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
        getShowPerformanceDashboard: () => get().ui.showPerformanceDashboard,

        getCurrentError: () => get().errors.current
      }
    }),
    {
      name: 'meow-namester-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

// * Hook to initialize store from localStorage
export const useAppStoreInitialization = () => {
  const { userActions, uiActions } = useAppStore();

  useEffect(() => {
    // * Initialize user state from localStorage on mount
    userActions.initializeFromStorage();
    // * Initialize theme state from localStorage on mount
    uiActions.initializeTheme();
  }, [userActions, uiActions]);
};

export default useAppStore;
