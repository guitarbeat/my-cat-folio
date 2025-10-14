/**
 * @module PerformanceDashboard
 * @description Real-time performance monitoring dashboard for all users
 */

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { performanceMonitor } from '../../utils/coreUtils';
import styles from './PerformanceDashboard.module.css';

const PerformanceDashboard = ({ userName, isVisible = false, onClose }) => {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Update metrics
  const updateMetrics = useCallback(() => {
    const currentMetrics = performanceMonitor.getAllMetrics();
    setMetrics(currentMetrics);
  }, []);

  // Initialize metrics for all users
  useEffect(() => {
    const initializeMetrics = () => {
      if (!userName) {
        setIsLoading(false);
        return;
      }

      // Load metrics immediately for all users
      if (isVisible) {
        updateMetrics();
      }
      setIsLoading(false);
    };

    initializeMetrics();
  }, [userName, isVisible, updateMetrics]);

  // Set up refresh interval
  useEffect(() => {
    if (isVisible) {
      // Only set up interval if metrics aren't already loaded
      if (!metrics) {
        updateMetrics();
      }
      const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds
      setRefreshInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isVisible, updateMetrics, refreshInterval, metrics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  if (isLoading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>Loading performance data...</div>
      </div>
    );
  }

  if (!isVisible) {
    return null;
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getPerformanceGrade = (loadTime) => {
    if (loadTime < 1000) return { grade: 'A+', color: '#28a745' };
    if (loadTime < 2000) return { grade: 'A', color: '#28a745' };
    if (loadTime < 3000) return { grade: 'B', color: '#ffc107' };
    if (loadTime < 5000) return { grade: 'C', color: '#fd7e14' };
    return { grade: 'D', color: '#dc3545' };
  };

  const getBundleGrade = (size) => {
    if (size < 500000) return { grade: 'A+', color: '#28a745' };
    if (size < 1000000) return { grade: 'A', color: '#28a745' };
    if (size < 2000000) return { grade: 'B', color: '#ffc107' };
    if (size < 5000000) return { grade: 'C', color: '#fd7e14' };
    return { grade: 'D', color: '#dc3545' };
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h2>📊 Performance Dashboard</h2>
        <div className={styles.controls}>
          <button
            className={styles.refreshBtn}
            onClick={updateMetrics}
            title="Refresh metrics"
          >
            🔄
          </button>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            title="Close dashboard"
          >
            ✕
          </button>
        </div>
      </div>

      {metrics && (
        <div className={styles.content}>
          {/* Bundle Size Metrics */}
          <div className={styles.section}>
            <h3>📦 Bundle Size</h3>
            <div className={styles.metricsGrid}>
              <div className={styles.metric}>
                <span className={styles.label}>JavaScript:</span>
                <span className={styles.value}>
                  {formatBytes(metrics.bundleSize.javascript || 0)}
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.label}>CSS:</span>
                <span className={styles.value}>
                  {formatBytes(metrics.bundleSize.css || 0)}
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.label}>Total:</span>
                <span className={styles.value}>
                  {formatBytes(metrics.bundleSize.total || 0)}
                </span>
                <span
                  className={styles.grade}
                  style={{
                    color: getBundleGrade(metrics.bundleSize.total || 0).color
                  }}
                >
                  {getBundleGrade(metrics.bundleSize.total || 0).grade}
                </span>
              </div>
            </div>
          </div>

          {/* Load Time Metrics */}
          <div className={styles.section}>
            <h3>⏱️ Load Performance</h3>
            <div className={styles.metricsGrid}>
              <div className={styles.metric}>
                <span className={styles.label}>First Paint:</span>
                <span className={styles.value}>
                  {formatTime(metrics.loadTimes.firstPaint || 0)}
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.label}>First Contentful Paint:</span>
                <span className={styles.value}>
                  {formatTime(metrics.loadTimes.firstContentfulPaint || 0)}
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.label}>Total Load Time:</span>
                <span className={styles.value}>
                  {formatTime(metrics.loadTimes.totalLoadTime || 0)}
                </span>
                <span
                  className={styles.grade}
                  style={{
                    color: getPerformanceGrade(metrics.loadTimes.totalLoadTime || 0).color
                  }}
                >
                  {getPerformanceGrade(metrics.loadTimes.totalLoadTime || 0).grade}
                </span>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          {metrics.memoryUsage && (
            <div className={styles.section}>
              <h3>🧠 Memory Usage</h3>
              <div className={styles.metricsGrid}>
                <div className={styles.metric}>
                  <span className={styles.label}>Used Heap:</span>
                  <span className={styles.value}>
                    {formatBytes(metrics.memoryUsage.usedJSHeapSize || 0)}
                  </span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.label}>Total Heap:</span>
                  <span className={styles.value}>
                    {formatBytes(metrics.memoryUsage.totalJSHeapSize || 0)}
                  </span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.label}>Heap Limit:</span>
                  <span className={styles.value}>
                    {formatBytes(metrics.memoryUsage.jsHeapSizeLimit || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Connection Info */}
          {metrics.connection && (
            <div className={styles.section}>
              <h3>🌐 Connection</h3>
              <div className={styles.metricsGrid}>
                <div className={styles.metric}>
                  <span className={styles.label}>Type:</span>
                  <span className={styles.value}>
                    {metrics.connection.effectiveType || 'Unknown'}
                  </span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.label}>Downlink:</span>
                  <span className={styles.value}>
                    {metrics.connection.downlink ? `${metrics.connection.downlink} Mbps` : 'Unknown'}
                  </span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.label}>RTT:</span>
                  <span className={styles.value}>
                    {metrics.connection.rtt ? `${metrics.connection.rtt}ms` : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* System Info */}
          <div className={styles.section}>
            <h3>💻 System Info</h3>
            <div className={styles.systemInfo}>
              <div className={styles.infoItem}>
                <span className={styles.label}>User Agent:</span>
                <span className={styles.value}>{metrics.userAgent}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Last Updated:</span>
                <span className={styles.value}>
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

PerformanceDashboard.propTypes = {
  userName: PropTypes.string,
  isVisible: PropTypes.bool,
  onClose: PropTypes.func.isRequired
};

export default PerformanceDashboard;
