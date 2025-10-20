/**
 * @module index
 * @description Application entry point. Renders the main App component
 * into the DOM and sets up React's StrictMode for development checks.
 *
 * @requires React
 * @requires ReactDOM
 * @requires App
 */

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { setupGlobalErrorHandling } from '@services/errorManager';
import '@styles/reset.css';
import '@styles/theme.css';
import '@styles/utilities.css';
import '@styles/animations.css';
import '@styles/background-effects.css';
import '@styles/components-global.css';
import '@styles/app-layout.css';
import '@styles/responsive.css';
import App from './App.jsx';
import ErrorBoundary from './shared/components/Error/ErrorBoundary.jsx';
import ErrorBoundaryFallback from './shared/components/Error/ErrorBoundaryFallback.jsx';
import { Analytics } from '@vercel/analytics/react';

// Set up global error handling
setupGlobalErrorHandling();

// Boot log to verify app mounting during preview
console.info('[Boot] index.jsx loaded');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      <App />
      <Analytics />
    </ErrorBoundary>
  </StrictMode>
);

