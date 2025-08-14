## Styling/Theming Fix Tasklist

### High-priority (do first)
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

### Tokens and cascade
- [ ] Make `variables.css` the single source of spacing, radii, z-index, breakpoints; move duplicated tokens out of `theme.css` if needed.
- [ ] Keep theme-dependent tokens in `theme.css` only (light vs dark values).
- [ ] Import order in `src/index.css`: `reset.css` → `variables.css` → `theme.css` → `base.css` → utilities/components. Verify no later file resets core tokens.

### Remove fragile global overrides
- [ ] Replace component-level dark overrides under `:global(body:not(.light-theme))` with token usage only, so components read from variables instead of restyling backgrounds:
  - `Results.module.css`, `TournamentSetup.module.css`, `RankingAdjustment.css`, `Profile.module.css`, `NameSuggestion.css`, `styles/components.css`, `styles/darkMode.css`.
- [ ] Eliminate hard-coded `rgb(var(--black-rgb) / XX%)` backgrounds in components in favor of `--card-hover`, `--surface-color`, `--overlay-*` tokens.

### Component sweeps (use tokens only)
- [ ] Normalize backgrounds/borders to tokens:
  - `background` → `--background-color | --surface-color | --card-background`
  - `border-color` → `--border-color`
- [ ] Buttons/controls: use `--button-*` tokens consistently (`styles/base.css`, `styles/utilities.css`, `styles/components.css`).
- [ ] Ensure `NavBar` and any plain CSS like `components/NavBar/navbar.css` also use tokens.

### Inline styles
- [ ] Audit and remove or tokenize inline styles found in:
  - `src/App.js`
  - `src/components/TournamentSetup/TournamentSetup.js`
  - `src/components/BongoCat/BongoCat.js`

### Accessibility & contrast
- [ ] Verify text/background contrast ≥ 4.5:1 for body text and 3:1 for large text in both themes.
- [ ] Respect `prefers-contrast` and `prefers-reduced-motion` already present; ensure they’re not overridden later.

### Tooling / guardrails
- [ ] Add Stylelint with a rule to forbid `::root`/`::global` and enforce token usage for `color`, `background`, `border-color`.
- [ ] Add a visual regression check (even simple Playwright screenshot tests) for light/dark home and key screens.

### Acceptance criteria
- [ ] App loads in light theme by default with backgrounds that are not near-black; dark theme remains readable with softened surfaces.
- [ ] No `::root` or `::global` remain; all theme differences come from variables in `theme.css`.
- [ ] No component defines hard-coded theme colors; all use tokens.
- [ ] Contrast passes WCAG AA in both themes.