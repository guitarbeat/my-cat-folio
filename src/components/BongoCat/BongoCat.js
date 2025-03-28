/**
 * @component BongoCat
 * @description A fun animated cat that responds to user interactions
 */

import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './BongoCat.module.css';

const BongoCat = memo(({ size = 1, color = '#000', onBongo }) => {
  const [isPawsDown, setIsPawsDown] = useState(false);
  const lastKeyTimeRef = useRef(0);
  const keysHeldRef = useRef(new Set());

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
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div 
      className={styles.container}
      style={{
        '--cat-bg': color,
        '--cat-outline': color === '#000' ? '#222' : color === '#fff' ? '#eee' : color,
        transform: `scale(${size})`
      }}
      role="img"
      aria-label="Bongo cat animation"
    >
      <div className={styles.table} />
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
});

BongoCat.displayName = 'BongoCat';

BongoCat.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  onBongo: PropTypes.func
};

export default BongoCat; 