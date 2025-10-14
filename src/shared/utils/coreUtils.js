/**
 * @module coreUtils
 * @description Consolidated utility functions for the cat names application.
 * Combines array operations, image handling, tournament logic, and performance monitoring.
 */

// * Array Utilities
/**
 * * Shuffles an array using the Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} A new shuffled array
 */
export function shuffleArray(array) {
  if (!Array.isArray(array)) {
    console.warn('shuffleArray received non-array input:', array);
    return [];
  }

  const newArray = [...array];
  try {
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in shuffleArray:', error);
    }
    return array;
  }
}

/**
 * * Generate all possible pairs from a list of names
 * @param {Array} nameList - Array of name strings
 * @returns {Array} Array of [name1, name2] pairs
 */
export function generatePairs(nameList) {
  const pairs = [];
  for (let i = 0; i < nameList.length - 1; i++) {
    for (let j = i + 1; j < nameList.length; j++) {
      pairs.push([nameList[i], nameList[j]]);
    }
  }
  return pairs;
}

/**
 * * Build a comparisons map from tournament history
 * @param {Array} history - Array of tournament history entries
 * @returns {Map} Map of name -> comparison count
 */
export function buildComparisonsMap(history) {
  const comparisons = new Map();
  for (const v of history) {
    const l = v?.match?.left?.name;
    const r = v?.match?.right?.name;
    if (l) comparisons.set(l, (comparisons.get(l) || 0) + 1);
    if (r) comparisons.set(r, (comparisons.get(r) || 0) + 1);
  }
  return comparisons;
}

// * Image Utilities
/**
 * * Load a File/Blob into an HTMLImageElement
 * @param {File} file - Image file to load
 * @returns {Promise<HTMLImageElement>} Loaded image element
 */
async function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

/**
 * * Validate if an image URL is accessible
 * @param {string} url - Image URL to validate
 * @returns {Promise<boolean>} True if image is accessible
 */
