# CSS Consolidation Fixes - TODO

## Overview
This document identifies the CSS composition mismatches that need to be fixed after consolidating all styles into `global.css`. Components are trying to compose from classes that either don't exist or have different names.

## Priority Levels
- 🔴 **CRITICAL**: Component completely unstyled, breaks functionality
- 🟡 **HIGH**: Major visual issues, affects user experience
- 🟢 **MEDIUM**: Minor styling issues, cosmetic problems

## File-by-File Fixes Required

### 🔴 `src/components/Tournament/Tournament.module.css`
**Total Issues: 18**

#### Missing Classes (Need to be added to global.css):
- `flex-center` - Line 383: `composes: flex-center from "../../styles/base.css";`
- `textsm` - Line 74: `composes: textsm from "../../styles/base.css";`

#### Case Sensitivity Mismatches (Need to be fixed in global.css):
- `cardinteractive` → `cardInteractive` (Lines: 97, 170, 184, 211, 225, 299, 698)
- `btnprimary` → `btnPrimary` (Lines: 184, 211, 389, 393)
- `btnsecondary` → `btnSecondary` (Lines: 170, 225, 299, 698)

#### Existing Classes (Already in global.css):
- `container` - Line 19: ✅ exists
- `flex-col` - Line 62: ✅ exists
- `modal` - Line 356: ✅ exists
- `modalbackdrop` - Line 365: ✅ exists
- `heading2` - Line 375: ✅ exists
- `text` - Line 379: ✅ exists

---

### 🔴 `src/components/TournamentSetup/TournamentSetup.module.css`
**Total Issues: 12**

#### Missing Classes (Need to be added to global.css):
- `heading3` - Line 92: `composes: heading3 from "../../styles/base.css";`
- `text` - Line 97: `composes: text from "../../styles/base.css";`

#### Case Sensitivity Mismatches (Need to be fixed in global.css):
- `cardinteractive` → `cardInteractive` (Lines: 111, 176, 209)
- `btnprimary` → `btnPrimary` (Lines: 148, 261)
- `btnsecondary` → `btnSecondary` (Lines: 35, 130)
- `btnicon` → `btnIcon` (Line 374)

#### Existing Classes (Already in global.css):
- `container` - Line 2: ✅ exists
- `card` - Line 524: ✅ exists

---

### 🔴 `src/components/Results/Results.module.css`
**Total Issues: 7**

#### Case Sensitivity Mismatches (Need to be fixed in global.css):
- `cardinteractive` → `cardInteractive` (Lines: 91, 206, 406)
- `btnprimary` → `btnPrimary` (Lines: 136, 421)

#### Existing Classes (Already in global.css):
- `container` - Line 3: ✅ exists

#### Missing Classes (Need to be added to global.css):
- `toast` - Lines: 192, 199: `composes: toast;` (no from path specified)

---

### 🔴 `src/components/ErrorBoundary/ErrorBoundary.module.css`
**Total Issues: 5**

#### Case Sensitivity Mismatches (Need to be fixed in global.css):
- `cardinteractive` → `cardInteractive` (Line 13)
- `btnprimary` → `btnPrimary` (Line 39)

#### Missing Classes (Need to be added to global.css):
- `heading2` - Line 26: `composes: heading2 from "../../styles/base.css";`
- `text` - Line 32: `composes: text from "../../styles/base.css";`

#### Existing Classes (Already in global.css):
- `container` - Line 1: ✅ exists

---

### 🔴 `src/components/Profile/Profile.module.css`
**Total Issues: 3**

#### Case Sensitivity Mismatches (Need to be fixed in global.css):
- `btnprimary` → `btnPrimary` (Line 125)

#### Missing Classes (Need to be added to global.css):
- `btn` - Line 92: `composes: btn from "../../styles/base.css";`
- `btndanger` → `btnDanger` (Line 113)

---

### 🔴 `src/components/NameCard/NameCard.module.css`
**Total Issues: 3**

