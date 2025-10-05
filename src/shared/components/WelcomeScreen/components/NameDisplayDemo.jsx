/**
 * @module NameDisplayDemo
 * @description Demo component showing both the original complex parsing approach
 * and the new straightforward mapping approach side by side for comparison.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import InteractiveCatName from './InteractiveCatName';
import SimpleCatName from './SimpleCatName';
import GridCatName from './GridCatName';
import styles from '../WelcomeScreen.module.css';

/**
 * Demo component comparing different name display approaches
 * @param {Object} props - Component props
 * @param {string} props.catName - The cat's name
 * @param {Array} props.nameStats - Array of name statistics
 * @returns {JSX.Element} Demo component
 */
const NameDisplayDemo = ({ catName, nameStats }) => {
  const [hoveredName, setHoveredName] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleNameHover = (nameData, position) => {
    setHoveredName(nameData);
    setTooltipPosition(position);
  };

  const handleNameLeave = () => {
    setHoveredName(null);
  };

  return (
    <div className={styles.demoContainer}>
      <h2 className={styles.demoTitle}>Name Display Approaches Comparison</h2>
      
      <div className={styles.demoGrid}>
        {/* Original Complex Parsing Approach */}
        <div className={styles.demoSection}>
          <h3 className={styles.demoSectionTitle}>Original: Complex Parsing</h3>
          <div className={styles.demoCard}>
            <InteractiveCatName
              catName={catName}
              nameStats={nameStats}
              onNameHover={handleNameHover}
              onNameLeave={handleNameLeave}
            />
          </div>
          <p className={styles.demoDescription}>
            Uses complex string parsing to find and highlight individual name components within the cat name.
            <br />
            <strong>Pros:</strong> Precise highlighting of name parts
            <br />
            <strong>Cons:</strong> Complex logic, hard to maintain, inconsistent with profile page
          </p>
        </div>

        {/* New Simple Approach */}
        <div className={styles.demoSection}>
          <h3 className={styles.demoSectionTitle}>New: Simple Mapping</h3>
          <div className={styles.demoCard}>
            <SimpleCatName
              catName={catName}
              nameStats={nameStats}
              onNameHover={handleNameHover}
              onNameLeave={handleNameLeave}
            />
          </div>
          <p className={styles.demoDescription}>
            Uses straightforward filtering and mapping to find matching names.
            <br />
            <strong>Pros:</strong> Simple logic, easy to maintain, consistent approach
            <br />
            <strong>Cons:</strong> Less precise highlighting
          </p>
        </div>

        {/* New Grid Approach */}
        <div className={styles.demoSection}>
          <h3 className={styles.demoSectionTitle}>New: Grid Layout</h3>
          <div className={styles.demoCard}>
            <GridCatName
              catName={catName}
              nameStats={nameStats}
              onNameHover={handleNameHover}
              onNameLeave={handleNameLeave}
            />
          </div>
          <p className={styles.demoDescription}>
            Uses grid layout similar to profile page with individual name cards.
            <br />
            <strong>Pros:</strong> Consistent with profile page, rich metadata display, scalable
            <br />
            <strong>Cons:</strong> Different visual style from original
          </p>
        </div>
      </div>
    </div>
  );
};

NameDisplayDemo.displayName = 'NameDisplayDemo';

NameDisplayDemo.propTypes = {
  catName: PropTypes.string.isRequired,
  nameStats: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      rating: PropTypes.number.isRequired,
      wins: PropTypes.number.isRequired,
      losses: PropTypes.number.isRequired,
      totalMatches: PropTypes.number.isRequired,
      winRate: PropTypes.number.isRequired,
      rank: PropTypes.number.isRequired,
      categories: PropTypes.arrayOf(PropTypes.string)
    })
  )
};

export default NameDisplayDemo;