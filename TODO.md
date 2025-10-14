# TODO: Codebase Maintenance Tasks

## Overview
This document outlines various maintenance tasks for the codebase, including state management consolidation and styling optimization.

## ✅ COMPLETED TASKS

### CSS Styling Audit and Cleanup
**Status**: ✅ Completed  
**Task**: Audit src styling files for unused classes/selectors and remove confirmed unused styling rules while preserving design.

**Summary**:
- **Total Lines Removed**: ~600+ lines of unused CSS
- **Files Cleaned**: 3 major styling files
- **Design Preserved**: All essential styling and functionality maintained
- **Performance Impact**: Reduced CSS bundle size and improved maintainability

**Key Changes**:
- Removed Vibrant Color System (200+ lines)
- Removed Mobile Utility Classes
- Removed Responsive Utilities
- Removed Hover/Focus Utilities
- Removed Animation Utilities
- Preserved Core Functionality

---

## 🚧 IN PROGRESS TASKS

### State Management Consolidation
**Status**: 🚧 In Progress  
**Priority**: High  
**Task**: Fix duplicate state management issues to improve maintainability and prevent potential bugs.

**Current Status**: Partially implemented - `useAppStore` is the primary store, but hooks still manage their own state

### Critical Issues Identified

#### 1. Duplicate User State Management ⚠️ HIGH PRIORITY
**Problem**: Both `useUserSession` hook and `useAppStore` manage user authentication state
- `useUserSession` manages: userName, isLoggedIn, error, login, logout
- `useAppStore` manages: user.name, user.isLoggedIn, user.isAdmin
- Both are used simultaneously in `App.jsx` causing potential conflicts

**Files Affected**:
- `src/core/hooks/useUserSession.js` (lines 66-76, 145-198)
- `src/core/store/useAppStore.js` (lines 24-29, 116-157)
- `src/App.jsx` (lines 35, 42-53)

**Action Required**:
- [ ] **1.1** Refactor `useUserSession` to only handle authentication logic
- [ ] **1.2** Move all user state management to `useAppStore`
- [ ] **1.3** Update `App.jsx` to use only store for user state
- [ ] **1.4** Ensure localStorage persistence is maintained through store

#### 2. Duplicate Tournament State Management ⚠️ HIGH PRIORITY
**Problem**: Both `useTournament` hook and `useAppStore` manage tournament state
- `useTournament` manages: tournamentState with useState (lines 31-41)
- `useAppStore` manages: tournament section (lines 14-21, 49-113)
- Both are being used, creating potential synchronization issues

**Files Affected**:
- `src/core/hooks/useTournament.js` (lines 31-41, 44-59)
- `src/core/store/useAppStore.js` (lines 14-21, 49-113)
- `src/App.jsx` (lines 46-53, 69-96, 104-125)

**Action Required**:
- [ ] **2.1** Remove `tournamentState` useState from `useTournament` hook
- [ ] **2.2** Update `useTournament` to read from store instead of managing state
- [ ] **2.3** Update all tournament state updates to use store actions
- [ ] **2.4** Test tournament functionality thoroughly

#### 3. Theme State Duplication ⚠️ MEDIUM PRIORITY
**Problem**: Both `useTheme` hook and `useAppStore` manage theme state
- `useTheme` manages theme with localStorage
- `useAppStore` manages theme in UI section
- Both are used simultaneously in `App.jsx`

**Files Affected**:
- `src/core/hooks/useTheme.js`
- `src/core/store/useAppStore.js` (lines 33, 161-175)
- `src/App.jsx` (lines 36, 158-160)

**Action Required**:
- [ ] **3.1** Choose one source of truth (recommend `useAppStore`)
- [ ] **3.2** Remove theme state from `useTheme` hook
- [ ] **3.3** Update `App.jsx` to use only one theme management system
- [ ] **3.4** Ensure localStorage persistence is maintained

