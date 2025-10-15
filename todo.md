# Project TODO

- [x] Fix dev server proxy to correct port (8080)
- [x] Make NavBar visible: consolidate styles and apply to current NavBar component
  - Replaced duplicate "improved" variant by unifying styles under `src/shared/components/NavBar/navbar.css`
  - Updated `NavBar.jsx` to import the consolidated CSS
  - Removed `NavBarImproved.jsx` and old `navbar-improved.css`
- [ ] Verify Navbar across states
  - [ ] Welcome screen: navbar hidden
  - [ ] Logged out: shows Tournament + external links
  - [ ] Logged in (non-admin): shows Profile, Logout, greeting, theme toggle; no Performance Dashboard
  - [ ] Logged in (admin "Aaron"): Performance Dashboard button visible and functional
  - [ ] Mobile: hamburger opens/closes drawer, links work, backdrop closes
  - [ ] Light/Dark themes render correctly
- [ ] Audit and remove any remaining duplicate or unused "improved" assets elsewhere
- [ ] Cross-browser check (Chrome, Safari, Firefox, mobile)
- [ ] Run tests and fix any failures if discovered