export async function validateImageUrl(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * * Preload an image with error handling
 * @param {string} src - Image source URL
 * @returns {Promise<HTMLImageElement>} Loaded image element
 */
export async function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (_error) => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * * Get fallback image URL when primary image fails
 * @param {string} originalSrc - Original image source
 * @returns {string} Fallback image URL
 */
export function getFallbackImageUrl(_originalSrc) {
  return '/assets/images/IMG_0778.jpg';
}

/**
 * * Compress an image file to WebP using a canvas
 * @param {File} file - Original image file
 * @param {Object} options - { maxWidth, maxHeight, quality }
 * @returns {Promise<File>} Compressed image as a File (webp) or original on failure
 */
export async function compressImageFile(
  file,
  { maxWidth = 1600, maxHeight = 1600, quality = 0.8 } = {}
) {
  try {
    const img = await loadImageFromFile(file);
    const { width, height } = img;
    let targetW = width;
    let targetH = height;

    // Fit within max dimensions preserving aspect ratio
    const scale = Math.min(maxWidth / width, maxHeight / height, 1);
    targetW = Math.round(width * scale);
    targetH = Math.round(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d', { alpha: true });
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(
        resolve,
        'image/webp',
        Math.min(Math.max(quality, 0.1), 0.95)
      )
    );

    if (!blob) return file; // fallback

    const base = file.name.replace(/\.[^.]+$/, '') || 'image';
    const compressed = new File([blob], `${base}.webp`, { type: 'image/webp' });
    return compressed;
  } catch {
    return file; // fallback to original if anything fails
  }
}

// * Tournament Utilities
/**
 * * Initialize sorter pairs if not already done
 * @param {Object} sorter - The sorter object
 * @param {Array} nameList - Array of name strings
 */
export function initializeSorterPairs(sorter, nameList) {
  if (!Array.isArray(sorter._pairs)) {
    sorter._pairs = generatePairs(nameList);
    sorter._pairIndex = 0;
  }
}

/**
 * * Get preferences map from sorter
 * @param {Object} sorter - The sorter object
 * @returns {Map} Preferences map
 */
export function getPreferencesMap(sorter) {
  return sorter.preferences instanceof Map ? sorter.preferences : new Map();
}

/**
 * * Calculate the blended rating for a name
 * @param {number} existingRating - Previous rating value
 * @param {number} position - Position in sorted list
 * @param {number} totalNames - Total number of names
 * @param {number} matchesPlayed - Matches completed
 * @param {number} maxMatches - Total matches in tournament
 * @returns {number} Final rating between 1000 and 2000
 */
export function computeRating(
  existingRating,
  position,
  totalNames,
  matchesPlayed,
  maxMatches
) {
  const ratingSpread = Math.min(1000, totalNames * 25);
  const positionValue =
    ((totalNames - position - 1) / (totalNames - 1)) * ratingSpread;
  const newPositionRating = 1500 + positionValue;
  const blendFactor = Math.min(0.8, (matchesPlayed / maxMatches) * 0.9);
  const newRating = Math.round(
    blendFactor * newPositionRating + (1 - blendFactor) * existingRating
  );
  return Math.max(1000, Math.min(2000, newRating));
}

// * Performance Monitoring
/**
 * * Performance monitoring class
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      bundleSize: {},
      loadTimes: {},
      runtimeMetrics: {},
      memoryUsage: {}
    };
    this.observers = [];
  }

  /**
   * * Track bundle size metrics
   */
  trackBundleSize() {
    if (typeof window === 'undefined') return;

    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

    let totalJS = 0;
    let totalCSS = 0;

    scripts.forEach(script => {
      const size = this.getResourceSize(script.src);
      if (size) totalJS += size;
    });

    stylesheets.forEach(link => {
      const size = this.getResourceSize(link.href);
      if (size) totalCSS += size;
    });

    this.metrics.bundleSize = {
      javascript: totalJS,
      css: totalCSS,
      total: totalJS + totalCSS,
      timestamp: Date.now()
    };

    console.log('📊 Bundle Size Metrics:', this.metrics.bundleSize);
  }

  /**
   * * Track page load times
   */
  trackLoadTimes() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];

      this.metrics.loadTimes = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint(),
        timestamp: Date.now()
      };

      console.log('⏱️ Load Time Metrics:', this.metrics.loadTimes);
    });
  }

  /**
   * * Track runtime performance
   */
  trackRuntimePerformance() {
    if (typeof window === 'undefined') return;

    // Track memory usage
    if (performance.memory) {
      this.metrics.memoryUsage = {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now()
      };
    }

    // Track long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // Tasks longer than 50ms
            console.warn('🐌 Long Task Detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    }
  }

  /**
   * * Track Welcome Screen specific metrics
   */
  trackWelcomeScreenMetrics() {
    if (typeof window === 'undefined') return;

    const startTime = performance.now();

    // Track particle system performance
    const particleObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('particle')) {
          console.log('✨ Particle Animation:', {
            duration: entry.duration,
            startTime: entry.startTime
          });
        }
      });
    });

    if ('PerformanceObserver' in window) {
      particleObserver.observe({ entryTypes: ['measure'] });
      this.observers.push(particleObserver);
    }

    // Track image loading
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      img.addEventListener('load', () => {
        const loadTime = performance.now() - startTime;
        console.log(`🖼️ Image ${index + 1} loaded in ${loadTime.toFixed(2)}ms`);
      });
    });
  }

  /**
   * * Track image loading metrics
   * @param {Object} metrics - Image loading metrics
   * @param {number} metrics.loadedCount - Number of successfully loaded images
   * @param {number} metrics.failedCount - Number of failed image loads
   * @param {number} metrics.totalImages - Total number of images
   */
  trackImageLoadMetrics({ loadedCount, failedCount, totalImages }) {
    const successRate = totalImages > 0 ? (loadedCount / totalImages) * 100 : 0;

    this.metrics.imageLoading = {
      loadedCount,
      failedCount,
      totalImages,
      successRate: Math.round(successRate * 100) / 100,
      timestamp: Date.now()
    };

    console.log('🖼️ Image Loading Metrics:', {
      loaded: loadedCount,
      failed: failedCount,
      total: totalImages,
      successRate: `${successRate.toFixed(1)}%`
    });

    // * Warn if success rate is low
    if (successRate < 80 && totalImages > 0) {
      console.warn('⚠️ Low image loading success rate:', `${successRate.toFixed(1)}%`);
    }
  }

  /**
   * * Get resource size from URL
   * @param {string} url - Resource URL
   * @returns {number} Resource size in bytes
   */
  getResourceSize(url) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('HEAD', url, false);
      xhr.send();
      return parseInt(xhr.getResponseHeader('Content-Length') || '0');
    } catch {
      return 0;
    }
  }

  /**
   * * Get First Paint time
   * @returns {number} First paint time in milliseconds
   */
  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  /**
   * * Get First Contentful Paint time
   * @returns {number} First contentful paint time in milliseconds
   */
  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint ? firstContentfulPaint.startTime : 0;
  }

  /**
   * * Get all metrics
   * @returns {Object} All performance metrics
   */
  getAllMetrics() {
    return {
      ...this.metrics,
      userAgent: navigator.userAgent,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null
    };
  }

  /**
   * * Clean up observers
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  /**
   * * Initialize all monitoring
   */
  init() {
    this.trackBundleSize();
    this.trackLoadTimes();
    this.trackRuntimePerformance();
    this.trackWelcomeScreenMetrics();
  }
}

// * Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// * Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  performanceMonitor.init();
}

// * Logger utility
/**
 * * Log messages during development only
 * @param {...any} args - Arguments to log
 */
export function devLog(...args) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEV]', ...args);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Logger error:', error);
    }
  }
}

// * Export individual functions and classes
export {
  performanceMonitor,
  loadImageFromFile
};

// * Default export with all utilities
export default {
  // Array utilities
  shuffleArray,
  generatePairs,
  buildComparisonsMap,
  
  // Image utilities
  validateImageUrl,
  preloadImage,
  getFallbackImageUrl,
  compressImageFile,
  
  // Tournament utilities
  initializeSorterPairs,
  getPreferencesMap,
  computeRating,
  
  // Performance monitoring
  PerformanceMonitor,
  performanceMonitor
};