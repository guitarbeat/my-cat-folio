/**
 * @component BongoCat
 * @description A fun animated cat that responds to user interactions
 */

import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import PropTypes from "prop-types";
import styles from "./BongoCat.module.css";

const BongoCat = memo(
  ({
    size = 0.5,
    color = "#000",
    onBongo,
    containerRef,
    offsetY = -120,
    zIndex = 20,
  }) => {
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
        const containerStyle = window.getComputedStyle(containerRef.current);
        const containerZ =
          containerStyle.zIndex === "auto"
            ? 1
            : parseInt(containerStyle.zIndex, 10);
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

    // If no containerRef is provided, just render the cat without positioning
    if (!containerRef) {
      return (
        <div
          className={styles.container}
          style={{
            "--cat-bg": color,
            "--cat-outline":
              color === "#000" ? "#222" : color === "#fff" ? "#eee" : color,
            "--cat-size": catSize,
          }}
          role="img"
          aria-label="Bongo cat animation"
        >
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
          <div
            className={`${styles.paws} ${styles.up} ${isPawsDown ? styles.hide : ""}`}
          >
            <div className={styles.paw}>
              <div className={styles.palm} />
              <div className={styles.bean} />
              <div className={styles.bean} />
              <div className={styles.bean} />
            </div>
            <div className={styles.paw}>
              <div className={styles.palm} />
              <div className={styles.bean} />
              <div className={styles.bean} />
              <div className={styles.bean} />
            </div>
          </div>
          <div
            className={`${styles.paws} ${styles.down} ${isPawsDown ? "" : styles.hide}`}
          >
            <div className={styles.paw} />
            <div className={styles.paw} />
          </div>
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
    const catVisibility = isVisible ? "visible" : "hidden";
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
            style={{
              "--cat-bg": color,
              "--cat-outline":
                color === "#000" ? "#222" : color === "#fff" ? "#eee" : color,
              "--cat-size": catSize,
            }}
            role="img"
            aria-label="Bongo cat animation"
          >
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
          </div>
        </div>

        {/* Up paws - behind container (same z-index as body) */}
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
            zIndex: upPawsZIndex, // Same z-index as body, so behind container
            pointerEvents: "none",
            transition: "top 0.2s ease-out, opacity 0.3s ease",
            opacity: isVisible ? 1 : 0,
            visibility: pawsVisibility,
            display: isPawsDown ? "none" : "block", // Hide when paws are down
          }}
        >
          <div
            className={styles.container}
            style={{
              "--cat-bg": color,
              "--cat-outline":
                color === "#000" ? "#222" : color === "#fff" ? "#eee" : color,
              "--cat-size": catSize,
            }}
          >
            {/* Up paws - behind container */}
            <div className={`${styles.paws} ${styles.up}`}>
              <div className={styles.paw}>
                <div className={styles.palm} />
                <div className={styles.bean} />
                <div className={styles.bean} />
                <div className={styles.bean} />
              </div>
              <div className={styles.paw}>
                <div className={styles.palm} />
                <div className={styles.bean} />
                <div className={styles.bean} />
                <div className={styles.bean} />
              </div>
            </div>
          </div>
        </div>

        {/* Down paws - above container with high z-index */}
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
            zIndex: downPawsZIndex, // Extremely high z-index to ensure down paws are on top
            pointerEvents: "none",
            transition: "top 0.2s ease-out, opacity 0.3s ease",
            opacity: isVisible ? 1 : 0,
            visibility: pawsVisibility,
            display: isPawsDown ? "block" : "none", // Only show when paws are down
          }}
        >
          <div
            className={styles.container}
            style={{
              "--cat-bg": color,
              "--cat-outline":
                color === "#000" ? "#222" : color === "#fff" ? "#eee" : color,
              "--cat-size": catSize,
            }}
          >
            {/* Down paws - above container */}
            <div className={`${styles.paws} ${styles.down}`}>
              <div className={styles.paw} />
              <div className={styles.paw} />
            </div>
          </div>
        </div>
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
  offsetY: PropTypes.number,
  zIndex: PropTypes.number,
};

export default BongoCat;
