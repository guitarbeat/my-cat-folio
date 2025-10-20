/**
 * @module shared/components
 * @description Consolidated exports for all shared components.
 * Provides a single import point for all reusable components.
 */

// * Core UI Components
import Button from './Button/Button';
import Card from './Card/Card';
import Loading, { LoadingSpinner, SuspenseView } from './Loading/Loading';
import Error from './Error/Error';
import Toast from './Toast/Toast';
import SkeletonLoader from './SkeletonLoader/SkeletonLoader';

// * Form Components
import Form from './Form/Form';
import Input from './Form/Input';
import Select from './Form/Select';

// * Layout Components
import { AppSidebar } from './AppSidebar/AppSidebar';
import Breadcrumb from './Breadcrumb/Breadcrumb';

// * Feature Components
import NameCard from './NameCard/NameCard';
import StatsCard from './StatsCard/StatsCard';
import Bracket from './Bracket/Bracket';
import BongoCat from './BongoCat/BongoCat';
import CatBackground from './CatBackground/CatBackground';
import CatImage from './CatImage/CatImage';
import PerformanceDashboard from './PerformanceDashboard/PerformanceDashboard';
import StartTournamentButton from './StartTournamentButton/StartTournamentButton';
import CalendarButton from './CalendarButton/CalendarButton';
import ViewRouter from './ViewRouter/ViewRouter';

// * UI System Components
import ErrorBoundary from './Error/ErrorBoundary';
import ErrorBoundaryFallback from './Error/ErrorBoundaryFallback';
export { SidebarProvider, useSidebar } from './ui/sidebar';

// * Component prop types for external use
export { default as PropTypes } from 'prop-types';

// * Named exports
export {
  // Core UI
  Button,
  Card,
  Loading,
  Error,
  Toast,
  SkeletonLoader,

  // Form
  Form,
  Input,
  Select,

  // Layout
  AppSidebar,
  Breadcrumb,

  // Features
  NameCard,
  StatsCard,
  Bracket,
  BongoCat,
  CatBackground,
  CatImage,
  PerformanceDashboard,
  StartTournamentButton,
  CalendarButton,
  ViewRouter,

  // UI System
  ErrorBoundary,
  ErrorBoundaryFallback,

  // Legacy helpers
  LoadingSpinner,
  SuspenseView,
};

// * Default export with all components
export default {
  // Core UI
  Button,
  Card,
  Loading,
  Error,
  Toast,
  SkeletonLoader,

  // Form
  Form,
  Input,
  Select,

  // Layout
  AppSidebar,
  Breadcrumb,

  // Features
  NameCard,
  StatsCard,
  Bracket,
  BongoCat,
  CatBackground,
  CatImage,
  PerformanceDashboard,
  StartTournamentButton,
  CalendarButton,
  ViewRouter,

  // UI System
  ErrorBoundary,
  ErrorBoundaryFallback,

  // Legacy helpers
  LoadingSpinner,
  SuspenseView,
};
