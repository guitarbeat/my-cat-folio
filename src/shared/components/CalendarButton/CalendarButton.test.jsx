import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import CalendarButton from './CalendarButton';

describe('CalendarButton', () => {
  const originalOpen = window.open;

  beforeEach(() => {
    window.open = vi.fn();
  });

  afterEach(() => {
    window.open = originalOpen;
    vi.restoreAllMocks();
  });

  it('excludes hidden names from the calendar payload', () => {
    const rankings = [
      { id: 1, name: 'Whiskers', rating: 1600 },
      { id: 2, name: 'Shadow', rating: 1500 }
    ];
    const hiddenNames = new Set([2]);

    const { getByRole } = render(
      <CalendarButton
        rankings={rankings}
        userName="Test User"
        hiddenNames={hiddenNames}
      />
    );

    fireEvent.click(getByRole('button', { name: /add to google calendar/i }));

    expect(window.open).toHaveBeenCalledTimes(1);
    const [[url]] = window.open.mock.calls;
    const [, queryString] = url.split('?');
    const params = new URLSearchParams(queryString);
    const details = params.get('details');

    expect(details).toContain('Whiskers');
    expect(details).not.toContain('Shadow');
  });
});
