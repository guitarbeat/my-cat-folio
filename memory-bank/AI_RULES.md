# AI Rules for Meow Namester Development

This document outlines the core technologies used in the Meow Namester application and provides clear guidelines for using specific libraries and tools.

## Tech Stack Overview

*   **Frontend Framework:** React 19 for building interactive user interfaces.
*   **Language:** JavaScript (ESNext) with JSX. TypeScript may be introduced incrementally in the future, but is not required today.
*   **Build Tool:** Vite for development and production builds.
*   **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`) for component-level state and custom hooks for reusable logic.
*   **Backend & Database:** Supabase (`@supabase/supabase-js`) for all data storage, authentication, and real-time capabilities. Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
*   **Styling:** CSS Modules and global CSS. Do not introduce Tailwind unless a migration plan is approved.
*   **UI Component Library:** None mandated. Prefer lightweight, custom components.
*   **Icons:** `@heroicons/react`.
*   **Data Visualization:** `chart.js` with `react-chartjs-2`.
*   **Drag and Drop:** `@hello-pangea/dnd`.
*   **Routing:** No router in use. Views are managed within `src/App.jsx` with local state and React.lazy.
*   **Linting, Formatting & Testing:** ESLint, Stylelint, Prettier, and Vitest.

## Library Usage Guidelines

To maintain consistency and efficiency, please adhere to the following rules when developing:

*   **React:** Always use React for building UI components.
*   **Language:** Write new code in JavaScript (JSX). If TypeScript is introduced, prefer incremental opt-in and do not block builds on typing.
*   **Supabase:** All interactions with the database, authentication, and storage go through the Supabase client configured in `src/supabase/supabaseClient.js`.
*   **Styling:**
    *   Use existing CSS Modules (`.module.css`) and global CSS files.
    *   Do not introduce Tailwind, Shadcn/ui, or Radix UI without an explicit migration decision.
*   **Icons:** Use `@heroicons/react`.
*   **Data Visualization:** Use `chart.js` with `react-chartjs-2`.
*   **Drag and Drop:** Use `@hello-pangea/dnd` where drag-and-drop is needed.
*   **Routing:** Keep current pattern (views inside `App.jsx`) unless routing is explicitly added later.
*   **File Structure:**
    *   All source code should reside in the `src` directory.
    *   Pages should be placed in `src/pages/`.
    *   Reusable components should be placed in `src/components/`.
    *   Hooks should be placed in `src/hooks/`.
    *   Utilities should be placed in `src/utils/`.
    *   Supabase-related files should be in `src/supabase/`.
    *   Directory names **must** be all lower-case. File names may use mixed-case.
*   **Responsiveness:** Build responsive UIs using CSS Modules and global responsive utilities already present.
*   **Accessibility:** Always prioritize accessibility (ARIA attributes, keyboard navigation, color contrast) in all new development.
*   **Simplicity:** Keep code simple and elegant. Avoid over-engineering. Implement only what is requested, fully and functionally.