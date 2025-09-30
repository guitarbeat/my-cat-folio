/**
 * @module ParticleBackground
 * @description Particle background component for visual effects.
 * Renders animated particles with performance optimizations.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styles from '../WelcomeScreen.module.css';

/**
 * Particle background component
 * @param {Object} props - Component props
 * @param {Array} props.particles - Array of particle objects
 * @param {boolean} props.isEnabled - Whether particles are enabled
 * @returns {JSX.Element} Particle background
 */
const ParticleBackground = ({ particles, isEnabled }) => {
  if (!isEnabled || particles.length === 0) {
    return null;
  }

  return (
    <div className={styles.particleContainer}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={styles.particle}
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
            transform: `rotate(${particle.x * 0.1}deg)`
          }}
        />
      ))}
    </div>
  );
};

ParticleBackground.displayName = 'ParticleBackground';

ParticleBackground.propTypes = {
  particles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      size: PropTypes.number.isRequired,
      opacity: PropTypes.number.isRequired
    })
  ).isRequired,
  isEnabled: PropTypes.bool.isRequired
};

export default ParticleBackground;