#### Case Sensitivity Mismatches (Need to be fixed in global.css):
- `cardinteractive` → `cardInteractive` (Line 1)

#### Missing Classes (Need to be added to global.css):
- `heading3` - Line 30: `composes: heading3 from "../../styles/base.css";`
- `text` - Line 37: `composes: text from "../../styles/base.css";`

---

### 🔴 `src/components/Bracket/Bracket.module.css`
**Total Issues: 10**

#### Case Sensitivity Mismatches (Need to be fixed in global.css):
- `cardinteractive` → `cardInteractive` (Lines: 1, 42, 109)

#### Missing Classes (Need to be added to global.css):
- `player` - Lines: 144, 152, 159, 167, 175: `composes: player;`
- `winnerBadge` - Lines: 200, 206: `composes: winnerBadge;`

#### Existing Classes (Already in global.css):
- `container` - Line 0: ✅ exists

---

### 🟡 `src/components/RankingAdjustment/RankingAdjustment.css`
**Total Issues: 2**

#### Missing Classes (Need to be added to global.css):
- `control-primary` - Line 325: `composes: control-primary;`
- `control-secondary` - Line 329: `composes: control-secondary;`

---

## Summary of Required Fixes

### 🔴 **CRITICAL - Fix Case Sensitivity (Total: 25 instances)**
1. `cardinteractive` → `cardInteractive` (11 instances)
2. `btnprimary` → `btnPrimary` (8 instances)  
3. `btnsecondary` → `btnSecondary` (6 instances)

### 🔴 **CRITICAL - Add Missing Base Classes (Total: 15 classes)**
1. `flex-center` - Layout utility
2. `textsm` - Typography utility
3. `heading2` - Typography component
4. `heading3` - Typography component
5. `text` - Typography component
6. `btn` - Button base
7. `btndanger` - Button variant
8. `btnicon` - Button variant
9. `toast` - Notification component
10. `player` - Bracket component
11. `winnerBadge` - Bracket component
12. `control-primary` - Form control
13. `control-secondary` - Form control

### 🟢 **MEDIUM - Verify Existing Classes (Total: 8 classes)**
These classes exist but should be verified for completeness:
- `container`
- `flex-col`
- `modal`
- `modalbackdrop`
- `card`

## Implementation Order

### **Phase 1: Fix Case Sensitivity (Immediate)**
1. Rename `cardInteractive` → `cardinteractive` in global.css
2. Rename `btnPrimary` → `btnprimary` in global.css
3. Rename `btnSecondary` → `btnsecondary` in global.css
4. Rename `btnDanger` → `btndanger` in global.css
5. Rename `btnIcon` → `btnicon` in global.css

### **Phase 2: Add Missing Base Classes (High Priority)**
1. Add `flex-center` utility class
2. Add `textsm` typography utility
3. Add `heading2`, `heading3`, `text` typography classes
4. Add `btn` base button class
5. Add `toast` notification class
6. Add bracket-specific classes (`player`, `winnerBadge`)
7. Add form control classes (`control-primary`, `control-secondary`)

### **Phase 3: Verification and Testing**
1. Test each component to ensure styles are applied
2. Verify mobile responsiveness is maintained
3. Check dark/light theme switching
4. Validate accessibility features

## Files to Modify

### **Primary File:**
- `src/styles/global.css` - Add missing classes and fix case sensitivity

### **No Changes Needed:**
- Component CSS module files (they're correctly composed)
- `src/index.js` (already imports global.css)
- Compatibility shim files (can be removed after fixes)

## Expected Outcome

After implementing these fixes:
- ✅ All components will have proper styling
- ✅ CSS composition system will work correctly
- ✅ Mobile responsiveness will be maintained
- ✅ Theme switching will work properly
- ✅ No need to unconsolidate CSS files

## Notes

- **Do NOT unconsolidate** - the single global.css approach is correct
- **Fix the class names** to match what components expect
- **Maintain the existing CSS structure** and variables
- **Test incrementally** after each phase to catch any issues early