/**
 * @module components/index
 * @description Central export point for all React components in the application.
 * Provides a clean interface for importing components throughout the app.
 * Organized by component category for better maintainability.
 */

// * Error Handling Components
export { default as ErrorBoundary } from './ErrorBoundary/ErrorBoundary';
export { default as ErrorDisplay } from './ErrorDisplay/ErrorDisplay';
export { default as InlineError } from './InlineError';

// * Loading Components
export {
  default as LoadingSpinner,
  SkeletonLoader,
  TournamentSkeleton,
  NameCardSkeleton
} from './LoadingSpinner';

// * UI Components
export { default as Card } from './Card/Card';
export { default as NameCard } from './NameCard/NameCard';
export { default as StatsCard } from './StatsCard/StatsCard';
export { default as CalendarButton } from './CalendarButton/CalendarButton';
export { default as NameStatsTooltip } from './NameStatsTooltip/NameStatsTooltip';

// * Navigation Components
export { default as Breadcrumb } from './Breadcrumb';

// * Notification Components
export { default as Toast } from './Toast';
export { default as ToastContainer } from './ToastContainer';

// * Interactive Components
export { default as BongoCat } from './BongoCat/BongoCat';
export { default as WelcomeScreen } from './WelcomeScreen/WelcomeScreen';

// * Feature Components
export { default as Login } from '../../features/auth/Login';
