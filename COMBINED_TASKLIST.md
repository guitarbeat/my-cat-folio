### Combined Project Tasklist

Generated from: `tasklist.md`, `CSS_TODO.md`, `COPY_PASTE_REFACTOR_TASKS.md`, `MOBILE_COLOR_SCHEME_IMPROVEMENTS.md`, `README.md`

---

### Styling/Theming Fix Tasklist (from `tasklist.md`)

- [x] Default to light theme on load
  - ✅ Ensure `body` has `light-theme` by default; persist user choice to `localStorage` and reapply on boot.
  - ✅ Verify no server/client mismatch if SSR.
- [x] Fix invalid selectors so variables and dark overrides actually apply
  - ✅ Replace `::root` with `:root` in:
    - `src/styles/variables.css`
    - `src/styles/base.css` (breakpoint block)
    - `src/components/Profile/Profile.module.css`
  - ✅ Replace `::global(...)` with `:global(...)` (CSS Modules) or with regular selectors where files are global CSS:
    - `src/styles/darkMode.css`
    - `src/styles/components.css`
    - `src/styles/base.css`
    - `src/components/Results/Results.module.css`
    - `src/components/RankingAdjustment/RankingAdjustment.css`
    - `src/components/NameSuggestion/NameSuggestion.css`
    - `src/components/TournamentSetup/TournamentSetup.module.css`
    - `src/components/Profile/Profile.module.css`
- [x] Soften the dark palette (everything is too dark)
  - ✅ In `src/styles/global.css` adjust dark values to be lighter and higher contrast:
    - `--background-color` (softened from `#0b1020` to `#0f1420`)
    - `--surface-color` (softened from `#111428` to `#1a1f35`)
    - `--card-background` (softened from `#121633` to `#1a1f3d`)
    - `--border-color-dark` (softened from `#263056` to `#2a2f4a`)
  - ✅ Reduce overlays in dark mode:
    - `--overlay-dark` and `--overlay-darker` (reduced from 65-75% to 55-65%).

#### Tokens and cascade
- [x] Make `variables.css` the single source of spacing, radii, z-index, breakpoints; move duplicated tokens out of `theme.css` if needed.
- [x] Keep theme-dependent tokens in `theme.css` only (light vs dark values).
- [x] Import order in `src/index.css`: `reset.css` → `variables.css` → `theme.css` → `base.css` → utilities/components. Verify no later file resets core tokens.

#### Remove fragile global overrides
- [x] Replace component-level dark overrides under `:global(body:not(.light-theme))` with token usage only, so components read from variables instead of restyling backgrounds:
  - ✅ `Results.module.css`, ✅ `TournamentSetup.module.css`, ✅ `RankingAdjustment.css`, ✅ `Profile.module.css`, ✅ `NameSuggestion.css`, ✅ `styles/components.css`, ✅ `styles/darkMode.css`.
- [x] Eliminate hard-coded `rgb(var(--black-rgb) / XX%)` backgrounds in components in favor of `--card-hover`, `--surface-color`, `--overlay-*` tokens.

#### Component sweeps (use tokens only)
- [x] Normalize backgrounds/borders to tokens:
  - ✅ `background` → `--background-color | --surface-color | --card-background`
  - ✅ `border-color` → `--border-color`
- [x] Buttons/controls: use `--button-*` tokens consistently (`styles/base.css`, `styles/utilities.css`, `styles/components.css`).
- [x] Ensure `NavBar` and any plain CSS like `components/NavBar/navbar.css` also use tokens.

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

---

### Performance & Optimization Tasks

#### Audio System Improvements
- [ ] Optimize audio file sizes (some tracks are 4-6MB)
  - Compress `MiseryBusiness.mp3`, `what-is-love.mp3`, `Lemon Demon` tracks
  - Consider converting to OGG format for better compression
- [ ] Implement audio preloading and caching strategy
- [ ] Add audio fallbacks for unsupported formats
- [ ] Implement progressive audio loading for better performance

#### Tournament Performance
- [ ] Optimize tournament state management for large datasets
- [ ] Implement virtual scrolling for tournament brackets with many names
- [ ] Add tournament state persistence with better memory management
- [ ] Optimize `useTournament` hook for better performance with large tournaments

