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
import { setupGlobalErrorHandling } from './shared/services/errorManager';
import './shared/styles/theme.css';
import './shared/styles/global.css';
import './shared/styles/mobile.css';
import './shared/styles/mobile-ergonomics.css';
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
