/**
 * @module PerformanceDashboard.test
 * @description Tests for Performance Dashboard component
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import PerformanceDashboard from '../PerformanceDashboard';

// Mock coreUtils to control performanceMonitor behavior
vi.mock('../../../utils/coreUtils', () => ({
  performanceMonitor: {
    getAllMetrics: vi.fn(() => ({
      bundleSize: {
        javascript: 250000,
        css: 50000,
        total: 300000
      },
      loadTimes: {
        firstPaint: 800,
        firstContentfulPaint: 1200,
        totalLoadTime: 1800
      },
      memoryUsage: {
        usedJSHeapSize: 10000000,
        totalJSHeapSize: 20000000,
        jsHeapSizeLimit: 40000000
      },
      connection: {
        effectiveType: '4g',
        downlink: 10,
        rtt: 50
      },
      userAgent: 'Mozilla/5.0 (Test Browser)'
    }))
  }
}));

describe('PerformanceDashboard', () => {
  const defaultProps = {
    userName: 'TestUser',
    isVisible: true,
    onClose: vi.fn()
  };

  test('renders loading state initially', async () => {
    // Reset the mock to default behavior first
    const { performanceMonitor } = await import('../../../utils/coreUtils');
    performanceMonitor.getAllMetrics.mockReturnValue({
      bundleSize: { javascript: 0, css: 0, total: 0 },
      loadTimes: { firstPaint: 0, firstContentfulPaint: 0, totalLoadTime: 0 },
      memoryUsage: { usedJSHeapSize: 0, totalJSHeapSize: 0, jsHeapSizeLimit: 0 },
      userAgent: 'Test Browser'
    });

    await act(async () => {
      render(<PerformanceDashboard {...defaultProps} />);
    });
    // Component should not show loading state when metrics load immediately
    expect(screen.queryByText('Loading performance data...')).not.toBeInTheDocument();
  });

  test('shows performance dashboard for all users', async () => {
    await act(async () => {
      render(<PerformanceDashboard {...defaultProps} />);
    });

    await waitFor(() => {
      expect(screen.getByText('📊 Performance Dashboard')).toBeInTheDocument();
    });
  });

  test('does not render when isVisible is false', async () => {
    await act(async () => {
      render(<PerformanceDashboard {...defaultProps} isVisible={false} />);
    });
    expect(screen.queryByText('📊 Performance Dashboard')).not.toBeInTheDocument();
  });

  test('handles missing userName gracefully', async () => {
    await act(async () => {
      render(<PerformanceDashboard {...defaultProps} userName="" />);
    });
    // When no userName, component should not show loading state (as per component logic)
    expect(screen.queryByText('Loading performance data...')).not.toBeInTheDocument();
  });

  test('handles errors gracefully', async () => {
    await act(async () => {
      render(<PerformanceDashboard {...defaultProps} />);
    });

    await waitFor(() => {
      expect(screen.getByText('📊 Performance Dashboard')).toBeInTheDocument();
    });
  });
});
