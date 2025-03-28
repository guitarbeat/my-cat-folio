/**
 * @component BongoCatDemo
 * @description Minimal demo showing how to add BongoCat to the Login page
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import BongoCat from './BongoCat';
import loginStyles from '../Login/Login.module.css';
import styles from './BongoCat.module.css';

// This demo shows how to integrate BongoCat with Login.js
const BongoCatDemo = () => {
  const [name, setName] = useState('');
  const [containerTop, setContainerTop] = useState(0);
  const [catSize, setCatSize] = useState(1);
  const [isVisible, setIsVisible] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Calculate position based on container position with debouncing
  const updatePosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const containerWidth = rect.width;
      
      // Position cat above the form
      const optimalTop = Math.max(0, rect.top - 200);
      
      setContainerTop(optimalTop);
      
      // Scale cat based on container width
      const baseSize = 0.8; // Increased base size
      const scaleFactor = Math.min(containerWidth / 500, 1);
      setCatSize(baseSize * scaleFactor);
      
      // Show/hide based on visibility
      setIsVisible(rect.top < viewportHeight);
    }
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setName(value);
    
    // Set typing state
    setIsTyping(true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Reset typing state after delay
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Use ResizeObserver for better performance
    resizeObserverRef.current = new ResizeObserver(updatePosition);
    if (containerRef.current) {
      resizeObserverRef.current.observe(containerRef.current);
    }
    
    // Initial position calculation
    updatePosition();
    
    // Add scroll listener for smooth updates
    window.addEventListener('scroll', updatePosition, { passive: true });
    
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      window.removeEventListener('scroll', updatePosition);
    };
  }, [updatePosition]);

  // Improved BongoCat container renderer with transitions
  const renderBongoCat = () => (
    <div 
      className={styles.demoContainer}
      style={{
        top: containerTop > 0 ? `${containerTop}px` : '8vh',
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden'
      }}
    >
      <BongoCat 
        size={catSize}
        color="#000"
        onBongo={() => {
          console.log('Cat bongoed!');
        }}
      />
    </div>
  );

  return (
    <div className={loginStyles.loginWrapper}>
      {renderBongoCat()}

      {/* Background */}
      <div className={loginStyles.backgroundContainer}>
        <div className={loginStyles.overlay} />
        <div 
          className={loginStyles.backgroundImage}
          style={{ backgroundColor: '#2a3b4c', width: '100%', height: '100%' }}
        />
      </div>

      <div className={loginStyles.loginContainer} ref={containerRef}>
        {/* Left section */}
        <section className={loginStyles.imageSection}>
          <h1 className={loginStyles.welcomeTitle}>Create Your Account</h1>
          <img 
            src="/images/IMG_5071.JPG" 
            alt="Cute cat avatar" 
            className={loginStyles.catImage}
            onError={(e) => e.target.src = 'https://placekitten.com/300/300'}
            loading="eager"
          />
          <p className={loginStyles.welcomeText}>
            Create your voter account to join our cat-naming community!
          </p>
        </section>

        {/* Right section - simplified form */}
        <div className={loginStyles.loginContent}>
          <h2 className={loginStyles.loginTitle}>Sign In or Create Account</h2>
          <input
            type="text"
            value={name}
            onChange={handleInputChange}
            placeholder="Type to see the cat bongo!"
            className={loginStyles.loginInput}
            autoFocus
            aria-label="Name input"
          />
          <p className={loginStyles.helperText}>
            {isTyping ? 'The cat is watching you type!' : 'The cat above will bongo when you type in the input!'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BongoCatDemo; 