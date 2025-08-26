/**
 * @module hooks/index
 * @description Central export point for all custom React hooks in the application.
 * Provides a clean interface for importing hooks throughout the app.
 */

export { useBongoCat } from './useBongoCat';
export { default as useErrorHandler } from './useErrorHandler';
export { default as useLocalStorage } from './useLocalStorage';
export { useTournament } from './useTournament';
export { default as useUserSession } from './useUserSession';
export { default as useToast } from './useToast';
