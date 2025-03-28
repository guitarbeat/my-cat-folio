# System Patterns: Meow Namester

## Architecture Overview
Meow Namester follows a modern frontend architecture with React for UI components and Supabase for backend services. The application primarily relies on client-side rendering with hooks-based state management. Data persistence is handled through Supabase's real-time database and authentication services. The tournament system uses the Elo rating algorithm to rank cat names based on user preferences, with a custom implementation for the tournament bracket system.

## Key Components
- **App Component**: Central component that manages routing, authentication state, and view transitions
- **Tournament System**: Core functionality that handles name comparisons and voting mechanics
- **User Authentication**: Google OAuth integration via Supabase for user login and session management
- **Results Dashboard**: Visualization and analytics for tournament outcomes
- **Profile Management**: User profile data handling and preferences storage
- **Supabase Integration**: Database and storage services for persistent data

## Design Patterns
- **Custom Hooks**: Encapsulating complex logic (tournament, user session, local storage) into reusable hooks
- **Component Composition**: Building complex UIs from smaller, focused components
- **Lifting State Up**: Managing shared state at parent components and passing down as props
- **Render Props**: Used for component reuse in some UI elements
- **Error Boundaries**: Implementing graceful error handling for component failures
- **Async/Await Pattern**: For clean handling of asynchronous operations like API calls

## Data Flow
1. User interactions trigger state changes in React components
2. Custom hooks (useTournament, useUserSession) process business logic
3. Supabase client handles data persistence to the database
4. State updates trigger component re-renders
5. Tournament results and user preferences are stored both locally and in Supabase
6. Authentication state is managed globally and affects available functionality

## Technical Decisions
- **React Hooks**: Used for state management instead of class components or Redux for simplicity and modern practices
- **Supabase**: Chosen for its real-time database capabilities, built-in authentication, and serverless approach
- **Elo Rating System**: Implemented for name ranking due to its effectiveness for pairwise comparisons
- **Tournament Algorithm**: Custom implementation that efficiently pairs names for comparison
- **Local Storage**: Used for caching and preserving state across sessions when not logged in
- **Chart.js and Recharts**: Used for data visualization in results display
- **HelloPangea/dnd**: Used for drag-and-drop functionality in the tournament setup
- **CSS Modules**: For component-scoped styling to prevent style leakage

## File References
- `src/App.js`: Main application component and routing
- `src/hooks/useTournament.js`: Tournament logic and Elo rating implementation
- `src/hooks/useUserSession.js`: Authentication and user session management
- `src/supabase/supabaseClient.js`: Supabase configuration and API calls
- `src/components/Tournament/Tournament.js`: Tournament UI implementation
- `src/components/Results/Results.js`: Results visualization 