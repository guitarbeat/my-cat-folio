# AI Rules for Meow Namester Development

This document outlines the core technologies used in the Meow Namester application and provides clear guidelines for using specific libraries and tools.

## Tech Stack Overview

*   **Frontend Framework:** React 19 for building interactive user interfaces.
*   **Language:** TypeScript for all new components and files, ensuring type safety and better maintainability.
*   **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`) for component-level state and custom hooks for reusable logic.
*   **Backend & Database:** Supabase (`@supabase/supabase-js`) for all data storage, authentication, and real-time capabilities.
*   **Styling:** Tailwind CSS for new styling and responsive design. Existing components use CSS Modules.
*   **UI Component Library:** Shadcn/ui and Radix UI for pre-built, accessible UI components.
*   **Icons:** `lucide-react` and `@heroicons/react` for vector icons.
*   **Data Visualization:** `chart.js` with `react-chartjs-2` and `recharts` for displaying charts and graphs.
*   **Drag and Drop:** `@hello-pangea/dnd` for drag-and-drop functionalities.
*   **Routing:** React Router, with main application routes defined in `src/App.tsx`.
*   **Linting & Formatting:** ESLint, Stylelint, and Prettier for consistent code quality.

## Library Usage Guidelines

To maintain consistency and efficiency, please adhere to the following rules when developing:

*   **React:** Always use React for building UI components.
*   **TypeScript:** All new files, components, and hooks **must** be written in TypeScript (`.ts` or `.tsx` extensions).
*   **Supabase:** All interactions with the database, authentication, and storage **must** go through the Supabase client. Do not use direct API calls for backend operations.
*   **Styling:**
    *   For **new components and features**, prioritize using **Tailwind CSS classes** for all styling.
    *   For **existing components** that use CSS Modules (`.module.css`), continue to use and maintain their existing CSS Modules. Do not convert existing CSS Modules to Tailwind unless explicitly requested.
    *   When building new UI elements, first check if a suitable component exists in **Shadcn/ui**. If it does, use the Shadcn/ui component.
    *   If Shadcn/ui does not offer a specific component, use **Radix UI** primitives as a foundation for building custom, accessible components.
    *   **Do not modify Shadcn/ui or Radix UI source files directly.** If customization is needed, create a new component that wraps or extends the library component.
*   **Icons:** Use icons from `lucide-react` or `@heroicons/react`.
*   **Data Visualization:** For any charting or data visualization needs, use `chart.js` (with `react-chartjs-2`) or `recharts`.
*   **Drag and Drop:** For any drag-and-drop functionality, use `@hello-pangea/dnd`.
*   **Routing:** All main application routes should be managed within `src/App.tsx` using React Router.
*   **File Structure:**
    *   All source code should reside in the `src` directory.
    *   Pages should be placed in `src/pages/`.
    *   Reusable components should be placed in `src/components/`.
    *   Hooks should be placed in `src/hooks/`.
    *   Utilities should be placed in `src/utils/`.
    *   Supabase-related files should be in `src/supabase/`.
    *   Directory names **must** be all lower-case. File names may use mixed-case.
*   **Responsiveness:** All new UI components and features **must** be designed to be fully responsive across various screen sizes, utilizing Tailwind's responsive utilities.
*   **Accessibility:** Always prioritize accessibility (ARIA attributes, keyboard navigation, color contrast) in all new development.
*   **Simplicity:** Keep code simple and elegant. Avoid over-engineering. Implement only what is requested, fully and functionally.