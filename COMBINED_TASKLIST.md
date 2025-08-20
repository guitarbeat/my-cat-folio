### Combined Project Tasklist

Generated from: `tasklist.md`, `CSS_TODO.md`, `COPY_PASTE_REFACTOR_TASKS.md`, `MOBILE_COLOR_SCHEME_IMPROVEMENTS.md`, `README.md`

---

### Styling/Theming Fix Tasklist (from `tasklist.md`)

- [ ] Default to light theme on load
  - Ensure `body` has `light-theme` by default; persist user choice to `localStorage` and reapply on boot.
  - Verify no server/client mismatch if SSR.
- [ ] Fix invalid selectors so variables and dark overrides actually apply
  - [ ] Replace `::root` with `:root` in:
    - `src/styles/variables.css`
    - `src/styles/base.css` (breakpoint block)
    - `src/components/Profile/Profile.module.css`
  - [ ] Replace `::global(...)` with `:global(...)` (CSS Modules) or with regular selectors where files are global CSS:
    - `src/styles/darkMode.css`
    - `src/styles/components.css`
    - `src/styles/base.css`
    - `src/components/Results/Results.module.css`
    - `src/components/RankingAdjustment/RankingAdjustment.css`
    - `src/components/NameSuggestion/NameSuggestion.css`
    - `src/components/TournamentSetup/TournamentSetup.module.css`
    - `src/components/Profile/Profile.module.css`
- [ ] Soften the dark palette (everything is too dark)
  - In `src/styles/theme.css` adjust dark values to be lighter and higher contrast:
    - `--background-color` (currently `#050714`)
    - `--surface-color` (currently `#0a0c1c`)
    - `--card-background` (currently `#0f1225`)
    - `--border-color-dark` (currently `#1a1f35`)
  - Reduce overlays in dark mode:
    - `--overlay-dark` and `--overlay-darker` (currently 85–95%).

#### Tokens and cascade
- [ ] Make `variables.css` the single source of spacing, radii, z-index, breakpoints; move duplicated tokens out of `theme.css` if needed.
- [ ] Keep theme-dependent tokens in `theme.css` only (light vs dark values).
- [ ] Import order in `src/index.css`: `reset.css` → `variables.css` → `theme.css` → `base.css` → utilities/components. Verify no later file resets core tokens.

#### Remove fragile global overrides
- [ ] Replace component-level dark overrides under `:global(body:not(.light-theme))` with token usage only, so components read from variables instead of restyling backgrounds:
  - `Results.module.css`, `TournamentSetup.module.css`, `RankingAdjustment.css`, `Profile.module.css`, `NameSuggestion.css`, `styles/components.css`, `styles/darkMode.css`.
- [ ] Eliminate hard-coded `rgb(var(--black-rgb) / XX%)` backgrounds in components in favor of `--card-hover`, `--surface-color`, `--overlay-*` tokens.

#### Component sweeps (use tokens only)
- [ ] Normalize backgrounds/borders to tokens:
  - `background` → `--background-color | --surface-color | --card-background`
  - `border-color` → `--border-color`
- [ ] Buttons/controls: use `--button-*` tokens consistently (`styles/base.css`, `styles/utilities.css`, `styles/components.css`).
- [ ] Ensure `NavBar` and any plain CSS like `components/NavBar/navbar.css` also use tokens.

#### Inline styles
- [ ] Audit and remove or tokenize inline styles found in:
  - `src/App.js`
  - `src/components/TournamentSetup/TournamentSetup.js`
  - `src/components/BongoCat/BongoCat.js`

#### Accessibility & contrast
- [ ] Verify text/background contrast ≥ 4.5:1 for body text and 3:1 for large text in both themes.
- [ ] Respect `prefers-contrast` and `prefers-reduced-motion` already present; ensure they’re not overridden later.

#### Tooling / guardrails
- [ ] Add Stylelint rule(s) to forbid `::root`/`::global` and enforce token usage for `color`, `background`, `border-color`.
- [ ] Add a visual regression check (simple Playwright screenshots) for light/dark home and key screens.

#### Acceptance criteria
- [ ] App loads in light theme by default with softened dark surfaces.
- [ ] No `::root` or `::global` remain; all theme differences come from variables in `theme.css`.
- [ ] No component defines hard-coded theme colors; all use tokens.
- [ ] Contrast passes WCAG AA in both themes.

---

### CSS Consolidation / Verification Tasks (from `CSS_TODO.md`)

- [ ] Testing and verification that all components render correctly
- [ ] Validation of mobile responsiveness and theme switching
- [ ] Final accessibility validation (contrast, focus, ARIA where applicable)

Recommended follow-ups
- [ ] Consolidate theme/variables duplication (`src/styles/theme.css` vs `src/styles/variables.css`)
- [ ] Review base vs components separation; extract shared styles into utilities
- [ ] Extract large duplicated utility blocks in `src/styles/utilities.css`
- [ ] Add JSCPD to CI/CD to prevent regressions

Success metrics
- [ ] Reduce duplication percentage below 0.5%
- [ ] No functionality regressions after consolidation

---

### Copy-Paste Detection Refactoring Tasks (from `COPY_PASTE_REFACTOR_TASKS.md`)

JavaScript
- [ ] BongoCat.js: Extract duplicate event handler logic into reusable functions; consider custom hook
- [ ] useTournament.js: Extract duplicate logic into a shared utility; review state patterns

CSS
- [x] TournamentSetup.module.css: Internal duplication consolidated
- [x] BongoCat.module.css: Repeated styles refactored into shared base + variants
- [ ] Theme vs Variables duplication: consolidate custom properties into a single source of truth
- [ ] Base vs Components duplication: extract shared styles into utilities; define boundaries
- [ ] Utilities.css large duplication: extract repeated utility blocks; consider mixins

Implementation guidance
- [ ] Start with CSS (theme/variables), then component logic, then utilities; add JSCPD in CI

---

### Mobile Color Scheme Follow-ups (from `MOBILE_COLOR_SCHEME_IMPROVEMENTS.md`)

Testing recommendations
- [ ] Color contrast testing across light/dark on multiple devices
- [ ] Touch device testing (active states, target sizes ≥ 44px)
- [ ] Device testing at ≤430px, ≤768px, and tablet widths; verify safe-area handling

Future enhancements
- [ ] Dynamic color schemes (system theme integration)
- [ ] Advanced touch feedback (consider haptics where available)
- [ ] Color blindness support (alternative palettes)
- [ ] Dark mode auto-switch by time
- [ ] Custom user-configurable color themes

---

### Operational Tasks (from `README.md`)

- [ ] Ensure local `.env.local` contains required envs
  - `REACT_APP_SUPABASE_URL`
  - `REACT_APP_SUPABASE_ANON_KEY`
- [ ] Verify Node.js ≥ 18; run `npm install` and `npm start`


