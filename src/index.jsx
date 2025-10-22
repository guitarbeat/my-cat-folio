/**
 * @module index
 * @description Application entry point. Renders the main App component
 * into the DOM and sets up React's StrictMode for development checks.
 *
 * @requires React
 * @requires ReactDOM
 * @requires App
 */

// * DEBUG: Simple test to see if JavaScript is running
document.addEventListener('DOMContentLoaded', () => {
  const debugDiv = document.createElement('div');
  debugDiv.style.cssText = 'position: fixed; top: 0; left: 0; background: #000; color: #0f0; padding: 10px; z-index: 9999; font-family: monospace; font-size: 12px;';
  debugDiv.innerHTML = `
    <div><strong>DEBUG: JavaScript is running!</strong></div>
    <div>VITE_SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL || 'undefined'}</div>
    <div>VITE_SUPABASE_ANON_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'loaded' : 'missing'}</div>
    <div>Time: ${new Date().toLocaleTimeString()}</div>
  `;
  document.body.appendChild(debugDiv);
});

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
// import { Analytics } from '@vercel/analytics/react';

// Set up global error handling
setupGlobalErrorHandling();

// Boot log to verify app mounting during preview
console.info('[Boot] index.jsx loaded');

// * DEBUG: Test if we can access the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = "<h1 style='color: red; padding: 20px;'>ERROR: Root element not found!</h1>";
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <StrictMode>
        <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
          <App />
          {/* <Analytics /> */}
        </ErrorBoundary>
      </StrictMode>
    );
  } catch (error) {
    document.body.innerHTML = `<h1 style='color: red; padding: 20px;'>ERROR: React failed to render: ${error.message}</h1>`;
  }
}

