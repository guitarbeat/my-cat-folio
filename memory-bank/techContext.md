# Technical Context: Meow Namester

## Technology Stack
- **Frontend**: React 19.0.0, React DOM 19.0.0, React Scripts 5.0.1
- **UI Components**: @heroicons/react 2.2.0, lucide-react 0.484.0
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Backend/Database**: Supabase (supabase-js 2.49.3)
- **Authentication**: @react-oauth/google 0.12.1, Google OAuth integration
- **Data Visualization**: Chart.js 4.4.8, react-chartjs-2 5.3.0, recharts 2.15.1
- **Drag and Drop**: @hello-pangea/dnd 18.0.1
- **API Integration**: @googleapis/calendar 9.8.0, node-fetch 3.3.2
- **Styling**: CSS Modules, PostCSS 8.5.3, postcss-preset-env 10.1.5

## Development Environment
- **Package Manager**: npm (as evidenced by package-lock.json)
- **Build System**: React Scripts (Create React App based)
- **Code Formatting**: Prettier 3.5.3
- **CSS Linting**: Stylelint 16.17.0 with various plugins
- **Version Control**: Git
- **Deployment**: Vercel (indicated by .vercel directory)

## Dependencies
- **@googleapis/calendar**: For calendar integration features
- **@hello-pangea/dnd**: For drag-and-drop functionality in tournament setup
- **@heroicons/react**: For UI icons
- **@react-oauth/google**: For Google authentication
- **@supabase/supabase-js**: For Supabase database and auth integration
- **chart.js & react-chartjs-2**: For data visualization in results
- **lucide-react**: Additional icon library
- **recharts**: Another data visualization library for results

## Technical Constraints
- Must maintain compatibility with React 19 features and patterns
- Must ensure responsive design for various device sizes
- Must optimize for performance with potentially large datasets
- Must maintain secure authentication flows with Google OAuth
- Must handle offline/spotty connectivity gracefully
- Must follow accessibility guidelines for all UI components

## Build & Deployment
The application is built using the standard Create React App build process and deployed to Vercel for hosting. The build process includes:

1. Development using `npm start` for local testing
2. CSS linting with `npm run lint:css` using Stylelint
3. Building production assets with `npm run build`
4. Deployment to Vercel for hosting

Environment variables are managed through `.env` files with separate configurations for development and production environments. The Vercel deployment automatically handles environment variable configuration for production.

## File References
- `package.json`: Defines dependencies and scripts
- `.env` and `.env.development.local`: Environment variable configuration
- `src/index.js`: Application entry point
- `src/supabase/supabaseClient.js`: Supabase configuration
- `public/`: Static assets and HTML template 