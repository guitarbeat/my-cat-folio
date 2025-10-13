/**
 * @module CatImageGallery
 * @description Simplified cat image gallery component with clean, maintainable code.
 */

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from '../WelcomeScreen.module.css';
const CatImageGallery = ({
  currentImage,
  isTransitioning,
  hasMultipleImages,
  currentIndex,
  totalImages,
  onPrevious,
  onNext,
  onImageSelect,
  onImageLoad,
  onImageError
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // * Handle image load success
  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
    setImageError(false);
    onImageLoad?.();
  }, [onImageLoad]);

  // * Handle image load error with fallback
  const handleImageError = useCallback((event) => {
    console.error('Image failed to load:', event.target.src);
    setImageError(true);
    setImageLoading(false);
    onImageError?.(event);
  }, [onImageError]);

  // * Reset loading state when image changes
  React.useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [currentImage]);

  return (
    <div className={styles.catImageSection}>
      <div className={styles.catImageContainer}>
        {imageError ? (
          // * Fallback content when image fails to load
          <div className={`${styles.catImage} ${styles.imageError}`}>
            <div className={styles.errorContent}>
              <span className={styles.errorIcon}>🐱</span>
              <span className={styles.errorText}>Image unavailable</span>
            </div>
          </div>
        ) : (
          <>
            <img
              src={currentImage}
              alt={`My cat looking adorable - Image ${currentIndex + 1} of ${totalImages}`}
              className={`${styles.catImage} ${isTransitioning ? styles.imageTransitioning : ''} ${imageLoading ? styles.imageLoading : ''}`}
              loading="lazy"
              decoding="async"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {imageLoading && (
              <div className={styles.imageLoadingOverlay}>
                <div className={styles.loadingSpinner} />
              </div>
            )}
          </>
        )}
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
  onImageLoad: PropTypes.func.isRequired,
  onImageError: PropTypes.func
};

export default CatImageGallery;
