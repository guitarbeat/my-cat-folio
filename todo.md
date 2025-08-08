# Meow Namester — TODO

## What’s implemented
- Tournament flow with PreferenceSorter and Elo-based rating updates
- Supabase integration: user sessions (`app_users`), name options (`name_options`), ratings (`cat_name_ratings`), hidden names (`hidden_names`), rating history helpers
- Login screen with fun name generator and BongoCat animation
- Tournament setup: fetch names (excluding hidden), selection UI, images overlay
- Tournament UI: keyboard controls, audio SFX/music, randomize, bracket history, vote tracking
- Results: drag-and-drop ranking adjustments (auto-save), calendar export, bracket view
- Profile: per-user stats and aggregated stats, admin controls scaffolding (hide/delete names), charts (Bar/Pie/Line)
- Theming: light/dark toggle with persisted preference and matrix easter egg
- Linting and formatting: ESLint, Stylelint, Prettier; basic unit test for spinner

## Product polish
- [ ] Verify dark theme styles and `light-theme` class behavior across views
- [ ] Tune audio UX: default volume levels, graceful autoplay failure messaging
- [ ] Improve mobile responsiveness for Tournament, Results, Profile grids
- [ ] Add accessible labels and focus states; audit ARIA usage (login, controls)
- [ ] Confirm meta theme-color is updated on theme switch (index.html)

## Results and ranking
- [ ] Validate rating blending logic (`computeRating`) boundaries across large tournaments
- [ ] Add confidence indicators to UI (already computed in hooks)
- [ ] Persist manual adjustments as history entries (context="manual")

## Profile/Admin
- [ ] Wire hide/unhide and delete flows end-to-end; confirm `hidden_names` and `delete_name_cascade` behavior
- [ ] Add admin auth/flag before showing destructive actions
- [ ] Add export (CSV/JSON) for a user’s ratings and aggregated stats

## Data and performance
- [ ] Batch Supabase requests where possible; handle rate limits
- [ ] Consider caching name options in localStorage with ETag-style validation

## Testing
- [ ] Expand unit tests: hooks (`useTournament`, `useUserSession`), components (Tournament, Results, Profile)
- [ ] Add integration tests for tournament flow and rating persistence
- [ ] Optional: add E2E (Playwright/Cypress) for login → setup → vote → results

## Tooling and CI
- [ ] Initialize Husky hooks (`npm run prepare`) and add pre-commit lint/format
- [ ] Consider moving from `react-scripts` to Vite for faster dev/build

## Cleanup
- [ ] Remove or use unused deps: `@googleapis/calendar`, `@react-oauth/google`, `node-fetch`
- [ ] Align React 19 with tooling (react-scripts 5 may not fully support 19)
- [ ] Update `memory-bank` docs to reflect current features (theming, audio, admin)

## Known issues to verify
- [ ] Tournament lag with many names — profile and setup mention performance work
- [ ] Chart render inconsistencies — confirm Chart.js config and font loading
- [ ] Auth edge cases — ensure `app_users` upsert and session restoration are robust

## Nice-to-haves / Backlog
- [ ] Internationalization
- [ ] Social sharing of results
- [ ] PWA/offline support