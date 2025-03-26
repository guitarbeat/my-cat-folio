/**
 * @component BongoCat
 * @description A fun animated cat that responds to user interactions like typing and tapping
 */

import React, { useEffect, useRef } from 'react';
import styles from './BongoCat.module.css';

const BongoCat = ({ onKeyPress, text }) => {
  const pawsUpRef = useRef(null);
  const pawsDownRef = useRef(null);

  useEffect(() => {
    // Set up event listeners for mouse/touch events
    document.addEventListener("mousedown", handleDown);
    document.addEventListener("mouseup", handleUp);
    document.addEventListener("touchstart", handleDown);
    document.addEventListener("touchend", handleUp);
    
    // Handle keyboard events if onKeyPress is used
    if (onKeyPress) {
      document.addEventListener("keydown", handleDown);
      document.addEventListener("keyup", handleUp);
    }

    // Clean up event listeners on component unmount
    return () => {
      document.removeEventListener("mousedown", handleDown);
      document.removeEventListener("mouseup", handleUp);
      document.removeEventListener("touchstart", handleDown);
      document.removeEventListener("touchend", handleUp);
      
      if (onKeyPress) {
        document.removeEventListener("keydown", handleDown);
        document.removeEventListener("keyup", handleUp);
      }
    };
  }, [onKeyPress]);

  const handleDown = () => {
    if (pawsUpRef.current && pawsDownRef.current) {
      pawsUpRef.current.classList.add(styles.hide);
      pawsDownRef.current.classList.remove(styles.hide);
    }
  };

  const handleUp = () => {
    if (pawsUpRef.current && pawsDownRef.current) {
      pawsUpRef.current.classList.remove(styles.hide);
      pawsDownRef.current.classList.add(styles.hide);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.table}></div>
      <div className={styles.cat}>
        <div className={styles.head}></div>
        <div className={`${styles.ears} ${styles.fill}`}>
          <div className={styles.ear}></div>
          <div className={styles.ear}></div>
        </div>
        <div className={`${styles.ears} ${styles.outline}`}>
          <div className={styles.ear}></div>
          <div className={styles.ear}></div>
        </div>
        <div className={styles.face}>
          <div className={styles.eyes}>
            <div className={styles.eye}></div>
            <div className={styles.eye}></div>
          </div>
          <div className={styles.mouth}>
            <div className={styles.uu}></div>
          </div>
        </div>
      </div>
      <div className={`${styles.paws} ${styles.up}`} ref={pawsUpRef}>
        <div className={styles.paw}>
          <div className={styles.palm}></div>
          <div className={styles.bean}></div>
          <div className={styles.bean}></div>
          <div className={styles.bean}></div>
        </div>
        <div className={styles.paw}>
          <div className={styles.palm}></div>
          <div className={styles.bean}></div>
          <div className={styles.bean}></div>
          <div className={styles.bean}></div>
        </div>
      </div>
      <div className={`${styles.paws} ${styles.down} ${styles.hide}`} ref={pawsDownRef}>
        <div className={styles.paw}></div>
        <div className={styles.paw}></div>
      </div>
      {text && <div className={styles.clickme}>{text}</div>}
    </div>
  );
};

export default BongoCat; 