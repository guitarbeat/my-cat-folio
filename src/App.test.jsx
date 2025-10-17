import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders primary navigation landmarks for users', () => {
    render(<App />);

    // * Skip link provides direct access to main content for keyboard users
    expect(
      screen.getByRole('link', { name: /skip to main content/i })
    ).toBeInTheDocument();

    // * Main navigation should be present as the key entry point into the app
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    // * Verify a couple of user-facing navigation items to ensure core UI loads
    expect(screen.getByText(/aaron's folly/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /k-pop site/i })
    ).toBeInTheDocument();
  });
});
