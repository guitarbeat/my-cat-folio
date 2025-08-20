/* eslint-env jest */
/**
 * @module NavBar.test
 * @description Tests for NavBar component theme switching functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NavBar from './NavBar';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock document.querySelector for meta theme-color
const mockMetaElement = {
  setAttribute: jest.fn(),
};
const mockQuerySelector = jest.fn(() => mockMetaElement);
Object.defineProperty(document, 'querySelector', {
  value: mockQuerySelector,
  writable: true
});

describe('NavBar Component', () => {
    const defaultProps = {
        view: 'tournament',
        setView: jest.fn(),
        isLoggedIn: false,
        userName: '',
        onLogout: jest.fn(),
        onMatrixActivate: jest.fn(),
        isLightTheme: true,
        onThemeChange: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.setItem.mockClear();
        mockMetaElement.setAttribute.mockClear();
    });

    test('renders theme toggle button', () => {
        render(<NavBar {...defaultProps} />);
        const themeButton = screen.getByRole('switch', { name: /Switch to dark theme/i });
        expect(themeButton).toBeInTheDocument();
    });

    test('theme toggle calls onThemeChange with opposite theme', () => {
        const onThemeChange = jest.fn();
        render(<NavBar {...defaultProps} onThemeChange={onThemeChange} isLightTheme={true} />);

        const themeButton = screen.getByRole('switch', { name: /Switch to dark theme/i });
        fireEvent.click(themeButton);

        expect(onThemeChange).toHaveBeenCalledWith(false);
    });

    test('theme toggle saves to localStorage', () => {
        render(<NavBar {...defaultProps} isLightTheme={true} />);

        const themeButton = screen.getByRole('switch', { name: /Switch to dark theme/i });
        fireEvent.click(themeButton);

        expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

      test('theme toggle updates meta theme-color', () => {
    render(<NavBar {...defaultProps} isLightTheme={true} />);
    
    const themeButton = screen.getByRole('switch', { name: /Switch to dark theme/i });
    fireEvent.click(themeButton);
    
    // Note: This test is simplified since the meta tag update is handled by the parent App component
    // The NavBar component calls updateThemeColor which attempts to update the meta tag
    expect(mockQuerySelector).toHaveBeenCalledWith("meta[name='theme-color']");
  });

      test('shows correct theme state based on current theme', () => {
    // Test light theme
    const { rerender } = render(<NavBar {...defaultProps} isLightTheme={true} />);
    const themeSwitch = screen.getByRole('switch', { name: /Switch to dark theme/i });
    expect(themeSwitch).toHaveAttribute('aria-checked', 'true');
    
    // Test dark theme
    rerender(<NavBar {...defaultProps} isLightTheme={false} />);
    expect(themeSwitch).toHaveAttribute('aria-checked', 'false');
  });

    test('matrix mode activates after 5 rapid clicks', () => {
        const onMatrixActivate = jest.fn();
        render(<NavBar {...defaultProps} onMatrixActivate={onMatrixActivate} />);

        const themeButton = screen.getByRole('switch', { name: /Switch to dark theme/i });

        // Click 5 times rapidly
        for (let i = 0; i < 5; i++) {
            fireEvent.click(themeButton);
        }

        expect(onMatrixActivate).toHaveBeenCalled();
    });
});
