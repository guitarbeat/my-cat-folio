/**
 * @component BongoCat
 * @description A fun animated cat that responds to user interactions
 */

import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import PropTypes from "prop-types";
import styles from "./BongoCat.module.css";

/**
 * Render the core cat body without paws.
 * @returns {JSX.Element}
 */
const CatBody = () => (
  <div className={styles.cat}>
    <div className={styles.head} />
    <div className={`${styles.ears} ${styles.fill}`}>
      <div className={styles.ear} />
      <div className={styles.ear} />
    </div>
    <div className={`${styles.ears} ${styles.outline}`}>
      <div className={styles.ear} />
      <div className={styles.ear} />
    </div>
    <div className={styles.face}>
      <div className={styles.eyes}>
        <div className={styles.eye} />
        <div className={styles.eye} />
      </div>
      <div className={styles.mouth}>
        <div className={styles.uu} />
      </div>
    </div>
  </div>
);

/**
 * Render a set of paws.
 * @param {Object} params
 * @param {"up"|"down"} params.position - Which paw orientation to render
 * @returns {JSX.Element}
 */
const Paw = () => (
  <div className={styles.paw}>
    <div className={styles.palm} />
    <div className={styles.bean} />
    <div className={styles.bean} />
    <div className={styles.bean} />
  </div>
);

const Paws = ({ position, className = "" }) => (
  <div className={`${styles.paws} ${styles[position]} ${className}`.trim()}>
    {position === "up" ? (
      <>
        <Paw />
        <Paw />
      </>
    ) : (
      <>
        <div className={styles.paw} />
        <div className={styles.paw} />
      </>
    )}
  </div>
);

Paws.propTypes = {
  position: PropTypes.oneOf(["up", "down"]).isRequired,
  className: PropTypes.string,
};

const PawsContainer = ({
  containerTop,
  pawsOffsetY,
  zIndex,
  isVisible,
  pawsVisibility,
  display,
  styleVars,
  pawsPosition,
}) => (
  <div
    className={styles.bongoContainer}
    style={{
      position: "absolute",
      top: `${containerTop + pawsOffsetY}px`,
      left: "50%",
      transform: "translateX(-50%)",
      width: "180px",
      maxWidth: "100%",
      aspectRatio: "1",
      zIndex,
      pointerEvents: "none",
      transition: "top 0.2s ease-out, opacity 0.3s ease",
      opacity: isVisible ? 1 : 0,
      visibility: pawsVisibility,
      display,
    }}
  >
    <div className={styles.container} style={styleVars}>
      <Paws position={pawsPosition} />
    </div>
  </div>
);

PawsContainer.propTypes = {
  containerTop: PropTypes.number.isRequired,
  pawsOffsetY: PropTypes.number.isRequired,
  zIndex: PropTypes.number.isRequired,
  isVisible: PropTypes.bool.isRequired,
  pawsVisibility: PropTypes.string.isRequired,
  display: PropTypes.string.isRequired,
  styleVars: PropTypes.object.isRequired,
  pawsPosition: PropTypes.string.isRequired,
};

