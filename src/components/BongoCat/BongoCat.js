/**
 * @component BongoCat
 * @description A fun animated cat that responds to user interactions
 */

import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './BongoCat.module.css';

const BongoCat = memo(({ 
  size = 0.5, 
  color = '#000', 
  onBongo, 
  containerRef, 
  offsetY = -160, 
  zIndex = 20 
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
      const containerWidth = rect.width;
      
      // Position cat relative to the container
      // Allow negative values to position the cat higher without restrictions
      const optimalTop = rect.top + offsetY;
      
      setContainerTop(optimalTop);
      
      // Scale cat based on container width
      const baseSize = size;
      const scaleFactor = Math.min(containerWidth / 500, 1);
      setCatSize(baseSize * scaleFactor);
      
      // Show/hide based on visibility
      setIsVisible(rect.top < viewportHeight);
      
      // Get container's z-index for layering
      const containerStyle = window.getComputedStyle(containerRef.current);
      const containerZ = containerStyle.zIndex === 'auto' ? 1 : parseInt(containerStyle.zIndex, 10);
      setContainerZIndex(containerZ);
    }
  }, [containerRef, offsetY, size]);

  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
    
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
  }, [isPawsDown, onBongo]);

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
      
      // Add scroll listener for smooth updates
      window.addEventListener('scroll', updatePosition, { passive: true });
    }
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      
      window.removeEventListener('scroll', updatePosition);
    };
  }, [handleKeyDown, handleKeyUp, containerRef, updatePosition]);

  // If no containerRef is provided, just render the cat without positioning
  if (!containerRef) {
    return (
      <div 
        className={styles.container}
        style={{
          '--cat-bg': color,
          '--cat-outline': color === '#000' ? '#222' : color === '#fff' ? '#eee' : color,
          '--cat-size': catSize
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
        <div className={`${styles.paws} ${styles.up} ${isPawsDown ? styles.hide : ''}`}>
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
        <div className={`${styles.paws} ${styles.down} ${isPawsDown ? '' : styles.hide}`}>
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
  const pawsOffsetY = -20; // More pronounced offset to create the "reaching over" effect
  
  // Adjust visibility management to ensure a clean cutoff
  const catVisibility = isVisible ? 'visible' : 'hidden';
  const pawsVisibility = isVisible ? 'visible' : 'hidden';

  // Render the positioned cat when containerRef is provided
  return (
    <>
      {/* Base cat body with lower z-index */}
      <div 
        className={styles.bongoContainer}
        style={{
          position: 'absolute',
          top: `${containerTop}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '180px',
          maxWidth: '100%',
          aspectRatio: '1',
          zIndex: catBodyZIndex, // Put cat body behind the container
          pointerEvents: 'none',
          transition: 'top 0.3s ease, opacity 0.3s ease',
          opacity: isVisible ? 1 : 0,
          visibility: catVisibility
        }}
      >
        <div 
          className={styles.container}
          style={{
            '--cat-bg': color,
            '--cat-outline': color === '#000' ? '#222' : color === '#fff' ? '#eee' : color,
            '--cat-size': catSize
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
          position: 'absolute',
          top: `${containerTop + pawsOffsetY}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '180px',
          maxWidth: '100%',
          aspectRatio: '1',
          zIndex: upPawsZIndex, // Same z-index as body, so behind container
          pointerEvents: 'none',
          transition: 'top 0.3s ease, opacity 0.3s ease',
          opacity: isVisible ? 1 : 0,
          visibility: pawsVisibility,
          display: isPawsDown ? 'none' : 'block' // Hide when paws are down
        }}
      >
        <div 
          className={styles.container}
          style={{
            '--cat-bg': color,
            '--cat-outline': color === '#000' ? '#222' : color === '#fff' ? '#eee' : color,
            '--cat-size': catSize
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
          position: 'absolute',
          top: `${containerTop + pawsOffsetY}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '180px',
          maxWidth: '100%',
          aspectRatio: '1',
          zIndex: downPawsZIndex, // Extremely high z-index to ensure down paws are on top
          pointerEvents: 'none',
          transition: 'top 0.3s ease, opacity 0.3s ease',
          opacity: isVisible ? 1 : 0,
          visibility: pawsVisibility,
          display: isPawsDown ? 'block' : 'none' // Only show when paws are down
        }}
      >
        <div 
          className={styles.container}
          style={{
            '--cat-bg': color,
            '--cat-outline': color === '#000' ? '#222' : color === '#fff' ? '#eee' : color,
            '--cat-size': catSize
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
});

BongoCat.displayName = 'BongoCat';

BongoCat.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  onBongo: PropTypes.func,
  containerRef: PropTypes.object,
  offsetY: PropTypes.number,
  zIndex: PropTypes.number
};

export default BongoCat; 