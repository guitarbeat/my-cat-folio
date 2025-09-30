/**
 * @module CatImageGallery
 * @description Cat image gallery component with navigation controls and transitions.
 * Handles image display, rotation, and user interactions.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styles from '../WelcomeScreen.module.css';

/**
 * Cat image gallery component
 * @param {Object} props - Component props
 * @param {string} props.currentImage - Current image URL
 * @param {boolean} props.isTransitioning - Whether image is transitioning
 * @param {boolean} props.hasMultipleImages - Whether multiple images are available
 * @param {number} props.currentIndex - Current image index
 * @param {number} props.totalImages - Total number of images
 * @param {Function} props.onPrevious - Previous image callback
 * @param {Function} props.onNext - Next image callback
 * @param {Function} props.onImageSelect - Image selection callback
 * @param {Function} props.onImageLoad - Image load callback
 * @returns {JSX.Element} Cat image gallery
 */
const CatImageGallery = ({
  currentImage,
  isTransitioning,
  hasMultipleImages,
  currentIndex,
  totalImages,
  onPrevious,
  onNext,
  onImageSelect,
  onImageLoad
}) => {
  return (
    <div className={styles.catImageSection}>
      <div className={styles.catImageContainer}>
        <img
          src={currentImage}
          alt={`My cat looking adorable - Image ${currentIndex + 1} of ${totalImages}`}
          className={`${styles.catImage} ${isTransitioning ? styles.imageTransitioning : ''}`}
          loading="lazy"
          onLoad={onImageLoad}
        />
        <div className={styles.catImageGlow} />
        
        {/* Image Navigation Controls */}
        {hasMultipleImages && (
          <>
            <button
              className={styles.imageNavButton}
              onClick={onPrevious}
              disabled={isTransitioning}
              aria-label="Previous cat image"
              type="button"
            >
              ‹
            </button>
            <button
              className={styles.imageNavButton}
              onClick={onNext}
              disabled={isTransitioning}
              aria-label="Next cat image"
              type="button"
            >
              ›
            </button>
            
            {/* Image Counter */}
            <div className={styles.imageCounter}>
              {currentIndex + 1} / {totalImages}
            </div>
            
            {/* Image Dots Indicator */}
            <div className={styles.imageDots}>
              {Array.from({ length: totalImages }, (_, index) => (
                <button
                  key={index}
                  className={`${styles.imageDot} ${index === currentIndex ? styles.activeDot : ''}`}
                  onClick={() => onImageSelect(index)}
                  disabled={isTransitioning}
                  aria-label={`Go to image ${index + 1}`}
                  type="button"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

CatImageGallery.displayName = 'CatImageGallery';

CatImageGallery.propTypes = {
  currentImage: PropTypes.string.isRequired,
  isTransitioning: PropTypes.bool.isRequired,
  hasMultipleImages: PropTypes.bool.isRequired,
  currentIndex: PropTypes.number.isRequired,
  totalImages: PropTypes.number.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onImageSelect: PropTypes.func.isRequired,
  onImageLoad: PropTypes.func.isRequired
};

export default CatImageGallery;