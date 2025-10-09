# TODO: Fix Duplicate State Management Issues

## Overview
This document outlines the duplicate state management issues found in the codebase that need to be addressed to improve maintainability and prevent potential bugs.

## Critical Issues

### 1. Duplicate Theme State Management
**Problem:** Both `useTheme` hook and `useAppStore` manage theme state independently
- `useTheme` hook manages theme with localStorage
- `useAppStore` manages theme in UI section
- Both are used simultaneously in `App.jsx`

**Files Affected:**
- `src/core/hooks/useTheme.js`
- `src/core/store/useAppStore.js`
- `src/App.jsx`

**Action Required:**
- [ ] Choose one source of truth (recommend `useAppStore`)
- [ ] Remove theme state from `useTheme` hook
- [ ] Update `App.jsx` to use only one theme management system
- [ ] Ensure localStorage persistence is maintained

### 2. Duplicate User State Management
**Problem:** Both `useUserSession` hook and `useAppStore` manage user authentication state
- `useUserSession` manages userName, isLoggedIn, error, login, logout
- `useAppStore` manages user state (name, isLoggedIn, isAdmin)
- Both are used in `App.jsx` causing potential conflicts

**Files Affected:**
- `src/core/hooks/useUserSession.js`
- `src/core/store/useAppStore.js`
- `src/App.jsx`

**Action Required:**
- [ ] Consolidate user state management into `useAppStore`
- [ ] Remove user state from `useUserSession` hook
- [ ] Update `App.jsx` to use only centralized user state
- [ ] Ensure authentication flow remains intact

### 3. Duplicate Admin State Management
**Problem:** Multiple components manage `isAdmin` state independently
- `Profile.jsx` has its own `isAdmin` state
- `TournamentSetup.jsx` has its own `isAdmin` state
- `PerformanceDashboard.jsx` has its own `isAdmin` state

**Files Affected:**
- `src/features/profile/Profile.jsx`
- `src/features/tournament/TournamentSetup.jsx`
- `src/shared/components/PerformanceDashboard/PerformanceDashboard.jsx`

**Action Required:**
- [ ] Move admin state to centralized store
- [ ] Remove individual `isAdmin` state from components
- [ ] Update components to use store's admin state
- [ ] Ensure admin detection logic is centralized

### 4. Duplicate Tournament State Management
**Problem:** Both `useTournament` hook and `useAppStore` manage tournament state
- `useTournament` manages tournament state with localStorage
- `useAppStore` manages tournament state in tournament section
- Both are being used, creating potential synchronization issues

**Files Affected:**
- `src/core/hooks/useTournament.js`
- `src/core/store/useAppStore.js`
- `src/features/tournament/Tournament.jsx`

**Action Required:**
- [ ] Consolidate tournament state into `useAppStore`
- [ ] Remove tournament state from `useTournament` hook
- [ ] Update tournament components to use only centralized state
- [ ] Ensure localStorage persistence is maintained

### 5. Duplicate Error State Management
**Problem:** Both `useErrorHandler` hook and `useAppStore` manage error state
- `useErrorHandler` manages errors array and error handling
- `useAppStore` manages error state in errors section
- Both are used in various components

**Files Affected:**
- `src/core/hooks/useErrorHandler.js`
- `src/core/store/useAppStore.js`
- Multiple components using error handling

**Action Required:**
- [ ] Consolidate error state into `useAppStore`
- [ ] Remove error state from `useErrorHandler` hook
- [ ] Update components to use centralized error state
- [ ] Ensure error handling functionality remains intact

## Code Quality Issues

### 6. Excessive useState in TournamentSetup
**Problem:** `TournamentSetup` component has 20+ individual `useState` calls
- Makes component hard to maintain
- State updates are scattered
- Potential for state synchronization issues

**Files Affected:**
- `src/features/tournament/TournamentSetup.jsx`

**Action Required:**
- [ ] Consolidate related state into objects
- [ ] Move shared state to centralized store
- [ ] Reduce number of individual useState calls
- [ ] Improve state management organization

### 7. localStorage Key Duplication
**Problem:** Different components use different localStorage keys for similar data
- `useTheme` uses 'theme' key
- `useAppStore` might use different keys
- Inconsistent data persistence

**Files Affected:**
- `src/core/hooks/useTheme.js`
- `src/core/store/useAppStore.js`
- `src/core/hooks/useLocalStorage.js`

**Action Required:**
- [ ] Standardize localStorage keys
- [ ] Create constants for all localStorage keys
- [ ] Ensure consistent data persistence
- [ ] Document localStorage usage

## Implementation Priority

### Phase 1: Critical State Consolidation
1. [ ] Fix duplicate theme state management
2. [ ] Fix duplicate user state management
3. [ ] Fix duplicate admin state management

### Phase 2: Tournament and Error State
4. [ ] Fix duplicate tournament state management
5. [ ] Fix duplicate error state management

### Phase 3: Code Quality Improvements
6. [ ] Refactor TournamentSetup useState usage
7. [ ] Standardize localStorage keys

## Testing Requirements
- [ ] Test theme switching functionality
- [ ] Test user login/logout flow
- [ ] Test admin functionality
- [ ] Test tournament state persistence
- [ ] Test error handling
- [ ] Test localStorage data persistence

## Notes
- The centralized `useAppStore` appears to be the most recent and comprehensive approach
- Consider using `useAppStore` as the primary state management solution
- Ensure backward compatibility during refactoring
- Test thoroughly after each change to prevent regressions