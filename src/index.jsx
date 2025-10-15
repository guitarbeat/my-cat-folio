/**
 * @module index
 * @description Application entry point. Renders the main App component
 * into the DOM and sets up React's StrictMode for development checks.
 *
 * @requires React
 * @requires ReactDOM
 * @requires App
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { setupGlobalErrorHandling } from '@services/errorManager';
import '@styles/reset.css';
import '@styles/theme.css';
import '@styles/utilities.css';
import '@styles/animations.css';
import '@styles/components-global.css';
import '@styles/responsive.css';
import App from './App.jsx';
// import { Analytics } from "@vercel/analytics/react"

// Set up global error handling
setupGlobalErrorHandling();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