const BongoCat = memo(
  ({ size = 0.5, color = "#000", onBongo, containerRef }) => {
    const [isPawsDown, setIsPawsDown] = useState(false);
    const [containerTop, setContainerTop] = useState(0);
    const [catSize, setCatSize] = useState(size);
    const [isVisible, setIsVisible] = useState(true);
    const [containerZIndex, setContainerZIndex] = useState(0);

    const lastKeyTimeRef = useRef(0);
    const keysHeldRef = useRef(new Set());
    const resizeObserverRef = useRef(null);

    // Calculate position based on container position with debouncing
    const updatePosition = useCallback(() => {
      if (containerRef && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const containerWidth = rect.width;

        // Position cat slightly down from the top of the container
        let optimalTop = 19;

        // Apply an additional offset for narrow screens to position the cat better
        if (viewportWidth <= 768) {
          const mobileAdjustment = 5;
          optimalTop += mobileAdjustment;
        }

        setContainerTop(optimalTop);

        // Scale cat based on container width with a mobile-specific adjustment
        const baseSize = size;
        const scaleFactor = Math.min(containerWidth / 500, 1);

        // Make the cat slightly smaller on mobile for better proportions
        const mobileScaleFactor = viewportWidth <= 768 ? 0.9 : 1.0;
        setCatSize(baseSize * scaleFactor * mobileScaleFactor);

        // Show/hide based on visibility
        setIsVisible(rect.top < viewportHeight);

        // Get container's z-index for layering
        const containerComputedStyle = window.getComputedStyle(
          containerRef.current,
        );
        const containerZ =
          containerComputedStyle.zIndex === "auto"
            ? 1
            : parseInt(containerComputedStyle.zIndex, 10);
        setContainerZIndex(containerZ);
      }
    }, [containerRef, size]);

    const handleKeyDown = useCallback(
      (e) => {
        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
          return;
        }

        const now = Date.now();
        if (now - lastKeyTimeRef.current > 1000) {
          lastKeyTimeRef.current = now;
        }

        // Add the key to the set of keys being held down
        keysHeldRef.current.add(e.key);
        setIsPawsDown(true);

        // Only trigger onBongo if it wasn't already paws down
        if (!isPawsDown && onBongo) {
          onBongo();
        }
      },
      [isPawsDown, onBongo],
    );

    const handleKeyUp = useCallback((e) => {
      // Remove the key from the set of keys being held down
      keysHeldRef.current.delete(e.key);

      // If no keys are being held down anymore, set paws up
      if (keysHeldRef.current.size === 0) {
        setIsPawsDown(false);
      }
    }, []);

    useEffect(() => {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);

      // Set up ResizeObserver for container positioning
      if (containerRef && containerRef.current) {
        resizeObserverRef.current = new ResizeObserver(updatePosition);
        resizeObserverRef.current.observe(containerRef.current);

        // Initial position calculation
        updatePosition();

        // Improved scroll and position tracking
        const handleScroll = () => {
          requestAnimationFrame(updatePosition);
        };

        // Track container position with multiple events to ensure it stays attached
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll, { passive: true });

        // Additional events that might affect positioning
        window.addEventListener("orientationchange", updatePosition);
        window.addEventListener("load", updatePosition);

        // Use MutationObserver to detect DOM changes that might affect container position
        const mutationObserver = new MutationObserver(updatePosition);
        mutationObserver.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
        });

        return () => {
          document.removeEventListener("keydown", handleKeyDown);
          document.removeEventListener("keyup", handleKeyUp);

          if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect();
          }

          window.removeEventListener("scroll", handleScroll);
          window.removeEventListener("resize", handleScroll);
          window.removeEventListener("orientationchange", updatePosition);
          window.removeEventListener("load", updatePosition);
          mutationObserver.disconnect();
        };
      }

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
      };
    }, [handleKeyDown, handleKeyUp, containerRef, updatePosition]);

    const styleVars = {
      "--cat-bg": color,
      "--cat-outline":
        color === "#000" ? "#222" : color === "#fff" ? "#eee" : color,
      "--cat-size": catSize,
    };

    // If no containerRef is provided, just render the cat without positioning
    if (!containerRef) {
      return (
        <div
          className={styles.container}
          style={styleVars}
          role="img"
          aria-label="Bongo cat animation"
        >
          <CatBody />
          <Paws position="up" className={isPawsDown ? styles.hide : ""} />
          <Paws position="down" className={isPawsDown ? "" : styles.hide} />
        </div>
      );
    }

    // Calculate z-index values
    const catBodyZIndex = Math.max(0, containerZIndex - 1);
    const upPawsZIndex = catBodyZIndex; // Up paws behind container (same as body)
    const downPawsZIndex = 9999; // Down paws above container with high z-index

    // Further adjust the paws position for the most natural cutoff effect
    // Make pawsOffsetY responsive to screen width
    const isMobile = window.innerWidth <= 768;
    const pawsOffsetY = isMobile ? -10 : -20; // Much smaller offset on mobile to bring paws forward

    // Adjust visibility management to ensure a clean cutoff
    const pawsVisibility = isVisible ? "visible" : "hidden";

    // Render the positioned cat when containerRef is provided
    return (
      <>
        {/* Base cat body with lower z-index */}
        <div
          className={styles.bongoContainer}
          style={{
            position: "absolute",
            top: `${containerTop}px`,
            left: "50%",
            transform: "translateX(-50%)",
            width: "180px",
            maxWidth: "100%",
            aspectRatio: "1",
            zIndex: catBodyZIndex,
            pointerEvents: "none",
            transition: "top 0.2s ease-out, opacity 0.3s ease",
            opacity: isVisible ? 1 : 0,
            visibility: isVisible ? "visible" : "hidden",
          }}
        >
          <div
            className={styles.container}
            style={styleVars}
            role="img"
            aria-label="Bongo cat animation"
          >
            <CatBody />
          </div>
        </div>

        {/* Up paws - behind container (same z-index as body) */}
        <PawsContainer
          containerTop={containerTop}
          pawsOffsetY={pawsOffsetY}
          zIndex={upPawsZIndex}
          isVisible={isVisible}
          pawsVisibility={pawsVisibility}
          display={isPawsDown ? "none" : "block"}
          styleVars={styleVars}
          pawsPosition="up"
        />

        {/* Down paws - above container with high z-index */}
        <PawsContainer
          containerTop={containerTop}
          pawsOffsetY={pawsOffsetY}
          zIndex={downPawsZIndex}
          isVisible={isVisible}
          pawsVisibility={pawsVisibility}
          display={isPawsDown ? "block" : "none"}
          styleVars={styleVars}
          pawsPosition="down"
        />
      </>
    );
  },
);

BongoCat.displayName = "BongoCat";

BongoCat.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  onBongo: PropTypes.func,
  containerRef: PropTypes.object,
};

export default BongoCat;
