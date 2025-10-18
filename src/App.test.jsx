import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders primary navigation landmarks for users', () => {
    render(<App />);

    // * Skip link provides direct access to main content for keyboard users
    const skipLink = screen.getByRole('link', {
      name: /skip to main content/i
    });
    expect(skipLink).toBeVisible();
    expect(skipLink).toHaveAttribute('href', '#main-content');

    // * The sidebar logo button offers a stable way to navigate home
    const homeButton = screen.getByRole('button', { name: /go to home page/i });
    expect(homeButton).toBeInTheDocument();
  });
});
