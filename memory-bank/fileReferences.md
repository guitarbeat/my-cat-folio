# File References: Meow Namester

This document serves as a comprehensive index of important files in the project, organized by category, with links to their corresponding Memory Bank documentation.

## Core Application Files

- `src/index.js`: Application entry point
  - References: [Technical Context](techContext.md)
  
- `src/App.js`: Main application component, routing, and state management
  - References: [Project Brief](projectbrief.md), [System Patterns](systemPatterns.md), [Active Context](activeContext.md), [Progress](progress.md)

- `src/index.css`: Global CSS styles
  - References: [Technical Context](techContext.md)

## Components

### Tournament System

- `src/components/Tournament/Tournament.js`: Tournament UI and interaction
  - References: [Project Brief](projectbrief.md), [Product Context](productContext.md), [System Patterns](systemPatterns.md), [Progress](progress.md)

- `src/components/TournamentSetup/TournamentSetup.js`: Tournament configuration
  - References: [Product Context](productContext.md), [Progress](progress.md)

- `src/components/Results/Results.js`: Tournament results display
  - References: [Product Context](productContext.md), [System Patterns](systemPatterns.md), [Active Context](activeContext.md), [Progress](progress.md)

- `src/components/Bracket/Bracket.js`: Tournament bracket visualization
  - References: [Progress](progress.md)

### User Interface

- `src/components/Sidebar/Sidebar.js`: Navigation sidebar
  - References: [Active Context](activeContext.md)

- `src/components/NameCard/NameCard.js`: Display card for cat names
  - References: [Progress](progress.md)

- `src/components/LoadingSpinner/LoadingSpinner.js`: Loading indicator
  - References: [Technical Context](techContext.md)

- `src/components/BongoCat/BongoCat.js`: Animation component
  - References: [Active Context](activeContext.md)

### User Management

- `src/components/Login/Login.js`: User authentication UI
  - References: [Product Context](productContext.md), [Active Context](activeContext.md)

- `src/components/Profile/Profile.js`: User profile management
  - References: [Progress](progress.md)

- `src/components/NameSuggestion/NameSuggestion.js`: Name suggestion form
  - References: [Progress](progress.md)

### Utility Components

- `src/components/ErrorBoundary/ErrorBoundary.js`: Error handling
  - References: [System Patterns](systemPatterns.md), [Progress](progress.md)

- `src/components/CalendarButton/CalendarButton.js`: Calendar integration
  - References: [Active Context](activeContext.md)

- `src/components/RankingAdjustment/RankingAdjustment.js`: Manual ranking adjustment
  - References: [Progress](progress.md)

## Hooks

- `src/hooks/useTournament.js`: Tournament logic and Elo rating implementation
  - References: [Project Brief](projectbrief.md), [Product Context](productContext.md), [System Patterns](systemPatterns.md), [Active Context](activeContext.md), [Progress](progress.md)

- `src/hooks/useUserSession.js`: Authentication and session management
  - References: [System Patterns](systemPatterns.md), [Progress](progress.md)

- `src/hooks/useLocalStorage.js`: Local storage utilities
  - References: [System Patterns](systemPatterns.md)

## Supabase Integration

- `src/supabase/supabaseClient.js`: Database configuration and API methods
  - References: [Project Brief](projectbrief.md), [System Patterns](systemPatterns.md), [Technical Context](techContext.md), [Progress](progress.md)

- `src/supabase/useSupabaseStorage.js`: Storage management
  - References: [Technical Context](techContext.md)

- `src/supabase/useNameOptions.js`: Name data management
  - References: [Technical Context](techContext.md)

## Utilities

- `src/utils/adminActions.js`: Admin functionality
  - References: [Technical Context](techContext.md)

- `src/utils/arrayUtils.js`: Array manipulation helpers
  - References: [Technical Context](techContext.md)

- `src/utils/chartConfig.js`: Chart configuration
  - References: [Technical Context](techContext.md)

## Configuration Files

- `package.json`: Dependencies and scripts
  - References: [Technical Context](techContext.md)

- `.env` and `.env.development.local`: Environment variables
  - References: [Technical Context](techContext.md)

- `.gitignore`: Git configuration
  - References: [Technical Context](techContext.md) 