/**
 * @module shared/components
 * @description Consolidated exports for all shared components.
 * Provides a single import point for all reusable components.
 */

// * Core UI Components
export { default as Button } from './Button/Button';
export { default as Card } from './Card/Card';
export { default as Loading } from './Loading/Loading';
export { default as Error } from './Error/Error';
export { default as Toast } from './Toast/Toast';
export { default as Modal } from './Modal/Modal';
export { default as Tooltip } from './Tooltip/Tooltip';
export { default as Badge } from './Badge/Badge';
export { default as SkeletonLoader } from './SkeletonLoader/SkeletonLoader';

// * Form Components
export { default as Form } from './Form/Form';
export { default as Input } from './Form/Input';
export { default as Select } from './Form/Select';
export { default as Textarea } from './Form/Textarea';
export { default as Checkbox } from './Form/Checkbox';
export { default as Radio } from './Form/Radio';

// * Layout Components
export { default as AppSidebar } from './AppSidebar/AppSidebar';
export { default as Breadcrumb } from './Breadcrumb/Breadcrumb';
export { default as Header } from './Header/Header';
export { default as Footer } from './Footer/Footer';

// * Feature Components
export { default as NameCard } from './NameCard/NameCard';
export { default as StatsCard } from './StatsCard/StatsCard';
export { default as Bracket } from './Bracket/Bracket';
export { default as BongoCat } from './BongoCat/BongoCat';
export { default as CatBackground } from './CatBackground/CatBackground';
export { default as PerformanceDashboard } from './PerformanceDashboard/PerformanceDashboard';
export { default as StartTournamentButton } from './StartTournamentButton/StartTournamentButton';
export { default as CalendarButton } from './CalendarButton/CalendarButton';

// * UI System Components
export { SidebarProvider, useSidebar } from './ui/sidebar';
export { default as ErrorBoundary } from './Error/ErrorBoundary';
export { default as ErrorBoundaryFallback } from './Error/ErrorBoundaryFallback';

// * Re-export commonly used components for convenience
export {
    LoadingSpinner,
    SuspenseView
} from './Loading/Loading';

// * Component prop types for external use
export { default as PropTypes } from 'prop-types';

// * Default export with all components
export default {
    // Core UI
    Button,
    Card,
    Loading,
    Error,
    Toast,
    Modal,
    Tooltip,
    Badge,
    SkeletonLoader,

    // Forms
    Form,
    Input,
    Select,
    Textarea,
    Checkbox,
    Radio,

    // Layout
    AppSidebar,
    Breadcrumb,
    Header,
    Footer,

    // Features
    NameCard,
    StatsCard,
    Bracket,
    BongoCat,
    CatBackground,
    PerformanceDashboard,
    StartTournamentButton,
    CalendarButton,

    // UI System
    SidebarProvider,
    useSidebar,
    ErrorBoundary,
    ErrorBoundaryFallback
};