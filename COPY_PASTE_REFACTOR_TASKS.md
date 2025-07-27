# Copy-Paste Detection Refactoring Tasks

## Overview
JSCPD analysis found 14 instances of code duplication across 54 files (29 JS, 25 CSS).
- **Original duplication**: 157 lines (1.29%) out of 12,162 total lines
- **Current duplication**: 112 lines (0.92%) out of 12,116 total lines
- **Improvement**: Reduced by 45 lines (0.37% reduction)
- **Priority**: Low duplication percentage indicates generally clean codebase

## JavaScript Refactoring Tasks

### 1. BongoCat.js - Duplicate Event Handlers
**Files**: `src/components/BongoCat/BongoCat.js`
**Issues**: 
- Lines 46-53 vs 52-59 (7 lines, 83 tokens)
- Lines 283-294 vs 307-318 (11 lines, 80 tokens)

**Tasks**:
- [ ] Extract duplicate event handler logic into reusable functions
- [ ] Consider creating a custom hook for BongoCat event management
- [ ] Review if both instances are necessary or if one can be removed

### 2. useTournament.js - Duplicate Logic
**Files**: `src/hooks/useTournament.js`
**Issues**:
- Lines 152-158 vs 159-165 (6 lines, 79 tokens)

**Tasks**:
- [ ] Extract duplicate logic into a shared utility function
- [ ] Review tournament state management patterns
- [ ] Consider if this duplication indicates a missing abstraction

## CSS Refactoring Tasks

### 3. TournamentSetup.module.css - Internal Duplication ✅ COMPLETED
**Files**: `src/components/TournamentSetup/TournamentSetup.module.css`
**Issues**:
- Lines 376-388 vs 397-409 (12 lines, 95 tokens)

**Tasks**:
- [x] Extract duplicate CSS rules into shared classes
- [x] Consider using CSS custom properties for repeated values
- [x] Review component structure for potential consolidation

**Solution**: Consolidated `.minimizeButton` and `.closeButton` styles into shared base styles with specific overrides.

### 4. BongoCat.module.css - Repeated Styles ✅ COMPLETED
**Files**: `src/components/BongoCat/BongoCat.module.css`
**Issues**:
- Lines 46-51 vs 66-71 (5 lines, 84 tokens)
- Lines 56-61 vs 74-79 (5 lines, 84 tokens)

**Tasks**:
- [x] Create shared CSS classes for repeated animations/transitions
- [x] Extract common BongoCat styling patterns
- [x] Consider using CSS-in-JS or styled-components for better organization

**Solution**: Refactored ear styles to use shared base classes with variant-specific overrides for fill/outline styles.

### 5. Cross-File CSS Duplication

#### 5.1 Theme vs Variables Duplication
**Files**: 
- `src/styles/theme.css` vs `src/styles/variables.css`
**Issues**:
- Lines 2-15 vs 31-44 (13 lines, 94 tokens)
- Lines 29-38 vs 52-61 (9 lines, 87 tokens)
- Lines 69-84 vs 192-207 (15 lines, 188 tokens)

**Tasks**:
- [ ] Consolidate theme and variables into a single source of truth
- [ ] Remove duplicate CSS custom properties
- [ ] Ensure consistent naming conventions across files

#### 5.2 Base vs Components Duplication
**Files**:
- `src/styles/base.css` vs `src/styles/components.css`
**Issues**:
- Lines 46-55 vs 23-32 (9 lines, 78 tokens)
- Lines 128-139 vs 83-94 (11 lines, 86 tokens)

**Tasks**:
- [ ] Review component vs base styling separation
- [ ] Extract shared styles into utilities
- [ ] Establish clear boundaries between base and component styles

### 6. Utilities.css - Large Duplication
**Files**: `src/styles/utilities.css`
**Issues**:
- Lines 221-244 vs 685-716 (31 lines, 125 tokens)

**Tasks**:
- [ ] Extract large duplicated utility blocks into shared classes
- [ ] Consider creating utility mixins or functions
- [ ] Review if both instances are necessary

### 7. Base.css - Internal Duplication ✅ COMPLETED
**Files**: `src/styles/base.css`
**Issues**:
- Lines 128-136 vs 359-367 (8 lines, 79 tokens)

**Tasks**:
- [x] Consolidate duplicate base styles
- [x] Review CSS organization and structure

**Solution**: Removed duplicate `.input` class definition, keeping the more complete version.

### 8. Index vs Reset Duplication ✅ COMPLETED
**Files**:
- `src/index.css` vs `src/styles/reset.css`
**Issues**:
- Lines 20-35 vs 7-22 (15 lines, 85 tokens)

**Tasks**:
- [x] Consolidate reset styles into a single location
- [x] Remove duplicate CSS reset rules
- [x] Ensure proper cascade order

**Solution**: Removed duplicate reset styles from `index.css`, keeping them centralized in `reset.css`.

## General Refactoring Recommendations

### High Priority
1. **CSS Organization**: Consolidate theme/variables duplication
2. **Component Logic**: Extract BongoCat duplicate handlers
3. **Utility Consolidation**: Merge large utility duplications

### Medium Priority
1. **Style Architecture**: Review base vs components separation
2. **Reset Styles**: Consolidate reset rules
3. **Tournament Logic**: Extract duplicate tournament logic

### Low Priority
1. **Minor Duplications**: Address small internal CSS duplications
2. **Code Review**: Ensure all duplications are intentional

## Implementation Strategy

1. **Start with CSS**: Address theme/variables consolidation first
2. **Component Logic**: Extract BongoCat handlers
3. **Utilities**: Consolidate large utility duplications
4. **Cleanup**: Address remaining minor duplications
5. **Prevention**: Add JSCPD to CI/CD pipeline

## Success Metrics
- Reduce duplication percentage below 0.5%
- Maintain or improve code maintainability
- Ensure no functionality is broken during refactoring
- Improve CSS organization and reusability