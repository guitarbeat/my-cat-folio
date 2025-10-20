/**
 * @module CatNameOlympics
 * @description Playful container that appears when the sidebar is minimized
 * Features cat-themed animations and Olympic-style branding
 */

import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./CatNameOlympics.css";

export function CatNameOlympics({ isVisible, className = "" }) {
  const [animationPhase, setAnimationPhase] = useState(0);

  // * Cycle through different animation phases for variety
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 4);
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className={`cat-name-olympics ${className}`} data-phase={animationPhase}>
      <div className="olympics-container">
        {/* * Olympic rings animation */}
        <div className="olympic-rings">
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>
          <div className="ring ring-4"></div>
          <div className="ring ring-5"></div>
        </div>

        {/* * Main title with cat emoji */}
        <div className="olympics-title">
          <span className="cat-emoji">🐱</span>
          <span className="title-text">Cat Name</span>
          <span className="olympics-text">Olympics</span>
        </div>

        {/* * Animated cat paw prints */}
        <div className="paw-prints">
          <div className="paw-print paw-1">🐾</div>
          <div className="paw-print paw-2">🐾</div>
          <div className="paw-print paw-3">🐾</div>
        </div>

        {/* * Floating cat icons */}
        <div className="floating-cats">
          <div className="floating-cat cat-1">😸</div>
          <div className="floating-cat cat-2">😹</div>
          <div className="floating-cat cat-3">😺</div>
        </div>

        {/* * Sparkle effects */}
        <div className="sparkles">
          <div className="sparkle sparkle-1">✨</div>
          <div className="sparkle sparkle-2">⭐</div>
          <div className="sparkle sparkle-3">✨</div>
          <div className="sparkle sparkle-4">⭐</div>
        </div>
      </div>
    </div>
  );
}

CatNameOlympics.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  className: PropTypes.string,
};
