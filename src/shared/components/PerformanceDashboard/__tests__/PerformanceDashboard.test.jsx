/**
 * @module PerformanceDashboard.test
 * @description Tests for Performance Dashboard component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import PerformanceDashboard from '../PerformanceDashboard';

// Mock the performance monitor
const mockPerformanceMonitor = {
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
};

vi.mock('../../utils/performanceMonitor', () => ({
  default: mockPerformanceMonitor
}));

// Mock the auth utils
const mockIsUserAdmin = vi.fn();
vi.mock('../../utils/authUtils', () => ({
  isUserAdmin: mockIsUserAdmin
}));

describe('PerformanceDashboard', () => {
  const defaultProps = {
    userName: 'TestUser',
    isVisible: true,
    onClose: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsUserAdmin.mockResolvedValue(true);
  });

  test('renders loading state initially', () => {
    render(<PerformanceDashboard {...defaultProps} />);
    expect(screen.getByText('Loading performance data...')).toBeInTheDocument();
  });

  test('shows unauthorized message for non-admin users', async () => {
    mockIsUserAdmin.mockResolvedValue(false);
    
    render(<PerformanceDashboard {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('🔒 Access Denied')).toBeInTheDocument();
      expect(screen.getByText('Performance dashboard is only available to administrators.')).toBeInTheDocument();
    });
  });

  test('renders performance metrics for admin users', async () => {
    render(<PerformanceDashboard {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('📊 Performance Dashboard')).toBeInTheDocument();
      expect(screen.getByText('📦 Bundle Size')).toBeInTheDocument();
      expect(screen.getByText('⏱️ Load Performance')).toBeInTheDocument();
    });
  });

  test('displays bundle size metrics correctly', async () => {
    render(<PerformanceDashboard {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('JavaScript:')).toBeInTheDocument();
      expect(screen.getByText('CSS:')).toBeInTheDocument();
      expect(screen.getByText('Total:')).toBeInTheDocument();
    });
  });

  test('displays load time metrics correctly', async () => {
    render(<PerformanceDashboard {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('First Paint:')).toBeInTheDocument();
      expect(screen.getByText('First Contentful Paint:')).toBeInTheDocument();
      expect(screen.getByText('Total Load Time:')).toBeInTheDocument();
    });
  });

  test('displays memory usage when available', async () => {
    render(<PerformanceDashboard {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('🧠 Memory Usage')).toBeInTheDocument();
      expect(screen.getByText('Used Heap:')).toBeInTheDocument();
      expect(screen.getByText('Total Heap:')).toBeInTheDocument();
    });
  });

  test('displays connection info when available', async () => {
    render(<PerformanceDashboard {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('🌐 Connection')).toBeInTheDocument();
      expect(screen.getByText('Type:')).toBeInTheDocument();
      expect(screen.getByText('Downlink:')).toBeInTheDocument();
    });
  });

  test('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<PerformanceDashboard {...defaultProps} onClose={onClose} />);
    
    await waitFor(() => {
      const closeButton = screen.getByTitle('Close dashboard');
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    });
  });

  test('calls onClose when refresh button is clicked', async () => {
    const onClose = vi.fn();
    render(<PerformanceDashboard {...defaultProps} onClose={onClose} />);
    
    await waitFor(() => {
      const refreshButton = screen.getByTitle('Refresh metrics');
      fireEvent.click(refreshButton);
      // Should not call onClose, just refresh
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  test('does not render when isVisible is false', () => {
    render(<PerformanceDashboard {...defaultProps} isVisible={false} />);
    expect(screen.queryByText('📊 Performance Dashboard')).not.toBeInTheDocument();
  });

  test('handles missing userName gracefully', async () => {
    mockIsUserAdmin.mockResolvedValue(false);
    render(<PerformanceDashboard {...defaultProps} userName="" />);
    
    await waitFor(() => {
      expect(screen.getByText('🔒 Access Denied')).toBeInTheDocument();
    });
  });

  test('handles authentication errors gracefully', async () => {
    mockIsUserAdmin.mockRejectedValue(new Error('Auth error'));
    render(<PerformanceDashboard {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('🔒 Access Denied')).toBeInTheDocument();
    });
  });

  test('formats bytes correctly', async () => {
    render(<PerformanceDashboard {...defaultProps} />);
    
    await waitFor(() => {
      // Should display formatted bytes (e.g., "250 KB", "50 KB")
      expect(screen.getByText(/250 KB/)).toBeInTheDocument();
      expect(screen.getByText(/50 KB/)).toBeInTheDocument();
    });
  });

  test('formats time correctly', async () => {
    render(<PerformanceDashboard {...defaultProps} />);
    
    await waitFor(() => {
      // Should display formatted time (e.g., "0.8s", "1.2s")
      expect(screen.getByText(/0\.8s/)).toBeInTheDocument();
      expect(screen.getByText(/1\.2s/)).toBeInTheDocument();
    });
  });

  test('shows performance grades', async () => {
    render(<PerformanceDashboard {...defaultProps} />);
    
    await waitFor(() => {
      // Should show performance grades (A+, A, B, etc.)
      const gradeElements = screen.getAllByText(/^[A-D][+]?$/);
      expect(gradeElements.length).toBeGreaterThan(0);
    });
  });
});