#### 4. Error State Duplication ⚠️ MEDIUM PRIORITY
**Problem**: Both `useErrorHandler` hook and `useAppStore` manage error state
- `useErrorHandler` manages errors array and error handling
- `useAppStore` manages error state in errors section
- Both are used in various components

**Files Affected**:
- `src/core/hooks/useErrorHandler.js`
- `src/core/store/useAppStore.js` (lines 43-46, 235-274)
- Multiple components using error handling

**Action Required**:
- [ ] **4.1** Consolidate error state into `useAppStore`
- [ ] **4.2** Remove error state from `useErrorHandler` hook
- [ ] **4.3** Update components to use centralized error state
- [ ] **4.4** Ensure error handling functionality remains intact

### Code Quality Issues

#### 5. localStorage Key Inconsistency ⚠️ LOW PRIORITY
**Problem**: Different components use different localStorage keys
- `useUserSession` uses 'catNamesUser' key
- `useTheme` likely uses 'theme' key
- Inconsistent data persistence patterns

**Action Required**:
- [ ] **5.1** Standardize localStorage keys
- [ ] **5.2** Create constants for all localStorage keys
- [ ] **5.3** Ensure consistent data persistence through store

---

## 📋 IMPLEMENTATION PLAN

### Phase 1: User State Consolidation (Priority: HIGH)
**Estimated Time**: 2-3 hours
- [ ] **1.1** Refactor `useUserSession` to remove state management
- [ ] **1.2** Update `useUserSession` to only handle authentication logic
- [ ] **1.3** Move user state to `useAppStore` with localStorage persistence
- [ ] **1.4** Update `App.jsx` to use store for user state
- [ ] **1.5** Test user login/logout flow

### Phase 2: Tournament State Consolidation (Priority: HIGH)
**Estimated Time**: 3-4 hours
- [ ] **2.1** Remove `tournamentState` from `useTournament` hook
- [ ] **2.2** Update `useTournament` to read from store
- [ ] **2.3** Update tournament state updates to use store actions
- [ ] **2.4** Test tournament functionality end-to-end

### Phase 3: Theme & Error State (Priority: MEDIUM)
**Estimated Time**: 1-2 hours
- [ ] **3.1** Consolidate theme state management
- [ ] **3.2** Consolidate error state management
- [ ] **3.3** Test theme switching and error handling

### Phase 4: Testing & Validation (Priority: HIGH)
**Estimated Time**: 1-2 hours
- [ ] **4.1** Comprehensive testing of all user flows
- [ ] **4.2** Test state persistence across browser sessions
- [ ] **4.3** Performance validation
- [ ] **4.4** Fix any regressions

---

## 🎯 SUCCESS CRITERIA
- [ ] No duplicate state management patterns remain
- [ ] All state is managed in `useAppStore`
- [ ] All functionality works as before
- [ ] Code is more maintainable and less complex
- [ ] No performance regressions
- [ ] All tests pass

---

---

## 🔮 FUTURE TASKS

### Performance Optimization
**Priority**: Medium
- [ ] **P.1** Implement React.memo for expensive components
- [ ] **P.2** Add lazy loading for heavy components
- [ ] **P.3** Optimize re-renders in tournament components
- [ ] **P.4** Add performance monitoring

### Code Quality Improvements
**Priority**: Low
- [ ] **C.1** Add comprehensive unit tests
- [ ] **C.2** Improve TypeScript coverage
- [ ] **C.3** Add ESLint rules for state management
- [ ] **C.4** Refactor large components into smaller ones

### Feature Enhancements
**Priority**: Low
- [ ] **F.1** Add tournament history persistence
- [ ] **F.2** Implement user preferences
- [ ] **F.3** Add tournament sharing functionality
- [ ] **F.4** Improve mobile experience

---

## 📝 NOTES
- The centralized `useAppStore` is the most recent and comprehensive approach
- All state should be managed in `useAppStore` as the single source of truth
- Hooks should handle logic, store should handle state
- Test thoroughly after each change to prevent regressions
- Focus on Phase 1 and 2 first as they address the most critical issues
