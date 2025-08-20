/* eslint-env jest */
import { render, screen } from '@testing-library/react';
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders loading text when provided', () => {
    render(<LoadingSpinner text="Loading..." />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
  });
});
