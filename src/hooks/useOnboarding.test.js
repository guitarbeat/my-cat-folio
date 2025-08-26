import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import useOnboarding from './useOnboarding';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useOnboarding', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should show onboarding by default when localStorage is empty', () => {
    const { result } = renderHook(() => useOnboarding());

    expect(result.current.showOnboarding).toBe(true);
    expect(result.current.hasSeenOnboarding).toBe(false);
  });

  it('should not show onboarding when localStorage has seen flag', () => {
    localStorageMock.getItem.mockReturnValue('true');

    const { result } = renderHook(() => useOnboarding());

    expect(result.current.showOnboarding).toBe(false);
    expect(result.current.hasSeenOnboarding).toBe(true);
  });

  it('should close onboarding when closeOnboarding is called', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.closeOnboarding();
    });

    expect(result.current.showOnboarding).toBe(false);
  });

  it('should set dont show again flag and close onboarding', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.dontShowAgain();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('catNameTournament_onboardingSeen', 'true');
    expect(result.current.showOnboarding).toBe(false);
    expect(result.current.hasSeenOnboarding).toBe(true);
  });

  it('should reset onboarding when resetOnboarding is called', () => {
    localStorageMock.getItem.mockReturnValue('true');
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.resetOnboarding();
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('catNameTournament_onboardingSeen');
    expect(result.current.showOnboarding).toBe(true);
    expect(result.current.hasSeenOnboarding).toBe(false);
  });
});
