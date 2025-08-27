/* eslint-env vitest */
/**
 * @module NavBar.test
 * @description Tests for NavBar component theme switching functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import NavBar from './NavBar';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('NavBar Component', () => {
  const defaultProps = {
    view: 'tournament',
    setView: vi.fn(),
    isLoggedIn: false,
    userName: '',
    onLogout: vi.fn(),
    isLightTheme: true,
    onThemeChange: vi.fn()

  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.setItem.mockClear();
  });

  test('renders theme toggle button', () => {
    render(<NavBar {...defaultProps} />);
    const themeButton = screen.getByRole('button', {
      name: /Switch to dark theme/i
    });
    expect(themeButton).toBeInTheDocument();
  });

  test('theme toggle calls onThemeChange', () => {
    const onThemeChange = vi.fn();
    render(
      <NavBar
        {...defaultProps}
        onThemeChange={onThemeChange}
        isLightTheme={true}
      />
    );

    const themeButton = screen.getByRole('button', {
      name: /Switch to dark theme/i
    });
    fireEvent.click(themeButton);

    expect(onThemeChange).toHaveBeenCalled();
  });

  test('theme toggle button has correct accessibility attributes', () => {
    render(<NavBar {...defaultProps} isLightTheme={true} />);

    const themeButton = screen.getByRole('button', {
      name: /Switch to dark theme/i
    });

    expect(themeButton).toHaveAttribute('aria-label', 'Switch to dark theme');
    expect(themeButton).toHaveAttribute('title', 'Switch to dark theme');
  });

  test('shows correct theme state based on current theme', () => {
    // Test light theme
    const { rerender } = render(
      <NavBar {...defaultProps} isLightTheme={true} />
    );
    const themeButton = screen.getByRole('button', {
      name: /Switch to dark theme/i
    });
    expect(themeButton).toHaveTextContent('🌙');

    // Test dark theme
    rerender(<NavBar {...defaultProps} isLightTheme={false} />);
    const themeButtonDark = screen.getByRole('button', {
      name: /Switch to light theme/i
    });
    expect(themeButtonDark).toHaveTextContent('☀️');
  });

  test('theme toggle button shows correct icon for each theme', () => {
    const { rerender } = render(<NavBar {...defaultProps} isLightTheme={true} />);

    // Light theme should show moon icon
    expect(screen.getByText('🌙')).toBeInTheDocument();

    // Dark theme should show sun icon
    rerender(<NavBar {...defaultProps} isLightTheme={false} />);
    expect(screen.getByText('☀️')).toBeInTheDocument();
  });


  test('renders logo with correct title', () => {
    render(<NavBar {...defaultProps} />);
    // Check that we have at least one logo title (desktop and mobile versions)
    const logoTitles = screen.getAllByText("Aaron's Folly");
    expect(logoTitles.length).toBeGreaterThan(0);
    expect(logoTitles[0]).toBeInTheDocument();
  });

  test('renders navigation items', () => {
    render(<NavBar {...defaultProps} />);
    // Check that we have at least one Tournament link (desktop and mobile versions)
    const tournamentLinks = screen.getAllByText('Tournament');
    expect(tournamentLinks.length).toBeGreaterThan(0);
    expect(tournamentLinks[0]).toBeInTheDocument();
  });

  test('renders user info when logged in', () => {
    render(<NavBar {...defaultProps} isLoggedIn={true} userName="TestUser" />);
    // Check that we have at least one welcome message (desktop and mobile versions)
    const welcomeMessages = screen.getAllByText('Welcome, TestUser');
    expect(welcomeMessages.length).toBeGreaterThan(0);
    expect(welcomeMessages[0]).toBeInTheDocument();
  });

  test('renders logout button when logged in', () => {
    render(<NavBar {...defaultProps} isLoggedIn={true} />);
    // Check that we have at least one logout link (desktop and mobile versions)
    const logoutLinks = screen.getAllByText('Logout');
    expect(logoutLinks.length).toBeGreaterThan(0);
    expect(logoutLinks[0]).toBeInTheDocument();
  });

  test('renders external links when not logged in', () => {
    render(<NavBar {...defaultProps} isLoggedIn={false} />);
    expect(screen.getByText('K-Pop Site')).toBeInTheDocument();
    expect(screen.getByText('Personal Site')).toBeInTheDocument();
  });

  test('mobile menu button toggles mobile menu', () => {
    render(<NavBar {...defaultProps} />);

    const mobileMenuButton = screen.getByRole('button', {
      name: /Open menu/i
    });

    fireEvent.click(mobileMenuButton);

    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
    expect(mobileMenuButton).toHaveAttribute('aria-label', 'Close menu');
  });
});
