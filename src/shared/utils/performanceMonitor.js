/**
 * @module performanceMonitor
 * @description Performance monitoring utilities for tracking bundle size, load times, and runtime performance.
 */

class PerformanceMonitor {
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
   * Track bundle size metrics
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
   * Track page load times
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
   * Track runtime performance
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
   * Track Welcome Screen specific metrics
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
   * Get resource size from URL
   */
  getResourceSize(url) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('HEAD', url, false);
      xhr.send();
      return parseInt(xhr.getResponseHeader('Content-Length') || '0');
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get First Paint time
   */
  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  /**
   * Get First Contentful Paint time
   */
  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint ? firstContentfulPaint.startTime : 0;
  }

  /**
   * Get all metrics
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
   * Clean up observers
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  /**
   * Initialize all monitoring
   */
  init() {
    this.trackBundleSize();
    this.trackLoadTimes();
    this.trackRuntimePerformance();
    this.trackWelcomeScreenMetrics();
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  performanceMonitor.init();
}

export default performanceMonitor;