/**
 * @module FloatingKitties
 * @description Animated floating cat images background with space/galaxy theme
 */
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo
} from 'react';
import PropTypes from 'prop-types';
import styles from './FloatingKitties.module.css';

// * Predefined space/galaxy background options
const BACKGROUND_OPTIONS = {
  space:
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  galaxy:
    'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  nebula:
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  stars:
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
};

const FloatingKitties = ({
  kittieCount = 15,
  creationInterval = 2000,
  minSize = 15,
  maxSize = 30,
  minDuration = 3,
  maxDuration = 8,
  backgroundImage = 'space',
  enableGlow = true,
  enableHover = true
}) => {
  const [kitties, setKitties] = useState([]);
  const containerRef = useRef(null);
  const intervalRef = useRef(null);

  // * Memoize the background URL to prevent unnecessary recalculations
  const backgroundUrl = useMemo(() => {
    if (BACKGROUND_OPTIONS[backgroundImage]) {
      return BACKGROUND_OPTIONS[backgroundImage];
    }
    return backgroundImage; // Custom URL
  }, [backgroundImage]);

  // * Generate a new floating kittie - memoized to prevent recreation
  const createKittie = useCallback(() => {
    const newKittie = {
      id: Date.now() + Math.random(),
      size: Math.random() * (maxSize - minSize) + minSize,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      endX: Math.random() * 100,
      endY: Math.random() * 100,
      rotation: Math.random() * 360,
      duration: Math.random() * (maxDuration - minDuration) + minDuration,
      delay: Math.random() * 2,
      glowColor: Math.floor(Math.random() * 3) // 0: cyan, 1: pink, 2: red
    };

    setKitties((prev) => {
      // * Only add if we're under the limit
      if (prev.length >= kittieCount) {
        return prev;
      }
      return [...prev, newKittie];
    });

    // * Remove kittie after animation completes
    setTimeout(
      () => {
        setKitties((prev) => prev.filter((k) => k.id !== newKittie.id));
      },
      (newKittie.duration + newKittie.delay) * 1000
    );
  }, [maxSize, minSize, maxDuration, minDuration, kittieCount]);

  // * Start the kittie creation interval - optimized to prevent recreation
  useEffect(() => {
    // * Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // * Only start interval if we need more kitties
    if (kitties.length < kittieCount) {
      intervalRef.current = setInterval(() => {
        setKitties((currentKitties) => {
          if (currentKitties.length < kittieCount) {
            createKittie();
            return currentKitties; // Return same array to prevent unnecessary re-render
          }
          return currentKitties;
        });
      }, creationInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [kittieCount, creationInterval, createKittie]); // * Removed kitties.length dependency

  // * Memoize kitties array to prevent unnecessary re-renders
  const memoizedKitties = useMemo(() => kitties, [kitties]);

  return (
    <div
      ref={containerRef}
      className={styles.kittiesWrapper}
      style={{
        backgroundImage: `url(${backgroundUrl})`
      }}
    >
      {/* * Space overlay for better text readability */}
      <div className={styles.spaceOverlay} />

      {/* * Floating kitties */}
      {memoizedKitties.map((kittie) => (
        <div
          key={kittie.id}
          className={`${styles.kittieWrapper} ${enableGlow ? styles.glowEnabled : ''} ${enableHover ? styles.hoverEnabled : ''}`}
          style={{
            '--kittie-size': `${kittie.size}px`,
            '--start-x': `${kittie.startX}%`,
            '--start-y': `${kittie.startY}%`,
            '--end-x': `${kittie.endX}%`,
            '--end-y': `${kittie.endY}%`,
            '--rotation': `${kittie.rotation}deg`,
            '--duration': `${kittie.duration}s`,
            '--delay': `${kittie.delay}s`,
            '--glow-color': kittie.glowColor
          }}
        >
          <img
            src="/images/cat.gif"
            alt="Floating cat"
            className={styles.kittieImage}
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
};

FloatingKitties.propTypes = {
  kittieCount: PropTypes.number,
  creationInterval: PropTypes.number,
  minSize: PropTypes.number,
  maxSize: PropTypes.number,
  minDuration: PropTypes.number,
  maxDuration: PropTypes.number,
  backgroundImage: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.oneOf(['space', 'galaxy', 'nebula', 'stars'])
  ]),
  enableGlow: PropTypes.bool,
  enableHover: PropTypes.bool
};

export default FloatingKitties;
