/**
 * @module index
 * @description Application entry point. Renders the main App component
 * into the DOM and sets up React's StrictMode for development checks.
 *
 * @requires React
 * @requires ReactDOM
 * @requires App
 */

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
// import { Analytics } from "@vercel/analytics/react"

// Check if we're on the test loading page
const isLoadingTest = window.location.pathname.includes("/loading");

const LoadingTest = () => {
  const [size, setSize] = React.useState("large");
  const [text] = React.useState("Testing Loading Spinner...");
  const [isDarkMode, setIsDarkMode] = React.useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: isDarkMode ? "#121212" : "#f5f5f5",
        color: isDarkMode ? "white" : "#333",
        transition: "all 0.3s ease",
      }}
    >
      <h1 style={{ marginBottom: "1rem", textAlign: "center" }}>
        Loading Spinner Test Page
      </h1>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => (window.location.href = "/")}
          style={{ padding: "0.5rem 1rem" }}
        >
          Back to App
        </button>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={{ padding: "0.5rem 1rem" }}
        >
          Toggle {isDarkMode ? "Light" : "Dark"} Mode
        </button>

        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          style={{ padding: "0.5rem 1rem" }}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div style={{ position: "relative", zIndex: 5 }}>
        <LoadingSpinner size={size} text={text} />
      </div>
    </div>
  );
};


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
