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
This document outlines the duplicate state management issues found in the codebase that need to be resolved to improve maintainability and prevent bugs.

## Critical Issues Found

### 1. Duplicate Tournament State Management
**Problem**: Tournament state is managed in both `useAppStore` (Zustand) and `useTournament` hook
- **Files**: `src/core/store/useAppStore.js` vs `src/core/hooks/useTournament.js`
- **Issue**: Same tournament data (names, ratings, completion status) stored in two different places with different update mechanisms
- **Impact**: High - Can cause state synchronization issues and data inconsistency

### 2. Duplicate User State Management
**Problem**: User authentication state is managed in both `useUserSession` hook and `useAppStore`
- **Files**: `src/core/hooks/useUserSession.js` vs `src/core/store/useAppStore.js`
- **Issue**: User login status, name, and admin status are duplicated across both systems
- **Impact**: High - Can cause authentication state conflicts

### 3. Redundant localStorage Usage
**Problem**: `useUserSession` directly manages localStorage while `useAppStore` also handles persistence
- **Files**: `src/core/hooks/useUserSession.js` lines 66-75
- **Issue**: User data is stored in localStorage twice with different keys
- **Impact**: Medium - Wastes storage and can cause data inconsistency

### 4. Duplicate Tournament State in Tournament Component
**Problem**: `Tournament.jsx` has its own `useTournamentState` hook that duplicates state already managed by `useTournament`
- **Files**: `src/features/tournament/Tournament.jsx` lines 259-350
- **Issue**: Tournament state is managed in three different places: store, hook, and component
- **Impact**: High - Creates unnecessary complexity and potential bugs

### 5. Redundant State Updates in App.jsx
**Problem**: App component manually updates store state that should be handled by the store itself
- **Files**: `src/App.jsx` lines 186-198, 201-203, 255-257
- **Issue**: Manual store updates that duplicate the store's own action methods
- **Impact**: Medium - Violates single source of truth principle

### 6. Duplicate Error State Management
**Problem**: Error state is managed in both `useErrorHandler` hook and `useAppStore`
- **Files**: `src/core/hooks/useErrorHandler.js` vs `src/core/store/useAppStore.js`
- **Issue**: Error handling logic is duplicated across multiple systems
- **Impact**: Medium - Can cause error state conflicts

## Action Items

### Phase 1: Consolidate Core State Management
- [ ] **1.1** Remove tournament state from `useTournament` hook and use only `useAppStore`
  - [ ] Update `useTournament` to read from store instead of managing its own state
  - [ ] Remove `tournamentState` useState from `useTournament`
  - [ ] Update all tournament state updates to use store actions
  - [ ] Test tournament functionality thoroughly

- [ ] **1.2** Consolidate user state management into `useAppStore`
  - [ ] Remove user state from `useUserSession` hook
  - [ ] Update `useUserSession` to only handle authentication logic, not state
  - [ ] Move all user state to `useAppStore`
  - [ ] Update all components using `useUserSession` to use store instead

- [ ] **1.3** Fix localStorage duplication
  - [ ] Remove direct localStorage usage from `useUserSession`
  - [ ] Ensure only `useAppStore` manages localStorage persistence
  - [ ] Update localStorage keys to be consistent
  - [ ] Test persistence across browser sessions

### Phase 2: Clean Up Component State
- [ ] **2.1** Remove duplicate tournament state from Tournament component
  - [ ] Remove `useTournamentState` hook from `Tournament.jsx`
  - [ ] Use only `useTournament` hook (which should read from store)
  - [ ] Remove redundant state variables
  - [ ] Test tournament component functionality

- [ ] **2.2** Clean up App.jsx state management
  - [ ] Remove manual store updates that duplicate store actions
  - [ ] Use only store actions for state changes
  - [ ] Remove redundant state synchronization code
  - [ ] Test app-level functionality

### Phase 3: Consolidate Error Handling
- [ ] **3.1** Consolidate error state management
  - [ ] Remove error state from `useErrorHandler` hook
  - [ ] Use only `useAppStore` for error state management
  - [ ] Update error handling logic to use store actions
  - [ ] Test error handling across the application

### Phase 4: Testing and Validation
- [ ] **4.1** Comprehensive testing
  - [ ] Test all user flows to ensure no functionality is broken
  - [ ] Test state persistence across browser sessions
  - [ ] Test error handling scenarios
  - [ ] Test tournament functionality end-to-end

- [ ] **4.2** Performance validation
  - [ ] Ensure no performance regression from state consolidation
  - [ ] Check for unnecessary re-renders
  - [ ] Validate memory usage improvements

## Implementation Notes

### Key Principles
1. **Single Source of Truth**: All state should be managed in `useAppStore`
2. **Separation of Concerns**: Hooks should handle logic, store should handle state
3. **Consistency**: Use consistent patterns for state management across the app
4. **Testing**: Thoroughly test after each change to prevent regressions

### Files to Modify
- `src/core/store/useAppStore.js` - Central state management
- `src/core/hooks/useTournament.js` - Remove state, keep logic
- `src/core/hooks/useUserSession.js` - Remove state, keep auth logic
- `src/core/hooks/useErrorHandler.js` - Remove state, keep error logic
- `src/features/tournament/Tournament.jsx` - Remove duplicate state
- `src/App.jsx` - Remove redundant state updates

### Risk Mitigation
- Make changes incrementally, one phase at a time
- Test thoroughly after each change
- Keep backup of working state before major changes
- Consider feature flags for gradual rollout if needed

## Success Criteria
- [ ] No duplicate state management patterns remain
- [ ] All state is managed in `useAppStore`
- [ ] All functionality works as before
- [ ] Code is more maintainable and less complex
- [ ] No performance regressions
- [ ] All tests pass

## Estimated Effort
- **Phase 1**: 4-6 hours
- **Phase 2**: 2-3 hours  
- **Phase 3**: 1-2 hours
- **Phase 4**: 2-3 hours
- **Total**: 9-14 hours

---
*This TODO list was generated based on analysis of duplicate state management issues in the codebase.*
