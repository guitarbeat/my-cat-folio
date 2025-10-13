/**
 * @module useImageGallery
 * @description Simplified custom hook for managing image gallery functionality.
 * Handles image loading, transitions, and user interactions with clean, maintainable code.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for managing image gallery
 * @param {Object} options - Configuration options
 * @param {Array} options.initialImages - Initial array of image URLs
 * @param {number} options.rotationInterval - Auto-rotation interval in milliseconds
 * @param {boolean} options.autoRotate - Whether to enable auto-rotation
 * @returns {Object} Gallery state and controls
 */
export const useImageGallery = ({
  initialImages = [],
  rotationInterval = 4000,
  autoRotate = true
} = {}) => {
  const [galleryData, setGalleryData] = useState(initialImages);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageTransitioning, setIsImageTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [failedImages, setFailedImages] = useState(new Set());

  const imageRotationRef = useRef(null);
  const transitionTimeoutRef = useRef(null);

  // * Rotate to next image with optimized transitions
  const rotateImage = useCallback(() => {
    if (galleryData.length <= 1 || isImageTransitioning) return;

    requestAnimationFrame(() => {
      setIsImageTransitioning(true);

      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      transitionTimeoutRef.current = setTimeout(() => {
        setCurrentImageIndex(prevIndex => (prevIndex + 1) % galleryData.length);
        requestAnimationFrame(() => {
          setIsImageTransitioning(false);
        });
      }, 200);
    });
  }, [galleryData.length, isImageTransitioning]);

  // * Go to next image
  const goToNextImage = useCallback(() => {
    if (galleryData.length <= 1 || isImageTransitioning) return;
    rotateImage();
  }, [rotateImage, galleryData.length, isImageTransitioning]);

  // * Go to previous image with optimized transitions
  const goToPreviousImage = useCallback(() => {
    if (galleryData.length <= 1 || isImageTransitioning) return;

    requestAnimationFrame(() => {
      setIsImageTransitioning(true);

      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      transitionTimeoutRef.current = setTimeout(() => {
        setCurrentImageIndex(prevIndex =>
          prevIndex === 0 ? galleryData.length - 1 : prevIndex - 1
        );
        requestAnimationFrame(() => {
          setIsImageTransitioning(false);
        });
      }, 200);
    });
  }, [galleryData.length, isImageTransitioning]);

  // * Go to specific image with optimized transitions
  const goToImage = useCallback((index) => {
    if (galleryData.length <= 1 || isImageTransitioning || index === currentImageIndex) return;

    if (index < 0 || index >= galleryData.length) return;

    requestAnimationFrame(() => {
      setIsImageTransitioning(true);

      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      transitionTimeoutRef.current = setTimeout(() => {
        setCurrentImageIndex(index);
        requestAnimationFrame(() => {
          setIsImageTransitioning(false);
        });
      }, 200);
    });
  }, [galleryData.length, isImageTransitioning, currentImageIndex]);

  // * Start auto-rotation
  const startAutoRotation = useCallback(() => {
    if (!autoRotate || galleryData.length <= 1) return;

    if (imageRotationRef.current) {
      clearInterval(imageRotationRef.current);
    }

    imageRotationRef.current = setInterval(rotateImage, rotationInterval);
  }, [autoRotate, galleryData.length, rotateImage, rotationInterval]);

  // * Stop auto-rotation
  const stopAutoRotation = useCallback(() => {
    if (imageRotationRef.current) {
      clearInterval(imageRotationRef.current);
      imageRotationRef.current = null;
    }
  }, []);

  // * Preload images for better performance
  const preloadImage = useCallback((src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, src]));
        resolve(img);
      };
      img.onerror = () => {
        setFailedImages(prev => new Set([...prev, src]));
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });
  }, []);

  // * Preload all images when gallery data changes
  const preloadAllImages = useCallback(async () => {
    if (!galleryData || galleryData.length === 0) return;

    const preloadPromises = galleryData.map(src =>
      preloadImage(src).catch(err => {
        console.warn('Image preload failed:', err.message);
        return null;
      })
    );

    await Promise.allSettled(preloadPromises);
  }, [galleryData, preloadImage]);

  // * Handle image load
  const handleImageLoad = useCallback(() => {
    setIsImageTransitioning(false);
  }, []);

  // * Handle image error
  const handleImageError = useCallback((event) => {
    console.error('Image failed to load:', event.target.src);
    setFailedImages(prev => new Set([...prev, event.target.src]));
    setIsImageTransitioning(false);
  }, []);

  // * Initialize gallery
  useEffect(() => {
    const initializeGallery = async () => {
      if (initialImages && initialImages.length > 0) {
        setGalleryData(initialImages);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/assets/images/gallery.json');
        if (response.ok) {
          const data = await response.json();
          setGalleryData(data);
        } else {
          // Fallback to default images
          setGalleryData(['/assets/images/IMG_0778.jpg']);
        }
      } catch (err) {
        console.error('Error loading gallery data:', err);
        setError(err);
        // Fallback to default images
        setGalleryData(['/assets/images/IMG_0778.jpg']);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGallery();
  }, [initialImages]);

  // * Preload images when gallery data is ready
  useEffect(() => {
    if (galleryData.length > 0 && !isLoading) {
      preloadAllImages();
    }
  }, [galleryData.length, isLoading, preloadAllImages]);

  // * Start auto-rotation when gallery is ready
  useEffect(() => {
    if (galleryData.length > 1 && !isLoading) {
      startAutoRotation();
    }

    return () => {
      stopAutoRotation();
    };
  }, [galleryData.length, isLoading, startAutoRotation, stopAutoRotation]);

  // * Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoRotation();
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [stopAutoRotation]);

  return {
    galleryData,
    currentImageIndex,
    isImageTransitioning,
    isLoading,
    error,
    loadedImages,
    failedImages,
    hasMultipleImages: galleryData.length > 1,
    currentImage: galleryData[currentImageIndex] || '/assets/images/IMG_0778.jpg',
    totalImages: galleryData.length,
    goToNextImage,
    goToPreviousImage,
    goToImage,
    handleImageLoad,
    handleImageError,
    startAutoRotation,
    stopAutoRotation
  };
};

export default useImageGallery;