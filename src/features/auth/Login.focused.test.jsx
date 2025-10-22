/**
 * @fileoverview Focused tests for Login component
 */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Login from './Login';

// * Mock fetch for cat facts
globalThis.fetch = vi.fn();

// * Mock useToast hook
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
vi.mock('../../core/hooks/useToast', () => ({
  default: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError
  })
}));

// * Mock validateUsername
vi.mock('../../shared/utils/validationUtils', () => ({
  validateUsername: vi.fn()
}));

describe('Login Component - Focused Tests', () => {
  const mockOnLogin = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    // * Mock successful cat fact fetch
    globalThis.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ fact: 'Cats sleep 12-16 hours per day!' })
    });

    // * Mock scrollIntoView for jsdom environment
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('renders login form in expanded state initially', async () => {
    await act(async () => {
      render(<Login onLogin={mockOnLogin} />);
    });

    expect(screen.getByText('Cat Name Olympics')).toBeInTheDocument();
    expect(
      screen.getByText('Enter your name to login or create a new account')
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('expands form on click', async () => {
    await act(async () => {
      render(<Login onLogin={mockOnLogin} />);
    });

    const formCard = screen
      .getByText('Cat Name Olympics')
      .closest('[tabindex="0"]');

    await act(async () => {
      await user.click(formCard);
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Your name')).toBeInTheDocument();
    });
  });

  it('shows input field when expanded', async () => {
    await act(async () => {
      render(<Login onLogin={mockOnLogin} />);
    });

    const formCard = screen
      .getByText('Cat Name Olympics')
      .closest('[tabindex="0"]');

    await act(async () => {
      await user.click(formCard);
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Your name')).toBeInTheDocument();
    });

    const input = screen.getByLabelText('Your name');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Enter your judge name');
  });

  it('shows submit button when expanded', async () => {
    await act(async () => {
      render(<Login onLogin={mockOnLogin} />);
    });

    const formCard = screen
      .getByText('Cat Name Olympics')
      .closest('[tabindex="0"]');

    await act(async () => {
      await user.click(formCard);
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /get random name & start/i })
      ).toBeInTheDocument();
    });
  });

  it('handles form submission with random name', async () => {
    const { validateUsername } = await import(
      '../../shared/utils/validationUtils'
    );
    validateUsername.mockReturnValue({
      success: true,
      value: 'Captain Whiskers'
    });
    mockOnLogin.mockResolvedValue(true);

    await act(async () => {
      render(<Login onLogin={mockOnLogin} />);
    });

    const formCard = screen
      .getByText('Cat Name Olympics')
      .closest('[tabindex="0"]');

    await act(async () => {
      await user.click(formCard);
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /get random name & start/i })
      ).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', {
      name: /get random name & start/i
    });

    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith('Captain Whiskers');
    });
  });

  it('handles form submission with entered name', async () => {
    const { validateUsername } = await import(
      '../../shared/utils/validationUtils'
    );
    validateUsername.mockReturnValue({ success: true, value: 'Test User' });
    mockOnLogin.mockResolvedValue(true);

    await act(async () => {
      render(<Login onLogin={mockOnLogin} />);
    });

    const formCard = screen
      .getByText('Cat Name Olympics')
      .closest('[tabindex="0"]');

    await act(async () => {
      await user.click(formCard);
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Your name')).toBeInTheDocument();
    });

    const input = screen.getByLabelText('Your name');
    await act(async () => {
      await user.type(input, 'Test User');
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /continue/i })
      ).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /continue/i });

    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith('Test User');
    });
  });

  it('shows error for invalid username', async () => {
    const { validateUsername } = await import(
      '../../shared/utils/validationUtils'
    );
    const errorMessage = 'That name is cursed by ancient cat magic.';

    validateUsername.mockReturnValue({
      success: false,
      error: errorMessage
    });

    await act(async () => {
      render(<Login onLogin={mockOnLogin} />);
    });

    const formCard = screen
      .getByText('Cat Name Olympics')
      .closest('[tabindex="0"]');

    await act(async () => {
      await user.click(formCard);
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Your name')).toBeInTheDocument();
    });

    const input = screen.getByLabelText('Your name');
    await act(async () => {
      await user.type(input, 'A');
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /continue/i })
      ).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /continue/i });

    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(errorMessage);
    });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(mockOnLogin).not.toHaveBeenCalled();

    validateUsername.mockReset();
  });
});