#### Data & API Optimization
- [ ] Implement Supabase query optimization and caching
- [ ] Add request batching for multiple database operations
- [ ] Implement offline-first approach with local storage fallbacks
- [ ] Add data pagination for large datasets in Profile views

---

### Code Quality & Architecture Improvements

#### React 19 Migration & Modernization
- [ ] Update to React 19 best practices and new features
- [ ] Implement React 19's new hooks and patterns
- [ ] Consider migrating from `react-scripts` to Vite for better performance
- [ ] Update testing libraries to latest versions compatible with React 19

#### Component Architecture
- [ ] Implement proper error boundaries for all major components
- [ ] Add loading states and skeleton screens for better UX
- [ ] Implement proper TypeScript migration (currently using PropTypes)
- [ ] Add component storybook for better development experience

#### State Management
- [ ] Consider implementing Zustand or Redux Toolkit for complex state
- [ ] Optimize `useTournament` hook state management
- [ ] Implement proper state persistence strategies
- [ ] Add state debugging and time-travel capabilities

---

### Testing & Quality Assurance

#### Unit Testing Expansion
- [ ] Add comprehensive tests for `useTournament` hook
- [ ] Test tournament flow edge cases (empty names, single name, etc.)
- [ ] Add tests for audio system and theme switching
- [ ] Implement proper mock strategies for Supabase operations

#### Integration Testing
- [ ] Add end-to-end tests for complete tournament flow
- [ ] Test theme switching across all components
- [ ] Test audio system integration
- [ ] Test responsive design across different screen sizes

#### Accessibility Testing
- [ ] Implement automated accessibility testing (axe-core)
- [ ] Test with screen readers and keyboard navigation
- [ ] Verify ARIA labels and semantic HTML usage
- [ ] Test color contrast compliance across all themes

---

### User Experience Enhancements

#### Tournament Experience
- [ ] Add tournament progress indicators and better visual feedback
- [ ] Implement tournament pause/resume functionality
- [ ] Add tournament sharing capabilities
- [ ] Implement tournament templates and presets

#### Profile & Analytics
- [ ] Add more chart types and data visualizations
- [ ] Implement data export functionality (CSV, JSON)
- [ ] Add tournament history and replay functionality
- [ ] Implement user preferences and customization options

#### Mobile Experience
- [ ] Optimize touch interactions for mobile devices
- [ ] Implement proper mobile navigation patterns
- [ ] Add mobile-specific audio controls
- [ ] Optimize mobile performance and battery usage

---

### Infrastructure & DevOps

#### Build & Deployment
- [ ] Implement proper CI/CD pipeline
- [ ] Add automated testing in CI
- [ ] Implement proper environment variable management
- [ ] Add build optimization and bundle analysis

#### Monitoring & Analytics
- [ ] Add error tracking and monitoring (Sentry)
- [ ] Implement user analytics and performance monitoring
- [ ] Add proper logging and debugging tools
- [ ] Implement health checks and uptime monitoring

#### Security & Compliance
- [ ] Implement proper CORS policies
- [ ] Add rate limiting for API calls
- [ ] Implement proper input validation and sanitization
- [ ] Add security headers and CSP policies

---

### Feature Backlog & Future Ideas

#### Advanced Tournament Features
- [ ] Implement tournament brackets and seeding
- [ ] Add tournament time limits and scheduling
- [ ] Implement tournament collaboration and team voting
- [ ] Add tournament result sharing and social features

#### Data & Analytics
- [ ] Implement machine learning for name recommendations
- [ ] Add trend analysis and popularity tracking
- [ ] Implement user behavior analytics
- [ ] Add predictive analytics for tournament outcomes

#### Social Features
- [ ] Implement user profiles and avatars
- [ ] Add friend system and social connections
- [ ] Implement leaderboards and achievements
- [ ] Add community features and discussions

#### Internationalization
- [ ] Implement multi-language support
- [ ] Add locale-specific name suggestions
- [ ] Implement RTL language support
- [ ] Add cultural context for names


