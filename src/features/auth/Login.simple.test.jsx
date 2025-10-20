/**
 * @fileoverview Simple tests for Login component
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Login from "./Login";

// * Mock fetch for cat facts
global.fetch = vi.fn();

// * Mock useToast hook
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
vi.mock("../../core/hooks/useToast", () => ({
  default: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));

// * Mock validateUsername
vi.mock("../../shared/utils/validationUtils", () => ({
  validateUsername: vi.fn(),
}));

describe("Login Component - Simple Tests", () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // * Mock successful cat fact fetch
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ fact: "Cats sleep 12-16 hours per day!" }),
    });
  });

  it("renders without crashing", () => {
    expect(() => render(<Login onLogin={mockOnLogin} />)).not.toThrow();
  });

  it("renders main title", () => {
    render(<Login onLogin={mockOnLogin} />);
    expect(screen.getByText("Ready to Judge the Names?")).toBeInTheDocument();
  });

  it("renders login form title", () => {
    render(<Login onLogin={mockOnLogin} />);
    expect(screen.getByText("Cat Name Olympics")).toBeInTheDocument();
  });

  it("renders login subtitle", () => {
    render(<Login onLogin={mockOnLogin} />);
    expect(
      screen.getByText("Enter your name to login or create a new account")
    ).toBeInTheDocument();
  });

  it("renders collapsed description", () => {
    render(<Login onLogin={mockOnLogin} />);
    expect(
      screen.getByText(/Hover or focus here to open the judge/)
    ).toBeInTheDocument();
  });
});
