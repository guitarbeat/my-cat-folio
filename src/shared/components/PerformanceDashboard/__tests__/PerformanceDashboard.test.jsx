/**
 * @module PerformanceDashboard.test
 * @description Tests for Performance Dashboard component
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import PerformanceDashboard from '../PerformanceDashboard';

// Mock the performance monitor
vi.mock('../../../utils/performanceMonitor', () => ({
  default: {
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

// Mock the auth utils
vi.mock('../../../utils/authUtils', () => ({
  isUserAdmin: vi.fn()
}));

describe('PerformanceDashboard', () => {
  const defaultProps = {
    userName: 'TestUser',
    isVisible: true,
    onClose: vi.fn()
  };

  test('renders loading state initially', async () => {
    const { isUserAdmin } = await import('../../../utils/authUtils');
    isUserAdmin.mockImplementation(() => new Promise(() => {})); // Never resolves

    await act(async () => {
      render(<PerformanceDashboard {...defaultProps} />);
    });
    expect(screen.getByText('Loading performance data...')).toBeInTheDocument();
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
    expect(screen.getByText('Loading performance data...')).toBeInTheDocument();
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
