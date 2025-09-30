/**
 * @module useImageGallery
 * @description Custom hook for managing image gallery functionality with rotation and navigation.
 * Handles image loading, transitions, and user interactions.
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
  
  const imageRotationRef = useRef(null);
  const transitionTimeoutRef = useRef(null);

  // Load gallery data from external source
  const loadGalleryData = useCallback(async () => {
    if (initialImages.length > 0) {
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
  }, [initialImages]);

  // Rotate to next image
  const rotateImage = useCallback(() => {
    if (galleryData.length <= 1 || isImageTransitioning) return;
    
    setIsImageTransitioning(true);
    
    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    transitionTimeoutRef.current = setTimeout(() => {
      setCurrentImageIndex(prevIndex => (prevIndex + 1) % galleryData.length);
      setIsImageTransitioning(false);
    }, 300);
  }, [galleryData.length, isImageTransitioning]);

  // Go to next image
  const goToNextImage = useCallback(() => {
    if (galleryData.length <= 1 || isImageTransitioning) return;
    rotateImage();
  }, [rotateImage, galleryData.length, isImageTransitioning]);

  // Go to previous image
  const goToPreviousImage = useCallback(() => {
    if (galleryData.length <= 1 || isImageTransitioning) return;
    
    setIsImageTransitioning(true);
    
    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    transitionTimeoutRef.current = setTimeout(() => {
      setCurrentImageIndex(prevIndex => 
        prevIndex === 0 ? galleryData.length - 1 : prevIndex - 1
      );
      setIsImageTransitioning(false);
    }, 300);
  }, [galleryData.length, isImageTransitioning]);

  // Go to specific image
  const goToImage = useCallback((index) => {
    if (galleryData.length <= 1 || isImageTransitioning || index === currentImageIndex) return;
    
    if (index < 0 || index >= galleryData.length) return;
    
    setIsImageTransitioning(true);
    
    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    transitionTimeoutRef.current = setTimeout(() => {
      setCurrentImageIndex(index);
      setIsImageTransitioning(false);
    }, 300);
  }, [galleryData.length, isImageTransitioning, currentImageIndex]);

  // Start auto-rotation
  const startAutoRotation = useCallback(() => {
    if (!autoRotate || galleryData.length <= 1) return;
    
    if (imageRotationRef.current) {
      clearInterval(imageRotationRef.current);
    }
    
    imageRotationRef.current = setInterval(rotateImage, rotationInterval);
  }, [autoRotate, galleryData.length, rotateImage, rotationInterval]);

  // Stop auto-rotation
  const stopAutoRotation = useCallback(() => {
    if (imageRotationRef.current) {
      clearInterval(imageRotationRef.current);
      imageRotationRef.current = null;
    }
  }, []);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    setIsImageTransitioning(false);
  }, []);

  // Initialize gallery
  useEffect(() => {
    loadGalleryData();
  }, [loadGalleryData]);

  // Start auto-rotation when gallery is ready
  useEffect(() => {
    if (galleryData.length > 1 && !isLoading) {
      startAutoRotation();
    }

    return () => {
      stopAutoRotation();
    };
  }, [galleryData.length, isLoading, startAutoRotation, stopAutoRotation]);

  // Cleanup on unmount
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
    hasMultipleImages: galleryData.length > 1,
    currentImage: galleryData[currentImageIndex] || '/assets/images/IMG_0778.jpg',
    goToNextImage,
    goToPreviousImage,
    goToImage,
    handleImageLoad,
    startAutoRotation,
    stopAutoRotation
  };
};

export default useImageGallery;