/**
 * @module useParticleSystem
 * @description Custom hook for managing particle effects with performance optimizations.
 * Provides a lightweight particle system that respects user preferences and device capabilities.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Creates a single particle with randomized properties
 * @param {Object} options - Configuration options
 * @param {number} options.maxWidth - Maximum screen width
 * @param {number} options.maxHeight - Maximum screen height
 * @param {boolean} options.isMobile - Whether device is mobile
 * @param {boolean} options.isSmallMobile - Whether device is small mobile
 * @returns {Object} Particle object with properties
 */
const createParticle = ({ maxWidth, maxHeight, isMobile, isSmallMobile }) => ({
  id: Math.random(),
  x: Math.random() * maxWidth,
  y: Math.random() * maxHeight,
  vx: (Math.random() - 0.5) * (isSmallMobile ? 0.1 : isMobile ? 0.15 : 0.2),
  vy: (Math.random() - 0.5) * (isSmallMobile ? 0.1 : isMobile ? 0.15 : 0.2),
  size: Math.random() * (isSmallMobile ? 0.8 : isMobile ? 1 : 1.5) + 0.5,
  opacity: Math.random() * (isSmallMobile ? 0.1 : isMobile ? 0.15 : 0.2) + 0.1,
  life: 1,
  decay: Math.random() * (isSmallMobile ? 0.03 : 0.04) + 0.02
});

/**
 * Custom hook for managing particle effects
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether particles should be enabled
 * @param {number} options.maxParticles - Maximum number of particles
 * @returns {Object} Particle system state and controls
 */
export const useParticleSystem = ({ enabled = true, maxParticles = 6 } = {}) => {
  const [particles, setParticles] = useState([]);
  const animationFrameRef = useRef(null);
  const lastUpdateRef = useRef(0);

  // Check if user prefers reduced motion
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Get device capabilities
  const getDeviceInfo = useCallback(() => {
    if (typeof window === 'undefined') {
      return { isMobile: false, isSmallMobile: false, maxWidth: 1920, maxHeight: 1080 };
    }
    
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    return {
      isMobile,
      isSmallMobile,
      maxWidth: window.innerWidth,
      maxHeight: window.innerHeight
    };
  }, []);

  // Animate particles
  const animateParticles = useCallback(() => {
    if (!enabled || prefersReducedMotion) return;

    const now = Date.now();
    const deltaTime = now - lastUpdateRef.current;
    
    // Throttle animation updates for better performance
    if (deltaTime < 100) return;
    
    lastUpdateRef.current = now;

    setParticles(prevParticles => {
      const deviceInfo = getDeviceInfo();
      const animationThreshold = deviceInfo.isSmallMobile ? 0.1 : 
                                deviceInfo.isMobile ? 0.15 : 0.2;

      return prevParticles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - particle.decay,
          opacity: particle.opacity * particle.life
        }))
        .filter(particle => particle.life > 0)
        .concat(
          Math.random() < animationThreshold ? 
            [createParticle(deviceInfo)] : 
            []
        )
        .slice(0, maxParticles);
    });
  }, [enabled, prefersReducedMotion, getDeviceInfo, maxParticles]);

  // Initialize particles
  const initializeParticles = useCallback(() => {
    if (!enabled || prefersReducedMotion) {
      setParticles([]);
      return;
    }

    const deviceInfo = getDeviceInfo();
    const particleCount = deviceInfo.isSmallMobile ? 2 : 
                         deviceInfo.isMobile ? 4 : maxParticles;
    
    const initialParticles = Array.from(
      { length: particleCount },
      () => createParticle(deviceInfo)
    );
    
    setParticles(initialParticles);
  }, [enabled, prefersReducedMotion, getDeviceInfo, maxParticles]);

  // Start animation loop
  const startAnimation = useCallback(() => {
    if (!enabled || prefersReducedMotion) return;

    const animate = () => {
      animateParticles();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [enabled, prefersReducedMotion, animateParticles]);

  // Stop animation loop
  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeParticles();
    startAnimation();

    return () => {
      stopAnimation();
    };
  }, [initializeParticles, startAnimation, stopAnimation]);

  // Handle window resize
  useEffect(() => {
    if (!enabled) return;

    const handleResize = () => {
      initializeParticles();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [enabled, initializeParticles]);

  return {
    particles,
    isEnabled: enabled && !prefersReducedMotion,
    initializeParticles,
    startAnimation,
    stopAnimation
  };
};

export default useParticleSystem;