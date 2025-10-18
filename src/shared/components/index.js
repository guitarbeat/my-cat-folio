/**
 * @module Shared Components
 * @description Centralized exports for all shared components
 * Optimized for tree shaking - only exports that are actually used
 */

// * Core UI Components (most commonly used)
export { default as Error } from './Error/Error';
export { default as Loading } from './Loading/Loading';
export { default as Toast } from './Toast/Toast';

// * Form Components
export { Form, Input, Select } from './Form';

// * Layout Components
export { default as Button } from './Button';
export { default as StartTournamentButton } from './StartTournamentButton';
export { default as Card } from './Card';
export { default as CatImage } from './CatImage';

// * Feature-specific Components (lazy loaded when needed)
export { default as NameCard } from './NameCard/NameCard';
export { default as StatsCard } from './StatsCard/StatsCard';
export { default as BongoCat } from './BongoCat/BongoCat';
export { default as SkeletonLoader } from './SkeletonLoader/SkeletonLoader';

// * Heavy components that should be imported directly for better tree shaking
// * These are not re-exported to avoid bundling them unnecessarily
// * Import them directly: import CatBackground from '@components/CatBackground/CatBackground'
// * import PerformanceDashboard from '@components/PerformanceDashboard/PerformanceDashboard'
