/**
 * @module components/index
 * @description Central export point for all React components in the application.
 * Provides a clean interface for importing components throughout the app.
 * Organized by component category for better maintainability.
 */

// * Error Handling Components
export { default as Error } from './Error/Error';

// * Loading Components
export {
  default as Loading,
  LoadingSpinner,
  SuspenseView
} from './Loading';

// * Skeleton Components
export {
  SkeletonLoader,
  TournamentSkeleton,
  NameCardSkeleton
} from './SkeletonLoader';

// * UI Components
export { default as Card } from './Card/Card';
export { default as NameCard } from './NameCard/NameCard';
export { default as StatsCard } from './StatsCard/StatsCard';
export { default as CalendarButton } from './CalendarButton/CalendarButton';
export { default as NameStatsTooltip } from './NameStatsTooltip/NameStatsTooltip';

// * Navigation Components
export { default as Breadcrumb } from './Breadcrumb';

// * Notification Components
export { default as Toast, ToastItem, ToastContainer } from './Toast';

// * Interactive Components
export { default as BongoCat } from './BongoCat/BongoCat';

// * Feature Components
export { default as Login } from '../../features/auth/Login';
